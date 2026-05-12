import List "mo:core/List";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import PaymentLib "../lib/payment";
import PaymentTypes "../types/payment";
import OrderLib "../lib/orders";
import OrderTypes "../types/orders";

mixin (
  admins : Set.Set<Principal>,
  orders : List.List<OrderTypes.Order>,
) {
  // Stripe secret key — replace with your live/test key
  let STRIPE_SECRET_KEY = "sk_test_YOUR_STRIPE_KEY";
  let STRIPE_API_URL = "https://api.stripe.com/v1/payment_intents";

  let ic = actor "aaaaa-aa" : actor {
    http_request : shared ({
      url : Text;
      max_response_bytes : ?Nat64;
      method : { #get; #head; #post };
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      transform : ?{
        function : shared query ({
          response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
          context : Blob;
        }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
        context : Blob;
      };
      is_replicated : ?Bool;
    }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  };

  /// Create a Stripe payment intent for a placed order (customer-facing).
  /// Returns client secret needed by the frontend Stripe.js to confirm payment.
  public shared ({ caller }) func createPaymentIntent(
    input : PaymentTypes.CreatePaymentIntentInput,
  ) : async PaymentTypes.PaymentIntentResult {
    // Verify the order exists
    switch (OrderLib.getOrder(orders, input.orderId)) {
      case null Runtime.trap("Order not found");
      case (?_) {};
    };

    // Build Stripe API request body (application/x-www-form-urlencoded)
    let bodyText =
      "amount=" # input.amountPaisa.toText() #
      "&currency=" # input.currency #
      "&receipt_email=" # input.customerEmail #
      "&metadata[order_id]=" # input.orderId.toText();

    let bodyBlob = bodyText.encodeUtf8();

    let request = {
      url = STRIPE_API_URL;
      max_response_bytes = ?(16384 : Nat64);
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
        { name = "Authorization"; value = "Bearer " # STRIPE_SECRET_KEY },
      ];
      body = ?bodyBlob;
      transform = null;
      is_replicated = ?(false);
    };

    let response = await ic.http_request(request);
    let responseText = switch (response.body.decodeUtf8()) {
      case (?t) t;
      case null Runtime.trap("Failed to decode Stripe response");
    };

    if (response.status != 200) {
      Runtime.trap("Stripe API error: " # responseText);
    };

    let paymentIntentId = switch (PaymentLib.extractJsonField(responseText, "id")) {
      case (?v) v;
      case null Runtime.trap("Missing payment intent id in Stripe response");
    };
    let clientSecret = switch (PaymentLib.extractJsonField(responseText, "client_secret")) {
      case (?v) v;
      case null Runtime.trap("Missing client_secret in Stripe response");
    };
    let statusText = switch (PaymentLib.extractJsonField(responseText, "status")) {
      case (?v) v;
      case null "unknown";
    };
    let stripeStatus = PaymentLib.parseStripeStatus(statusText);

    // Record the payment intent id on the order
    ignore OrderLib.updateOrderPaymentStatus(orders, input.orderId, paymentIntentId, ?stripeStatus);

    { paymentIntentId; clientSecret; status = stripeStatus };
  };

  /// Confirm that Stripe payment succeeded for an order.
  /// Called by the frontend after Stripe.js confirms the payment.
  public shared ({ caller }) func confirmPayment(
    input : PaymentTypes.ConfirmPaymentInput,
  ) : async Bool {
    let getUrl = STRIPE_API_URL # "/" # input.paymentIntentId;

    let request = {
      url = getUrl;
      max_response_bytes = ?(16384 : Nat64);
      method = #get;
      headers = [
        { name = "Authorization"; value = "Bearer " # STRIPE_SECRET_KEY },
      ];
      body = null;
      transform = null;
      is_replicated = ?(false);
    };

    let response = await ic.http_request(request);
    let responseText = switch (response.body.decodeUtf8()) {
      case (?t) t;
      case null return false;
    };

    if (response.status != 200) { return false };

    let statusText = switch (PaymentLib.extractJsonField(responseText, "status")) {
      case (?v) v;
      case null return false;
    };
    let stripeStatus = PaymentLib.parseStripeStatus(statusText);

    // Update the order's payment status
    ignore OrderLib.updateOrderPaymentStatus(orders, input.orderId, input.paymentIntentId, ?stripeStatus);

    // If succeeded, also move order to confirmed
    switch (stripeStatus) {
      case (#succeeded) {
        ignore OrderLib.updateOrderStatus(orders, input.orderId, #confirmed);
        true;
      };
      case _ false;
    };
  };
};

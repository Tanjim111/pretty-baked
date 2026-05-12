import Common "common";
import Payment "payment";

module {
  public type OrderItem = {
    productId : Common.ProductId;
    productName : Text;
    quantity : Nat;
    unitPrice : Nat; // in BDT paisa
  };

  public type Order = {
    id : Common.OrderId;
    orderId : Text; // human-readable display ID, e.g. "ORD-7X3K9M"
    customerPrincipal : ?Principal; // set when placed by a logged-in customer
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    items : [OrderItem];
    total : Nat; // in BDT paisa (after discounts)
    status : Common.OrderStatus;
    // notes stores the combined value "deliveryAddress|||NOTE|||deliveryNote"
    // OR just the delivery address when no delivery note is present.
    notes : ?Text;
    paymentMethod : Payment.PaymentMethod;
    stripePaymentIntentId : ?Text;
    stripePaymentStatus : ?Payment.StripePaymentStatus;
    createdAt : Common.Timestamp;
    // Coupon / loyalty points tracking
    couponCode : ?Text;      // coupon code applied at checkout
    couponDiscount : ?Nat;   // discount amount in BDT paisa from coupon
    pointsRedeemed : ?Nat;   // loyalty points redeemed (1 pt = 1 BDT paisa discount)
    pointsEarned : ?Nat;     // loyalty points earned from this order
  };

  public type OrderInput = {
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    items : [OrderItem];
    // Legacy combined field — kept for backward compatibility with old frontend
    notes : ?Text;
    // Canonical separate fields — used by updated frontend
    deliveryAddress : ?Text;
    deliveryNote : ?Text;
    paymentMethod : Payment.PaymentMethod;
    stripePaymentIntentId : ?Text; // pre-supplied when paying via Stripe
    // Discount / loyalty
    couponCode : ?Text;    // optional coupon code to validate and apply
    pointsToRedeem : ?Nat; // optional loyalty points to redeem
  };
};

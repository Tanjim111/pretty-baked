import Text "mo:core/Text";
import PaymentTypes "../types/payment";

module {
  /// Parse a Stripe payment status string from the API response.
  public func parseStripeStatus(status : Text) : PaymentTypes.StripePaymentStatus {
    if (status == "requires_payment_method") { #requiresPaymentMethod }
    else if (status == "requires_confirmation") { #requiresConfirmation }
    else if (status == "requires_action") { #requiresAction }
    else if (status == "processing") { #processing }
    else if (status == "succeeded") { #succeeded }
    else if (status == "canceled") { #canceled }
    else { #unknown };
  };

  /// Extract a quoted JSON string field value from a simple JSON response.
  /// e.g. extractJsonField(json, "id") -> ?"pi_xxx"
  public func extractJsonField(json : Text, field : Text) : ?Text {
    let marker = "\"" # field # "\":\"";
    let parts = json.split(#text marker).toArray();
    if (parts.size() < 2) { return null };
    // parts[1] starts right after the opening quote of the value
    let chars = parts[1].toIter();
    var value = "";
    var escaped = false;
    var done = false;
    label scan for (c in chars) {
      if (done) { break scan };
      if (escaped) {
        let ch = Text.fromChar(c);
        let decoded = if (ch == "n") "\n"
          else if (ch == "r") "\r"
          else if (ch == "t") "\t"
          else ch;
        value := value # decoded;
        escaped := false;
      } else if (c == '\\') {
        escaped := true;
      } else if (c == '\"') {
        done := true;
      } else {
        value := value # Text.fromChar(c);
      };
    };
    if (done) ?value else null;
  };
};

module {
  // Payment method chosen by customer at checkout
  public type PaymentMethod = {
    #stripe;
    #cod; // cash on delivery
  };

  // Status of a Stripe payment intent
  public type StripePaymentStatus = {
    #requiresPaymentMethod;
    #requiresConfirmation;
    #requiresAction;
    #processing;
    #succeeded;
    #canceled;
    #unknown;
  };

  // Input for creating a Stripe payment intent for a BDT order
  public type CreatePaymentIntentInput = {
    orderId : Nat;
    amountPaisa : Nat; // order total in BDT paisa
    currency : Text;   // always "bdt"
    customerEmail : Text;
  };

  // Result returned after creating a Stripe payment intent
  public type PaymentIntentResult = {
    paymentIntentId : Text;
    clientSecret : Text;
    status : StripePaymentStatus;
  };

  // Input to confirm a payment intent after frontend success
  public type ConfirmPaymentInput = {
    orderId : Nat;
    paymentIntentId : Text;
  };
};

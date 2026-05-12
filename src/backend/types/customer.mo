import Common "common";

module {
  // A single item in the customer's persisted cart
  public type CartItem = {
    productId : Common.ProductId;
    quantity : Nat;
  };

  // Customer profile keyed by email (not principal)
  public type CustomerProfile = {
    name : Text;
    email : Text;
    phone : Text;
    passwordHash : Text; // stored as-is (plain text) — production would use a proper hash
    createdAt : Common.Timestamp;
    securityQuestion : Text; // one of the 5 predefined questions
    securityAnswer : Text;   // lowercased for case-insensitive comparison
    avatar : ?Text;          // base64 data URL for profile picture
    bio : ?Text;             // short customer bio
    deliveryAddress : ?Text; // saved delivery address for faster checkout
    loyaltyPoints : Nat;     // earned points; 1 pt per 100 BDT spent; 1 pt = 1 BDT discount
    wishlist : [Common.ProductId]; // saved product IDs for later purchase
    cart : [CartItem];             // persisted cart items
  };

  // View type returned to admin — includes email and stored password for visibility
  public type AdminUserView = {
    email : Text;
    name : Text;
    phone : Text;
    password : Text; // exposed to admin only
    bio : ?Text;
    avatar : ?Text;
    deliveryAddress : ?Text;
    loyaltyPoints : Nat;
    wishlist : [Common.ProductId];
    securityQuestion : Text;
    createdAt : Common.Timestamp;
  };

  // Admin update input — all fields optional
  public type AdminUserUpdate = {
    displayName : ?Text;
    phone : ?Text;
    bio : ?Text;
    deliveryAddress : ?Text;
    newPassword : ?Text;
  };

  // Input for profile updates — all fields optional; only provided fields are changed
  public type UpdateProfileInput = {
    name : ?Text;
    phone : ?Text;
    securityQuestion : ?Text;
    securityAnswer : ?Text;
    avatar : ?Text;
    bio : ?Text;
    deliveryAddress : ?Text;
  };

  // Input for registration — extended with security question/answer
  public type RegisterInput = {
    name : Text;
    email : Text;
    phone : Text;
    password : Text;
    securityQuestion : Text;
    securityAnswer : Text;
  };

  // Result returned on register / login / password-reset operations
  public type AuthResult = {
    #ok : Text;                 // session token (register/login) or success message
    #emailTaken;                // registration: email already registered
    #invalidCredentials;        // login: wrong email or password
    #notFound;                  // generic not found
    #invalidSecurityAnswer;     // security-question reset: answer does not match
    #resetTokenNotFound;        // email-based reset: token not found
    #resetTokenExpired;         // email-based reset: token has expired
    #passwordResetSuccess;      // password reset completed successfully
  };

  // Result type for requestPasswordReset (email-based flow)
  public type ResetRequestResult = {
    #ok;          // reset email queued (email extension deferred)
    #notFound;    // no account found for the given email
  };

  // Entry stored in the resetTokens map
  public type ResetToken = {
    email : Text;
    expiresAt : Int; // nanoseconds (Time.now() + TTL)
  };
};

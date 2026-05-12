import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import CustomerLib "../lib/customer";
import CustomerTypes "../types/customer";
import OrderLib "../lib/orders";
import OrderTypes "../types/orders";
import Common "../types/common";

mixin (
  admins : Set.Set<Principal>,
  customerProfiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
  customerSessions : Map.Map<Text, Text>,
  tokenCounter : { var value : Nat },
  orders : List.List<OrderTypes.Order>,
  resetTokens : Map.Map<Text, CustomerTypes.ResetToken>,
) {
  /// Register a new customer with email + password + security question/answer.
  /// Returns a session token on success, or an error variant.
  public func registerCustomer(
    input : CustomerTypes.RegisterInput,
  ) : async CustomerTypes.AuthResult {
    CustomerLib.register(customerProfiles, customerSessions, tokenCounter, input);
  };

  /// Log in with email + password.
  /// Returns a session token on success, or an error variant.
  public func loginCustomer(
    email : Text,
    password : Text,
  ) : async CustomerTypes.AuthResult {
    CustomerLib.login(customerProfiles, customerSessions, tokenCounter, email, password);
  };

  /// Validate a session token. Returns the associated customer profile or null.
  public query func validateToken(token : Text) : async ?CustomerTypes.CustomerProfile {
    CustomerLib.validateToken(customerProfiles, customerSessions, token);
  };

  /// Invalidate a session token (log out).
  public func logoutCustomer(token : Text) : async () {
    CustomerLib.logout(customerSessions, token);
  };

  /// Get the profile for the owner of the given session token.
  public query func getMyProfile(token : Text) : async ?CustomerTypes.CustomerProfile {
    CustomerLib.validateToken(customerProfiles, customerSessions, token);
  };

  /// Check whether the given session token belongs to a registered customer.
  public query func isCustomerRegistered(token : Text) : async Bool {
    switch (CustomerLib.validateToken(customerProfiles, customerSessions, token)) {
      case (?_) true;
      case null false;
    };
  };

  /// Return all orders for the customer identified by the given session token.
  /// Looks up orders by the customer's email (from the session token) so results
  /// are reliable regardless of the caller's IC Principal at query time.
  public query func getMyOrders(token : Text) : async [OrderTypes.Order] {
    switch (CustomerLib.validateToken(customerProfiles, customerSessions, token)) {
      case null [];
      case (?profile) {
        OrderLib.getOrdersByEmail(orders, profile.email);
      };
    };
  };

  /// Return the security question for the given email (for the reset UI).
  /// Returns null if no account exists for that email.
  public query func getSecurityQuestion(email : Text) : async ?Text {
    CustomerLib.getSecurityQuestion(customerProfiles, email);
  };

  /// Reset password by verifying the customer's security question answer.
  /// On success returns #passwordResetSuccess; on mismatch #invalidSecurityAnswer.
  public func resetPasswordWithSecurityQuestion(
    email : Text,
    answer : Text,
    newPassword : Text,
  ) : async CustomerTypes.AuthResult {
    CustomerLib.resetPasswordWithSecurityQuestion(
      customerProfiles,
      customerSessions,
      tokenCounter,
      email,
      answer,
      newPassword,
    );
  };

  /// Initiate an email-based password reset (token stored for later verification).
  /// Email sending is deferred until the email extension is enabled.
  public func requestPasswordReset(email : Text) : async CustomerTypes.ResetRequestResult {
    CustomerLib.createResetToken(customerProfiles, resetTokens, tokenCounter, email);
  };

  /// Complete an email-based reset using the token that was emailed to the customer.
  public func resetPasswordWithToken(
    tokenId : Text,
    newPassword : Text,
  ) : async CustomerTypes.AuthResult {
    CustomerLib.resetPasswordWithToken(
      customerProfiles,
      resetTokens,
      customerSessions,
      tokenCounter,
      tokenId,
      newPassword,
    );
  };

  /// Update profile fields (name, phone, securityQuestion, securityAnswer, avatar) for the
  /// customer identified by the given session token. Only non-null fields are applied.
  public func updateMyProfile(
    token : Text,
    updates : CustomerTypes.UpdateProfileInput,
  ) : async CustomerTypes.AuthResult {
    CustomerLib.updateProfile(customerProfiles, customerSessions, token, updates);
  };

  /// Change password for the customer identified by the given session token.
  /// Verifies currentPassword before applying the new password.
  public func changePassword(
    token : Text,
    currentPassword : Text,
    newPassword : Text,
  ) : async CustomerTypes.AuthResult {
    CustomerLib.changePassword(customerProfiles, customerSessions, token, currentPassword, newPassword);
  };

  // ── Loyalty points ─────────────────────────────────────────────────────────

  /// Get the loyalty points balance for the customer identified by session token.
  public query func getMyPoints(token : Text) : async Nat {
    switch (CustomerLib.validateToken(customerProfiles, customerSessions, token)) {
      case null 0;
      case (?profile) profile.loyaltyPoints;
    };
  };

  /// Add loyalty points to a customer's account.
  public func addLoyaltyPoints(token : Text, points : Nat) : async Bool {
    switch (customerSessions.get(token)) {
      case null false;
      case (?emailKey) {
        switch (customerProfiles.get(emailKey)) {
          case null false;
          case (?profile) {
            customerProfiles.add(emailKey, { profile with loyaltyPoints = profile.loyaltyPoints + points });
            true;
          };
        };
      };
    };
  };

  /// Deduct loyalty points from a customer's account.
  public func deductLoyaltyPoints(token : Text, points : Nat) : async Bool {
    switch (customerSessions.get(token)) {
      case null false;
      case (?emailKey) {
        switch (customerProfiles.get(emailKey)) {
          case null false;
          case (?profile) {
            if (profile.loyaltyPoints < points) {
              false;
            } else {
              customerProfiles.add(emailKey, { profile with loyaltyPoints = Nat.sub(profile.loyaltyPoints, points) });
              true;
            };
          };
        };
      };
    };
  };

  // ── Wishlist ───────────────────────────────────────────────────────────────

  /// Add a product to the customer's wishlist.
  public func addToWishlist(token : Text, productId : Common.ProductId) : async Bool {
    switch (customerSessions.get(token)) {
      case null false;
      case (?emailKey) {
        switch (customerProfiles.get(emailKey)) {
          case null false;
          case (?profile) {
            // Only add if not already in wishlist
            let alreadyThere = profile.wishlist.find(func(id : Common.ProductId) : Bool = id == productId);
            switch (alreadyThere) {
              case (?_) true; // already present, no-op success
              case null {
                customerProfiles.add(emailKey, { profile with wishlist = profile.wishlist.concat([productId]) });
                true;
              };
            };
          };
        };
      };
    };
  };

  /// Remove a product from the customer's wishlist.
  public func removeFromWishlist(token : Text, productId : Common.ProductId) : async Bool {
    switch (customerSessions.get(token)) {
      case null false;
      case (?emailKey) {
        switch (customerProfiles.get(emailKey)) {
          case null false;
          case (?profile) {
            let newWishlist = profile.wishlist.filter(func(id : Common.ProductId) : Bool = id != productId);
            customerProfiles.add(emailKey, { profile with wishlist = newWishlist });
            true;
          };
        };
      };
    };
  };

  /// Get all product IDs in the customer's wishlist.
  public query func getMyWishlist(token : Text) : async [Common.ProductId] {
    switch (CustomerLib.validateToken(customerProfiles, customerSessions, token)) {
      case null [];
      case (?profile) profile.wishlist;
    };
  };

  // ── Cart ───────────────────────────────────────────────────────────────────

  /// Get all cart items for the customer identified by the session token.
  public query func getMyCart(token : Text) : async [CustomerTypes.CartItem] {
    switch (CustomerLib.validateToken(customerProfiles, customerSessions, token)) {
      case null [];
      case (?profile) CustomerLib.getCart(profile);
    };
  };

  /// Replace the customer's entire cart with the provided items.
  /// This is the primary sync method — call it whenever the local cart state changes.
  public func saveMyCart(token : Text, items : [CustomerTypes.CartItem]) : async Bool {
    switch (customerSessions.get(token)) {
      case null false;
      case (?emailKey) {
        switch (customerProfiles.get(emailKey)) {
          case null false;
          case (?profile) {
            customerProfiles.add(emailKey, CustomerLib.setCart(profile, items));
            true;
          };
        };
      };
    };
  };

  /// Clear the customer's cart (used on logout or after order placement).
  public func clearMyCart(token : Text) : async Bool {
    switch (customerSessions.get(token)) {
      case null false;
      case (?emailKey) {
        switch (customerProfiles.get(emailKey)) {
          case null false;
          case (?profile) {
            customerProfiles.add(emailKey, CustomerLib.clearCart(profile));
            true;
          };
        };
      };
    };
  };

  // ── Admin operations ───────────────────────────────────────────────────────

  /// List all registered customers with full profile data including password.
  /// Admin only.
  public query ({ caller }) func listAllUsers() : async [CustomerTypes.AdminUserView] {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    CustomerLib.listAllUsers(customerProfiles);
  };

  /// Get full profile (including password) for a single user by email.
  /// Admin only.
  public query ({ caller }) func adminGetUser(email : Text) : async ?CustomerTypes.AdminUserView {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can view user details");
    };
    CustomerLib.adminGetUser(customerProfiles, email);
  };

  /// Update a customer's profile fields and/or password as admin.
  /// Admin only.
  public shared ({ caller }) func adminUpdateUser(
    email : Text,
    updates : CustomerTypes.AdminUserUpdate,
  ) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can update user profiles");
    };
    CustomerLib.adminUpdateUser(customerProfiles, email, updates);
  };

  /// Delete a customer account by email.
  /// Admin only.
  public shared ({ caller }) func adminDeleteUser(email : Text) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    CustomerLib.adminDeleteUser(customerProfiles, customerSessions, email);
  };
};

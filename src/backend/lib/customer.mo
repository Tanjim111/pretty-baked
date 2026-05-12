import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import CustomerTypes "../types/customer";
import Common "../types/common";

module {
  // ── Predefined security questions ───────────────────────────────────────────
  // 1. "What was the name of your first pet?"
  // 2. "What is your mother's maiden name?"
  // 3. "What city were you born in?"
  // 4. "What was the name of your primary school?"
  // 5. "What is your favorite childhood book?"

  // ── Token generation ────────────────────────────────────────────────────────
  // Simple deterministic token: combine email + timestamp + counter as text.
  // Counter is owned by the actor and passed in as a mutable box to avoid
  // module-level mutable state (M0014).
  public func generateToken(email : Text, counter : { var value : Nat }) : Text {
    counter.value += 1;
    let ts = Time.now();
    email # "_" # counter.value.toText() # "_" # ts.toText();
  };

  // ── Registration ────────────────────────────────────────────────────────────
  /// Register a new customer. Returns #emailTaken if already registered.
  public func register(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    tokenCounter : { var value : Nat },
    input : CustomerTypes.RegisterInput,
  ) : CustomerTypes.AuthResult {
    let emailKey = input.email.toLower().trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case (?_) { #emailTaken };
      case null {
        // Trim password to prevent whitespace mismatches from autofill
        let trimmedPassword = input.password.trim(#char ' ');
        profiles.add(emailKey, {
          name = input.name;
          email = input.email.trim(#char ' ');
          phone = input.phone;
          passwordHash = trimmedPassword; // plain text storage — functional, not prod-secure
          createdAt = Time.now();
          securityQuestion = input.securityQuestion;
          securityAnswer = input.securityAnswer.toLower().trim(#char ' ');
          avatar = null;
          bio = null;
          deliveryAddress = null;
          loyaltyPoints = 10; // sign-up bonus
          wishlist = [];
          cart = [];
        });
        let token = generateToken(emailKey, tokenCounter);
        sessions.add(token, emailKey);
        #ok token;
      };
    };
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  /// Verify credentials and issue a new session token on success.
  public func login(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    tokenCounter : { var value : Nat },
    email : Text,
    password : Text,
  ) : CustomerTypes.AuthResult {
    let emailKey = email.toLower().trim(#char ' ');
    // Trim password to match the trimmed hash stored at registration time
    let trimmedPassword = password.trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case null { #invalidCredentials };
      case (?profile) {
        if (profile.passwordHash == trimmedPassword) {
          let token = generateToken(emailKey, tokenCounter);
          sessions.add(token, emailKey);
          #ok token;
        } else {
          #invalidCredentials;
        };
      };
    };
  };

  // ── Token validation ────────────────────────────────────────────────────────
  /// Resolve a token to the associated customer profile, or null if invalid.
  public func validateToken(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    token : Text,
  ) : ?CustomerTypes.CustomerProfile {
    switch (sessions.get(token)) {
      case null null;
      case (?emailKey) profiles.get(emailKey);
    };
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  /// Invalidate a session token.
  public func logout(
    sessions : Map.Map<Text, Text>,
    token : Text,
  ) : () {
    sessions.remove(token);
  };

  // ── Profile helpers ─────────────────────────────────────────────────────────
  /// Retrieve a profile by email key.
  public func getProfileByEmail(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    email : Text,
  ) : ?CustomerTypes.CustomerProfile {
    profiles.get(email.toLower().trim(#char ' '));
  };

  /// Check whether an email is already registered.
  public func isRegisteredByEmail(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    email : Text,
  ) : Bool {
    switch (profiles.get(email.toLower().trim(#char ' '))) {
      case (?_) true;
      case null false;
    };
  };

  // ── Session invalidation helper ──────────────────────────────────────────────
  /// Remove all session tokens belonging to the given email (lowercase key).
  func invalidateSessionsForEmail(
    sessions : Map.Map<Text, Text>,
    emailKey : Text,
  ) : () {
    // Collect all token keys that map to this email first, then remove them.
    // We cannot mutate the map while iterating, so we build a list of keys first.
    var toRemove : [Text] = [];
    for ((tok, storedEmail) in sessions.entries()) {
      if (storedEmail == emailKey) {
        toRemove := toRemove.concat([tok]);
      };
    };
    for (tok in toRemove.values()) {
      sessions.remove(tok);
    };
  };

  // ── Security question ───────────────────────────────────────────────────────
  /// Return the security question for the given email, or null if not found.
  public func getSecurityQuestion(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    email : Text,
  ) : ?Text {
    switch (profiles.get(email.toLower().trim(#char ' '))) {
      case null null;
      case (?profile) ?profile.securityQuestion;
    };
  };

  // ── Password reset — security question flow ─────────────────────────────────
  /// Reset password by verifying the customer's security answer.
  public func resetPasswordWithSecurityQuestion(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    _tokenCounter : { var value : Nat },
    email : Text,
    answer : Text,
    newPassword : Text,
  ) : CustomerTypes.AuthResult {
    let emailKey = email.toLower().trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case null { #notFound };
      case (?profile) {
        // Case-insensitive, trimmed comparison
        let normalizedAnswer = answer.toLower();
        let trimmedAnswer = normalizedAnswer.trim(#char ' ');
        if (profile.securityAnswer == trimmedAnswer) {
          // Update password hash (trimmed for consistency)
          profiles.add(emailKey, { profile with passwordHash = newPassword.trim(#char ' ') });
          // Invalidate all existing sessions for this email
          invalidateSessionsForEmail(sessions, emailKey);
          #passwordResetSuccess;
        } else {
          #invalidSecurityAnswer;
        };
      };
    };
  };

  // ── Password reset — email-based token flow ─────────────────────────────────
  /// Create a reset token entry for the given email (token ID generated here).
  public func createResetToken(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    resetTokens : Map.Map<Text, CustomerTypes.ResetToken>,
    tokenCounter : { var value : Nat },
    email : Text,
  ) : CustomerTypes.ResetRequestResult {
    let emailKey = email.toLower().trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case null { #notFound };
      case (?_) {
        let tokenId = generateToken(emailKey # "_reset", tokenCounter);
        let ttl : Int = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
        resetTokens.add(tokenId, {
          email = emailKey;
          expiresAt = Time.now() + ttl;
        });
        #ok;
      };
    };
  };

  // ── Profile update ───────────────────────────────────────────────────────────
  /// Update profile fields for the customer identified by the given session token.
  /// Only non-null fields in `updates` are applied.
  /// Returns #ok with a success message, or #invalidCredentials if token is invalid.
  public func updateProfile(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    token : Text,
    updates : CustomerTypes.UpdateProfileInput,
  ) : CustomerTypes.AuthResult {
    switch (sessions.get(token)) {
      case null { #invalidCredentials };
      case (?emailKey) {
        switch (profiles.get(emailKey)) {
          case null { #invalidCredentials };
          case (?profile) {
            let updatedName = switch (updates.name) {
              case (?n) n;
              case null profile.name;
            };
            let updatedPhone = switch (updates.phone) {
              case (?p) p;
              case null profile.phone;
            };
            let updatedSecurityQuestion = switch (updates.securityQuestion) {
              case (?q) q;
              case null profile.securityQuestion;
            };
            let updatedSecurityAnswer = switch (updates.securityAnswer) {
              case (?a) a.toLower();
              case null profile.securityAnswer;
            };
            let updatedAvatar = switch (updates.avatar) {
              case (?av) ?av;
              case null profile.avatar;
            };
            let updatedBio = switch (updates.bio) {
              case (?b) ?b;
              case null profile.bio;
            };
            let updatedDeliveryAddress = switch (updates.deliveryAddress) {
              case (?d) ?d;
              case null profile.deliveryAddress;
            };
            profiles.add(emailKey, {
              profile with
              name = updatedName;
              phone = updatedPhone;
              securityQuestion = updatedSecurityQuestion;
              securityAnswer = updatedSecurityAnswer;
              avatar = updatedAvatar;
              bio = updatedBio;
              deliveryAddress = updatedDeliveryAddress;
            });
            #ok "Profile updated successfully";
          };
        };
      };
    };
  };

  // ── Password change ─────────────────────────────────────────────────────────
  /// Change password for the customer identified by the given session token.
  /// Verifies currentPassword matches the stored passwordHash before applying the change.
  /// Returns #ok on success, #invalidCredentials if token is invalid or currentPassword is wrong.
  public func changePassword(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    token : Text,
    currentPassword : Text,
    newPassword : Text,
  ) : CustomerTypes.AuthResult {
    switch (sessions.get(token)) {
      case null { #invalidCredentials };
      case (?emailKey) {
        switch (profiles.get(emailKey)) {
          case null { #invalidCredentials };
          case (?profile) {
            if (profile.passwordHash != currentPassword.trim(#char ' ')) {
              #invalidCredentials;
            } else {
              profiles.add(emailKey, { profile with passwordHash = newPassword.trim(#char ' ') });
              #ok "Password changed successfully";
            };
          };
        };
      };
    };
  };

  // ── Admin operations ────────────────────────────────────────────────────────

  /// Return all customer profiles as AdminUserView (includes password).
  public func listAllUsers(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
  ) : [CustomerTypes.AdminUserView] {
    var result : [CustomerTypes.AdminUserView] = [];
    for ((_key, profile) in profiles.entries()) {
      let view : CustomerTypes.AdminUserView = {
        email = profile.email;
        name = profile.name;
        phone = profile.phone;
        password = profile.passwordHash;
        bio = profile.bio;
        avatar = profile.avatar;
        deliveryAddress = profile.deliveryAddress;
        loyaltyPoints = profile.loyaltyPoints;
        wishlist = profile.wishlist;
        securityQuestion = profile.securityQuestion;
        createdAt = profile.createdAt;
      };
      result := result.concat([view]);
    };
    result;
  };

  /// Return the full AdminUserView for a single user by email, or null if not found.
  public func adminGetUser(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    email : Text,
  ) : ?CustomerTypes.AdminUserView {
    let emailKey = email.toLower().trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case null null;
      case (?profile) {
        ?{
          email = profile.email;
          name = profile.name;
          phone = profile.phone;
          password = profile.passwordHash;
          bio = profile.bio;
          avatar = profile.avatar;
          deliveryAddress = profile.deliveryAddress;
          loyaltyPoints = profile.loyaltyPoints;
          wishlist = profile.wishlist;
          securityQuestion = profile.securityQuestion;
          createdAt = profile.createdAt;
        };
      };
    };
  };

  /// Update a customer profile as admin. Applies only non-null fields.
  public func adminUpdateUser(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    email : Text,
    updates : CustomerTypes.AdminUserUpdate,
  ) : Bool {
    let emailKey = email.toLower().trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case null false;
      case (?profile) {
        let updatedName = switch (updates.displayName) {
          case (?n) n;
          case null profile.name;
        };
        let updatedPhone = switch (updates.phone) {
          case (?p) p;
          case null profile.phone;
        };
        let updatedBio = switch (updates.bio) {
          case (?b) ?b;
          case null profile.bio;
        };
        let updatedDeliveryAddress = switch (updates.deliveryAddress) {
          case (?d) ?d;
          case null profile.deliveryAddress;
        };
        let updatedPassword = switch (updates.newPassword) {
          case (?pw) pw.trim(#char ' ');
          case null profile.passwordHash;
        };
        profiles.add(emailKey, {
          profile with
          name = updatedName;
          phone = updatedPhone;
          bio = updatedBio;
          deliveryAddress = updatedDeliveryAddress;
          passwordHash = updatedPassword;
        });
        true;
      };
    };
  };

  /// Delete a customer account by email. Returns true if found and removed.
  public func adminDeleteUser(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    sessions : Map.Map<Text, Text>,
    email : Text,
  ) : Bool {
    let emailKey = email.toLower().trim(#char ' ');
    switch (profiles.get(emailKey)) {
      case null false;
      case (?_) {
        // Invalidate all active sessions for this user first
        invalidateSessionsForEmail(sessions, emailKey);
        profiles.remove(emailKey);
        true;
      };
    };
  };

  /// Reset password using a previously issued email reset token.
  public func resetPasswordWithToken(
    profiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
    resetTokens : Map.Map<Text, CustomerTypes.ResetToken>,
    sessions : Map.Map<Text, Text>,
    _tokenCounter : { var value : Nat },
    tokenId : Text,
    newPassword : Text,
  ) : CustomerTypes.AuthResult {
    switch (resetTokens.get(tokenId)) {
      case null { #resetTokenNotFound };
      case (?resetToken) {
        if (Time.now() > resetToken.expiresAt) {
          // Token has expired — clean it up
          resetTokens.remove(tokenId);
          #resetTokenExpired;
        } else {
          let emailKey = resetToken.email;
          switch (profiles.get(emailKey)) {
            case null { #notFound };
            case (?profile) {
              // Update password (trimmed for consistency)
              profiles.add(emailKey, { profile with passwordHash = newPassword.trim(#char ' ') });
              // Consume the token
              resetTokens.remove(tokenId);
              // Invalidate all existing sessions for this email
              invalidateSessionsForEmail(sessions, emailKey);
              #passwordResetSuccess;
            };
          };
        };
      };
    };
  };

  // ── Cart helpers ────────────────────────────────────────────────────────────

  /// Get the current cart items from a profile.
  public func getCart(profile : CustomerTypes.CustomerProfile) : [CustomerTypes.CartItem] {
    profile.cart;
  };

  /// Replace the entire cart with the given items.
  public func setCart(profile : CustomerTypes.CustomerProfile, items : [CustomerTypes.CartItem]) : CustomerTypes.CustomerProfile {
    { profile with cart = items };
  };

  /// Upsert a product into the cart. If productId already exists, update its quantity; otherwise append.
  public func addToCart(profile : CustomerTypes.CustomerProfile, productId : Common.ProductId, quantity : Nat) : CustomerTypes.CustomerProfile {
    let existing = profile.cart.find(func(item : CustomerTypes.CartItem) : Bool = item.productId == productId);
    switch (existing) {
      case (?_) {
        // Update quantity for existing entry
        let updated = profile.cart.map(
          func(item) {
            if (item.productId == productId) { { item with quantity = quantity } } else { item }
          }
        );
        { profile with cart = updated };
      };
      case null {
        // Append new entry
        { profile with cart = profile.cart.concat([{ productId; quantity }]) };
      };
    };
  };

  /// Remove a product from the cart by productId.
  public func removeFromCart(profile : CustomerTypes.CustomerProfile, productId : Common.ProductId) : CustomerTypes.CustomerProfile {
    { profile with cart = profile.cart.filter(func(item : CustomerTypes.CartItem) : Bool = item.productId != productId) };
  };

  /// Clear the cart entirely.
  public func clearCart(profile : CustomerTypes.CustomerProfile) : CustomerTypes.CustomerProfile {
    { profile with cart = [] };
  };
};

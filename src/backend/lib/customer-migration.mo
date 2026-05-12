// CustomerMigration.mo
// Explicit migration function to add `themePreference : ?Text` to CustomerProfile.
//
// When upgrading from a version that did not have `themePreference` in
// CustomerProfile, the stable Map<Text, CustomerProfile> contains records
// without that field. This migration transforms the old pre-upgrade state
// into the new state by filling in `themePreference = null` for all existing
// profiles.

import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  // ── Old CustomerProfile type (before themePreference was added) ─────────────
  // This mirrors the previous stable type exactly so the compiler can verify
  // the migration is type-safe.
  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type OldCustomerProfile = {
    name : Text;
    email : Text;
    phone : Text;
    passwordHash : Text;
    createdAt : Int;
    securityQuestion : Text;
    securityAnswer : Text;
    avatar : ?Text;
    bio : ?Text;
    deliveryAddress : ?Text;
    loyaltyPoints : Nat;
    wishlist : [Nat];
    cart : [CartItem];
  };

  // ── New CustomerProfile type (with themePreference) ─────────────────────────
  type NewCustomerProfile = {
    name : Text;
    email : Text;
    phone : Text;
    passwordHash : Text;
    createdAt : Int;
    securityQuestion : Text;
    securityAnswer : Text;
    avatar : ?Text;
    bio : ?Text;
    deliveryAddress : ?Text;
    loyaltyPoints : Nat;
    wishlist : [Nat];
    cart : [CartItem];
    themePreference : ?Text;
  };

  // ── Migration function ───────────────────────────────────────────────────────
  // Transforms the pre-upgrade state (with OldCustomerProfile) into the
  // post-upgrade state (with NewCustomerProfile), adding themePreference = null.
  public func migration(
    old : {
      var customerProfiles : Map.Map<Text, OldCustomerProfile>;
    }
  ) : {
    var customerProfiles : Map.Map<Text, NewCustomerProfile>;
  } {
    let newProfiles = Map.empty<Text, NewCustomerProfile>();
    for ((key, p) in old.customerProfiles.entries()) {
      newProfiles.add(key, {
        name = p.name;
        email = p.email;
        phone = p.phone;
        passwordHash = p.passwordHash;
        createdAt = p.createdAt;
        securityQuestion = p.securityQuestion;
        securityAnswer = p.securityAnswer;
        avatar = p.avatar;
        bio = p.bio;
        deliveryAddress = p.deliveryAddress;
        loyaltyPoints = p.loyaltyPoints;
        wishlist = p.wishlist;
        cart = p.cart;
        themePreference = null;
      });
    };
    { var customerProfiles = newProfiles };
  };
};

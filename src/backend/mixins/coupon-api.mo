import List "mo:core/List";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import CouponLib "../lib/coupon";
import Common "../types/common";

mixin (
  admins : Set.Set<Principal>,
  coupons : List.List<Common.Coupon>,
  nextCouponId : { var value : Nat },
) {
  // ── Admin: create a new coupon ──────────────────────────────────────────────
  public shared ({ caller }) func addCoupon(input : Common.CouponInput) : async Common.Coupon {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can create coupons");
    };
    if (input.discountValue == 0) {
      Runtime.trap("discountValue must be greater than 0");
    };
    CouponLib.addCoupon(coupons, nextCouponId, input);
  };

  // ── Admin: update an existing coupon ───────────────────────────────────────
  public shared ({ caller }) func updateCoupon(id : Nat, input : Common.CouponInput) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can update coupons");
    };
    CouponLib.updateCoupon(coupons, id, input);
  };

  // ── Admin: delete a coupon ─────────────────────────────────────────────────
  public shared ({ caller }) func deleteCoupon(id : Nat) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete coupons");
    };
    CouponLib.deleteCoupon(coupons, id);
  };

  // ── Admin: list all coupons ────────────────────────────────────────────────
  public shared ({ caller }) func getCoupons() : async [Common.Coupon] {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can list coupons");
    };
    CouponLib.getAllCoupons(coupons);
  };

  // ── Public: validate a coupon code ────────────────────────────────────────
  // Returns the coupon if valid and active; null if invalid/expired/exhausted
  public query func validateCoupon(code : Text) : async ?Common.Coupon {
    CouponLib.validateCoupon(coupons, code);
  };
};

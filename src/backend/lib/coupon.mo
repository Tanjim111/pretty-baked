import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Common "../types/common";

module {
  public type Coupon = Common.Coupon;
  public type CouponInput = Common.CouponInput;

  // Validate a coupon code and return the matching coupon if valid
  public func validateCoupon(
    coupons : List.List<Coupon>,
    code : Text,
  ) : ?Coupon {
    let codeUpper = code.toUpper().trim(#char ' ');
    let now = Time.now();
    coupons.find(func(c : Coupon) : Bool {
      c.code.toUpper() == codeUpper and
      c.isActive and
      (switch (c.maxUses) { case null true; case (?max) c.currentUses < max }) and
      (switch (c.expiresAt) { case null true; case (?exp) now < exp })
    });
  };

  // Apply a coupon discount to a base total (in BDT paisa), returning discount amount
  public func applyDiscount(
    coupon : Coupon,
    baseTotal : Nat,
  ) : Nat {
    switch (coupon.discountType) {
      case (#fixed) {
        if (coupon.discountValue > baseTotal) baseTotal else coupon.discountValue;
      };
      case (#percentage) {
        let discount = baseTotal * coupon.discountValue / 100;
        if (discount > baseTotal) baseTotal else discount;
      };
    };
  };

  // Increment coupon use count after a successful order
  public func recordUse(
    coupons : List.List<Coupon>,
    couponId : Nat,
  ) : () {
    coupons.mapInPlace(func(c : Coupon) : Coupon {
      if (c.id == couponId) { { c with currentUses = c.currentUses + 1 } } else { c }
    });
  };

  // Create a new coupon and append to list
  public func addCoupon(
    coupons : List.List<Coupon>,
    nextId : { var value : Nat },
    input : CouponInput,
  ) : Coupon {
    let id = nextId.value;
    let coupon : Coupon = {
      id;
      code = input.code.toUpper().trim(#char ' ');
      discountType = input.discountType;
      discountValue = input.discountValue;
      maxUses = input.maxUses;
      currentUses = 0;
      expiresAt = input.expiresAt;
      isActive = input.isActive;
      createdAt = Time.now();
    };
    coupons.add(coupon);
    nextId.value += 1;
    coupon;
  };

  // Update an existing coupon by id
  public func updateCoupon(
    coupons : List.List<Coupon>,
    id : Nat,
    input : CouponInput,
  ) : Bool {
    var found = false;
    coupons.mapInPlace(func(c : Coupon) : Coupon {
      if (c.id == id) {
        found := true;
        {
          c with
          code = input.code.toUpper().trim(#char ' ');
          discountType = input.discountType;
          discountValue = input.discountValue;
          maxUses = input.maxUses;
          expiresAt = input.expiresAt;
          isActive = input.isActive;
        };
      } else { c };
    });
    found;
  };

  // Delete a coupon by id
  public func deleteCoupon(
    coupons : List.List<Coupon>,
    id : Nat,
  ) : Bool {
    let before = coupons.size();
    let kept = coupons.filter(func(c : Coupon) : Bool = c.id != id);
    coupons.clear();
    coupons.addAll(kept.values());
    coupons.size() < before;
  };

  // Return all coupons as array
  public func getAllCoupons(coupons : List.List<Coupon>) : [Coupon] {
    coupons.toArray();
  };
};

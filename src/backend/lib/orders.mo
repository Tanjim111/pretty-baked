import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import OrderTypes "../types/orders";
import PaymentTypes "../types/payment";
import Common "../types/common";
import CustomerTypes "../types/customer";

module {
  let CHARSET : [Char] = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                           'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
                           '0','1','2','3','4','5','6','7','8','9'];
  let CHARSET_SIZE : Nat = 36;

  /// Generate a human-readable order ID like "ORD-7X3K9M".
  /// Combines Time.now() (nanoseconds) with the sequential id for uniqueness.
  func generateOrderId(seqId : Nat) : Text {
    // Mix nanosecond timestamp with seqId. Int.abs ensures Nat.
    let t : Nat = Int.abs(Time.now());
    // Use different digit positions of the seed for each character to spread entropy.
    var seed = t + seqId * 100_003;
    let chars : [var Char] = [var 'A','A','A','A','A','A'];
    var i = 0;
    while (i < 6) {
      let idx = seed % CHARSET_SIZE;
      chars[i] := CHARSET[idx];
      // Advance seed: shift by dividing and mixing with seqId per position
      seed := seed / CHARSET_SIZE + (t / (i + 1) % 1_000_000) + seqId;
      i += 1;
    };
    "ORD-" # Text.fromIter(chars.vals());
  };

  public func computeTotal(items : [OrderTypes.OrderItem]) : Nat {
    var total : Nat = 0;
    for (item in items.vals()) {
      total += item.unitPrice * item.quantity;
    };
    total;
  };

  let NOTES_DELIM : Text = "|||NOTE|||";

  /// Encode deliveryAddress and deliveryNote into the notes field.
  /// If OrderInput provides the canonical separate fields, combine them.
  /// Otherwise fall back to the legacy notes field.
  func encodeNotes(input : OrderTypes.OrderInput) : ?Text {
    switch (input.deliveryAddress, input.deliveryNote) {
      case (?addr, ?note) {
        // Both provided: encode as "address|||NOTE|||note"
        ?(addr # NOTES_DELIM # note);
      };
      case (?addr, null) {
        // Address only — check if legacy notes also has something
        switch (input.notes) {
          case (?n) {
            // Legacy notes present: prefer encoded combination
            ?(addr # NOTES_DELIM # n);
          };
          case null ?(addr);
        };
      };
      case (null, _) {
        // No canonical address — fall back to legacy notes field
        input.notes;
      };
    };
  };

  public func placeOrder(
    orders : List.List<OrderTypes.Order>,
    nextOrderId : { var value : Nat },
    input : OrderTypes.OrderInput,
    callerPrincipal : ?Principal,
    coupons : List.List<Common.Coupon>,
    customerProfiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
  ) : Common.OrderId {
    let id = nextOrderId.value;
    let orderId = generateOrderId(id);
    let now = Time.now();
    let subtotal = computeTotal(input.items);

    // ── Coupon validation ─────────────────────────────────────────────────
    var appliedCouponCode : ?Text = null;
    var appliedCouponDiscount : ?Nat = null;
    switch (input.couponCode) {
      case null {};
      case (?code) {
        let codeUpper = code.toUpper().trim(#char ' ');
        switch (coupons.find(func(c : Common.Coupon) : Bool {
          c.code.toUpper() == codeUpper and c.isActive and
          (switch (c.maxUses) { case null true; case (?max) c.currentUses < max }) and
          (switch (c.expiresAt) { case null true; case (?exp) now < exp })
        })) {
          case null {}; // coupon not found or invalid — ignore silently
          case (?coupon) {
            let discount = switch (coupon.discountType) {
              case (#fixed) { if (coupon.discountValue > subtotal) subtotal else coupon.discountValue };
              case (#percentage) { subtotal * coupon.discountValue / 100 };
            };
            appliedCouponCode := ?code;
            appliedCouponDiscount := ?discount;
            // Increment use counter
            coupons.mapInPlace(func(c : Common.Coupon) : Common.Coupon {
              if (c.id == coupon.id) { { c with currentUses = c.currentUses + 1 } } else { c }
            });
          };
        };
      };
    };

    // ── Loyalty points redemption ──────────────────────────────────────────
    var redeemedPoints : ?Nat = null;
    switch (input.pointsToRedeem) {
      case null {};
      case (?pts) {
        if (pts > 0) {
          redeemedPoints := ?pts;
          // Deduct from customer profile
          switch (callerPrincipal) {
            case null {};
            case (?_) {
              let emailKey = input.customerEmail.toLower().trim(#char ' ');
              switch (customerProfiles.get(emailKey)) {
                case null {};
                case (?profile) {
                  let deduct = if (pts > profile.loyaltyPoints) profile.loyaltyPoints else pts;
                  customerProfiles.add(emailKey, { profile with loyaltyPoints = Nat.sub(profile.loyaltyPoints, deduct) });
                  redeemedPoints := ?deduct;
                };
              };
            };
          };
        };
      };
    };

    // ── Compute final total ────────────────────────────────────────────────
    let couponOff = switch (appliedCouponDiscount) { case null 0; case (?d) d };
    let pointsOff = switch (redeemedPoints) { case null 0; case (?p) p };
    let rawTotal = subtotal;
    let afterCoupon = if (couponOff > rawTotal) 0 else Nat.sub(rawTotal, couponOff);
    let finalTotal = if (pointsOff > afterCoupon) 0 else Nat.sub(afterCoupon, pointsOff);

    orders.add({
      id;
      orderId;
      customerPrincipal = callerPrincipal;
      customerName = input.customerName;
      customerPhone = input.customerPhone;
      customerEmail = input.customerEmail;
      items = input.items;
      total = finalTotal;
      status = #pending;
      notes = encodeNotes(input);
      paymentMethod = input.paymentMethod;
      stripePaymentIntentId = input.stripePaymentIntentId;
      stripePaymentStatus = null;
      createdAt = now;
      couponCode = appliedCouponCode;
      couponDiscount = appliedCouponDiscount;
      pointsRedeemed = redeemedPoints;
      pointsEarned = null; // awarded when order is delivered
    });
    nextOrderId.value += 1;
    id;
  };

  public func getOrder(
    orders : List.List<OrderTypes.Order>,
    id : Common.OrderId,
  ) : ?OrderTypes.Order {
    orders.find(func(o : OrderTypes.Order) : Bool = o.id == id);
  };

  public func listOrders(
    orders : List.List<OrderTypes.Order>,
  ) : [OrderTypes.Order] {
    orders.toArray();
  };

  public func getOrdersByCustomer(
    orders : List.List<OrderTypes.Order>,
    customer : Principal,
  ) : [OrderTypes.Order] {
    orders.filter(func(o : OrderTypes.Order) : Bool {
      switch (o.customerPrincipal) {
        case (?p) Principal.equal(p, customer);
        case null false;
      };
    }).toArray();
  };

  public func updateOrderStatus(
    orders : List.List<OrderTypes.Order>,
    id : Common.OrderId,
    status : Common.OrderStatus,
  ) : Bool {
    var found = false;
    orders.mapInPlace(
      func(o : OrderTypes.Order) : OrderTypes.Order {
        if (o.id == id) {
          found := true;
          { o with status };
        } else {
          o;
        };
      }
    );
    found;
  };

  public func updateOrderPaymentStatus(
    orders : List.List<OrderTypes.Order>,
    id : Common.OrderId,
    paymentIntentId : Text,
    paymentStatus : ?PaymentTypes.StripePaymentStatus,
  ) : Bool {
    var found = false;
    orders.mapInPlace(
      func(o : OrderTypes.Order) : OrderTypes.Order {
        if (o.id == id) {
          found := true;
          { o with stripePaymentIntentId = ?paymentIntentId; stripePaymentStatus = paymentStatus };
        } else {
          o;
        };
      }
    );
    found;
  };

  public func getOrdersByEmail(
    orders : List.List<OrderTypes.Order>,
    email : Text,
  ) : [OrderTypes.Order] {
    let emailLower = email.toLower();
    orders.filter(func(o : OrderTypes.Order) : Bool {
      o.customerEmail.toLower() == emailLower;
    }).toArray();
  };

  public func deleteOrder(
    orders : List.List<OrderTypes.Order>,
    id : Common.OrderId,
  ) : Bool {
    let before = orders.size();
    let kept = orders.filter(func(o : OrderTypes.Order) : Bool = o.id != id);
    orders.clear();
    orders.addAll(kept.values());
    orders.size() < before;
  };
};

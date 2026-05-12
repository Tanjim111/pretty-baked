import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import OrderLib "../lib/orders";
import OrderTypes "../types/orders";
import CatalogTypes "../types/catalog";
import CustomerTypes "../types/customer";
import Common "../types/common";

mixin (
  admins : Set.Set<Principal>,
  orders : List.List<OrderTypes.Order>,
  products : List.List<CatalogTypes.ProductInternal>,
  nextOrderId : { var value : Nat },
  coupons : List.List<Common.Coupon>,
  customerProfiles : Map.Map<Text, CustomerTypes.CustomerProfile>,
) {
  // ── Customer operations ──────────────────────────────────────────────────

  /// Place an order. If the caller is authenticated (non-anonymous), their
  /// principal is stored on the order so they can retrieve it via getMyOrders.
  /// Validates and applies coupon / loyalty points if provided in the input.
  public shared ({ caller }) func placeOrder(input : OrderTypes.OrderInput) : async Common.OrderId {
    let maybeCaller : ?Principal = if (caller.isAnonymous()) null else ?caller;
    OrderLib.placeOrder(orders, nextOrderId, input, maybeCaller, coupons, customerProfiles);
  };

  // ── Admin operations ─────────────────────────────────────────────────────

  public query ({ caller }) func listOrders() : async [OrderTypes.Order] {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can list orders");
    };
    OrderLib.listOrders(orders);
  };

  public query ({ caller }) func getOrder(id : Common.OrderId) : async ?OrderTypes.Order {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    OrderLib.getOrder(orders, id);
  };

  public shared ({ caller }) func updateOrderStatus(id : Common.OrderId, status : Common.OrderStatus) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    OrderLib.updateOrderStatus(orders, id, status);
  };

  public shared ({ caller }) func deleteOrder(id : Common.OrderId) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };
    OrderLib.deleteOrder(orders, id);
  };

  /// Admin analytics: return all orders within [startDate, endDate] (nanosecond timestamps).
  public query ({ caller }) func getOrdersByDateRange(startDate : Int, endDate : Int) : async [OrderTypes.Order] {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can access analytics");
    };
    orders.filter(func(o : OrderTypes.Order) : Bool {
      o.createdAt >= startDate and o.createdAt <= endDate
    }).toArray();
  };
};

import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import CatalogLib "lib/catalog";
import CatalogTypes "types/catalog";
import OrderTypes "types/orders";
import CustomerTypes "types/customer";
import ReviewTypes "types/review";
import Common "types/common";
import CatalogApiMixin "mixins/catalog-api";
import OrdersApiMixin "mixins/orders-api";
import ChatApiMixin "mixins/chat-api";
import PaymentApiMixin "mixins/payment-api";
import CustomerApiMixin "mixins/customer-api";
import ReviewApiMixin "mixins/review-api";
import CouponApiMixin "mixins/coupon-api";
import PromoApiMixin "mixins/promo-api";
import SiteContentApiMixin "mixins/site-content-api";
import SiteContentLib "lib/site-content";
import Nat "mo:core/Nat";
import PromoLib "lib/promo";





actor {
  // ── Authorization state ──────────────────────────────────────────────────
  // Simple admin set — first caller to `claimAdmin` becomes admin
  let admins = Set.empty<Principal>();

  public shared ({ caller }) func claimAdmin() : async Bool {
    if (admins.size() == 0) {
      admins.add(caller);
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func assignAdmin(user : Principal) : async () {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    admins.add(user);
  };

  public query func isAdmin(user : Principal) : async Bool {
    admins.contains(user);
  };

  // ── Catalog state ────────────────────────────────────────────────────
  let products = List.empty<CatalogTypes.ProductInternal>();
  let categories = List.empty<CatalogTypes.Category>();
  let nextProductId = { var value : Nat = 1 };
  let nextCategoryId = { var value : Nat = 1 };
  let seeded = { var value : Bool = false };

  // Seed sample data on first run — guard with both seeded flag and empty check
  // so seed never re-runs on upgrade (seeded persists via EOP) and is also
  // idempotent if the flag ever resets (products.size() == 0 prevents duplicates)
  if (not seeded.value and products.size() == 0) {
    CatalogLib.seedProducts(products, categories, nextProductId, nextCategoryId);
    seeded.value := true;
  };

  include CatalogApiMixin(
    admins,
    products,
    categories,
    nextProductId,
    nextCategoryId,
  );

  // ── Coupon state ────────────────────────────────────────────────────
  let coupons = List.empty<Common.Coupon>();
  let nextCouponId = { var value : Nat = 1 };

  include CouponApiMixin(
    admins,
    coupons,
    nextCouponId,
  );

  // ── Promo announcement state ──────────────────────────────────────────────
  let promoState = { var announcement : ?Common.PromoAnnouncement = null };

  include PromoApiMixin(
    admins,
    promoState,
  );

  // ── Site content state ────────────────────────────────────────────────────
  let siteContentStore = { var content : Common.SiteContent = SiteContentLib.defaultSiteContent };

  include SiteContentApiMixin(
    admins,
    siteContentStore,
  );

  // ── Orders state ────────────────────────────────────────────────────
  let orders = List.empty<OrderTypes.Order>();
  let nextOrderId = { var value : Nat = 1 };

  // Customer profiles are wired below but needed by orders for loyalty points
  let customerProfiles = Map.empty<Text, CustomerTypes.CustomerProfile>();

  include OrdersApiMixin(
    admins,
    orders,
    products,
    nextOrderId,
    coupons,
    customerProfiles,
  );

  // ── Payment state ──────────────────────────────────────────────────
  include PaymentApiMixin(
    admins,
    orders,
  );

  // ── Customer account state ────────────────────────────────────────────
  // Profiles keyed by lowercase email; sessions keyed by token -> email
  // resetTokens keyed by tokenId -> {email, expiresAt} for email-based reset flow
  let customerSessions = Map.empty<Text, Text>();
  let customerTokenCounter = { var value : Nat = 0 };
  let resetTokens = Map.empty<Text, CustomerTypes.ResetToken>();

  include CustomerApiMixin(
    admins,
    customerProfiles,
    customerSessions,
    customerTokenCounter,
    orders,
    resetTokens,
  );

  // ── Chat state ────────────────────────────────────────────────────
  include ChatApiMixin(products, categories);

  // ── Reviews state ──────────────────────────────────────────────────
  let reviews = List.empty<ReviewTypes.Review>();
  let nextReviewId = { var value : Nat = 0 };

  include ReviewApiMixin(reviews, nextReviewId);

  // ── Re-seed guard ────────────────────────────────────────────────────
  // Called by the frontend after detecting empty data (e.g. after a full canister
  // reinstall). Safe to call multiple times — does nothing if data already exists.
  public shared func reinitializeIfEmpty() : async Bool {
    if (not seeded.value and products.size() == 0) {
      CatalogLib.seedProducts(products, categories, nextProductId, nextCategoryId);
      seeded.value := true;
      true; // reseeded
    } else {
      false; // already had data
    };
  };

  // ── Backend status query ────────────────────────────────────────────────────
  // Lets the frontend instantly know whether the backend has data or is empty,
  // without waiting for a full data fetch to time out or return empty arrays.
  public query func getBackendStatus() : async { hasProducts : Bool; hasCategories : Bool; hasAdmins : Bool; productCount : Nat; categoryCount : Nat } {
    {
      hasProducts = products.size() > 0;
      hasCategories = categories.size() > 0;
      hasAdmins = admins.size() > 0;
      productCount = products.size();
      categoryCount = categories.size();
    };
  };

  // ── Fast init query ────────────────────────────────────────────────────
  // Returns all data the storefront + admin dashboard needs in a single call.
  // Including recent orders and low-stock products eliminates extra round-trips.
  public type StoreInitData = {
    products : [CatalogTypes.Product];
    categories : [CatalogTypes.Category];
    promoAnnouncement : ?Common.PromoAnnouncement;
    siteContent : Common.SiteContent;
    recentOrders : [OrderTypes.Order];    // last 50 orders (newest first)
    lowStockProducts : [CatalogTypes.Product]; // products with quantity < 3
  };

  public query func getStoreInitData() : async StoreInitData {
    // Sort orders newest-first and take up to 50
    let allOrders = orders.toArray();
    let sortedOrders = allOrders.sort(func(a : OrderTypes.Order, b : OrderTypes.Order) : { #less; #equal; #greater } {
      if (a.createdAt > b.createdAt) #less
      else if (a.createdAt < b.createdAt) #greater
      else #equal;
    });
    let recentOrders = if (sortedOrders.size() <= 50) sortedOrders
      else sortedOrders.sliceToArray(0, 50);
    {
      products = CatalogLib.listProducts(products);
      categories = CatalogLib.listCategories(categories);
      promoAnnouncement = PromoLib.getPromoAnnouncement(promoState);
      siteContent = SiteContentLib.getSiteContent(siteContentStore);
      recentOrders;
      lowStockProducts = CatalogLib.getLowStockProducts(products, 3);
    };
  };
};

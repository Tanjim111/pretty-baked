module {
  public type Timestamp = Int;
  public type ProductId = Nat;
  public type CategoryId = Nat;
  public type OrderId = Nat;

  public type OrderStatus = {
    #pending;
    #confirmed;
    #preparing;
    #readyForPickup;
    #outForDelivery;
    #delivered;
    #cancelled;
  };

  // Chat types for Bakey AI assistant
  public type ChatMessage = {
    role : Text;    // "user" or "assistant"
    content : Text;
  };

  // Coupon discount type
  public type DiscountType = {
    #percentage; // discountValue is a percent (0-100)
    #fixed;      // discountValue is a flat BDT paisa amount
  };

  // Coupon / promo code
  public type Coupon = {
    id : Nat;
    code : Text;
    discountType : DiscountType;
    discountValue : Nat;
    maxUses : ?Nat;       // null = unlimited
    currentUses : Nat;
    expiresAt : ?Int;     // null = no expiry; Int nanoseconds timestamp
    isActive : Bool;
    createdAt : Int;
  };

  public type CouponInput = {
    code : Text;
    discountType : DiscountType;
    discountValue : Nat;
    maxUses : ?Nat;
    expiresAt : ?Int;
    isActive : Bool;
  };

  // Promotional announcement bar (header)
  public type PromoAnnouncement = {
    title : Text;
    message : Text;
    isActive : Bool;
    offerImageUrl : ?Text;
    deliveryHours : Text;
  };

  // Orders summary for dashboard (shared/public type)
  public type OrderSummary = {
    id : OrderId;
    orderId : Text;
    customerName : Text;
    customerEmail : Text;
    total : Nat;
    status : OrderStatus;
    createdAt : Timestamp;
    couponCode : ?Text;
    couponDiscount : ?Nat;
    pointsRedeemed : ?Nat;
  };

  // Editable site content (header, footer, contact, about, special occasions)
  public type SiteContent = {
    siteName : Text;          // display name shown in the site header
    logoImageUrl : Text;      // URL of the custom logo; empty = use default logo
    headerTagline : Text;
    footerAddress : Text;
    footerPhone : Text;
    footerEmail : Text;
    footerSocialFacebook : Text;
    footerSocialInstagram : Text;
    footerSocialWhatsApp : Text;
    contactAddress : Text;
    contactPhone : Text;
    contactEmail : Text;
    contactHours : Text;
    contactMapEmbed : Text;
    aboutTitle : Text;
    aboutStory : Text;
    aboutMission : Text;
    aboutFoundedYear : Text;
    aboutTeamInfo : Text;
    specialOccasionsTitle : Text;
    specialOccasionsDescription : Text;
    specialOccasionsOfferings : Text;
  };
};

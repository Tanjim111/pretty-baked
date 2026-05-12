export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // BDT
  category: string;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  sku: string;
  createdAt: number;
  ingredients: string[];
  /** Additional product images (data URLs or remote URLs) */
  images?: string[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderId?: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  createdAt: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  /** Delivery note / special instructions entered by the customer at checkout */
  deliveryNote?: string;
  /** @deprecated Legacy alias for deliveryNote — kept for backward compat */
  notes?: string;
  customerPrincipal: string | null;
  paymentMethod: "stripe" | "cod";
  stripePaymentIntentId: string | null;
  stripePaymentStatus: string | null;
  couponCode?: string;
  couponDiscount?: number;
  pointsRedeemed?: number;
  pointsEarned?: number;
  deliveryFee?: number;
}

export interface SiteContent {
  siteName: string;
  logoImageUrl: string;
  headerTagline: string;
  siteSlogan: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerSocialFacebook: string;
  footerSocialInstagram: string;
  footerSocialWhatsApp: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string;
  contactMapEmbed: string;
  aboutTitle: string;
  aboutStory: string;
  aboutMission: string;
  aboutFoundedYear: string;
  aboutTeamInfo: string;
  ourStoryImageUrl: string;
  ourStoryYearsOfCraft: string;
  ourStoryProductCount: string;
  ourStoryHappyCustomers: string;
  specialOccasionsTitle: string;
  specialOccasionsDescription: string;
  specialOccasionsOfferings: string;
}

export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  createdAt: bigint;
  avatar?: string;
  bio?: string;
  deliveryAddress?: string;
  loyaltyPoints: number;
  wishlist: number[];
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

export interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: bigint;
}

export interface Coupon {
  id: bigint;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: bigint;
  maxUses?: bigint;
  currentUses: bigint;
  expiresAt?: bigint;
  isActive: boolean;
  createdAt: bigint;
}

export interface CouponInput {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: bigint;
  maxUses?: bigint;
  expiresAt?: bigint;
  isActive: boolean;
}

export interface PromoAnnouncement {
  title: string;
  message: string;
  isActive: boolean;
  offerImageUrl?: string;
  /** Up to 4 billboard images for slideshow. Takes precedence over offerImageUrl. */
  offerImages?: string[];
  deliveryHours: string;
}

export interface AdminUserView {
  email: string;
  password: string;
  name: string;
  phone: string;
  createdAt: bigint;
  loyaltyPoints: bigint;
  wishlist: bigint[];
  avatar?: string;
  bio?: string;
  deliveryAddress?: string;
  securityQuestion: string;
}

export interface AdminUserUpdate {
  displayName?: string;
  phone?: string;
  bio?: string;
  deliveryAddress?: string;
  newPassword?: string;
}

/** Serialisable cart item stored in the backend per-user. */
export interface BackendCartItem {
  productId: string;
  quantity: number;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface CategoryInput {
    displayOrder: bigint;
    name: string;
    description: string;
}
export interface OrderItem {
    productId: ProductId;
    productName: string;
    quantity: bigint;
    unitPrice: bigint;
}
export interface OrderInput {
    customerName: string;
    deliveryAddress?: string;
    couponCode?: string;
    paymentMethod: PaymentMethod;
    customerPhone: string;
    deliveryNote?: string;
    notes?: string;
    pointsToRedeem?: bigint;
    stripePaymentIntentId?: string;
    items: Array<OrderItem>;
    customerEmail: string;
}
export interface PromoAnnouncement {
    title: string;
    isActive: boolean;
    message: string;
    deliveryHours: string;
    offerImageUrl?: string;
}
export interface RegisterInput {
    password: string;
    name: string;
    securityQuestion: string;
    email: string;
    securityAnswer: string;
    phone: string;
}
export interface ChatMessage {
    content: string;
    role: string;
}
export type ReviewId = bigint;
export interface SiteContent {
    footerEmail: string;
    footerSocialFacebook: string;
    specialOccasionsDescription: string;
    contactMapEmbed: string;
    contactHours: string;
    footerAddress: string;
    footerPhone: string;
    aboutTitle: string;
    siteName: string;
    specialOccasionsOfferings: string;
    footerSocialInstagram: string;
    aboutFoundedYear: string;
    contactEmail: string;
    specialOccasionsTitle: string;
    logoImageUrl: string;
    aboutTeamInfo: string;
    aboutStory: string;
    headerTagline: string;
    footerSocialWhatsApp: string;
    contactAddress: string;
    aboutMission: string;
    contactPhone: string;
}
export interface ConfirmPaymentInput {
    orderId: bigint;
    paymentIntentId: string;
}
export type AuthResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "invalidSecurityAnswer";
    invalidSecurityAnswer: null;
} | {
    __kind__: "emailTaken";
    emailTaken: null;
} | {
    __kind__: "resetTokenNotFound";
    resetTokenNotFound: null;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "resetTokenExpired";
    resetTokenExpired: null;
} | {
    __kind__: "invalidCredentials";
    invalidCredentials: null;
} | {
    __kind__: "passwordResetSuccess";
    passwordResetSuccess: null;
};
export interface StoreInitData {
    categories: Array<Category>;
    lowStockProducts: Array<Product>;
    recentOrders: Array<Order>;
    products: Array<Product>;
    siteContent: SiteContent;
    promoAnnouncement?: PromoAnnouncement;
}
export interface Review {
    id: ReviewId;
    createdAt: Timestamp;
    text: string;
    productId: ProductId;
    reviewerName: string;
    reviewerPrincipal: Principal;
    rating: bigint;
}
export interface Category {
    id: CategoryId;
    displayOrder: bigint;
    name: string;
    createdAt: Timestamp;
    description: string;
}
export interface ProductInput {
    name: string;
    description: string;
    category: CategoryId;
    image?: Uint8Array;
    price: bigint;
    ingredients: Array<string>;
    images: Array<Uint8Array>;
}
export type AddReviewResult = {
    __kind__: "ok";
    ok: ReviewId;
} | {
    __kind__: "err";
    err: string;
};
export interface PaymentIntentResult {
    status: StripePaymentStatus;
    clientSecret: string;
    paymentIntentId: string;
}
export interface Coupon {
    id: bigint;
    discountValue: bigint;
    expiresAt?: bigint;
    code: string;
    createdAt: bigint;
    discountType: DiscountType;
    isActive: boolean;
    currentUses: bigint;
    maxUses?: bigint;
}
export interface CustomerProfile {
    bio?: string;
    deliveryAddress?: string;
    cart: Array<CartItem>;
    name: string;
    createdAt: Timestamp;
    securityQuestion: string;
    email: string;
    loyaltyPoints: bigint;
    securityAnswer: string;
    passwordHash: string;
    phone: string;
    wishlist: Array<ProductId>;
    avatar?: string;
}
export interface CreatePaymentIntentInput {
    orderId: bigint;
    currency: string;
    customerEmail: string;
    amountPaisa: bigint;
}
export interface AdminUserUpdate {
    bio?: string;
    deliveryAddress?: string;
    displayName?: string;
    newPassword?: string;
    phone?: string;
}
export interface Order {
    id: OrderId;
    customerName: string;
    status: OrderStatus;
    couponCode?: string;
    total: bigint;
    paymentMethod: PaymentMethod;
    customerPhone: string;
    customerPrincipal?: Principal;
    createdAt: Timestamp;
    orderId: string;
    pointsEarned?: bigint;
    couponDiscount?: bigint;
    notes?: string;
    stripePaymentIntentId?: string;
    items: Array<OrderItem>;
    pointsRedeemed?: bigint;
    customerEmail: string;
    stripePaymentStatus?: StripePaymentStatus;
}
export interface AdminUserView {
    bio?: string;
    deliveryAddress?: string;
    password: string;
    name: string;
    createdAt: Timestamp;
    securityQuestion: string;
    email: string;
    loyaltyPoints: bigint;
    phone: string;
    wishlist: Array<ProductId>;
    avatar?: string;
}
export interface UpdateProfileInput {
    bio?: string;
    deliveryAddress?: string;
    name?: string;
    securityQuestion?: string;
    securityAnswer?: string;
    phone?: string;
    avatar?: string;
}
export type CategoryId = bigint;
export interface CouponInput {
    discountValue: bigint;
    expiresAt?: bigint;
    code: string;
    discountType: DiscountType;
    isActive: boolean;
    maxUses?: bigint;
}
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export type OrderId = bigint;
export interface Product {
    id: ProductId;
    name: string;
    createdAt: Timestamp;
    description: string;
    category: CategoryId;
    image?: Uint8Array;
    price: bigint;
    ingredients: Array<string>;
    images: Array<Uint8Array>;
}
export enum DiscountType {
    fixed = "fixed",
    percentage = "percentage"
}
export enum OrderStatus {
    readyForPickup = "readyForPickup",
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    outForDelivery = "outForDelivery",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    cod = "cod",
    stripe = "stripe"
}
export enum ResetRequestResult {
    ok = "ok",
    notFound = "notFound"
}
export enum StripePaymentStatus {
    canceled = "canceled",
    requiresPaymentMethod = "requiresPaymentMethod",
    requiresConfirmation = "requiresConfirmation",
    requiresAction = "requiresAction",
    processing = "processing",
    unknown_ = "unknown",
    succeeded = "succeeded"
}
export interface backendInterface {
    addCategory(input: CategoryInput): Promise<CategoryId>;
    addCoupon(input: CouponInput): Promise<Coupon>;
    addLoyaltyPoints(token: string, points: bigint): Promise<boolean>;
    addProduct(input: ProductInput): Promise<ProductId>;
    addReview(productId: ProductId, reviewerName: string, rating: bigint, text: string): Promise<AddReviewResult>;
    addToWishlist(token: string, productId: ProductId): Promise<boolean>;
    adminDeleteUser(email: string): Promise<boolean>;
    adminGetUser(email: string): Promise<AdminUserView | null>;
    adminUpdateUser(email: string, updates: AdminUserUpdate): Promise<boolean>;
    assignAdmin(user: Principal): Promise<void>;
    changePassword(token: string, currentPassword: string, newPassword: string): Promise<AuthResult>;
    chatWithBakey(userMessage: string, conversationHistory: Array<ChatMessage>): Promise<string>;
    claimAdmin(): Promise<boolean>;
    clearMyCart(token: string): Promise<boolean>;
    confirmPayment(input: ConfirmPaymentInput): Promise<boolean>;
    createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
    deductLoyaltyPoints(token: string, points: bigint): Promise<boolean>;
    deleteCategory(id: CategoryId): Promise<boolean>;
    deleteCoupon(id: bigint): Promise<boolean>;
    deleteOrder(id: OrderId): Promise<boolean>;
    deleteProduct(id: ProductId): Promise<boolean>;
    getAverageRating(productId: ProductId): Promise<number | null>;
    getBackendStatus(): Promise<{
        hasCategories: boolean;
        productCount: bigint;
        categoryCount: bigint;
        hasProducts: boolean;
        hasAdmins: boolean;
    }>;
    getCategories(): Promise<Array<Category>>;
    getCoupons(): Promise<Array<Coupon>>;
    getLowStockProducts(threshold: bigint): Promise<Array<Product>>;
    getMyCart(token: string): Promise<Array<CartItem>>;
    getMyOrders(token: string): Promise<Array<Order>>;
    getMyPoints(token: string): Promise<bigint>;
    getMyProfile(token: string): Promise<CustomerProfile | null>;
    getMyWishlist(token: string): Promise<Array<ProductId>>;
    getOrder(id: OrderId): Promise<Order | null>;
    getOrdersByDateRange(startDate: bigint, endDate: bigint): Promise<Array<Order>>;
    getProductById(id: ProductId): Promise<Product | null>;
    getProductImage(id: ProductId): Promise<Uint8Array | null>;
    getProductImages(id: ProductId): Promise<Array<Uint8Array>>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(categoryId: CategoryId): Promise<Array<Product>>;
    getPromoAnnouncement(): Promise<PromoAnnouncement | null>;
    getReviewsByProduct(productId: ProductId): Promise<Array<Review>>;
    getSecurityQuestion(email: string): Promise<string | null>;
    getSiteContent(): Promise<SiteContent>;
    getStoreInitData(): Promise<StoreInitData>;
    isAdmin(user: Principal): Promise<boolean>;
    isCustomerRegistered(token: string): Promise<boolean>;
    listAllUsers(): Promise<Array<AdminUserView>>;
    listOrders(): Promise<Array<Order>>;
    loginCustomer(email: string, password: string): Promise<AuthResult>;
    logoutCustomer(token: string): Promise<void>;
    placeOrder(input: OrderInput): Promise<OrderId>;
    registerCustomer(input: RegisterInput): Promise<AuthResult>;
    reinitializeIfEmpty(): Promise<boolean>;
    removeFromWishlist(token: string, productId: ProductId): Promise<boolean>;
    requestPasswordReset(email: string): Promise<ResetRequestResult>;
    resetPasswordWithSecurityQuestion(email: string, answer: string, newPassword: string): Promise<AuthResult>;
    resetPasswordWithToken(tokenId: string, newPassword: string): Promise<AuthResult>;
    saveMyCart(token: string, items: Array<CartItem>): Promise<boolean>;
    setProductImage(id: ProductId, image: Uint8Array | null): Promise<boolean>;
    setProductImages(id: ProductId, images: Array<Uint8Array>): Promise<boolean>;
    setPromoAnnouncement(input: PromoAnnouncement): Promise<void>;
    setSiteContent(content: SiteContent): Promise<void>;
    updateCategory(id: CategoryId, input: CategoryInput): Promise<boolean>;
    updateCoupon(id: bigint, input: CouponInput): Promise<boolean>;
    updateMyProfile(token: string, updates: UpdateProfileInput): Promise<AuthResult>;
    updateOrderStatus(id: OrderId, status: OrderStatus): Promise<boolean>;
    updateProduct(id: ProductId, input: ProductInput): Promise<boolean>;
    uploadProductImage(id: ProductId, imageBytes: Uint8Array): Promise<boolean>;
    validateCoupon(code: string): Promise<Coupon | null>;
    validateToken(token: string): Promise<CustomerProfile | null>;
}

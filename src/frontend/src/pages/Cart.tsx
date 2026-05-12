import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Gift,
  Lock,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  useAddOrder,
  useCreatePaymentIntent,
  useGetMyPoints,
  useGetMyProfile,
  useValidateCoupon,
} from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";
import type { Coupon } from "../types";

interface OrderForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

const EMPTY_FORM: OrderForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
};

type PaymentChoice = "cod" | "stripe";

// ── Delivery zone configuration ──────────────────────────────────────────────
const DELIVERY_ZONES = {
  insideCities: ["thakurgaon", "dinajpur", "saidpur", "rangpur"],
  insideFee: 50,
  outsideFee: 100,
} as const;

function getDeliveryFee(city: string): number {
  const normalized = city.trim().toLowerCase();
  if (!normalized) return DELIVERY_ZONES.outsideFee;
  return DELIVERY_ZONES.insideCities.some((c) => normalized.includes(c))
    ? DELIVERY_ZONES.insideFee
    : DELIVERY_ZONES.outsideFee;
}

function isInsideZone(city: string): boolean {
  const normalized = city.trim().toLowerCase();
  return DELIVERY_ZONES.insideCities.some((c) => normalized.includes(c));
}

/** Calculate the BDT discount amount from a coupon and a subtotal */
function calcCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discountType === "percentage") {
    return Math.round((subtotal * Number(coupon.discountValue)) / 100);
  }
  return Math.min(Number(coupon.discountValue), subtotal);
}

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    appliedCoupon,
    pointsToRedeem,
    applyCoupon,
    removeCoupon,
    setPointsToRedeem,
  } = useCartStore();
  const navigate = useNavigate();
  const addOrderMutation = useAddOrder();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const { data: profile } = useGetMyProfile();
  const auth = useAuth();

  // Coupon
  const validateCouponMutation = useValidateCoupon();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  // Points
  const { data: availablePoints = 0 } = useGetMyPoints();
  const [pointsInput, setPointsInput] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("cod");
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [addressPrefilled, setAddressPrefilled] = useState(false);

  // Pre-fill address and email from profile/auth when opening checkout
  useEffect(() => {
    if (checkoutOpen && !addressPrefilled) {
      setForm((prev) => ({
        ...prev,
        address: profile?.deliveryAddress ?? prev.address,
        email: auth.email ?? prev.email,
        name: profile?.name ?? auth.name ?? prev.name,
        phone: profile?.phone ?? prev.phone,
      }));
      setAddressPrefilled(true);
    }
    if (!checkoutOpen) {
      setAddressPrefilled(false);
    }
  }, [checkoutOpen, profile, auth, addressPrefilled]);

  const cartTotal = total();
  const count = itemCount();

  // Zone-based delivery fee — derived from city field in form
  const delivery = getDeliveryFee(form.city);
  const insideZone = form.city.trim() ? isInsideZone(form.city) : null;

  const couponDiscount = appliedCoupon
    ? calcCouponDiscount(appliedCoupon, cartTotal)
    : 0;
  const pointsDiscount = Math.min(
    pointsToRedeem,
    cartTotal + delivery - couponDiscount,
  );
  const grandTotal = Math.max(
    0,
    cartTotal + delivery - couponDiscount - pointsDiscount,
  );
  const isFreeOrder =
    grandTotal === 0 && (couponDiscount > 0 || pointsDiscount > 0);

  function setField(field: keyof OrderForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCloseCheckout() {
    if (submitting) return;
    setCheckoutOpen(false);
    setForm(EMPTY_FORM);
    setPaymentChoice("cod");
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError("");
    try {
      const coupon = await validateCouponMutation.mutateAsync(code);
      if (!coupon) {
        setCouponError("Invalid or expired coupon code.");
        return;
      }
      if (!coupon.isActive) {
        setCouponError("This coupon is no longer active.");
        return;
      }
      if (
        coupon.maxUses !== undefined &&
        coupon.currentUses >= coupon.maxUses
      ) {
        setCouponError("This coupon has reached its maximum uses.");
        return;
      }
      if (
        coupon.expiresAt !== undefined &&
        // expiresAt is stored in nanoseconds — convert to ms before comparing
        Number(BigInt(String(coupon.expiresAt)) / 1_000_000n) < Date.now()
      ) {
        setCouponError("This coupon has expired.");
        return;
      }
      applyCoupon(coupon);
      setCouponInput("");
      const disc = calcCouponDiscount(coupon, cartTotal);
      toast.success(
        coupon.discountType === "percentage"
          ? `${Number(coupon.discountValue)}% off applied! You save ৳${disc.toLocaleString()}`
          : `৳${Number(coupon.discountValue)} off applied!`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[handleApplyCoupon] error:", msg);
      setCouponError(`Could not validate coupon: ${msg}`);
    }
  }

  function handleUsePoints() {
    const n = Number.parseInt(pointsInput, 10);
    if (Number.isNaN(n) || n <= 0) {
      toast.error("Enter a valid number of points.");
      return;
    }
    if (n > availablePoints) {
      toast.error(`You only have ${availablePoints} points available.`);
      return;
    }
    setPointsToRedeem(n);
    setPointsInput("");
    toast.success(`Using ${n} points — ৳${n} discount applied!`);
  }

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Please fill in your name, phone, address, and city.");
      return;
    }
    if (paymentChoice === "stripe" && !form.email) {
      toast.error("Email is required for card payment.");
      return;
    }

    setSubmitting(true);

    // Combine address + city for storage
    const fullAddress = form.city
      ? `${form.address}, ${form.city}`
      : form.address;

    try {
      if (paymentChoice === "cod") {
        const tempId = Date.now().toString();
        const customerEmail = auth.email ?? (form.email.trim() || "guest");
        await addOrderMutation.mutateAsync({
          id: tempId,
          customerId: customerEmail,
          items: [...items],
          total: grandTotal,
          status: "pending",
          createdAt: Date.now(),
          customerName: form.name,
          customerPhone: form.phone,
          deliveryAddress: fullAddress,
          deliveryNote: form.notes || undefined,
          customerPrincipal: null,
          paymentMethod: "cod",
          stripePaymentIntentId: null,
          stripePaymentStatus: null,
          couponCode: appliedCoupon?.code ?? undefined,
          couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
          pointsRedeemed: pointsDiscount > 0 ? pointsDiscount : undefined,
          deliveryFee: delivery,
        });
        clearCart();
        handleCloseCheckout();
        toast.success("Order placed! We'll call you to confirm.");
        void navigate({
          to: "/checkout/success",
          search: { paymentMethod: "cod" },
        });
      } else {
        const pendingOrder = {
          form,
          items: [...items],
          grandTotal,
          delivery,
          cartTotal,
          createdAt: Date.now(),
          couponCode: appliedCoupon?.code ?? undefined,
          couponDiscount,
          pointsRedeemed: pointsDiscount,
          deliveryFee: delivery,
        };
        sessionStorage.setItem(
          "pending-stripe-order",
          JSON.stringify(pendingOrder),
        );

        const tempId = Date.now().toString();
        const intent = await createPaymentIntentMutation.mutateAsync({
          orderId: tempId,
          amountBDT: grandTotal,
          currency: "bdt",
          customerEmail: form.email,
        });

        if (!intent?.clientSecret) {
          throw new Error("Could not initiate payment. Please try again.");
        }

        const returnUrl = `${window.location.origin}/checkout/success?payment_intent=${intent.paymentIntentId}&payment_method=stripe`;

        const stripeModule = await import("@stripe/stripe-js");
        const stripe = await stripeModule.loadStripe(
          (import.meta.env.VITE_STRIPE_PUBLIC_KEY as string) ||
            "pk_test_placeholder",
        );

        if (!stripe) throw new Error("Stripe failed to load. Try again.");

        const { error } = await stripe.confirmPayment({
          clientSecret: intent.clientSecret,
          confirmParams: {
            return_url: returnUrl,
            payment_method_data: {
              billing_details: {
                name: form.name,
                email: form.email,
                phone: form.phone,
              },
            },
          },
        });

        if (error) {
          throw new Error(error.message ?? "Payment failed. Please try again.");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background min-h-screen" data-ocid="cart.page">
      {/* Header */}
      <div className="bg-card border-b border-border py-6 sm:py-8">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/shop">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 hover:text-primary transition-smooth"
                data-ocid="cart.back_to_shop_header_button"
              >
                <ArrowLeft size={15} /> Shop
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Shopping Cart
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {count} item{count !== 1 ? "s" : ""} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              className="text-center py-24 bg-card rounded-2xl border border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-ocid="cart.empty_state"
            >
              <ShoppingBag
                size={60}
                className="mx-auto mb-5 text-muted-foreground/30"
              />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-7 max-w-xs mx-auto">
                Add some delicious items from our bakery to get started!
              </p>
              <Link to="/shop" data-ocid="cart.browse_products_button">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth px-8">
                  <ShoppingBag size={16} /> Browse Products
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Cart Items */}
              <div
                className="lg:col-span-2 space-y-4"
                data-ocid="cart.items_list"
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-foreground">
                    Cart Items ({count})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 text-xs gap-1.5 transition-smooth"
                    onClick={() => {
                      clearCart();
                      removeCoupon();
                      setPointsToRedeem(0);
                      toast.info("Cart cleared");
                    }}
                    data-ocid="cart.clear_cart_button"
                  >
                    <Trash2 size={13} /> Clear All
                  </Button>
                </div>

                {items.map((item, i) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`cart.item.${i + 1}`}
                  >
                    <Card className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 bg-card border-border shadow-warm">
                      {/* Thumbnail */}
                      <Link
                        to="/shop/$productId"
                        params={{ productId: item.productId }}
                        className="flex-shrink-0"
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted hover-lift">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/images/placeholder.svg";
                            }}
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to="/shop/$productId"
                          params={{ productId: item.productId }}
                        >
                          <h3 className="font-display font-bold text-foreground text-sm truncate hover:text-primary transition-smooth">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-primary font-semibold text-sm mt-0.5">
                          ৳{item.price.toLocaleString()} each
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center border border-input rounded-xl overflow-hidden shadow-warm flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-none hover:bg-primary/10 transition-smooth"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          data-ocid={`cart.decrease_button.${i + 1}`}
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-none hover:bg-primary/10 transition-smooth"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          data-ocid={`cart.increase_button.${i + 1}`}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>

                      {/* Line total */}
                      <p className="font-bold text-foreground w-16 sm:w-20 text-right text-sm flex-shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 transition-smooth flex-shrink-0"
                        onClick={() => {
                          removeItem(item.productId);
                          toast.info(`${item.name} removed`);
                        }}
                        aria-label={`Remove ${item.name}`}
                        data-ocid={`cart.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </Card>
                  </motion.div>
                ))}

                <Link to="/shop">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth mt-2"
                    data-ocid="cart.continue_shopping_button"
                  >
                    <ArrowLeft size={15} /> Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Order Summary Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                data-ocid="cart.order_summary_panel"
              >
                <Card className="p-6 bg-card border-border shadow-elevated sticky top-24 space-y-5">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Order Summary
                  </h2>

                  {/* Price breakdown */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({count} items)</span>
                      <span>৳{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck size={12} />
                        Delivery
                        {insideZone !== null && (
                          <span className="text-[10px] font-medium ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {insideZone ? "Inside zone" : "Outside zone"}
                          </span>
                        )}
                      </span>
                      <span
                        className={
                          delivery === 0 ? "text-primary font-medium" : ""
                        }
                      >
                        {delivery === 0 ? "FREE" : `৳${delivery}`}
                      </span>
                    </div>

                    {couponDiscount > 0 ? null : null}
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 space-y-0.5">
                      <p className="text-primary/80 font-medium">
                        📍 Inside: Thakurgaon/Dinajpur/Saidpur/Rangpur → ৳
                        {DELIVERY_ZONES.insideFee} · Outside → ৳
                        {DELIVERY_ZONES.outsideFee}
                      </p>
                    </div>

                    <AnimatePresence>
                      {couponDiscount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium"
                        >
                          <span className="flex items-center gap-1.5">
                            <Tag size={12} />
                            Coupon ({appliedCoupon?.code})
                          </span>
                          <span>−৳{couponDiscount.toLocaleString()}</span>
                        </motion.div>
                      )}
                      {pointsDiscount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles size={12} />
                            Points ({pointsToRedeem} pts)
                          </span>
                          <span>−৳{pointsDiscount.toLocaleString()}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Separator />

                    <div className="flex justify-between font-bold text-foreground text-base">
                      <span>Total</span>
                      <div className="text-right">
                        <span className="text-primary font-display text-xl">
                          ৳{grandTotal.toLocaleString()}
                        </span>
                        {isFreeOrder && (
                          <Badge className="ml-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">
                            FREE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Coupon Code Section ──────────────────────── */}
                  <div className="space-y-2" data-ocid="cart.coupon_section">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Tag size={12} className="text-primary" />
                      Coupon Code
                    </p>

                    {appliedCoupon ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between bg-primary/8 border border-primary/25 rounded-xl px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            size={15}
                            className="text-primary flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-primary leading-tight">
                              {appliedCoupon.code}
                            </p>
                            <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                              {appliedCoupon.discountType === "percentage"
                                ? `${Number(appliedCoupon.discountValue)}% off`
                                : `৳${Number(appliedCoupon.discountValue)} off`}{" "}
                              — saves ৳{couponDiscount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                          onClick={() => {
                            removeCoupon();
                            toast.info("Coupon removed");
                          }}
                          aria-label="Remove coupon"
                          data-ocid="cart.remove_coupon_button"
                        >
                          <X size={14} />
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleApplyCoupon();
                              }
                            }}
                            className="border-input focus:border-primary text-sm font-mono tracking-wider uppercase"
                            data-ocid="cart.coupon_input"
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 flex-shrink-0 transition-smooth"
                            onClick={() => void handleApplyCoupon()}
                            disabled={
                              !couponInput.trim() ||
                              validateCouponMutation.isPending
                            }
                            data-ocid="cart.apply_coupon_button"
                          >
                            {validateCouponMutation.isPending ? "…" : "Apply"}
                          </Button>
                        </div>
                        {couponError && (
                          <p
                            className="text-xs text-destructive"
                            data-ocid="cart.coupon_error_state"
                          >
                            {couponError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Loyalty Points Section ───────────────────── */}
                  <div className="space-y-2" data-ocid="cart.points_section">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Sparkles size={12} className="text-primary" />
                      Loyalty Points
                    </p>

                    {!auth.isLoggedIn ? (
                      <div className="bg-muted/50 rounded-xl px-3 py-3 text-center">
                        <Gift
                          size={20}
                          className="mx-auto mb-1.5 text-primary/50"
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <Link
                            to="/profile"
                            className="text-primary font-semibold hover:underline"
                            data-ocid="cart.login_for_points_link"
                          >
                            Log in
                          </Link>{" "}
                          to use your loyalty points
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-primary/6 border border-primary/20 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Sparkles size={13} className="text-primary" />
                            <span className="text-xs text-muted-foreground">
                              Available points
                            </span>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {availablePoints} pts
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground px-0.5">
                          1 point = ৳1 discount
                        </p>

                        {pointsToRedeem > 0 ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-between bg-primary/8 border border-primary/25 rounded-xl px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                size={15}
                                className="text-primary flex-shrink-0"
                              />
                              <div>
                                <p className="text-sm font-semibold text-primary leading-tight">
                                  {pointsToRedeem} points applied
                                </p>
                                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                                  ৳{pointsDiscount.toLocaleString()} off
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                              onClick={() => {
                                setPointsToRedeem(0);
                                toast.info("Points removed");
                              }}
                              aria-label="Remove points"
                              data-ocid="cart.remove_points_button"
                            >
                              <X size={14} />
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder={`Max ${availablePoints}`}
                              value={pointsInput}
                              min={1}
                              max={availablePoints}
                              onChange={(e) => setPointsInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleUsePoints();
                                }
                              }}
                              className="border-input focus:border-primary text-sm"
                              data-ocid="cart.points_input"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 flex-shrink-0 transition-smooth gap-1.5"
                              onClick={handleUsePoints}
                              disabled={!pointsInput || availablePoints === 0}
                              data-ocid="cart.use_points_button"
                            >
                              <Sparkles size={13} />
                              Use
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm hover-lift transition-smooth"
                    onClick={() => setCheckoutOpen(true)}
                    data-ocid="cart.checkout_button"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed -mt-1">
                    🔒 Secure checkout · Card &amp; Cash on delivery
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Checkout Modal ─────────────────────────────────── */}
      <Dialog open={checkoutOpen} onOpenChange={handleCloseCheckout}>
        <DialogContent
          className="max-w-md bg-card"
          data-ocid="cart.checkout_dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Complete Your Order
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Order summary mini */}
            <div className="bg-muted/40 rounded-xl p-3 text-sm space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Items ({count})</span>
                <span>৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{delivery === 0 ? "FREE" : `৳${delivery}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={11} /> Coupon ({appliedCoupon?.code})
                  </span>
                  <span>−৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} /> Points ({pointsToRedeem} pts)
                  </span>
                  <span>−৳{pointsDiscount.toLocaleString()}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-display">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                  {isFreeOrder && (
                    <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">
                      FREE
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentChoice("cod")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-smooth cursor-pointer ${
                    paymentChoice === "cod"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                  data-ocid="cart.payment_cod_toggle"
                >
                  <Truck size={18} />
                  Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentChoice("stripe")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-smooth cursor-pointer ${
                    paymentChoice === "stripe"
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  }`}
                  data-ocid="cart.payment_stripe_toggle"
                >
                  <CreditCard size={18} />
                  Pay with Card
                </button>
              </div>
              {paymentChoice === "stripe" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Lock size={11} className="text-primary" />
                  You'll be redirected to Stripe's secure payment page.
                </p>
              )}
            </div>

            {/* Customer info fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="order-name" className="text-xs font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="order-name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="border-input focus:border-primary"
                  data-ocid="cart.checkout_name_input"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-phone" className="text-xs font-semibold">
                  Phone Number *
                </Label>
                <Input
                  id="order-phone"
                  placeholder="+880 17xx-xxxxxx"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="border-input focus:border-primary"
                  data-ocid="cart.checkout_phone_input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-email" className="text-xs font-semibold">
                Email{paymentChoice === "stripe" ? " *" : " (optional)"}
              </Label>
              <Input
                id="order-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                className="border-input focus:border-primary"
                data-ocid="cart.checkout_email_input"
                required={paymentChoice === "stripe"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-address" className="text-xs font-semibold">
                Delivery Address *
              </Label>
              <Input
                id="order-address"
                placeholder="Full delivery address, Dhaka"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="border-input focus:border-primary"
                data-ocid="cart.checkout_address_input"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-city" className="text-xs font-semibold">
                City / District *
              </Label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="order-city"
                  placeholder="e.g. Dhaka, Rangpur, Dinajpur…"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="border-input focus:border-primary pl-9"
                  data-ocid="cart.checkout_city_input"
                  required
                />
              </div>
              {form.city.trim() && (
                <p
                  className={`text-xs font-medium flex items-center gap-1 ${isInsideZone(form.city) ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                >
                  <Truck size={11} />
                  {isInsideZone(form.city)
                    ? `Inside zone — ৳${DELIVERY_ZONES.insideFee} delivery fee`
                    : `Outside zone — ৳${DELIVERY_ZONES.outsideFee} delivery fee`}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-notes" className="text-xs font-semibold">
                Delivery Notes (optional)
              </Label>
              <Textarea
                id="order-notes"
                placeholder="Any special instructions or allergies..."
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                className="border-input focus:border-primary resize-none h-16"
                data-ocid="cart.checkout_notes_textarea"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border hover:bg-muted/60 transition-smooth"
                onClick={handleCloseCheckout}
                disabled={submitting}
                data-ocid="cart.checkout_cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover-lift transition-smooth"
                disabled={submitting}
                data-ocid="cart.checkout_submit_button"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {paymentChoice === "stripe" ? "Redirecting…" : "Placing…"}
                  </span>
                ) : paymentChoice === "stripe" ? (
                  <>
                    <CreditCard size={15} />{" "}
                    {grandTotal === 0
                      ? "Place Free Order"
                      : `Pay ৳${grandTotal.toLocaleString()}`}
                  </>
                ) : (
                  <>
                    Place Order <ArrowRight size={15} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { d as useCartStore, z as useNavigate, D as useAddOrder, E as useCreatePaymentIntent, F as useGetMyProfile, h as useAuth, G as useValidateCoupon, r as reactExports, J as useGetMyPoints, j as jsxRuntimeExports, L as Link, e as Button, w as Separator, A as AnimatePresence, m as motion, S as ShoppingBag, g as ue, T as Tag, B as Badge, X, I as Input, o as Label, _ as __vitePreload } from "./index-YPmBzU2g.js";
import { C as Card } from "./card-y8MOlqQc.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-CYJVCNc-.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { A as ArrowLeft } from "./arrow-left-CWrfTQFu.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import { M as Minus } from "./minus-B6-gqcJ-.js";
import { P as Plus } from "./plus-KifZePkW.js";
import { T as Truck } from "./truck-h-OKdrKh.js";
import { S as Sparkles } from "./sparkles-lxR0n97q.js";
import { C as CircleCheck } from "./circle-check-BrWsE1Gy.js";
import { G as Gift, L as Lock } from "./lock-CuqEYU-b.js";
import { A as ArrowRight } from "./arrow-right-C093tOIt.js";
import { C as CreditCard } from "./credit-card-B8D97PZs.js";
import { M as MapPin } from "./map-pin-Ck2KqkTp.js";
import "./index-DfMnyd6p.js";
const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: ""
};
const DELIVERY_ZONES = {
  insideCities: ["thakurgaon", "dinajpur", "saidpur", "rangpur"],
  insideFee: 50,
  outsideFee: 100
};
function getDeliveryFee(city) {
  const normalized = city.trim().toLowerCase();
  if (!normalized) return DELIVERY_ZONES.outsideFee;
  return DELIVERY_ZONES.insideCities.some((c) => normalized.includes(c)) ? DELIVERY_ZONES.insideFee : DELIVERY_ZONES.outsideFee;
}
function isInsideZone(city) {
  const normalized = city.trim().toLowerCase();
  return DELIVERY_ZONES.insideCities.some((c) => normalized.includes(c));
}
function calcCouponDiscount(coupon, subtotal) {
  if (coupon.discountType === "percentage") {
    return Math.round(subtotal * Number(coupon.discountValue) / 100);
  }
  return Math.min(Number(coupon.discountValue), subtotal);
}
function CartPage() {
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
    setPointsToRedeem
  } = useCartStore();
  const navigate = useNavigate();
  const addOrderMutation = useAddOrder();
  const createPaymentIntentMutation = useCreatePaymentIntent();
  const { data: profile } = useGetMyProfile();
  const auth = useAuth();
  const validateCouponMutation = useValidateCoupon();
  const [couponInput, setCouponInput] = reactExports.useState("");
  const [couponError, setCouponError] = reactExports.useState("");
  const { data: availablePoints = 0 } = useGetMyPoints();
  const [pointsInput, setPointsInput] = reactExports.useState("");
  const [checkoutOpen, setCheckoutOpen] = reactExports.useState(false);
  const [paymentChoice, setPaymentChoice] = reactExports.useState("cod");
  const [form, setForm] = reactExports.useState(EMPTY_FORM);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [addressPrefilled, setAddressPrefilled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (checkoutOpen && !addressPrefilled) {
      setForm((prev) => ({
        ...prev,
        address: (profile == null ? void 0 : profile.deliveryAddress) ?? prev.address,
        email: auth.email ?? prev.email,
        name: (profile == null ? void 0 : profile.name) ?? auth.name ?? prev.name,
        phone: (profile == null ? void 0 : profile.phone) ?? prev.phone
      }));
      setAddressPrefilled(true);
    }
    if (!checkoutOpen) {
      setAddressPrefilled(false);
    }
  }, [checkoutOpen, profile, auth, addressPrefilled]);
  const cartTotal = total();
  const count = itemCount();
  const delivery = getDeliveryFee(form.city);
  const insideZone = form.city.trim() ? isInsideZone(form.city) : null;
  const couponDiscount = appliedCoupon ? calcCouponDiscount(appliedCoupon, cartTotal) : 0;
  const pointsDiscount = Math.min(
    pointsToRedeem,
    cartTotal + delivery - couponDiscount
  );
  const grandTotal = Math.max(
    0,
    cartTotal + delivery - couponDiscount - pointsDiscount
  );
  const isFreeOrder = grandTotal === 0 && (couponDiscount > 0 || pointsDiscount > 0);
  function setField(field, value) {
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
      if (coupon.maxUses !== void 0 && coupon.currentUses >= coupon.maxUses) {
        setCouponError("This coupon has reached its maximum uses.");
        return;
      }
      if (coupon.expiresAt !== void 0 && // expiresAt is stored in nanoseconds — convert to ms before comparing
      Number(BigInt(String(coupon.expiresAt)) / 1000000n) < Date.now()) {
        setCouponError("This coupon has expired.");
        return;
      }
      applyCoupon(coupon);
      setCouponInput("");
      const disc = calcCouponDiscount(coupon, cartTotal);
      ue.success(
        coupon.discountType === "percentage" ? `${Number(coupon.discountValue)}% off applied! You save ৳${disc.toLocaleString()}` : `৳${Number(coupon.discountValue)} off applied!`
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
      ue.error("Enter a valid number of points.");
      return;
    }
    if (n > availablePoints) {
      ue.error(`You only have ${availablePoints} points available.`);
      return;
    }
    setPointsToRedeem(n);
    setPointsInput("");
    ue.success(`Using ${n} points — ৳${n} discount applied!`);
  }
  async function handleSubmitOrder(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      ue.error("Please fill in your name, phone, address, and city.");
      return;
    }
    if (paymentChoice === "stripe" && !form.email) {
      ue.error("Email is required for card payment.");
      return;
    }
    setSubmitting(true);
    const fullAddress = form.city ? `${form.address}, ${form.city}` : form.address;
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
          deliveryNote: form.notes || void 0,
          customerPrincipal: null,
          paymentMethod: "cod",
          stripePaymentIntentId: null,
          stripePaymentStatus: null,
          couponCode: (appliedCoupon == null ? void 0 : appliedCoupon.code) ?? void 0,
          couponDiscount: couponDiscount > 0 ? couponDiscount : void 0,
          pointsRedeemed: pointsDiscount > 0 ? pointsDiscount : void 0,
          deliveryFee: delivery
        });
        clearCart();
        handleCloseCheckout();
        ue.success("Order placed! We'll call you to confirm.");
        void navigate({
          to: "/checkout/success",
          search: { paymentMethod: "cod" }
        });
      } else {
        const pendingOrder = {
          form,
          items: [...items],
          grandTotal,
          delivery,
          cartTotal,
          createdAt: Date.now(),
          couponCode: (appliedCoupon == null ? void 0 : appliedCoupon.code) ?? void 0,
          couponDiscount,
          pointsRedeemed: pointsDiscount,
          deliveryFee: delivery
        };
        sessionStorage.setItem(
          "pending-stripe-order",
          JSON.stringify(pendingOrder)
        );
        const tempId = Date.now().toString();
        const intent = await createPaymentIntentMutation.mutateAsync({
          orderId: tempId,
          amountBDT: grandTotal,
          currency: "bdt",
          customerEmail: form.email
        });
        if (!(intent == null ? void 0 : intent.clientSecret)) {
          throw new Error("Could not initiate payment. Please try again.");
        }
        const returnUrl = `${window.location.origin}/checkout/success?payment_intent=${intent.paymentIntentId}&payment_method=stripe`;
        const stripeModule = await __vitePreload(() => import("./index-CjnNuTiP.js"), true ? [] : void 0);
        const stripe = await stripeModule.loadStripe(
          "pk_test_placeholder"
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
                phone: form.phone
              }
            }
          }
        });
        if (error) {
          throw new Error(error.message ?? "Payment failed. Please try again.");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      ue.error(msg);
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background min-h-screen", "data-ocid": "cart.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border py-6 sm:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "gap-1.5 hover:text-primary transition-smooth",
          "data-ocid": "cart.back_to_shop_header_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
            " Shop"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { orientation: "vertical", className: "h-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl md:text-3xl font-bold text-foreground leading-tight", children: "Shopping Cart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm mt-0.5", children: [
          count,
          " item",
          count !== 1 ? "s" : "",
          " in your cart"
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "text-center py-24 bg-card rounded-2xl border border-border",
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        "data-ocid": "cart.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ShoppingBag,
            {
              size: 60,
              className: "mx-auto mb-5 text-muted-foreground/30"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-2", children: "Your cart is empty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-7 max-w-xs mx-auto", children: "Add some delicious items from our bakery to get started!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "cart.browse_products_button", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth px-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 16 }),
            " Browse Products"
          ] }) })
        ]
      },
      "empty"
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "lg:col-span-2 space-y-4",
              "data-ocid": "cart.items_list",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-foreground", children: [
                    "Cart Items (",
                    count,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "text-destructive hover:bg-destructive/10 text-xs gap-1.5 transition-smooth",
                      onClick: () => {
                        clearCart();
                        removeCoupon();
                        setPointsToRedeem(0);
                        ue.info("Cart cleared");
                      },
                      "data-ocid": "cart.clear_cart_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }),
                        " Clear All"
                      ]
                    }
                  )
                ] }),
                items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    layout: true,
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: 20, scale: 0.95 },
                    transition: { delay: i * 0.04 },
                    "data-ocid": `cart.item.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-3 sm:p-4 flex items-center gap-3 sm:gap-4 bg-card border-border shadow-warm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Link,
                        {
                          to: "/shop/$productId",
                          params: { productId: item.productId },
                          className: "flex-shrink-0",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted hover-lift", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "img",
                            {
                              src: item.imageUrl,
                              alt: item.name,
                              className: "w-full h-full object-cover",
                              onError: (e) => {
                                e.target.src = "/assets/images/placeholder.svg";
                              }
                            }
                          ) })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Link,
                          {
                            to: "/shop/$productId",
                            params: { productId: item.productId },
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-sm truncate hover:text-primary transition-smooth", children: item.name })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-primary font-semibold text-sm mt-0.5", children: [
                          "৳",
                          item.price.toLocaleString(),
                          " each"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border border-input rounded-xl overflow-hidden shadow-warm flex-shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-8 w-8 rounded-none hover:bg-primary/10 transition-smooth",
                            onClick: () => updateQuantity(item.productId, item.quantity - 1),
                            "data-ocid": `cart.decrease_button.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 12 })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center text-sm font-semibold", children: item.quantity }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-8 w-8 rounded-none hover:bg-primary/10 transition-smooth",
                            onClick: () => updateQuantity(item.productId, item.quantity + 1),
                            "data-ocid": `cart.increase_button.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 12 })
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-foreground w-16 sm:w-20 text-right text-sm flex-shrink-0", children: [
                        "৳",
                        (item.price * item.quantity).toLocaleString()
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "text-destructive hover:bg-destructive/10 h-8 w-8 p-0 transition-smooth flex-shrink-0",
                          onClick: () => {
                            removeItem(item.productId);
                            ue.info(`${item.name} removed`);
                          },
                          "aria-label": `Remove ${item.name}`,
                          "data-ocid": `cart.delete_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                        }
                      )
                    ] })
                  },
                  item.productId
                )),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "outline",
                    className: "gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth mt-2",
                    "data-ocid": "cart.continue_shopping_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
                      " Continue Shopping"
                    ]
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.15 },
              "data-ocid": "cart.order_summary_panel",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 bg-card border-border shadow-elevated sticky top-24 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold text-foreground", children: "Order Summary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Subtotal (",
                      count,
                      " items)"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "৳",
                      cartTotal.toLocaleString()
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 12 }),
                      "Delivery",
                      insideZone !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary", children: insideZone ? "Inside zone" : "Outside zone" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: delivery === 0 ? "text-primary font-medium" : "",
                        children: delivery === 0 ? "FREE" : `৳${delivery}`
                      }
                    )
                  ] }),
                  couponDiscount > 0 ? null : null,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 space-y-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-primary/80 font-medium", children: [
                    "📍 Inside: Thakurgaon/Dinajpur/Saidpur/Rangpur → ৳",
                    DELIVERY_ZONES.insideFee,
                    " · Outside → ৳",
                    DELIVERY_ZONES.outsideFee
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
                    couponDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      motion.div,
                      {
                        initial: { opacity: 0, height: 0 },
                        animate: { opacity: 1, height: "auto" },
                        exit: { opacity: 0, height: 0 },
                        className: "flex justify-between text-emerald-600 dark:text-emerald-400 font-medium",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 12 }),
                            "Coupon (",
                            appliedCoupon == null ? void 0 : appliedCoupon.code,
                            ")"
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            "−৳",
                            couponDiscount.toLocaleString()
                          ] })
                        ]
                      }
                    ),
                    pointsDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      motion.div,
                      {
                        initial: { opacity: 0, height: 0 },
                        animate: { opacity: 1, height: "auto" },
                        exit: { opacity: 0, height: 0 },
                        className: "flex justify-between text-emerald-600 dark:text-emerald-400 font-medium",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12 }),
                            "Points (",
                            pointsToRedeem,
                            " pts)"
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            "−৳",
                            pointsDiscount.toLocaleString()
                          ] })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-foreground text-base", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-display text-xl", children: [
                        "৳",
                        grandTotal.toLocaleString()
                      ] }),
                      isFreeOrder && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5", children: "FREE" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "data-ocid": "cart.coupon_section", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 12, className: "text-primary" }),
                    "Coupon Code"
                  ] }),
                  appliedCoupon ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.div,
                    {
                      initial: { opacity: 0, scale: 0.97 },
                      animate: { opacity: 1, scale: 1 },
                      className: "flex items-center justify-between bg-primary/8 border border-primary/25 rounded-xl px-3 py-2.5",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            CircleCheck,
                            {
                              size: 15,
                              className: "text-primary flex-shrink-0"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-primary leading-tight", children: appliedCoupon.code }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-tight mt-0.5", children: [
                              appliedCoupon.discountType === "percentage" ? `${Number(appliedCoupon.discountValue)}% off` : `৳${Number(appliedCoupon.discountValue)} off`,
                              " ",
                              "— saves ৳",
                              couponDiscount.toLocaleString()
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth",
                            onClick: () => {
                              removeCoupon();
                              ue.info("Coupon removed");
                            },
                            "aria-label": "Remove coupon",
                            "data-ocid": "cart.remove_coupon_button",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
                          }
                        )
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          placeholder: "Enter coupon code",
                          value: couponInput,
                          onChange: (e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError("");
                          },
                          onKeyDown: (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleApplyCoupon();
                            }
                          },
                          className: "border-input focus:border-primary text-sm font-mono tracking-wider uppercase",
                          "data-ocid": "cart.coupon_input"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          type: "button",
                          size: "sm",
                          className: "bg-primary hover:bg-primary/90 text-primary-foreground px-4 flex-shrink-0 transition-smooth",
                          onClick: () => void handleApplyCoupon(),
                          disabled: !couponInput.trim() || validateCouponMutation.isPending,
                          "data-ocid": "cart.apply_coupon_button",
                          children: validateCouponMutation.isPending ? "…" : "Apply"
                        }
                      )
                    ] }),
                    couponError && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-xs text-destructive",
                        "data-ocid": "cart.coupon_error_state",
                        children: couponError
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "data-ocid": "cart.points_section", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12, className: "text-primary" }),
                    "Loyalty Points"
                  ] }),
                  !auth.isLoggedIn ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 rounded-xl px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Gift,
                      {
                        size: 20,
                        className: "mx-auto mb-1.5 text-primary/50"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Link,
                        {
                          to: "/profile",
                          className: "text-primary font-semibold hover:underline",
                          "data-ocid": "cart.login_for_points_link",
                          children: "Log in"
                        }
                      ),
                      " ",
                      "to use your loyalty points"
                    ] })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-primary/6 border border-primary/20 rounded-xl px-3 py-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13, className: "text-primary" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Available points" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
                        availablePoints,
                        " pts"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground px-0.5", children: "1 point = ৳1 discount" }),
                    pointsToRedeem > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      motion.div,
                      {
                        initial: { opacity: 0, scale: 0.97 },
                        animate: { opacity: 1, scale: 1 },
                        className: "flex items-center justify-between bg-primary/8 border border-primary/25 rounded-xl px-3 py-2.5",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              CircleCheck,
                              {
                                size: 15,
                                className: "text-primary flex-shrink-0"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-primary leading-tight", children: [
                                pointsToRedeem,
                                " points applied"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-tight mt-0.5", children: [
                                "৳",
                                pointsDiscount.toLocaleString(),
                                " off"
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              variant: "ghost",
                              size: "sm",
                              className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth",
                              onClick: () => {
                                setPointsToRedeem(0);
                                ue.info("Points removed");
                              },
                              "aria-label": "Remove points",
                              "data-ocid": "cart.remove_points_button",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
                            }
                          )
                        ]
                      }
                    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "number",
                          placeholder: `Max ${availablePoints}`,
                          value: pointsInput,
                          min: 1,
                          max: availablePoints,
                          onChange: (e) => setPointsInput(e.target.value),
                          onKeyDown: (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleUsePoints();
                            }
                          },
                          className: "border-input focus:border-primary text-sm",
                          "data-ocid": "cart.points_input"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          type: "button",
                          size: "sm",
                          className: "bg-primary hover:bg-primary/90 text-primary-foreground px-3 flex-shrink-0 transition-smooth gap-1.5",
                          onClick: handleUsePoints,
                          disabled: !pointsInput || availablePoints === 0,
                          "data-ocid": "cart.use_points_button",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13 }),
                            "Use"
                          ]
                        }
                      )
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "lg",
                    className: "w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm hover-lift transition-smooth",
                    onClick: () => setCheckoutOpen(true),
                    "data-ocid": "cart.checkout_button",
                    children: [
                      "Proceed to Checkout ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center leading-relaxed -mt-1", children: "🔒 Secure checkout · Card & Cash on delivery" })
              ] })
            }
          )
        ]
      },
      "cart"
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: checkoutOpen, onOpenChange: handleCloseCheckout, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        className: "max-w-md bg-card",
        "data-ocid": "cart.checkout_dialog",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-xl font-bold text-foreground", children: "Complete Your Order" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitOrder, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl p-3 text-sm space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Items (",
                  count,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "৳",
                  cartTotal.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: delivery === 0 ? "FREE" : `৳${delivery}` })
              ] }),
              couponDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-emerald-600 dark:text-emerald-400 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 11 }),
                  " Coupon (",
                  appliedCoupon == null ? void 0 : appliedCoupon.code,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "−৳",
                  couponDiscount.toLocaleString()
                ] })
              ] }),
              pointsDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-emerald-600 dark:text-emerald-400 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 11 }),
                  " Points (",
                  pointsToRedeem,
                  " pts)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "−৳",
                  pointsDiscount.toLocaleString()
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-display", children: [
                    "৳",
                    grandTotal.toLocaleString()
                  ] }),
                  isFreeOrder && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-500 text-white text-[10px] px-1.5 py-0.5", children: "FREE" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Payment Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setPaymentChoice("cod"),
                    className: `flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-smooth cursor-pointer ${paymentChoice === "cod" ? "border-primary bg-primary/8 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`,
                    "data-ocid": "cart.payment_cod_toggle",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 18 }),
                      "Cash on Delivery"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setPaymentChoice("stripe"),
                    className: `flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-smooth cursor-pointer ${paymentChoice === "stripe" ? "border-primary bg-primary/8 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`,
                    "data-ocid": "cart.payment_stripe_toggle",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 18 }),
                      "Pay with Card"
                    ]
                  }
                )
              ] }),
              paymentChoice === "stripe" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1.5 mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 11, className: "text-primary" }),
                "You'll be redirected to Stripe's secure payment page."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "order-name", className: "text-xs font-semibold", children: "Full Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "order-name",
                    placeholder: "Your name",
                    value: form.name,
                    onChange: (e) => setField("name", e.target.value),
                    className: "border-input focus:border-primary",
                    "data-ocid": "cart.checkout_name_input",
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "order-phone", className: "text-xs font-semibold", children: "Phone Number *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "order-phone",
                    placeholder: "+880 17xx-xxxxxx",
                    value: form.phone,
                    onChange: (e) => setField("phone", e.target.value),
                    className: "border-input focus:border-primary",
                    "data-ocid": "cart.checkout_phone_input",
                    required: true
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "order-email", className: "text-xs font-semibold", children: [
                "Email",
                paymentChoice === "stripe" ? " *" : " (optional)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "order-email",
                  type: "email",
                  placeholder: "you@example.com",
                  value: form.email,
                  onChange: (e) => setField("email", e.target.value),
                  className: "border-input focus:border-primary",
                  "data-ocid": "cart.checkout_email_input",
                  required: paymentChoice === "stripe"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "order-address", className: "text-xs font-semibold", children: "Delivery Address *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "order-address",
                  placeholder: "Full delivery address, Dhaka",
                  value: form.address,
                  onChange: (e) => setField("address", e.target.value),
                  className: "border-input focus:border-primary",
                  "data-ocid": "cart.checkout_address_input",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "order-city", className: "text-xs font-semibold", children: "City / District *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MapPin,
                  {
                    size: 14,
                    className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "order-city",
                    placeholder: "e.g. Dhaka, Rangpur, Dinajpur…",
                    value: form.city,
                    onChange: (e) => setField("city", e.target.value),
                    className: "border-input focus:border-primary pl-9",
                    "data-ocid": "cart.checkout_city_input",
                    required: true
                  }
                )
              ] }),
              form.city.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: `text-xs font-medium flex items-center gap-1 ${isInsideZone(form.city) ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 11 }),
                    isInsideZone(form.city) ? `Inside zone — ৳${DELIVERY_ZONES.insideFee} delivery fee` : `Outside zone — ৳${DELIVERY_ZONES.outsideFee} delivery fee`
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "order-notes", className: "text-xs font-semibold", children: "Delivery Notes (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "order-notes",
                  placeholder: "Any special instructions or allergies...",
                  value: form.notes,
                  onChange: (e) => setField("notes", e.target.value),
                  className: "border-input focus:border-primary resize-none h-16",
                  "data-ocid": "cart.checkout_notes_textarea"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  className: "flex-1 border-border hover:bg-muted/60 transition-smooth",
                  onClick: handleCloseCheckout,
                  disabled: submitting,
                  "data-ocid": "cart.checkout_cancel_button",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  className: "flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover-lift transition-smooth",
                  disabled: submitting,
                  "data-ocid": "cart.checkout_submit_button",
                  children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }),
                    paymentChoice === "stripe" ? "Redirecting…" : "Placing…"
                  ] }) : paymentChoice === "stripe" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 15 }),
                    " ",
                    grandTotal === 0 ? "Place Free Order" : `Pay ৳${grandTotal.toLocaleString()}`
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    "Place Order ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15 })
                  ] })
                }
              )
            ] })
          ] })
        ]
      }
    ) })
  ] });
}
export {
  CartPage as default
};

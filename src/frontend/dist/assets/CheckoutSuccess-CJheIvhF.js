import { c as createLucideIcon, a1 as useSearch, r as reactExports, a2 as useConfirmPayment, D as useAddOrder, d as useCartStore, h as useAuth, j as jsxRuntimeExports, f as Skeleton, L as Link, e as Button, S as ShoppingBag, P as Package, g as ue } from "./index-YPmBzU2g.js";
import { C as CircleCheckBig } from "./circle-check-big-zc-xK0f_.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode);
function CheckoutSuccessPage() {
  const search = useSearch({ strict: false });
  const paymentIntentId = search.payment_intent;
  const paymentMethodParam = search.payment_method;
  const redirectStatus = search.redirect_status;
  const [pageState, setPageState] = reactExports.useState(
    paymentIntentId ? "loading" : "success"
  );
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const [confirmedOrderId, setConfirmedOrderId] = reactExports.useState(
    void 0
  );
  const [copied, setCopied] = reactExports.useState(false);
  const confirmPaymentMutation = useConfirmPayment();
  const addOrderMutation = useAddOrder();
  const { clearCart } = useCartStore();
  const auth = useAuth();
  const ranRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!paymentIntentId) return;
    if (ranRef.current) return;
    ranRef.current = true;
    if (redirectStatus !== "succeeded") {
      setErrorMsg(
        redirectStatus === "failed" ? "Your payment was declined. Please try a different card." : "Payment was cancelled. Your cart has been preserved."
      );
      setPageState("error");
      return;
    }
    async function finalizeStripeOrder() {
      try {
        const raw = sessionStorage.getItem("pending-stripe-order");
        if (!raw)
          throw new Error("Order data not found. Please contact support.");
        const pending = JSON.parse(raw);
        sessionStorage.removeItem("pending-stripe-order");
        const tempId = pending.createdAt.toString();
        await confirmPaymentMutation.mutateAsync({
          orderId: tempId,
          paymentIntentId
        });
        const customerEmail = auth.email ?? (pending.form.email || "guest");
        await addOrderMutation.mutateAsync({
          id: tempId,
          customerId: customerEmail,
          items: pending.items,
          total: pending.grandTotal,
          status: "confirmed",
          createdAt: pending.createdAt,
          customerName: pending.form.name,
          customerPhone: pending.form.phone,
          deliveryAddress: pending.form.address,
          deliveryNote: pending.form.notes || void 0,
          customerPrincipal: null,
          paymentMethod: "stripe",
          stripePaymentIntentId: paymentIntentId,
          stripePaymentStatus: null
        });
        clearCart();
        setConfirmedOrderId(tempId);
        setPageState("success");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to confirm your order.";
        setErrorMsg(msg);
        ue.error(msg);
        setPageState("error");
      }
    }
    void finalizeStripeOrder();
  }, [
    paymentIntentId,
    redirectStatus,
    confirmPaymentMutation.mutateAsync,
    addOrderMutation.mutateAsync,
    clearCart,
    auth.email
  ]);
  const isStripe = !!paymentIntentId || paymentMethodParam === "stripe";
  const displayOrderId = confirmedOrderId ?? search.orderId;
  function handleCopyOrderId() {
    if (!displayOrderId) return;
    void navigator.clipboard.writeText(displayOrderId).then(() => {
      setCopied(true);
      ue.success("Order ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2e3);
    });
  }
  if (pageState === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 py-16",
        "data-ocid": "checkout_success.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48 mx-auto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64 mx-auto" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Confirming your payment…" })
        ]
      }
    );
  }
  if (pageState === "error") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 gap-6",
        "data-ocid": "checkout_success.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 40, className: "text-destructive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-w-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold text-foreground", children: "Payment Unsuccessful" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-base leading-relaxed", children: errorMsg || "Your payment could not be processed." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cart", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "bg-primary text-primary-foreground gap-2",
                "data-ocid": "checkout_success.retry_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 16 }),
                  "Return to Cart"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                className: "gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary",
                "data-ocid": "checkout_success.shop_button",
                children: "Browse Products"
              }
            ) })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 gap-6",
      "data-ocid": "checkout_success.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 40, className: "text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl sm:text-4xl font-bold text-foreground", children: "Order Confirmed!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-base leading-relaxed", children: "Thank you for shopping with Pretty Baked. Your delicious order is on its way!" })
        ] }),
        displayOrderId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-card border-2 border-primary/30 rounded-2xl px-7 py-5 text-center space-y-2 shadow-elevated w-full max-w-sm",
            "data-ocid": "checkout_success.order_id_card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground", children: "Your Order ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "font-display font-bold text-primary text-2xl sm:text-3xl tracking-wider",
                    "data-ocid": "checkout_success.order_id",
                    children: displayOrderId
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleCopyOrderId,
                    "aria-label": "Copy order ID",
                    "data-ocid": "checkout_success.copy_order_id_button",
                    className: "p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 shrink-0",
                    children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 16 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Save this ID to track or reference your order" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 border-t border-border/60", children: [
                !isStripe && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs flex items-center justify-center gap-1", children: "Payment: Cash on Delivery" }),
                isStripe && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 11, className: "text-primary" }),
                  "Payment: Card — Confirmed"
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl px-6 py-5 max-w-sm text-left space-y-3 border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground text-sm uppercase tracking-wider", children: "What happens next?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 15, className: "mt-0.5 text-primary shrink-0" }),
              "Our team will confirm your order shortly."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 15, className: "mt-0.5 text-primary shrink-0" }),
              "We'll prepare your freshly baked items with love."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 15, className: "mt-0.5 text-primary shrink-0" }),
              "Your order will be delivered to your address."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/my-orders", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "default",
              className: "bg-primary text-primary-foreground gap-2",
              "data-ocid": "checkout_success.my_orders_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 16 }),
                "View My Orders"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary",
              "data-ocid": "checkout_success.shop_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 16 }),
                "Continue Shopping"
              ]
            }
          ) })
        ] })
      ]
    }
  );
}
export {
  CheckoutSuccessPage as default
};

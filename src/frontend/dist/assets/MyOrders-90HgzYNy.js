import { c as createLucideIcon, h as useAuth, K as useGetMyOrders, r as reactExports, j as jsxRuntimeExports, P as Package, M as ChevronUp, e as Button, L as Link, N as AuthModal, S as ShoppingBag, m as motion, I as Input, f as Skeleton, O as ChevronDown, A as AnimatePresence, T as Tag, B as Badge } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { S as Search } from "./search-DbXcbU19.js";
import { S as Sparkles } from "./sparkles-lxR0n97q.js";
import { M as MapPin } from "./map-pin-Ck2KqkTp.js";
import { C as CreditCard } from "./credit-card-B8D97PZs.js";
import { C as CircleCheck } from "./circle-check-BrWsE1Gy.js";
import { T as Truck } from "./truck-h-OKdrKh.js";
import { C as Clock } from "./clock-CQ7pTt6k.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode);
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "badge-pending",
    icon: Clock
  },
  confirmed: {
    label: "Confirmed",
    className: "badge-pending",
    icon: CircleCheck
  },
  preparing: {
    label: "Preparing",
    className: "badge-pending",
    icon: Clock
  },
  ready: {
    label: "Ready for Pickup",
    className: "badge-pending",
    icon: Truck
  },
  delivered: {
    label: "Delivered",
    className: "badge-delivered",
    icon: CircleCheck
  },
  cancelled: {
    label: "Cancelled",
    className: "badge-cancelled",
    icon: CircleX
  }
};
function OrderStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 11 }),
        cfg.label
      ]
    }
  );
}
function PaymentBadge({ method }) {
  if (method === "stripe") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/40 text-foreground border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 10 }),
      "Card Payment"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border", children: "Cash on Delivery" });
}
function StripeStatusBadge({ status }) {
  const statusMap = {
    succeeded: { label: "Payment Successful", cn: "badge-delivered" },
    processing: { label: "Payment Processing", cn: "badge-pending" },
    requires_payment_method: {
      label: "Payment Failed",
      cn: "badge-cancelled"
    },
    canceled: { label: "Payment Cancelled", cn: "badge-cancelled" }
  };
  const cfg = statusMap[status] ?? { label: status, cn: "badge-pending" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cn}`,
      children: cfg.label
    }
  );
}
function OrderCard({
  order,
  index
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const date = new Date(Number(order.createdAt)).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const displayId = order.orderId ? order.orderId : order.id.slice(-8).toUpperCase();
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay: index * 0.07 },
      "data-ocid": `my_orders.item.${index + 1}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border shadow-warm overflow-hidden hover-lift", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setExpanded((v) => !v),
            "data-ocid": `my_orders.toggle.${index + 1}`,
            "aria-expanded": expanded,
            className: "w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-4 pb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground text-base leading-tight", children: displayId }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: date })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(OrderStatusBadge, { status: order.status }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ChevronDown,
                    {
                      size: 16,
                      className: `text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
                    itemCount,
                    " ",
                    itemCount === 1 ? "item" : "items"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "·" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentBadge, { method: order.paymentMethod })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display font-bold text-primary text-lg", children: [
                  "BDT ",
                  order.total.toLocaleString()
                ] })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: expanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            exit: { height: 0, opacity: 0 },
            transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
            style: { overflow: "hidden" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "px-5 pb-5 pt-0 border-t border-border/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Items Ordered" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: order.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: "flex items-center justify-between gap-3 text-sm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: item.imageUrl,
                            alt: item.name,
                            className: "w-full h-full object-cover",
                            onError: (e) => {
                              e.target.src = "/assets/images/placeholder.svg";
                            }
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0", children: item.quantity }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground truncate", children: item.name })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-medium shrink-0 tabular-nums", children: [
                        "BDT ",
                        (item.price * item.quantity).toLocaleString()
                      ] })
                    ]
                  },
                  `${item.productId}-${item.name}`
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-border/60 space-y-1.5", children: [
                  order.couponCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Tag,
                        {
                          size: 12,
                          className: "text-emerald-600 dark:text-emerald-400 shrink-0"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Coupon used:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-400/30 text-[11px] font-mono px-1.5 py-0.5 rounded-md", children: order.couponCode })
                    ] }),
                    order.couponDiscount !== void 0 && order.couponDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums", children: [
                      "−BDT ",
                      order.couponDiscount.toLocaleString()
                    ] })
                  ] }),
                  order.pointsRedeemed !== void 0 && order.pointsRedeemed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Sparkles,
                        {
                          size: 12,
                          className: "text-primary shrink-0"
                        }
                      ),
                      "Points redeemed"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums", children: [
                      "−BDT ",
                      order.pointsRedeemed.toLocaleString()
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1 border-t border-border/40", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Order Total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display font-bold text-primary text-base tabular-nums", children: [
                        "BDT ",
                        order.total.toLocaleString()
                      ] }),
                      order.total === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-500 text-white text-[10px] px-1.5 py-0.5", children: "FREE" })
                    ] })
                  ] })
                ] })
              ] }),
              order.deliveryAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm mb-3 p-3 rounded-lg bg-muted/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  MapPin,
                  {
                    size: 14,
                    className: "text-primary shrink-0 mt-0.5"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-0.5", children: "Delivery Address" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground break-words", children: order.deliveryAddress })
                ] })
              ] }),
              (order.deliveryNote ?? order.notes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FileText,
                  {
                    size: 14,
                    className: "text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 dark:text-amber-400 font-semibold mb-0.5 uppercase tracking-wide", children: "Delivery Note" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground break-words", children: order.deliveryNote ?? order.notes })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap text-sm mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { size: 13, className: "text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "Payment:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentBadge, { method: order.paymentMethod })
                ] }),
                order.paymentMethod === "stripe" && order.stripePaymentStatus && /* @__PURE__ */ jsxRuntimeExports.jsx(StripeStatusBadge, { status: order.stripePaymentStatus })
              ] }),
              order.customerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Ordered by",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: order.customerName }),
                order.customerPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  " · ",
                  order.customerPhone
                ] })
              ] })
            ] })
          },
          "details"
        ) })
      ] })
    }
  );
}
function OrdersSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-border bg-card p-5 space-y-3 shadow-warm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24 rounded-full" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20" })
        ] })
      ]
    },
    k
  )) });
}
function MyOrdersPage() {
  const { isLoggedIn } = useAuth();
  const { data: orders, isLoading } = useGetMyOrders();
  const [authOpen, setAuthOpen] = reactExports.useState(false);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  if (!isLoggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6",
          "data-ocid": "my_orders.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full gradient-warm flex items-center justify-center shadow-elevated", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 32, className: "text-primary-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 12, className: "text-foreground" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-2", children: "Sign in to view your orders" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "Log in to your Pretty Baked account to see your full order history, track deliveries, and revisit your favourite treats." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setAuthOpen(true),
                "data-ocid": "my_orders.login_button",
                className: "px-8",
                size: "lg",
                children: "Login to My Account"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "New to Pretty Baked?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: "/shop",
                  className: "text-primary underline underline-offset-2 hover:text-primary/70 transition-colors",
                  "data-ocid": "my_orders.browse_link",
                  children: "Browse our menu first"
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AuthModal,
        {
          open: authOpen,
          onClose: () => setAuthOpen(false),
          defaultTab: "login"
        }
      )
    ] });
  }
  const sortedOrders = (orders ?? []).slice().sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  const filteredOrders = searchQuery.trim() ? sortedOrders.filter((o) => {
    const query = searchQuery.trim().toLowerCase();
    const idToSearch = o.orderId ? o.orderId.toLowerCase() : o.id.slice(-8).toLowerCase();
    return idToSearch.includes(query);
  }) : sortedOrders;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-3xl mx-auto px-4 sm:px-6 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", "data-ocid": "my_orders.page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full gradient-warm flex items-center justify-center shadow-warm shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 18, className: "text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight", children: "My Orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "All your purchases from Pretty Baked" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-3xl mx-auto px-4 sm:px-6 py-8", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(OrdersSkeleton, {}) : !orders || orders.length === 0 ? (
      /* Empty state — no orders at all */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 },
          className: "text-center py-16 flex flex-col items-center gap-5",
          "data-ocid": "my_orders.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 32, className: "text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground mb-2", children: "No orders yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: "You haven't placed any orders yet. Browse our shop and discover something delicious!" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "my_orders.shop_link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "lg",
                className: "px-8",
                "data-ocid": "my_orders.shop_button",
                children: "Browse Our Menu"
              }
            ) })
          ]
        }
      )
    ) : (
      /* Orders list */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", "data-ocid": "my_orders.list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              size: 16,
              className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "text",
              placeholder: "Search by order ID (e.g. ORD-7X3K9M)…",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              "data-ocid": "my_orders.search_input",
              className: "pl-9 bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            }
          ),
          searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSearchQuery(""),
              "aria-label": "Clear search",
              "data-ocid": "my_orders.search_clear_button",
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 15 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: searchQuery.trim() ? `${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"} matching "${searchQuery.trim()}"` : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed` }),
        filteredOrders.length === 0 ? (
          /* No search matches */
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3 },
              className: "text-center py-14 flex flex-col items-center gap-4",
              "data-ocid": "my_orders.search_empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 24, className: "text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold text-foreground mb-1.5", children: "No orders found" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm leading-relaxed", children: [
                    'No orders match "',
                    searchQuery.trim(),
                    '". Try a different order ID or clear the search.'
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => setSearchQuery(""),
                    "data-ocid": "my_orders.search_clear_results_button",
                    children: "Clear Search"
                  }
                )
              ]
            }
          )
        ) : filteredOrders.map((order, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(OrderCard, { order, index: idx }, order.id)),
        !searchQuery.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "my_orders.order_more_link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            "data-ocid": "my_orders.order_more_button",
            children: "Order something new"
          }
        ) }) })
      ] })
    ) })
  ] });
}
export {
  MyOrdersPage as default
};

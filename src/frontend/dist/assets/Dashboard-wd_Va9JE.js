import { c as createLucideIcon, a4 as useIsAdmin, a5 as useStoreInitData, j as jsxRuntimeExports, f as Skeleton, P as Package, T as Tag, S as ShoppingBag, B as Badge, e as Button, a6 as RefreshCw, m as motion, a7 as ChartNoAxesColumn, a8 as useClaimAdmin, r as reactExports, o as Label, I as Input, g as ue } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-y8MOlqQc.js";
import { T as TrendingUp } from "./trending-up-Cgqes8lE.js";
import { L as LoaderCircle } from "./loader-circle-De99uBSv.js";
import { P as Plus } from "./plus-KifZePkW.js";
import { E as Eye } from "./eye-BkZbYeCW.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode);
const STAT_COLORS = [
  "bg-primary/10 text-primary",
  "bg-muted text-foreground",
  "bg-primary/5 text-primary",
  "bg-destructive/10 text-destructive"
];
function ClaimAdminGate() {
  const claimMutation = useClaimAdmin();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  async function handleClaim(e) {
    e.preventDefault();
    setError("");
    try {
      await claimMutation.mutateAsync({ email, password });
      ue.success("Admin access granted! Welcome to Pretty Baked Admin.");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[60vh] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      className: "max-w-sm w-full",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border shadow-elevated p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 26, className: "text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground", children: "Admin Login" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Enter your admin credentials to access the dashboard." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleClaim, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "admin-email", className: "text-sm font-medium", children: "Admin Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "admin-email",
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "Enter admin email",
                className: "mt-1",
                required: true,
                autoComplete: "email",
                "data-ocid": "admin.dashboard.claim_email_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "admin-pw", className: "text-sm font-medium", children: "Admin Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "admin-pw",
                type: "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                placeholder: "Enter admin password",
                className: "mt-1",
                required: true,
                autoComplete: "current-password",
                "data-ocid": "admin.dashboard.claim_password_input"
              }
            )
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-xs text-destructive mt-1",
              "data-ocid": "admin.dashboard.claim_error_state",
              children: error
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "submit",
              disabled: claimMutation.isPending,
              className: "w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth",
              "data-ocid": "admin.dashboard.claim_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 15 }),
                claimMutation.isPending ? "Signing in..." : "Sign In"
              ]
            }
          )
        ] })
      ] })
    }
  ) });
}
function AdminDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    data: initData,
    isLoading: initLoading,
    isFetching,
    isError: initError,
    failureCount,
    refetch: retryInit
  } = useStoreInitData();
  const products = (initData == null ? void 0 : initData.products) ?? [];
  const categories = (initData == null ? void 0 : initData.categories) ?? [];
  const orders = (initData == null ? void 0 : initData.recentOrders) ?? [];
  const lowStockProducts = (initData == null ? void 0 : initData.lowStockProducts) ?? [];
  const dataLoading = initLoading && !initData;
  const isReconnecting = isFetching && failureCount > 0 && failureCount <= 3;
  const hardError = initError && !initData && failureCount >= 3;
  if (adminLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", "data-ocid": "admin.dashboard.loading_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-xl" }, k)) })
    ] });
  }
  if (!isAdmin) return /* @__PURE__ */ jsxRuntimeExports.jsx(ClaimAdminGate, {});
  const revenueLoaded = !dataLoading && initData !== void 0;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const statVal = (v) => {
    if (hardError && !initData) return "--";
    return v;
  };
  const stats = [
    {
      label: "Total Products",
      value: dataLoading ? null : statVal(products.length),
      icon: Package,
      sub: hardError && !initData ? "Connection issue" : dataLoading ? "Loading…" : `${products.filter((p) => p.isFeatured).length} featured`
    },
    {
      label: "Categories",
      value: dataLoading ? null : statVal(categories.length),
      icon: Tag,
      sub: hardError && !initData ? "Connection issue" : dataLoading ? "Loading…" : "Active groups"
    },
    {
      label: "Total Orders",
      value: dataLoading ? null : statVal(orders.length),
      icon: ShoppingBag,
      sub: hardError && !initData ? "Connection issue" : dataLoading ? "Loading…" : `${orders.filter((o) => o.status === "pending").length} pending`
    },
    {
      label: "Revenue (BDT)",
      value: hardError && !initData ? "--" : !revenueLoaded ? null : `৳${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      sub: hardError && !initData ? "Connection issue" : "All time"
    }
  ];
  const quickLinks = [
    {
      href: "/admin/products/new",
      label: "Add Product",
      icon: Plus,
      desc: "List a new item"
    },
    {
      href: "/admin/categories",
      label: "Manage Categories",
      icon: Tag,
      desc: "Organize your catalog"
    },
    {
      href: "/admin/orders",
      label: "View Orders",
      icon: ShoppingBag,
      desc: "Track customer orders"
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: ChartNoAxesColumn,
      desc: "Revenue & insights"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", "data-ocid": "admin.dashboard.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Welcome back to Pretty Baked Admin" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        isReconnecting && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: "secondary",
            className: "gap-1.5 text-xs text-muted-foreground",
            "data-ocid": "admin.dashboard.reconnecting_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 11, className: "animate-spin" }),
              "Reconnecting…"
            ]
          }
        ),
        (hardError || initError && !isReconnecting) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => retryInit(),
            className: "gap-1.5 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
            "data-ocid": "admin.dashboard.retry_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13 }),
              "Refresh Data"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "/admin/products/new",
            "data-ocid": "admin.dashboard.add_product_button",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
              " Add Product"
            ] })
          }
        )
      ] })
    ] }),
    hardError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm",
        "data-ocid": "admin.dashboard.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "text-amber-500 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/80", children: [
            "Some data is temporarily unavailable. Click",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Refresh Data" }),
            " above to retry."
          ] })
        ]
      }
    ),
    initError && !hardError && !initData && isReconnecting && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 text-sm",
        "data-ocid": "admin.dashboard.reconnecting_warning_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "text-amber-500 shrink-0 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/70", children: "Connecting to backend… Dashboard will update automatically." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4",
        "data-ocid": "admin.dashboard.stats_panel",
        children: stats.map((stat, i) => {
          const Icon = stat.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: i * 0.08 },
              "data-ocid": `admin.dashboard.stat_card.${i + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border shadow-warm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-9 h-9 rounded-lg flex items-center justify-center ${STAT_COLORS[i]}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 17 })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl font-bold text-foreground", children: stat.value === null ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-12 inline-block" }) : stat.value }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: stat.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70 mt-1", children: stat.sub })
              ] }) })
            },
            stat.label
          );
        })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", children: quickLinks.map((link, i) => {
      const Icon = link.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -10 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: 0.3 + i * 0.08 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: link.href,
              "data-ocid": `admin.dashboard.quick_link.${i + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 bg-card border-border shadow-warm hover-lift cursor-pointer group transition-smooth hover:border-primary/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0 flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16, className: "text-primary" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground group-hover:text-primary transition-smooth", children: link.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: link.desc })
                ] })
              ] }) })
            }
          )
        },
        link.href
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "bg-card border-border shadow-warm",
          "data-ocid": "admin.dashboard.products_panel",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-base font-bold text-foreground", children: "Recent Products" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: "/admin/products",
                  "data-ocid": "admin.dashboard.view_all_products_link",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "gap-1.5 text-xs hover:text-primary transition-smooth",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 }),
                        " View All"
                      ]
                    }
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: dataLoading ? [1, 2, 3, 4, 5].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-9 h-9 rounded-lg flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-3/4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-12 rounded-full" })
            ] }, k)) : hardError && !initData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "text-center py-8 text-muted-foreground",
                "data-ocid": "admin.dashboard.products_error_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 20, className: "mx-auto mb-2 opacity-40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
                    "Failed to load — click ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Refresh Data" })
                  ] })
                ]
              }
            ) : products.slice(0, 5).map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-smooth",
                "data-ocid": `admin.dashboard.product_row.${i + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: product.imageUrl,
                      alt: product.name,
                      className: "w-full h-full object-cover",
                      onError: (e) => {
                        e.target.src = "/assets/images/placeholder.svg";
                      }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: product.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                      "৳",
                      product.price.toLocaleString(),
                      " · Stock: ",
                      product.stock
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: product.isAvailable ? "default" : "secondary",
                      className: "text-xs flex-shrink-0",
                      children: product.isAvailable ? "Active" : "Off"
                    }
                  )
                ]
              },
              product.id
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "bg-card border-border shadow-warm",
          "data-ocid": "admin.dashboard.low_stock_panel",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3 flex flex-row items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-base font-bold text-foreground flex items-center gap-2", children: [
              "Stock Alerts",
              lowStockProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "destructive",
                  className: "text-[10px] px-1.5 py-0 h-4",
                  children: lowStockProducts.length
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: lowStockProducts.length === 0 && !hardError ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "text-center py-8 text-muted-foreground",
                "data-ocid": "admin.dashboard.no_alerts_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl mb-2", children: "✅" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "All products are well-stocked!" })
                ]
              }
            ) : hardError && !initData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "text-center py-8 text-muted-foreground",
                "data-ocid": "admin.dashboard.alerts_error_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 20, className: "mx-auto mb-2 opacity-40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
                    "Failed to load — click ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Refresh Data" })
                  ] })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: lowStockProducts.map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20",
                "data-ocid": `admin.dashboard.alert_row.${i + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TriangleAlert,
                    {
                      size: 15,
                      className: "text-destructive flex-shrink-0"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: product.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive", children: [
                      "Only ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: product.stock }),
                      " ",
                      "unit",
                      product.stock !== 1 ? "s" : "",
                      " left"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/admin/products/${product.id}/edit`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "text-xs h-7 hover:text-primary transition-smooth",
                      "data-ocid": `admin.dashboard.alert_edit_button.${i + 1}`,
                      children: "Edit"
                    }
                  ) })
                ]
              },
              product.id
            )) }) })
          ]
        }
      )
    ] })
  ] });
}
export {
  AdminDashboardPage as default
};

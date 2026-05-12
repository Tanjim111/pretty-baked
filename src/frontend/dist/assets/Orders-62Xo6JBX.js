import { ag as useOrders, ah as useUpdateOrderStatus, ai as useDeleteOrder, r as reactExports, S as ShoppingBag, j as jsxRuntimeExports, I as Input, m as motion, B as Badge, W as Select, Y as SelectTrigger, Z as SelectValue, $ as SelectContent, a0 as SelectItem, aj as Check, e as Button, w as Separator, T as Tag, P as Package, g as ue } from "./index-YPmBzU2g.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Hws5YtRC.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-y8MOlqQc.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-CYJVCNc-.js";
import { C as Clock } from "./clock-CQ7pTt6k.js";
import { C as CircleCheckBig } from "./circle-check-big-zc-xK0f_.js";
import { T as TrendingUp } from "./trending-up-Cgqes8lE.js";
import { S as Search } from "./search-DbXcbU19.js";
import { L as LoaderCircle } from "./loader-circle-De99uBSv.js";
import { E as Eye } from "./eye-BkZbYeCW.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import { S as Sparkles } from "./sparkles-lxR0n97q.js";
import "./index-DfMnyd6p.js";
const STATUS_STYLES = {
  pending: "bg-secondary/50 text-foreground border-secondary",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  preparing: "bg-primary/15 text-primary border-primary/25",
  ready: "bg-primary/10 text-primary border-primary/30",
  delivered: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20"
};
const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled"
};
const ALL_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled"
];
let localOrderOverrides = {};
function getDisplayId(order) {
  if (order.orderId && !order.orderId.startsWith("#")) return order.orderId;
  return order.orderId ?? `#${order.id.slice(-6).toUpperCase()}`;
}
function AdminOrdersPage() {
  const { data: rawOrders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [selectedOrder, setSelectedOrder] = reactExports.useState(null);
  const [deletingIds, setDeletingIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [statusOverrides, setStatusOverrides] = reactExports.useState({});
  const [unsavedIds, setUnsavedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [savingIds, setSavingIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const orders = rawOrders.filter((o) => !deletingIds.has(o.id)).map((o) => ({
    ...o,
    status: statusOverrides[o.id] ?? localOrderOverrides[o.id] ?? o.status
  }));
  const filteredOrders = searchQuery.trim().length === 0 ? orders : orders.filter(
    (o) => getDisplayId(o).toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock
    },
    {
      label: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CircleCheckBig
    },
    {
      label: "Revenue",
      value: `৳${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`,
      icon: TrendingUp
    }
  ];
  function handleStatusChange(orderId, status) {
    setStatusOverrides((prev) => ({ ...prev, [orderId]: status }));
    setUnsavedIds((prev) => /* @__PURE__ */ new Set([...prev, orderId]));
    if ((selectedOrder == null ? void 0 : selectedOrder.id) === orderId) {
      setSelectedOrder((o) => o ? { ...o, status } : null);
    }
  }
  async function handleSaveStatus(orderId, status) {
    setSavingIds((prev) => /* @__PURE__ */ new Set([...prev, orderId]));
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      localOrderOverrides = { ...localOrderOverrides, [orderId]: status };
      setUnsavedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      ue.success(`Status saved: "${STATUS_LABELS[status]}"`);
    } catch {
      ue.error("Failed to save status. Please try again.");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }
  async function handleDelete(orderId) {
    setDeletingIds((s) => /* @__PURE__ */ new Set([...s, orderId]));
    try {
      await deleteOrder.mutateAsync(orderId);
      if ((selectedOrder == null ? void 0 : selectedOrder.id) === orderId) setSelectedOrder(null);
      ue.success("Order deleted successfully");
    } catch {
      setDeletingIds((s) => {
        const next = new Set(s);
        next.delete(orderId);
        return next;
      });
      ue.error("Failed to delete order. Please try again.");
    }
  }
  const visibleSelectedOrder = selectedOrder && !deletingIds.has(selectedOrder.id) ? {
    ...selectedOrder,
    status: statusOverrides[selectedOrder.id] ?? localOrderOverrides[selectedOrder.id] ?? selectedOrder.status
  } : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.orders.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
        orders.length,
        " total orders"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, i) => {
      const Icon = stat.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "bg-card border-border shadow-warm",
          "data-ocid": `admin.orders.stat.${i + 1}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 15, className: "text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: stat.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold text-foreground", children: stat.value })
          ] })
        },
        stat.label
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border shadow-warm",
        "data-ocid": "admin.orders.orders_panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-base font-bold text-foreground", children: "Order History" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Search,
                {
                  size: 14,
                  className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "search",
                  placeholder: "Search by Order ID...",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "pl-8 h-8 text-xs border-border bg-background focus-visible:ring-primary/40 rounded-lg",
                  "data-ocid": "admin.orders.search_input"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-12 bg-muted animate-pulse rounded-lg"
            },
            k
          )) }) : orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-14",
              "data-ocid": "admin.orders.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ShoppingBag,
                  {
                    size: 40,
                    className: "mx-auto mb-3 text-muted-foreground/40"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: "No orders yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Orders will appear here once customers start purchasing from your store." })
              ]
            }
          ) : filteredOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-12",
              "data-ocid": "admin.orders.search_empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Search,
                  {
                    size: 36,
                    className: "mx-auto mb-3 text-muted-foreground/40"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground mb-1", children: "No orders found" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
                  "No order matches “",
                  searchQuery,
                  "”. Try a different ID."
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Order ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell", children: "Customer" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell", children: "Items" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Actions" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filteredOrders.map((order, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.tr,
                {
                  className: "hover:bg-muted/30 transition-smooth",
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: i * 0.03 },
                  "data-ocid": `admin.orders.row.${i + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold border border-primary/20 tracking-wide", children: getDisplayId(order) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground text-xs", children: order.customerName }),
                      order.customerPhone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: order.customerPhone })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 hidden md:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                      order.items.length,
                      " item",
                      order.items.length !== 1 ? "s" : ""
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-right font-semibold text-primary", children: [
                      "৳",
                      order.total.toLocaleString()
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: order.status,
                          onValueChange: (v) => handleStatusChange(order.id, v),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              SelectTrigger,
                              {
                                className: `h-7 text-xs w-32 border ${STATUS_STYLES[order.status]}`,
                                "data-ocid": `admin.orders.status_select.${i + 1}`,
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ALL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              SelectItem,
                              {
                                value: s,
                                className: "text-xs",
                                children: STATUS_LABELS[s]
                              },
                              s
                            )) })
                          ]
                        }
                      ),
                      unsavedIds.has(order.id) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          className: "h-7 w-7 flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors duration-150 disabled:opacity-60 flex-shrink-0",
                          onClick: () => handleSaveStatus(order.id, order.status),
                          disabled: savingIds.has(order.id),
                          "aria-label": "Save status change",
                          "data-ocid": `admin.orders.save_status_button.${i + 1}`,
                          children: savingIds.has(order.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 13, strokeWidth: 2.5 })
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth",
                          onClick: () => setSelectedOrder(order),
                          "aria-label": "View order details",
                          "data-ocid": `admin.orders.view_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth",
                            "aria-label": "Delete order",
                            disabled: deletingIds.has(order.id),
                            "data-ocid": `admin.orders.delete_button.${i + 1}`,
                            children: deletingIds.has(order.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.orders.delete_dialog", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
                              "Delete order ",
                              getDisplayId(order),
                              "?"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently delete this order record. This action cannot be undone." })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.orders.delete_cancel_button", children: "Cancel" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              AlertDialogAction,
                              {
                                onClick: () => handleDelete(order.id),
                                className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                                "data-ocid": "admin.orders.delete_confirm_button",
                                children: "Delete"
                              }
                            )
                          ] })
                        ] })
                      ] })
                    ] }) })
                  ]
                },
                order.id
              )) })
            ] }),
            searchQuery.trim().length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center mt-3", children: [
              "Showing ",
              filteredOrders.length,
              " of ",
              orders.length,
              " orders"
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!visibleSelectedOrder,
        onOpenChange: (o) => !o && setSelectedOrder(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-lg max-h-[80vh] overflow-y-auto",
            "data-ocid": "admin.orders.detail_dialog",
            children: [
              visibleSelectedOrder && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display text-lg", children: [
                  "Order",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-mono", children: getDisplayId(visibleSelectedOrder) })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        className: `text-xs border ${STATUS_STYLES[visibleSelectedOrder.status]}`,
                        children: STATUS_LABELS[visibleSelectedOrder.status]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Customer" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: visibleSelectedOrder.customerName }),
                      visibleSelectedOrder.customerPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                        "📞 ",
                        visibleSelectedOrder.customerPhone
                      ] }),
                      visibleSelectedOrder.deliveryAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                        "📍 ",
                        visibleSelectedOrder.deliveryAddress
                      ] }),
                      (visibleSelectedOrder.deliveryNote ?? visibleSelectedOrder.notes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1.5", children: "📝 Delivery Note" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground font-medium", children: visibleSelectedOrder.deliveryNote ?? visibleSelectedOrder.notes })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Order Items" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: visibleSelectedOrder.items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "flex items-center gap-3 p-2 rounded-lg bg-muted/40",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: item.name }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                              "৳",
                              item.price.toLocaleString(),
                              " × ",
                              item.quantity
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-primary", children: [
                            "৳",
                            (item.price * item.quantity).toLocaleString()
                          ] })
                        ]
                      },
                      `${item.productId}-${i}`
                    )) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                  (visibleSelectedOrder.couponCode || visibleSelectedOrder.pointsRedeemed !== void 0 && visibleSelectedOrder.pointsRedeemed > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Discounts Applied" }),
                      visibleSelectedOrder.couponCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Tag,
                            {
                              size: 13,
                              className: "text-emerald-600 dark:text-emerald-400 shrink-0"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide", children: "Coupon Used" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-sm font-bold text-emerald-800 dark:text-emerald-300 tracking-wider", children: visibleSelectedOrder.couponCode })
                          ] })
                        ] }),
                        visibleSelectedOrder.couponDiscount !== void 0 && visibleSelectedOrder.couponDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-emerald-700 dark:text-emerald-400", children: [
                          "−৳",
                          visibleSelectedOrder.couponDiscount.toLocaleString()
                        ] })
                      ] }),
                      visibleSelectedOrder.pointsRedeemed !== void 0 && visibleSelectedOrder.pointsRedeemed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/15", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Sparkles,
                            {
                              size: 13,
                              className: "text-primary shrink-0"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground", children: "Loyalty Points Redeemed" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
                          "−৳",
                          visibleSelectedOrder.pointsRedeemed.toLocaleString()
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {})
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Final Total" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display text-xl font-bold text-primary", children: [
                        "৳",
                        visibleSelectedOrder.total.toLocaleString()
                      ] }),
                      visibleSelectedOrder.total === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-500 text-white text-xs px-1.5 py-0.5", children: "FREE ORDER" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Update Status" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Select,
                        {
                          value: visibleSelectedOrder.status,
                          onValueChange: (v) => handleStatusChange(
                            visibleSelectedOrder.id,
                            v
                          ),
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              SelectTrigger,
                              {
                                className: "flex-1",
                                "data-ocid": "admin.orders.detail_status_select",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ALL_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: STATUS_LABELS[s] }, s)) })
                          ]
                        }
                      ),
                      unsavedIds.has(visibleSelectedOrder.id) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          className: "h-9 px-3 flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors duration-150 disabled:opacity-60 flex-shrink-0",
                          onClick: () => handleSaveStatus(
                            visibleSelectedOrder.id,
                            visibleSelectedOrder.status
                          ),
                          disabled: savingIds.has(visibleSelectedOrder.id),
                          "aria-label": "Save status change",
                          "data-ocid": "admin.orders.detail_save_status_button",
                          children: [
                            savingIds.has(visibleSelectedOrder.id) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14, strokeWidth: 2.5 }),
                            "Save"
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
                    "Placed on",
                    " ",
                    new Date(visibleSelectedOrder.createdAt).toLocaleDateString(
                      "en-BD",
                      { year: "numeric", month: "long", day: "numeric" }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "outline",
                        className: "flex-1",
                        onClick: () => setSelectedOrder(null),
                        "data-ocid": "admin.orders.detail_close_button",
                        children: "Close"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          variant: "outline",
                          className: "gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10",
                          "data-ocid": "admin.orders.detail_delete_button",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
                            " Delete"
                          ]
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this order?" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone." })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            AlertDialogAction,
                            {
                              onClick: () => handleDelete(visibleSelectedOrder.id),
                              className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                              "data-ocid": "admin.orders.detail_delete_confirm_button",
                              children: "Delete"
                            }
                          )
                        ] })
                      ] })
                    ] })
                  ] })
                ] })
              ] }),
              !visibleSelectedOrder && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 32, className: "text-muted-foreground/40" }) })
            ]
          }
        )
      }
    )
  ] });
}
export {
  AdminOrdersPage as default
};

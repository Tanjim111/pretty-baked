import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteOrder,
  useOrders,
  useUpdateOrderStatus,
} from "../../hooks/useBackend";
import type { Order } from "../../types";

type OrderStatus = Order["status"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-secondary/50 text-foreground border-secondary",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  preparing: "bg-primary/15 text-primary border-primary/25",
  ready: "bg-primary/10 text-primary border-primary/30",
  delivered: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

// Local order management (since backend returns empty, we manage updates in memory)
let localOrderOverrides: Record<string, OrderStatus> = {};

/** Returns the best display ID for an order — the generated orderId if present, otherwise the legacy fallback. */
function getDisplayId(order: Order): string {
  if (order.orderId && !order.orderId.startsWith("#")) return order.orderId;
  return order.orderId ?? `#${order.id.slice(-6).toUpperCase()}`;
}

export default function AdminOrdersPage() {
  const { data: rawOrders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, OrderStatus>
  >({});
  const [unsavedIds, setUnsavedIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const orders = rawOrders
    .filter((o) => !deletingIds.has(o.id))
    .map((o) => ({
      ...o,
      status: (statusOverrides[o.id] ??
        localOrderOverrides[o.id] ??
        o.status) as OrderStatus,
    }));

  const filteredOrders =
    searchQuery.trim().length === 0
      ? orders
      : orders.filter((o) =>
          getDisplayId(o)
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase()),
        );

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock,
    },
    {
      label: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle,
    },
    {
      label: "Revenue",
      value: `৳${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`,
      icon: TrendingUp,
    },
  ];

  function handleStatusChange(orderId: string, status: OrderStatus) {
    setStatusOverrides((prev) => ({ ...prev, [orderId]: status }));
    setUnsavedIds((prev) => new Set([...prev, orderId]));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((o) => (o ? { ...o, status } : null));
    }
  }

  async function handleSaveStatus(orderId: string, status: OrderStatus) {
    setSavingIds((prev) => new Set([...prev, orderId]));
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      localOrderOverrides = { ...localOrderOverrides, [orderId]: status };
      setUnsavedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      toast.success(`Status saved: "${STATUS_LABELS[status]}"`);
    } catch {
      toast.error("Failed to save status. Please try again.");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  async function handleDelete(orderId: string) {
    setDeletingIds((s) => new Set([...s, orderId]));
    try {
      await deleteOrder.mutateAsync(orderId);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      toast.success("Order deleted successfully");
    } catch {
      setDeletingIds((s) => {
        const next = new Set(s);
        next.delete(orderId);
        return next;
      });
      toast.error("Failed to delete order. Please try again.");
    }
  }

  const visibleSelectedOrder =
    selectedOrder && !deletingIds.has(selectedOrder.id)
      ? {
          ...selectedOrder,
          status: (statusOverrides[selectedOrder.id] ??
            localOrderOverrides[selectedOrder.id] ??
            selectedOrder.status) as OrderStatus,
        }
      : null;

  return (
    <div className="space-y-6" data-ocid="admin.orders.page">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Orders
        </h2>
        <p className="text-muted-foreground text-sm">
          {orders.length} total orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-card border-border shadow-warm"
              data-ocid={`admin.orders.stat.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} className="text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="font-display text-xl font-bold text-foreground">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card
        className="bg-card border-border shadow-warm"
        data-ocid="admin.orders.orders_panel"
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="font-display text-base font-bold text-foreground">
              Order History
            </CardTitle>
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="search"
                placeholder="Search by Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs border-border bg-background focus-visible:ring-primary/40 rounded-lg"
                data-ocid="admin.orders.search_input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {(["a", "b", "c"] as const).map((k) => (
                <div
                  key={k}
                  className="h-12 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div
              className="text-center py-14"
              data-ocid="admin.orders.empty_state"
            >
              <ShoppingBag
                size={40}
                className="mx-auto mb-3 text-muted-foreground/40"
              />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                No orders yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Orders will appear here once customers start purchasing from
                your store.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="admin.orders.search_empty_state"
            >
              <Search
                size={36}
                className="mx-auto mb-3 text-muted-foreground/40"
              />
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                No orders found
              </h3>
              <p className="text-muted-foreground text-sm">
                No order matches &ldquo;{searchQuery}&rdquo;. Try a different
                ID.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                      Customer
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">
                      Items
                    </th>
                    <th className="text-right px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      className="hover:bg-muted/30 transition-smooth"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      data-ocid={`admin.orders.row.${i + 1}`}
                    >
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold border border-primary/20 tracking-wide">
                          {getDisplayId(order)}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <div>
                          <p className="font-medium text-foreground text-xs">
                            {order.customerName}
                          </p>
                          {order.customerPhone && (
                            <p className="text-xs text-muted-foreground">
                              {order.customerPhone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-primary">
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Select
                            value={order.status}
                            onValueChange={(v) =>
                              handleStatusChange(order.id, v as OrderStatus)
                            }
                          >
                            <SelectTrigger
                              className={`h-7 text-xs w-32 border ${STATUS_STYLES[order.status]}`}
                              data-ocid={`admin.orders.status_select.${i + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_STATUSES.map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-xs"
                                >
                                  {STATUS_LABELS[s]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {unsavedIds.has(order.id) && (
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors duration-150 disabled:opacity-60 flex-shrink-0"
                              onClick={() =>
                                handleSaveStatus(order.id, order.status)
                              }
                              disabled={savingIds.has(order.id)}
                              aria-label="Save status change"
                              data-ocid={`admin.orders.save_status_button.${i + 1}`}
                            >
                              {savingIds.has(order.id) ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={13} strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth"
                            onClick={() => setSelectedOrder(order)}
                            aria-label="View order details"
                            data-ocid={`admin.orders.view_button.${i + 1}`}
                          >
                            <Eye size={13} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth"
                                aria-label="Delete order"
                                disabled={deletingIds.has(order.id)}
                                data-ocid={`admin.orders.delete_button.${i + 1}`}
                              >
                                {deletingIds.has(order.id) ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-ocid="admin.orders.delete_dialog">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete order {getDisplayId(order)}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this order
                                  record. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.orders.delete_cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(order.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  data-ocid="admin.orders.delete_confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {searchQuery.trim().length > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!visibleSelectedOrder}
        onOpenChange={(o) => !o && setSelectedOrder(null)}
      >
        <DialogContent
          className="max-w-lg max-h-[80vh] overflow-y-auto"
          data-ocid="admin.orders.detail_dialog"
        >
          {visibleSelectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg">
                  Order{" "}
                  <span className="text-primary font-mono">
                    {getDisplayId(visibleSelectedOrder)}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Status
                  </span>
                  <Badge
                    className={`text-xs border ${STATUS_STYLES[visibleSelectedOrder.status]}`}
                  >
                    {STATUS_LABELS[visibleSelectedOrder.status]}
                  </Badge>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Customer
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {visibleSelectedOrder.customerName}
                    </p>
                    {visibleSelectedOrder.customerPhone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {visibleSelectedOrder.customerPhone}
                      </p>
                    )}
                    {visibleSelectedOrder.deliveryAddress && (
                      <p className="text-sm text-muted-foreground">
                        📍 {visibleSelectedOrder.deliveryAddress}
                      </p>
                    )}
                    {(visibleSelectedOrder.deliveryNote ??
                      visibleSelectedOrder.notes) && (
                      <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                          📝 Delivery Note
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {visibleSelectedOrder.deliveryNote ??
                            visibleSelectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Order Items
                  </p>
                  <div className="space-y-2">
                    {visibleSelectedOrder.items.map((item, i) => (
                      <div
                        key={`${item.productId}-${i}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/40"
                      >
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ৳{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Coupon / Discount used */}
                {(visibleSelectedOrder.couponCode ||
                  (visibleSelectedOrder.pointsRedeemed !== undefined &&
                    visibleSelectedOrder.pointsRedeemed > 0)) && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Discounts Applied
                      </p>
                      {visibleSelectedOrder.couponCode && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                          <div className="flex items-center gap-2">
                            <Tag
                              size={13}
                              className="text-emerald-600 dark:text-emerald-400 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                Coupon Used
                              </p>
                              <code className="text-sm font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                                {visibleSelectedOrder.couponCode}
                              </code>
                            </div>
                          </div>
                          {visibleSelectedOrder.couponDiscount !== undefined &&
                            visibleSelectedOrder.couponDiscount > 0 && (
                              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                −৳
                                {visibleSelectedOrder.couponDiscount.toLocaleString()}
                              </span>
                            )}
                        </div>
                      )}
                      {visibleSelectedOrder.pointsRedeemed !== undefined &&
                        visibleSelectedOrder.pointsRedeemed > 0 && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                            <div className="flex items-center gap-2">
                              <Sparkles
                                size={13}
                                className="text-primary shrink-0"
                              />
                              <p className="text-xs font-semibold text-foreground">
                                Loyalty Points Redeemed
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              −৳
                              {visibleSelectedOrder.pointsRedeemed.toLocaleString()}
                            </span>
                          </div>
                        )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Final Total</p>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-xl font-bold text-primary">
                      ৳{visibleSelectedOrder.total.toLocaleString()}
                    </p>
                    {visibleSelectedOrder.total === 0 && (
                      <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0.5">
                        FREE ORDER
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Update Status */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Update Status
                  </p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={visibleSelectedOrder.status}
                      onValueChange={(v) =>
                        handleStatusChange(
                          visibleSelectedOrder.id,
                          v as OrderStatus,
                        )
                      }
                    >
                      <SelectTrigger
                        className="flex-1"
                        data-ocid="admin.orders.detail_status_select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {unsavedIds.has(visibleSelectedOrder.id) && (
                      <button
                        type="button"
                        className="h-9 px-3 flex items-center gap-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors duration-150 disabled:opacity-60 flex-shrink-0"
                        onClick={() =>
                          handleSaveStatus(
                            visibleSelectedOrder.id,
                            visibleSelectedOrder.status,
                          )
                        }
                        disabled={savingIds.has(visibleSelectedOrder.id)}
                        aria-label="Save status change"
                        data-ocid="admin.orders.detail_save_status_button"
                      >
                        {savingIds.has(visibleSelectedOrder.id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} strokeWidth={2.5} />
                        )}
                        Save
                      </button>
                    )}
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground text-center">
                  Placed on{" "}
                  {new Date(visibleSelectedOrder.createdAt).toLocaleDateString(
                    "en-BD",
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedOrder(null)}
                    data-ocid="admin.orders.detail_close_button"
                  >
                    Close
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                        data-ocid="admin.orders.detail_delete_button"
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(visibleSelectedOrder.id)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          data-ocid="admin.orders.detail_delete_confirm_button"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
          {!visibleSelectedOrder && (
            <div className="flex items-center justify-center py-8">
              <Package size={32} className="text-muted-foreground/40" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

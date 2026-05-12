import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AuthModal } from "../components/AuthModal";
import { useAuth } from "../hooks/useAuth";
import { useGetMyOrders } from "../hooks/useBackend";
import type { Order } from "../types";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

type OrderStatus = Order["status"];

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ElementType;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    className: "badge-pending",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    className: "badge-pending",
    icon: CheckCircle2,
  },
  preparing: {
    label: "Preparing",
    className: "badge-pending",
    icon: Clock,
  },
  ready: {
    label: "Ready for Pickup",
    className: "badge-pending",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    className: "badge-delivered",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "badge-cancelled",
    icon: XCircle,
  },
};

// ---------------------------------------------------------------------------
// OrderStatusBadge
// ---------------------------------------------------------------------------

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Payment method label
// ---------------------------------------------------------------------------

function PaymentBadge({ method }: { method: Order["paymentMethod"] }) {
  if (method === "stripe") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/40 text-foreground border border-border">
        <CreditCard size={10} />
        Card Payment
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
      Cash on Delivery
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stripe payment status
// ---------------------------------------------------------------------------

function StripeStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; cn: string }> = {
    succeeded: { label: "Payment Successful", cn: "badge-delivered" },
    processing: { label: "Payment Processing", cn: "badge-pending" },
    requires_payment_method: {
      label: "Payment Failed",
      cn: "badge-cancelled",
    },
    canceled: { label: "Payment Cancelled", cn: "badge-cancelled" },
  };
  const cfg = statusMap[status] ?? { label: status, cn: "badge-pending" };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cn}`}
    >
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// OrderCard — collapsible with full details on expand
// ---------------------------------------------------------------------------

function OrderCard({
  order,
  index,
}: {
  order: Order;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(Number(order.createdAt)).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Show full orderId if present (e.g. ORD-7X3K9M), otherwise fallback to last 8 chars of id
  const displayId = order.orderId
    ? order.orderId
    : order.id.slice(-8).toUpperCase();

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      data-ocid={`my_orders.item.${index + 1}`}
    >
      <Card className="bg-card border-border shadow-warm overflow-hidden hover-lift">
        {/* Collapsed header — always visible */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          data-ocid={`my_orders.toggle.${index + 1}`}
          aria-expanded={expanded}
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-lg"
        >
          <div className="px-5 pt-4 pb-4">
            {/* Top row: order ID + status */}
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div>
                <p className="font-display font-semibold text-foreground text-base leading-tight">
                  {displayId}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <OrderStatusBadge status={order.status} />
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {/* Summary row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="text-muted-foreground text-xs">·</span>
                <PaymentBadge method={order.paymentMethod} />
              </div>
              <span className="font-display font-bold text-primary text-lg">
                BDT {order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </button>

        {/* Expanded details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="px-5 pb-5 pt-0 border-t border-border/60">
                {/* Items list */}
                <div className="mt-4 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Items Ordered
                  </p>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={`${item.productId}-${item.name}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
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
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {item.quantity}
                            </span>
                            <span className="text-foreground truncate">
                              {item.name}
                            </span>
                          </div>
                        </div>
                        <span className="text-foreground font-medium shrink-0 tabular-nums">
                          BDT {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Subtotal line */}
                  <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                    {/* Coupon / discount row — shown only when a coupon was used */}
                    {order.couponCode && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5">
                          <Tag
                            size={12}
                            className="text-emerald-600 dark:text-emerald-400 shrink-0"
                          />
                          <span className="text-muted-foreground">
                            Coupon used:
                          </span>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-400/30 text-[11px] font-mono px-1.5 py-0.5 rounded-md">
                            {order.couponCode}
                          </Badge>
                        </span>
                        {order.couponDiscount !== undefined &&
                          order.couponDiscount > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                              −BDT {order.couponDiscount.toLocaleString()}
                            </span>
                          )}
                      </div>
                    )}
                    {/* Points redeemed row */}
                    {order.pointsRedeemed !== undefined &&
                      order.pointsRedeemed > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Sparkles
                              size={12}
                              className="text-primary shrink-0"
                            />
                            Points redeemed
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                            −BDT {order.pointsRedeemed.toLocaleString()}
                          </span>
                        </div>
                      )}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <span className="text-sm font-medium text-muted-foreground">
                        Order Total
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-primary text-base tabular-nums">
                          BDT {order.total.toLocaleString()}
                        </span>
                        {order.total === 0 && (
                          <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">
                            FREE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery address */}
                {order.deliveryAddress && (
                  <div className="flex items-start gap-2 text-sm mb-3 p-3 rounded-lg bg-muted/50">
                    <MapPin
                      size={14}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">
                        Delivery Address
                      </p>
                      <p className="text-foreground break-words">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery note */}
                {(order.deliveryNote ?? order.notes) && (
                  <div className="flex items-start gap-2 text-sm mb-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                    <FileText
                      size={14}
                      className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mb-0.5 uppercase tracking-wide">
                        Delivery Note
                      </p>
                      <p className="text-foreground break-words">
                        {order.deliveryNote ?? order.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment info row */}
                <div className="flex items-center gap-3 flex-wrap text-sm mb-3">
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={13} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      Payment:
                    </span>
                    <PaymentBadge method={order.paymentMethod} />
                  </div>
                  {order.paymentMethod === "stripe" &&
                    order.stripePaymentStatus && (
                      <StripeStatusBadge status={order.stripePaymentStatus} />
                    )}
                </div>

                {/* Customer name */}
                {order.customerName && (
                  <p className="text-xs text-muted-foreground">
                    Ordered by{" "}
                    <span className="text-foreground font-medium">
                      {order.customerName}
                    </span>
                    {order.customerPhone && <> · {order.customerPhone}</>}
                  </p>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((k) => (
        <div
          key={k}
          className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-warm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function MyOrdersPage() {
  const { isLoggedIn } = useAuth();
  const { data: orders, isLoading } = useGetMyOrders();
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Not logged in — prompt to sign in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div
          className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6"
          data-ocid="my_orders.empty_state"
        >
          {/* Decorative bakery icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center shadow-elevated">
              <Package size={32} className="text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <ChevronUp size={12} className="text-foreground" />
            </div>
          </div>

          <div className="max-w-sm">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Sign in to view your orders
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Log in to your Pretty Baked account to see your full order
              history, track deliveries, and revisit your favourite treats.
            </p>
          </div>

          <Button
            onClick={() => setAuthOpen(true)}
            data-ocid="my_orders.login_button"
            className="px-8"
            size="lg"
          >
            Login to My Account
          </Button>

          <p className="text-xs text-muted-foreground">
            New to Pretty Baked?{" "}
            <Link
              to="/shop"
              className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors"
              data-ocid="my_orders.browse_link"
            >
              Browse our menu first
            </Link>
          </p>
        </div>

        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultTab="login"
        />
      </div>
    );
  }

  const sortedOrders = (orders ?? [])
    .slice()
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const filteredOrders = searchQuery.trim()
    ? sortedOrders.filter((o) => {
        const query = searchQuery.trim().toLowerCase();
        // Match against orderId (ORD-XXXXXX) or fallback short id
        const idToSearch = o.orderId
          ? o.orderId.toLowerCase()
          : o.id.slice(-8).toLowerCase();
        return idToSearch.includes(query);
      })
    : sortedOrders;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header band */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3" data-ocid="my_orders.page">
            <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center shadow-warm shrink-0">
              <ShoppingBag size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                My Orders
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                All your purchases from Pretty Baked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <OrdersSkeleton />
        ) : !orders || orders.length === 0 ? (
          /* Empty state — no orders at all */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16 flex flex-col items-center gap-5"
            data-ocid="my_orders.empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag size={32} className="text-muted-foreground" />
            </div>
            <div className="max-w-xs">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                No orders yet
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You haven't placed any orders yet. Browse our shop and discover
                something delicious!
              </p>
            </div>
            <Link to="/shop" data-ocid="my_orders.shop_link">
              <Button
                size="lg"
                className="px-8"
                data-ocid="my_orders.shop_button"
              >
                Browse Our Menu
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Orders list */
          <div className="space-y-4" data-ocid="my_orders.list">
            {/* Search bar */}
            <div className="relative mb-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="text"
                placeholder="Search by order ID (e.g. ORD-7X3K9M)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-ocid="my_orders.search_input"
                className="pl-9 bg-card border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  data-ocid="my_orders.search_clear_button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle size={15} />
                </button>
              )}
            </div>

            {/* Summary chip */}
            <p className="text-sm text-muted-foreground font-medium">
              {searchQuery.trim()
                ? `${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"} matching "${searchQuery.trim()}"`
                : `${orders.length} ${orders.length === 1 ? "order" : "orders"} placed`}
            </p>

            {filteredOrders.length === 0 ? (
              /* No search matches */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-14 flex flex-col items-center gap-4"
                data-ocid="my_orders.search_empty_state"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <div className="max-w-xs">
                  <h2 className="font-display text-lg font-bold text-foreground mb-1.5">
                    No orders found
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No orders match "{searchQuery.trim()}". Try a different
                    order ID or clear the search.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  data-ocid="my_orders.search_clear_results_button"
                >
                  Clear Search
                </Button>
              </motion.div>
            ) : (
              filteredOrders.map((order, idx) => (
                <OrderCard key={order.id} order={order} index={idx} />
              ))
            )}

            {/* Bottom CTA — only show when not filtering */}
            {!searchQuery.trim() && (
              <div className="pt-4 text-center">
                <Link to="/shop" data-ocid="my_orders.order_more_link">
                  <Button
                    variant="outline"
                    data-ocid="my_orders.order_more_button"
                  >
                    Order something new
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

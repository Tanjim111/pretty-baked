import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertTriangle,
  BarChart2,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Tag,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useClaimAdmin,
  useIsAdmin,
  useStoreInitData,
} from "../../hooks/useBackend";

const STAT_COLORS = [
  "bg-primary/10 text-primary",
  "bg-muted text-foreground",
  "bg-primary/5 text-primary",
  "bg-destructive/10 text-destructive",
];

function ClaimAdminGate() {
  const claimMutation = useClaimAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await claimMutation.mutateAsync({ email, password });
      toast.success("Admin access granted! Welcome to Pretty Baked Admin.");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        <Card className="bg-card border-border shadow-elevated p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck size={26} className="text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Admin Login
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your admin credentials to access the dashboard.
            </p>
          </div>
          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-sm font-medium">
                Admin Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="mt-1"
                required
                autoComplete="email"
                data-ocid="admin.dashboard.claim_email_input"
              />
            </div>
            <div>
              <Label htmlFor="admin-pw" className="text-sm font-medium">
                Admin Password
              </Label>
              <Input
                id="admin-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
                required
                autoComplete="current-password"
                data-ocid="admin.dashboard.claim_password_input"
              />
            </div>
            {error && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="admin.dashboard.claim_error_state"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={claimMutation.isPending}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth"
              data-ocid="admin.dashboard.claim_button"
            >
              <UserCheck size={15} />
              {claimMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    data: initData,
    isLoading: initLoading,
    isFetching,
    isError: initError,
    failureCount,
    refetch: retryInit,
  } = useStoreInitData();
  const products = initData?.products ?? [];
  const categories = initData?.categories ?? [];
  const orders = initData?.recentOrders ?? [];
  const lowStockProducts = initData?.lowStockProducts ?? [];

  // Show loading skeletons only when we have no data at all yet
  const dataLoading = initLoading && !initData;
  // Show a subtle reconnecting badge when retrying but already have stale data
  // Stop reconnecting badge after 3 failures — just show error/refresh
  const isReconnecting = isFetching && failureCount > 0 && failureCount <= 3;
  // Hard error: failed 3+ times and no data
  const hardError = initError && !initData && failureCount >= 3;

  if (adminLoading) {
    return (
      <div className="space-y-4" data-ocid="admin.dashboard.loading_state">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) return <ClaimAdminGate />;

  // Revenue: show spinner when orders haven't loaded yet (avoid showing ৳0)
  const revenueLoaded = !dataLoading && initData !== undefined;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Use "--" for stats when there's a connection error and no cached data
  const statVal = (v: number | string | null) => {
    if (hardError && !initData) return "--";
    return v;
  };

  const stats = [
    {
      label: "Total Products",
      value: dataLoading ? null : statVal(products.length),
      icon: Package,
      sub:
        hardError && !initData
          ? "Connection issue"
          : dataLoading
            ? "Loading…"
            : `${products.filter((p) => p.isFeatured).length} featured`,
    },
    {
      label: "Categories",
      value: dataLoading ? null : statVal(categories.length),
      icon: Tag,
      sub:
        hardError && !initData
          ? "Connection issue"
          : dataLoading
            ? "Loading…"
            : "Active groups",
    },
    {
      label: "Total Orders",
      value: dataLoading ? null : statVal(orders.length),
      icon: ShoppingBag,
      sub:
        hardError && !initData
          ? "Connection issue"
          : dataLoading
            ? "Loading…"
            : `${orders.filter((o) => o.status === "pending").length} pending`,
    },
    {
      label: "Revenue (BDT)",
      value:
        hardError && !initData
          ? "--"
          : !revenueLoaded
            ? null
            : `৳${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      sub: hardError && !initData ? "Connection issue" : "All time",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/products/new",
      label: "Add Product",
      icon: Plus,
      desc: "List a new item",
    },
    {
      href: "/admin/categories",
      label: "Manage Categories",
      icon: Tag,
      desc: "Organize your catalog",
    },
    {
      href: "/admin/orders",
      label: "View Orders",
      icon: ShoppingBag,
      desc: "Track customer orders",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart2,
      desc: "Revenue & insights",
    },
  ];

  return (
    <div className="space-y-8" data-ocid="admin.dashboard.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back to Pretty Baked Admin
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Subtle reconnecting badge — only shown during first 3 retries */}
          {isReconnecting && (
            <Badge
              variant="secondary"
              className="gap-1.5 text-xs text-muted-foreground"
              data-ocid="admin.dashboard.reconnecting_state"
            >
              <Loader2 size={11} className="animate-spin" />
              Reconnecting…
            </Badge>
          )}
          {/* Prominent Refresh button shown when error/timeout occurs */}
          {(hardError || (initError && !isReconnecting)) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => retryInit()}
              className="gap-1.5 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              data-ocid="admin.dashboard.retry_button"
            >
              <RefreshCw size={13} />
              Refresh Data
            </Button>
          )}
          <a
            href="/admin/products/new"
            data-ocid="admin.dashboard.add_product_button"
          >
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth">
              <Plus size={15} /> Add Product
            </Button>
          </a>
        </div>
      </div>

      {/* Soft warning strip — shown when backend fails after 3 retries */}
      {hardError && (
        <div
          className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm"
          data-ocid="admin.dashboard.error_state"
        >
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <span className="text-foreground/80">
            Some data is temporarily unavailable. Click{" "}
            <strong>Refresh Data</strong> above to retry.
          </span>
        </div>
      )}
      {/* Light warning when retrying (but not full error yet) */}
      {initError && !hardError && !initData && isReconnecting && (
        <div
          className="flex items-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3 text-sm"
          data-ocid="admin.dashboard.reconnecting_warning_state"
        >
          <Loader2 size={13} className="text-amber-500 shrink-0 animate-spin" />
          <span className="text-foreground/70">
            Connecting to backend… Dashboard will update automatically.
          </span>
        </div>
      )}

      {/* Stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        data-ocid="admin.dashboard.stats_panel"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              data-ocid={`admin.dashboard.stat_card.${i + 1}`}
            >
              <Card className="bg-card border-border shadow-warm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${STAT_COLORS[i]}`}
                    >
                      <Icon size={17} />
                    </div>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stat.value === null ? (
                      <Skeleton className="h-7 w-12 inline-block" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <a
                href={link.href}
                data-ocid={`admin.dashboard.quick_link.${i + 1}`}
              >
                <Card className="p-4 bg-card border-border shadow-warm hover-lift cursor-pointer group transition-smooth hover:border-primary/30">
                  <CardContent className="p-0 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-smooth">
                        {link.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {link.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card
          className="bg-card border-border shadow-warm"
          data-ocid="admin.dashboard.products_panel"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-display text-base font-bold text-foreground">
              Recent Products
            </CardTitle>
            <a
              href="/admin/products"
              data-ocid="admin.dashboard.view_all_products_link"
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs hover:text-primary transition-smooth"
              >
                <Eye size={13} /> View All
              </Button>
            </a>
          </CardHeader>
          <CardContent className="space-y-2">
            {dataLoading ? (
              [1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              ))
            ) : hardError && !initData ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="admin.dashboard.products_error_state"
              >
                <RefreshCw size={20} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  Failed to load — click <strong>Refresh Data</strong>
                </p>
              </div>
            ) : (
              products.slice(0, 5).map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-smooth"
                  data-ocid={`admin.dashboard.product_row.${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/images/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ৳{product.price.toLocaleString()} · Stock: {product.stock}
                    </p>
                  </div>
                  <Badge
                    variant={product.isAvailable ? "default" : "secondary"}
                    className="text-xs flex-shrink-0"
                  >
                    {product.isAvailable ? "Active" : "Off"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          className="bg-card border-border shadow-warm"
          data-ocid="admin.dashboard.low_stock_panel"
        >
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              Stock Alerts
              {lowStockProducts.length > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {lowStockProducts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 && !hardError ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="admin.dashboard.no_alerts_state"
              >
                <p className="text-2xl mb-2">✅</p>
                <p className="text-sm">All products are well-stocked!</p>
              </div>
            ) : hardError && !initData ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="admin.dashboard.alerts_error_state"
              >
                <RefreshCw size={20} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  Failed to load — click <strong>Refresh Data</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product, i) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20"
                    data-ocid={`admin.dashboard.alert_row.${i + 1}`}
                  >
                    <AlertTriangle
                      size={15}
                      className="text-destructive flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-destructive">
                        Only <span className="font-bold">{product.stock}</span>{" "}
                        unit{product.stock !== 1 ? "s" : ""} left
                      </p>
                    </div>
                    <a href={`/admin/products/${product.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 hover:text-primary transition-smooth"
                        data-ocid={`admin.dashboard.alert_edit_button.${i + 1}`}
                      >
                        Edit
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

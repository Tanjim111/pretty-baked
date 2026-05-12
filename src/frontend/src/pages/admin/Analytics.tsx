import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetOrdersByDateRange, useOrders } from "../../hooks/useBackend";
import type { Order } from "../../types";

// ── Date range helpers ──────────────────────────────────────────────────────

type RangeTab = "today" | "week" | "month" | "custom";

function getRangeDates(
  tab: RangeTab,
  customStart: string,
  customEnd: string,
): { start: number; end: number } {
  const now = Date.now();
  const startOfDay = (ts: number) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  switch (tab) {
    case "today":
      return { start: startOfDay(now), end: now };
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return { start: d.getTime(), end: now };
    }
    case "month": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      return { start: d.getTime(), end: now };
    }
    case "custom": {
      const start = customStart
        ? new Date(customStart).setHours(0, 0, 0, 0)
        : startOfDay(now);
      const end = customEnd
        ? new Date(customEnd).setHours(23, 59, 59, 999)
        : now;
      return { start, end };
    }
  }
}

// ── Derived helpers ────────────────────────────────────────────────────────

function formatBDT(amount: number) {
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function computeRevenueTrend(orders: Order[], tab: RangeTab) {
  const map: Record<string, number> = {};
  for (const o of orders) {
    const date = new Date(o.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    map[key] = (map[key] ?? 0) + o.total;
  }
  const limit = tab === "today" ? 24 : tab === "week" ? 7 : 30;
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([date, revenue]) => ({ date: date.slice(5), revenue }));
}

function computeTopProducts(orders: Order[]) {
  const map: Record<string, { name: string; revenue: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      if (!map[item.productId])
        map[item.productId] = { name: item.name, revenue: 0 };
      map[item.productId].revenue += item.price * item.quantity;
    }
  }
  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function computePaymentBreakdown(orders: Order[]) {
  const stripe = orders.filter((o) => o.paymentMethod === "stripe").length;
  const cod = orders.filter((o) => o.paymentMethod === "cod").length;
  const total = orders.length;
  return [
    {
      name: "Stripe",
      count: stripe,
      pct: total ? Math.round((stripe / total) * 100) : 0,
      fill: "oklch(0.65 0.22 38)",
    },
    {
      name: "Cash on Delivery",
      count: cod,
      pct: total ? Math.round((cod / total) * 100) : 0,
      fill: "oklch(0.78 0.16 38)",
    },
  ];
}

// ── Custom tooltips ─────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

function RevenueTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-primary">{formatBDT(payload[0].value)}</p>
    </div>
  );
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0] as {
    value: number;
    name: string;
    payload: { pct: number };
  };
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-elevated text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="text-muted-foreground">
        {d.value} orders ({d.payload.pct}%)
      </p>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  index: number;
}

function StatCard({ label, value, sub, colorClass, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className="bg-card border-border shadow-warm">
        <CardContent className="p-5">
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colorClass}`}
          >
            {label}
          </p>
          <p className="font-display text-2xl font-bold text-foreground">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────

interface TabBtnProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ocid: string;
}

function TabBtn({ active, onClick, children, ocid }: TabBtnProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`text-xs font-medium transition-smooth ${
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      data-ocid={ocid}
    >
      {children}
    </Button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { data: allOrders = [], isLoading: allLoading } = useOrders();

  const [activeTab, setActiveTab] = useState<RangeTab>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getRangeDates(activeTab, customStart, customEnd);
  const { data: filteredOrders, isLoading: filteredLoading } =
    useGetOrdersByDateRange(start, end);

  // Use filtered orders when available; fall back to all orders for "month" (initial load)
  const orders = filteredOrders ?? allOrders;

  if (allLoading) {
    return (
      <div className="space-y-6" data-ocid="admin.analytics.loading_state">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length
    ? Math.round(totalRevenue / orders.length)
    : 0;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const revenueTrend = computeRevenueTrend(orders, activeTab);
  const topProducts = computeTopProducts(orders);
  const paymentBreakdown = computePaymentBreakdown(orders);

  const stats = [
    {
      label: "Total Revenue",
      value: formatBDT(totalRevenue),
      sub: "Filtered period",
      colorClass: "text-primary",
    },
    {
      label: "Total Orders",
      value: orders.length.toString(),
      sub: `${pendingCount} pending`,
      colorClass: "text-primary",
    },
    {
      label: "Avg Order Value",
      value: formatBDT(avgOrderValue),
      sub: "Per order",
      colorClass: "text-muted-foreground",
    },
    {
      label: "Pending Orders",
      value: pendingCount.toString(),
      sub: "Awaiting action",
      colorClass: "text-destructive",
    },
  ];

  const hasOrders = orders.length > 0;

  const tabLabel: Record<RangeTab, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    custom: "Custom Range",
  };

  return (
    <div className="space-y-8" data-ocid="admin.analytics.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Analytics
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Revenue insights and order performance for Pretty Baked
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border border-border">
          {(["today", "week", "month", "custom"] as RangeTab[]).map((tab) => (
            <TabBtn
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              ocid={`admin.analytics.filter_${tab}_tab`}
            >
              {tabLabel[tab]}
            </TabBtn>
          ))}
        </div>
      </div>

      {/* Custom range inputs */}
      {activeTab === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border"
          data-ocid="admin.analytics.custom_range_panel"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">From</span>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-36 text-sm"
              data-ocid="admin.analytics.custom_start_input"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">To</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-36 text-sm"
              data-ocid="admin.analytics.custom_end_input"
            />
          </div>
        </motion.div>
      )}

      {/* Loading overlay for filter change */}
      {filteredLoading && !allLoading && (
        <div
          className="text-sm text-muted-foreground flex items-center gap-2"
          data-ocid="admin.analytics.filter_loading_state"
        >
          <span className="w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
          Loading {tabLabel[activeTab].toLowerCase()} data...
        </div>
      )}

      {/* Summary Stats */}
      <div
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
        data-ocid="admin.analytics.stats_panel"
      >
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            colorClass={stat.colorClass}
            index={i}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="bg-card border-border shadow-warm"
            data-ocid="admin.analytics.revenue_trend_panel"
          >
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold text-foreground">
                Revenue Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {tabLabel[activeTab]} — BDT
              </p>
            </CardHeader>
            <CardContent>
              {!hasOrders || revenueTrend.length === 0 ? (
                <div
                  className="h-52 flex flex-col items-center justify-center text-muted-foreground"
                  data-ocid="admin.analytics.trend_empty_state"
                >
                  <p className="text-3xl mb-3">📊</p>
                  <p className="text-sm font-medium">
                    No orders in this period
                  </p>
                  <p className="text-xs mt-1">Try a different date range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart
                    data={revenueTrend}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(156, 163, 175, 0.3)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 10,
                        fill: "rgba(107, 114, 128, 0.8)",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "rgba(107, 114, 128, 0.8)",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `৳${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`
                      }
                      width={48}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Bar
                      dataKey="revenue"
                      fill="oklch(0.65 0.22 38)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card
            className="bg-card border-border shadow-warm h-full"
            data-ocid="admin.analytics.payment_breakdown_panel"
          >
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-bold text-foreground">
                Payment Methods
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {orders.length} total orders
              </p>
            </CardHeader>
            <CardContent>
              {!hasOrders ? (
                <div
                  className="h-40 flex flex-col items-center justify-center text-muted-foreground"
                  data-ocid="admin.analytics.payment_empty_state"
                >
                  <p className="text-3xl mb-2">💳</p>
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={paymentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={64}
                        dataKey="count"
                        paddingAngle={3}
                      >
                        {paymentBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {paymentBreakdown.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: item.fill }}
                          />
                          <span className="text-foreground/80 text-xs">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {item.count}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4"
                          >
                            {item.pct}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card
          className="bg-card border-border shadow-warm"
          data-ocid="admin.analytics.top_products_panel"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold text-foreground">
              Top 5 Products by Revenue
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Based on {tabLabel[activeTab].toLowerCase()} order items
            </p>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div
                className="py-10 flex flex-col items-center justify-center text-muted-foreground"
                data-ocid="admin.analytics.top_products_empty_state"
              >
                <p className="text-3xl mb-3">🏆</p>
                <p className="text-sm font-medium">
                  No product revenue in this period
                </p>
                <p className="text-xs mt-1">Try selecting a wider date range</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => {
                  const maxRevenue = topProducts[0].revenue;
                  const pct =
                    maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div
                      key={product.name}
                      className="flex items-center gap-4"
                      data-ocid={`admin.analytics.top_product.${i + 1}`}
                    >
                      <span className="w-5 text-xs font-bold text-muted-foreground text-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <span className="text-sm font-bold text-primary ml-3 flex-shrink-0">
                            {formatBDT(product.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              delay: 0.5 + i * 0.1,
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

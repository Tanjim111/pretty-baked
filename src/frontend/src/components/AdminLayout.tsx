import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart2,
  ChevronRight,
  FileEdit,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  ShoppingBag,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/coupons", label: "Coupon Codes", icon: Ticket },
  { href: "/admin/promo", label: "Promo Bar", icon: Megaphone },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/site-content", label: "Site Content", icon: FileEdit },
];

const ADMIN_LS_KEY = "pretty-baked-admin-claimed";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  // Admin panel is ALWAYS in dark mode — force it on every mount
  useEffect(() => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    localStorage.setItem(
      "pretty-baked-theme",
      JSON.stringify({ state: { theme: "dark" }, version: 0 }),
    );
  }, []);

  const isAdminClaimed = !!localStorage.getItem(ADMIN_LS_KEY);

  function handleAdminLogout() {
    localStorage.removeItem(ADMIN_LS_KEY);
    window.location.reload();
  }

  function isActive(href: string, end?: boolean) {
    if (end) return currentPath === href;
    return currentPath.startsWith(href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-border">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="admin.home_logo_link"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">
              B
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-primary text-base leading-none">
              Pretty Baked
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1" data-ocid="admin.sidebar_nav">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.end);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              data-ocid={`admin.nav_${item.label.toLowerCase()}_link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                active
                  ? "bg-primary text-primary-foreground shadow-warm"
                  : "text-foreground/70 hover:bg-primary/10 hover:text-primary",
              )}
            >
              <Icon
                size={17}
                className={cn(
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span>{item.label}</span>
              {active && (
                <ChevronRight size={14} className="ml-auto opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer actions */}
      <div className="p-3 space-y-2">
        <Link to="/" data-ocid="admin.back_to_store_link">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-smooth"
          >
            <Home size={14} /> Back to Store
          </Button>
        </Link>
        {isAdminClaimed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdminLogout}
            data-ocid="admin.logout_button"
            className="w-full gap-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
          >
            <LogOut size={14} /> Logout
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex w-56 flex-col bg-card border-r border-border shadow-warm flex-shrink-0"
        data-ocid="admin.sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
          />
          <aside className="relative w-56 flex flex-col bg-card border-r border-border shadow-elevated z-50 animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-40 bg-card border-b border-border shadow-warm h-14 flex items-center px-4 gap-3"
          data-ocid="admin.topbar"
        >
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            data-ocid="admin.mobile_sidebar_button"
          >
            <Menu size={18} />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">
              {ADMIN_NAV.find((n) => isActive(n.href, n.end))?.label ?? "Admin"}
            </h1>
          </div>
          <Badge variant="secondary" className="text-xs hidden sm:flex">
            Admin
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </Button>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 p-4 sm:p-6 bg-background overflow-x-hidden"
          data-ocid="admin.content"
        >
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

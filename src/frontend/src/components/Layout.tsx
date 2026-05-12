import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  useGetMyProfile,
  useGetPromoAnnouncement,
  useGetSiteContent,
} from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";
import {
  applyTheme,
  loadUserTheme,
  saveUserTheme,
  useThemeStore,
} from "../store/themeStore";
import { AuthModal } from "./AuthModal";
import { BakeyChat } from "./BakeyChat";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

// ── Billboard Title Bar — rendered ABOVE the sticky header ──────────────────

function BillboardTitleBar() {
  const { data: promo } = useGetPromoAnnouncement();

  if (!promo?.isActive) return null;

  // Title and message are 100% independent UI elements.
  // Title bar: ONLY rendered when title is non-empty, NEVER shows message.
  // Message bar: ONLY rendered when message is non-empty, NEVER shows title.
  // These two bars are completely separate — one's content never bleeds into the other.

  const titleText = promo.title?.trim() ?? "";
  const messageText = promo.message?.trim() ?? "";

  const hasTitle = titleText.length > 0;
  const hasMessage = messageText.length > 0;

  if (!hasTitle && !hasMessage) return null;

  return (
    <>
      {/* Title bar — ONLY rendered when title is non-empty; NEVER shows message */}
      {hasTitle && (
        <div
          className="relative bg-primary text-primary-foreground py-2 overflow-hidden w-full"
          data-ocid="promo.title_bar"
        >
          <div className="w-full overflow-hidden">
            <span className="animate-marquee font-semibold text-sm w-full inline-block">
              {titleText}
            </span>
          </div>
        </div>
      )}
      {/* Message bar — ONLY rendered when message is non-empty; NEVER shows title */}
      {hasMessage && (
        <div
          className="bg-primary/10 text-primary border-b border-primary/20 py-1.5 overflow-hidden w-full"
          data-ocid="promo.message_bar"
        >
          <span className="animate-marquee font-medium text-sm inline-block">
            {messageText}
          </span>
        </div>
      )}
    </>
  );
}

// ── Billboard Image Slideshow — rendered BELOW the sticky header ─────────────

function BillboardImageSlideshow() {
  const { data: promo } = useGetPromoAnnouncement();
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve the images array: prefer offerImages[], fall back to offerImageUrl
  const images: string[] = (() => {
    if (!promo) return [];
    if (promo.offerImages && promo.offerImages.length > 0) {
      return promo.offerImages.filter(Boolean);
    }
    if (promo.offerImageUrl) return [promo.offerImageUrl];
    return [];
  })();

  const hasImages = images.length > 0;
  const multiSlide = images.length > 1;

  // Auto-advance every 4 seconds when multiple images exist
  useEffect(() => {
    if (!multiSlide) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [multiSlide, images.length]);

  function goTo(idx: number) {
    setActiveIdx(idx);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      if (multiSlide) {
        timerRef.current = setInterval(() => {
          setActiveIdx((prev) => (prev + 1) % images.length);
        }, 4000);
      }
    }
  }

  // Only show when promo is active AND there are images
  if (!promo?.isActive || !hasImages) return null;

  return (
    <div className="w-full overflow-hidden" data-ocid="promo.billboard">
      <div className="px-3 sm:px-6 mt-1 mb-0">
        <div className="relative overflow-hidden rounded-2xl">
          {images.map((src, i) => (
            <div
              key={src}
              className={cn(
                "transition-opacity duration-700 ease-in-out",
                i === activeIdx
                  ? "opacity-100 relative"
                  : "opacity-0 absolute inset-0",
              )}
              aria-hidden={i !== activeIdx}
            >
              <img
                src={src}
                alt={
                  i === 0
                    ? (promo.title ?? "Promotional offer")
                    : `Promotional photo ${i + 1}`
                }
                loading="lazy"
                className="w-full object-cover max-h-[200px] sm:max-h-[220px] md:max-h-[260px] lg:max-h-[300px] rounded-2xl block"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}

          {/* Prev / Next arrows */}
          {multiSlide && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() =>
                  goTo((activeIdx - 1 + images.length) % images.length)
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-smooth z-10"
                data-ocid="promo.prev_button"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo((activeIdx + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-smooth z-10"
                data-ocid="promo.next_button"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {multiSlide && (
          <div className="flex justify-center gap-1.5 mt-1 mb-0">
            {images.map((src, i) => (
              <button
                key={`dot-${src}`}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === activeIdx
                    ? "bg-primary w-5 h-2"
                    : "bg-muted-foreground/40 w-2 h-2 hover:bg-muted-foreground/60",
                )}
                data-ocid={`promo.dot_button.${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ScrollToTop — runs on every route change ────────────────────────────────

function ScrollToTop() {
  const router = useRouter();

  useEffect(
    () =>
      router.subscribe("onResolved", () => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }),
    [router],
  );

  return null;
}
// ── PageVisibilityRefresh — reloads page once per session when user returns ──

function PageVisibilityRefresh() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const SESSION_KEY = "pretty-baked-visibility-refreshed";
    const alreadyRefreshed = sessionStorage.getItem(SESSION_KEY) === "1";
    sessionStorage.setItem("pretty-baked-page-loaded", "1");

    function handleVisibilityChange() {
      if (!document.hidden) {
        const pageWasLoaded =
          sessionStorage.getItem("pretty-baked-page-loaded") === "1";
        const refreshed = sessionStorage.getItem(SESSION_KEY) === "1";
        if (pageWasLoaded && !refreshed) {
          sessionStorage.setItem(SESSION_KEY, "1");
          window.location.reload();
          return;
        }
        // On every tab return (after the first reload), aggressively invalidate
        // critical queries so fresh data is fetched immediately without a full reload.
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        queryClient.invalidateQueries({ queryKey: ["storeInitData"] });
        queryClient.invalidateQueries({ queryKey: ["promoAnnouncement"] });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!alreadyRefreshed) {
      // already registered above, the first return will fire reload
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient]);

  return null;
}

// ── Main Layout ──────────────────────────────────────────────────────────────

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [whatsappVisible, setWhatsappVisible] = useState(true);
  const { isLoggedIn, name, email, logout } = useAuth();
  const itemCount = useCartStore((s) => s.itemCount());
  const router = useRouter();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const { data: profile } = useGetMyProfile();
  const { data: siteContent } = useGetSiteContent();

  const siteName = siteContent?.siteName || "Pretty Baked";
  const logoSrc = siteContent?.logoImageUrl || "/assets/logo.jpg";

  const showMyOrders = isLoggedIn;
  const currentPath = router.state.location.pathname;

  // When a user logs in, load their saved theme preference from a user-scoped
  // localStorage key ("pretty-baked-user-theme-{email}") and apply it.
  // This ensures User A and User B each have their own independent theme even
  // on the same browser — switching accounts changes the theme immediately.
  const appliedThemeForEmail = useRef<string | null>(null);
  useEffect(() => {
    if (!isLoggedIn || !email) return;
    // Only apply once per login session for this email
    if (appliedThemeForEmail.current === email) return;
    appliedThemeForEmail.current = email;

    const savedTheme = loadUserTheme(email);
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
      applyTheme(savedTheme, null);
    }
  }, [isLoggedIn, email, theme, setTheme]);

  // Reset ref on logout so the next login loads the theme fresh
  useEffect(() => {
    if (!isLoggedIn) {
      appliedThemeForEmail.current = null;
    }
  }, [isLoggedIn]);

  // Per-user theme toggle: toggle theme and persist to user-scoped localStorage.
  // Guest users continue to use the shared global localStorage key.
  function handleThemeToggle() {
    const newTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    if (isLoggedIn && email) {
      saveUserTheme(email, newTheme);
    }
  }

  function openLogin() {
    setAuthTab("login");
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthTab("register");
    setAuthOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background w-full overflow-x-hidden">
      <ScrollToTop />
      <PageVisibilityRefresh />

      {/* Billboard Title Bar — ABOVE the sticky header */}
      <BillboardTitleBar />

      {/* Header — sticky navbar */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-warm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              data-ocid="nav.logo_link"
            >
              <img
                src={logoSrc}
                alt={`${siteName} Logo`}
                className="h-11 w-11 object-contain rounded-full"
              />
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold text-primary tracking-tight">
                  {siteName}
                </span>
                <span className="text-xs text-muted-foreground tracking-widest uppercase">
                  Artisan Bakery
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              data-ocid="nav.desktop_nav"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-smooth hover:bg-primary/10 hover:text-primary",
                    currentPath === link.href
                      ? "text-primary bg-primary/8"
                      : "text-foreground/80",
                  )}
                  data-ocid={`nav.${link.label.toLowerCase()}_link`}
                >
                  {link.label}
                </Link>
              ))}
              {showMyOrders && (
                <>
                  <Link
                    to="/profile"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-smooth hover:bg-primary/10 hover:text-primary flex items-center gap-1.5",
                      currentPath === "/profile"
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80",
                    )}
                    data-ocid="nav.profile_link"
                  >
                    <UserCircle size={14} />
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-smooth hover:bg-primary/10 hover:text-primary flex items-center gap-1.5",
                      currentPath === "/my-orders"
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80",
                    )}
                    data-ocid="nav.my_orders_link"
                  >
                    <Package size={14} />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-smooth hover:bg-primary/10 hover:text-primary flex items-center gap-1.5",
                      currentPath === "/wishlist"
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80",
                    )}
                    data-ocid="nav.wishlist_link"
                  >
                    <Heart size={14} />
                    Wishlist
                  </Link>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={handleThemeToggle}
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                data-ocid="nav.theme_toggle"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-primary/10 transition-smooth"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Cart */}
              <Link to="/cart" data-ocid="nav.cart_button">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative gap-2 hover:bg-primary/10 hover:text-primary transition-smooth"
                >
                  <ShoppingCart size={18} />
                  <span className="hidden sm:inline text-sm">Cart</span>
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full animate-fade-in">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Auth — desktop */}
              {isLoggedIn ? (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-foreground/80 max-w-[160px]">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={name ?? "Avatar"}
                        className="w-7 h-7 rounded-full object-cover border border-primary/30 shrink-0"
                      />
                    ) : (
                      <User size={14} className="text-primary shrink-0" />
                    )}
                    <span className="truncate" title={name ?? email ?? ""}>
                      {name ?? email}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    data-ocid="nav.logout_button"
                    className="gap-1.5 border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-smooth"
                  >
                    <LogOut size={15} />
                    <span className="text-sm">Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openLogin}
                  data-ocid="nav.auth_button"
                  className="hidden md:flex gap-1.5 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <LogIn size={15} />
                  <span className="text-sm">Login</span>
                </Button>
              )}

              {/* Mobile toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                data-ocid="nav.mobile_menu_button"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t border-border bg-card animate-slide-up"
            data-ocid="nav.mobile_menu"
          >
            <div className="container px-4 sm:px-6 py-4 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-smooth text-foreground"
                  onClick={() => setMobileOpen(false)}
                  data-ocid={`nav.mobile_${link.label.toLowerCase()}_link`}
                >
                  {link.label}
                </Link>
              ))}
              {showMyOrders && (
                <>
                  <Link
                    to="/profile"
                    className="px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-smooth flex items-center gap-2 text-foreground"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.mobile_profile_link"
                  >
                    <UserCircle size={15} />
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className="px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-smooth flex items-center gap-2 text-foreground"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.mobile_my_orders_link"
                  >
                    <Package size={15} />
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-smooth flex items-center gap-2 text-foreground"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.mobile_wishlist_link"
                  >
                    <Heart size={15} />
                    Wishlist
                  </Link>
                </>
              )}
              <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
                {/* Mobile Dark Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    handleThemeToggle();
                    setMobileOpen(false);
                  }}
                  data-ocid="nav.mobile_theme_toggle"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-smooth text-left text-foreground"
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>

                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={name ?? "Avatar"}
                          className="w-6 h-6 rounded-full object-cover border border-primary/30 shrink-0"
                        />
                      ) : (
                        <User size={14} className="text-primary shrink-0" />
                      )}
                      <span className="truncate">{name ?? email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive"
                      data-ocid="nav.mobile_logout_button"
                    >
                      <LogOut size={15} /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        openLogin();
                        setMobileOpen(false);
                      }}
                      className="w-full gap-2"
                      data-ocid="nav.mobile_login_button"
                    >
                      <LogIn size={15} /> Login
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        openRegister();
                        setMobileOpen(false);
                      }}
                      className="w-full gap-2"
                      data-ocid="nav.mobile_register_button"
                    >
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Billboard Image Slideshow — BELOW the sticky header */}
      <BillboardImageSlideshow />

      {/* Main */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Footer */}
      <footer
        className="bg-primary text-primary-foreground mt-auto"
        data-ocid="footer"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src={logoSrc}
                  alt={`${siteName} Logo`}
                  className="h-9 w-9 object-contain rounded-full"
                />
                <span className="font-display text-2xl font-bold text-primary-foreground">
                  {siteName}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {["Facebook", "Instagram", "YouTube"].map((social) => (
                  <a
                    key={social}
                    href={`https://${social.toLowerCase()}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-primary-foreground/15 flex items-center justify-center hover:bg-primary-foreground/30 transition-smooth text-xs font-medium"
                    aria-label={social}
                  >
                    <span className="sr-only">{social}</span>
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {social === "Facebook" && (
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      )}
                      {social === "Instagram" && (
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      )}
                      {social === "YouTube" && (
                        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4 text-primary-foreground/90">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                {[
                  { href: "/shop", label: "Shop" },
                  { href: "/#about", label: "About Us" },
                  { href: "/#contact", label: "Contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="hover:text-primary-foreground transition-smooth"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4 text-primary-foreground/90">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  📍{" "}
                  {siteContent?.contactAddress || "123 Baker Street, Dhaka, BD"}
                </li>
                <li>📞 {siteContent?.contactPhone || "+880 1700-000000"}</li>
                <li>
                  ✉️ {siteContent?.contactEmail || "hello@prettybaked.com"}
                </li>
                <li>🕐 {siteContent?.contactHours || "Mon–Sat: 8am – 9pm"}</li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
            <span>© 2026 Dark.pkg . All rights reserved.</span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-foreground/90 transition-smooth"
            >
              Built with love using caffeine.ai by Tanjim Tazwor
            </a>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" richColors />
      <BakeyChat />

      {/* Floating WhatsApp Button */}
      {whatsappVisible && (
        <div
          className="fixed bottom-24 right-4 z-50 group"
          style={{ animation: "float-bounce 3s ease-in-out infinite" }}
          data-ocid="whatsapp.float_button"
        >
          {/* X close button — top-right corner */}
          <button
            type="button"
            aria-label="Close WhatsApp button"
            onClick={() => setWhatsappVisible(false)}
            data-ocid="whatsapp.close_button"
            className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-sm transition-smooth"
            style={{ backgroundColor: "#25D366" }}
          >
            <X size={11} />
          </button>
          <a
            href="https://wa.me/8801701965947?text=Hello%20Pretty%20Baked,%20I'd%20like%20to%20place%20an%20order!"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            <div
              className="flex items-center gap-2 rounded-full shadow-elevated text-white font-semibold text-sm pl-3 pr-4 py-3 transition-all duration-300 group-hover:pl-4 group-hover:shadow-lg"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="currentColor"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap">
                Chat on WhatsApp
              </span>
            </div>
          </a>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
}

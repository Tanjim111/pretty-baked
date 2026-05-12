import { Skeleton } from "@/components/ui/skeleton";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { AdminLayout } from "./components/AdminLayout";
import { Layout } from "./components/Layout";

// Lazy-load public pages
const HomePage = lazy(() => import("./pages/Home"));
const ShopPage = lazy(() => import("./pages/Shop"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/Cart"));
const MyOrdersPage = lazy(() => import("./pages/MyOrders"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccess"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPassword"));
const WishlistPage = lazy(() => import("./pages/Wishlist"));

// Lazy-load admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/Dashboard"));
const AdminProductsPage = lazy(() => import("./pages/admin/Products"));
const AdminProductFormPage = lazy(() => import("./pages/admin/ProductForm"));
const AdminProductEditPage = lazy(() => import("./pages/admin/ProductEdit"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/Categories"));
const AdminOrdersPage = lazy(() => import("./pages/admin/Orders"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/Analytics"));
const AdminCouponsPage = lazy(() => import("./pages/admin/Coupons"));
const AdminPromoPage = lazy(() => import("./pages/admin/Promo"));
const AdminUsersPage = lazy(() => import("./pages/admin/Users"));
const AdminSiteContentPage = lazy(() => import("./pages/admin/SiteContent"));

function PageLoader() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {(["a", "b", "c", "d"] as const).map((k) => (
          <Skeleton key={k} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Public layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: () => (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  ),
});

// Public routes
const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});
const shopRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/shop",
  component: ShopPage,
});
const productDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/shop/$productId",
  component: ProductDetailPage,
});
const cartRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/cart",
  component: CartPage,
});
const myOrdersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/my-orders",
  component: MyOrdersPage,
});
const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: ProfilePage,
});
const checkoutSuccessRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/checkout/success",
  component: CheckoutSuccessPage,
});
const resetPasswordRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/reset-password",
  component: ResetPasswordPage,
});
const wishlistRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/wishlist",
  component: WishlistPage,
});

// Admin layout route (sibling of layoutRoute, NOT nested under it)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "adminLayout",
  component: () => (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AdminLayout>
  ),
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin",
  component: AdminDashboardPage,
});
const adminProductsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/products",
  component: AdminProductsPage,
});
const adminProductNewRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/products/new",
  component: AdminProductFormPage,
});
const adminProductEditRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/products/$productId/edit",
  component: AdminProductEditPage,
});
const adminCategoriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/categories",
  component: AdminCategoriesPage,
});
const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/orders",
  component: AdminOrdersPage,
});
const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/analytics",
  component: AdminAnalyticsPage,
});
const adminCouponsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/coupons",
  component: AdminCouponsPage,
});
const adminPromoRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/promo",
  component: AdminPromoPage,
});
const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});
const adminSiteContentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/admin/site-content",
  component: AdminSiteContentPage,
});

// Build the router tree
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    homeRoute,
    shopRoute,
    productDetailRoute,
    cartRoute,
    myOrdersRoute,
    profileRoute,
    checkoutSuccessRoute,
    resetPasswordRoute,
    wishlistRoute,
  ]),
  adminLayoutRoute.addChildren([
    adminRoute,
    adminProductsRoute,
    adminProductNewRoute,
    adminProductEditRoute,
    adminCategoriesRoute,
    adminOrdersRoute,
    adminAnalyticsRoute,
    adminCouponsRoute,
    adminPromoRoute,
    adminUsersRoute,
    adminSiteContentRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

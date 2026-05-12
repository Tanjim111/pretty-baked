import { h as useAuth, Q as useRouter, d as useCartStore, i as useGetMyWishlist, u as useProducts, l as useRemoveFromWishlist, r as reactExports, j as jsxRuntimeExports, H as Heart, e as Button, f as Skeleton, L as Link, S as ShoppingBag, g as ue, B as Badge } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
function WishlistProductCard({
  product,
  onRemove,
  onAddToCart,
  removing
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "group overflow-hidden border-border hover-lift bg-card h-full flex flex-col",
      "data-ocid": `wishlist.product_card.${product.id}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: product.imageUrl,
              alt: product.name,
              className: "w-full h-full object-cover group-hover:scale-105 transition-smooth",
              onError: (e) => {
                e.target.src = "/assets/images/placeholder.svg";
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onRemove,
              disabled: removing,
              "aria-label": `Remove ${product.name} from wishlist`,
              className: "absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm shadow-sm flex items-center justify-center border border-border hover:bg-destructive hover:border-destructive hover:text-destructive-foreground text-foreground transition-colors disabled:opacity-50",
              "data-ocid": `wishlist.remove_button.${product.id}`,
              children: removing ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 flex flex-col gap-1", children: [
            product.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[9px] px-1.5 bg-primary text-primary-foreground", children: "⭐ Featured" }),
            !product.isAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[9px] px-1.5", children: "Out of Stock" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex flex-col flex-1 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/shop/$productId",
              params: { productId: product.id },
              "data-ocid": `wishlist.product_link.${product.id}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-bold text-foreground text-center uppercase tracking-wide leading-tight line-clamp-2 hover:text-primary transition-smooth", children: product.name })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center font-display font-bold text-primary text-lg", children: [
            "৳",
            product.price.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "w-full text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 transition-smooth mt-auto",
              onClick: onAddToCart,
              disabled: !product.isAvailable,
              "data-ocid": `wishlist.add_to_cart_button.${product.id}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 12 }),
                product.isAvailable ? "Add to Cart" : "Unavailable"
              ]
            }
          )
        ] })
      ]
    }
  );
}
function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { data: wishlistIds = [], isLoading: wishlistLoading } = useGetMyWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const removeFromWishlist = useRemoveFromWishlist();
  const isLoading = wishlistLoading || productsLoading;
  const wishlistProducts = reactExports.useMemo(() => {
    const idSet = new Set(wishlistIds.map(String));
    return allProducts.filter((p) => idSet.has(p.id));
  }, [allProducts, wishlistIds]);
  if (!isLoggedIn) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-16 px-8 max-w-sm mx-auto",
        "data-ocid": "wishlist.login_prompt",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 28, className: "text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-2", children: "Save Your Favourites" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mb-6", children: "Log in to view and manage your wishlist." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => router.navigate({ to: "/" }),
              className: "gap-2 bg-primary hover:bg-primary/90",
              "data-ocid": "wishlist.login_button",
              children: "Log In to Continue"
            }
          )
        ]
      }
    ) });
  }
  function handleRemove(product) {
    removeFromWishlist.mutate(Number(product.id), {
      onSuccess: () => {
        ue.success(`${product.name} removed from wishlist`);
      },
      onError: () => {
        ue.error("Failed to remove from wishlist");
      }
    });
  }
  function handleAddToCart(product) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    ue.success(`${product.name} added to cart!`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", "data-ocid": "wishlist.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border py-8 sm:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-2", children: "Saved Items" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-4xl md:text-5xl font-bold text-foreground flex items-center justify-center gap-3", children: [
        "My Wishlist",
        !isLoading && wishlistProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-base font-bold", children: wishlistProducts.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 max-w-md mx-auto", children: "Products you've saved — add them to your cart whenever you're ready." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square w-full rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/3 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" })
    ] }, k)) }) : wishlistProducts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-24 bg-card rounded-2xl border border-border",
        "data-ocid": "wishlist.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 36, className: "text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl font-bold text-foreground mb-2", children: "Your wishlist is empty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6 max-w-xs mx-auto", children: "Browse our menu and tap the heart icon on any product to save it here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "wishlist.browse_shop_link", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2 bg-primary hover:bg-primary/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 15 }),
            "Browse Our Menu"
          ] }) })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5",
        "data-ocid": "wishlist.products_list",
        children: wishlistProducts.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          WishlistProductCard,
          {
            product,
            onRemove: () => handleRemove(product),
            onAddToCart: () => handleAddToCart(product),
            removing: removeFromWishlist.isPending && removeFromWishlist.variables === Number(product.id)
          },
          product.id
        ))
      }
    ) })
  ] });
}
export {
  WishlistPage as default
};

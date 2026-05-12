import { c as createLucideIcon, h as useAuth, r as reactExports, u as useProducts, a as useCategories, i as useGetMyWishlist, d as useCartStore, k as useAddToWishlist, l as useRemoveFromWishlist, j as jsxRuntimeExports, I as Input, e as Button, n as cn, f as Skeleton, A as AnimatePresence, m as motion, B as Badge, L as Link, S as ShoppingBag, g as ue, o as Label, H as Heart } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { S as Search } from "./search-DbXcbU19.js";
import { M as Minus } from "./minus-B6-gqcJ-.js";
import { P as Plus } from "./plus-KifZePkW.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M12.531 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14v6a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341l.427-.473",
      key: "ol2ft2"
    }
  ],
  ["path", { d: "m16.5 3.5 5 5", key: "15e6fa" }],
  ["path", { d: "m21.5 3.5-5 5", key: "m0lwru" }]
];
const FunnelX = createLucideIcon("funnel-x", __iconNode);
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" }
];
function PriceRangeInputs({
  min,
  max,
  onMinChange,
  onMaxChange
}) {
  function parseVal(raw) {
    if (raw === "") return "";
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : "";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] text-muted-foreground font-medium uppercase tracking-wider", children: "Min ৳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          min: 0,
          placeholder: "0",
          value: min === "" ? "" : String(min),
          onChange: (e) => onMinChange(parseVal(e.target.value)),
          className: "h-9 w-24 text-sm border-input focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          "data-ocid": "shop.price_min_input"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground pb-2 select-none", children: "–" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] text-muted-foreground font-medium uppercase tracking-wider", children: "Max ৳" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          min: 0,
          placeholder: "∞",
          value: max === "" ? "" : String(max),
          onChange: (e) => onMaxChange(parseVal(e.target.value)),
          className: "h-9 w-24 text-sm border-input focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          "data-ocid": "shop.price_max_input"
        }
      )
    ] })
  ] });
}
function WishlistButton({
  product,
  wishlistIds,
  isLoggedIn,
  onToggle,
  pending
}) {
  const inWishlist = wishlistIds.has(product.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isLoggedIn) {
          ue.info("Please login to save to wishlist");
          return;
        }
        onToggle(product.id, inWishlist);
      },
      disabled: pending,
      "aria-label": inWishlist ? "Remove from wishlist" : "Add to wishlist",
      className: cn(
        "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm z-10",
        inWishlist ? "bg-primary border-primary text-primary-foreground hover:bg-primary/80" : "bg-card/90 backdrop-blur-sm border-border text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground",
        pending && "opacity-60 pointer-events-none"
      ),
      "data-ocid": `shop.wishlist_button.${product.id}`,
      children: pending ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 13, className: cn(inWishlist && "fill-current") })
    }
  );
}
function ShopPage() {
  const { isLoggedIn } = useAuth();
  const [query, setQuery] = reactExports.useState("");
  const [category, setCategory] = reactExports.useState("all");
  const [sort, setSort] = reactExports.useState("featured");
  const [minPrice, setMinPrice] = reactExports.useState("");
  const [maxPrice, setMaxPrice] = reactExports.useState("");
  const [cardQty, setCardQty] = reactExports.useState({});
  const [pendingWishlist, setPendingWishlist] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: wishlistIds = [] } = useGetMyWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const wishlistSet = reactExports.useMemo(
    () => new Set(wishlistIds.map(String)),
    [wishlistIds]
  );
  const allTabs = reactExports.useMemo(
    () => [{ id: "all", name: "All" }, ...categories],
    [categories]
  );
  const filtered = reactExports.useMemo(() => {
    let list = [...products];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    if (minPrice !== "") {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== "") {
      list = list.filter((p) => p.price <= maxPrice);
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "featured")
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, category, sort, minPrice, maxPrice]);
  const activeFilterCount = reactExports.useMemo(() => {
    let n = 0;
    if (query) n++;
    if (category !== "all") n++;
    if (sort !== "featured") n++;
    if (minPrice !== "") n++;
    if (maxPrice !== "") n++;
    return n;
  }, [query, category, sort, minPrice, maxPrice]);
  function clearAllFilters() {
    setQuery("");
    setCategory("all");
    setSort("featured");
    setMinPrice("");
    setMaxPrice("");
  }
  function getQty(id) {
    return cardQty[id] ?? 1;
  }
  function incQty(id, max) {
    setCardQty((prev) => ({
      ...prev,
      [id]: Math.min(max, (prev[id] ?? 1) + 1)
    }));
  }
  function decQty(id) {
    setCardQty((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) - 1) }));
  }
  function handleAddToCart(product) {
    const qty = getQty(product.id);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      imageUrl: product.imageUrl
    });
    ue.success(
      qty === 1 ? `${product.name} added to cart!` : `${product.name} ×${qty} added to cart!`
    );
  }
  async function handleWishlistToggle(productId, inWishlist) {
    var _a, _b;
    setPendingWishlist((prev) => /* @__PURE__ */ new Set([...prev, productId]));
    try {
      if (inWishlist) {
        await removeFromWishlist.mutateAsync(Number(productId));
        const productName = ((_a = products.find((p) => p.id === productId)) == null ? void 0 : _a.name) ?? "Item";
        ue.success(`${productName} removed from wishlist`);
      } else {
        await addToWishlist.mutateAsync(Number(productId));
        const productName = ((_b = products.find((p) => p.id === productId)) == null ? void 0 : _b.name) ?? "Item";
        ue.success(`${productName} saved to wishlist ❤️`);
      }
    } catch {
      ue.error("Failed to update wishlist. Please try again.");
    } finally {
      setPendingWishlist((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background min-h-screen", "data-ocid": "shop.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border py-8 sm:py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-2", children: "Fresh Every Day" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl md:text-5xl font-bold text-foreground", children: "Our Menu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 max-w-md mx-auto", children: "Browse our full selection of handcrafted baked goods" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col sm:flex-row gap-3 mb-4",
          "data-ocid": "shop.filters_panel",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Search,
                {
                  size: 15,
                  className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Search by name or description...",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  className: "pl-9 border-input focus:border-primary",
                  "data-ocid": "shop.search_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap shrink-0", children: SORT_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: sort === o.value ? "default" : "outline",
                className: cn(
                  "text-xs transition-smooth",
                  sort === o.value ? "bg-primary text-primary-foreground" : "border-border hover:border-primary/50 hover:text-primary"
                ),
                onClick: () => setSort(o.value),
                "data-ocid": `shop.sort_${o.value}_button`,
                children: o.label
              },
              o.value
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3 mb-5 pb-5 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PriceRangeInputs,
            {
              min: minPrice,
              max: maxPrice,
              onMinChange: setMinPrice,
              onMaxChange: setMaxPrice
            }
          ),
          (minPrice !== "" || maxPrice !== "") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-9 text-xs text-muted-foreground hover:text-destructive gap-1.5 transition-smooth",
              onClick: () => {
                setMinPrice("");
                setMaxPrice("");
              },
              "data-ocid": "shop.clear_price_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FunnelX, { size: 13 }),
                "Clear price"
              ]
            }
          )
        ] }),
        activeFilterCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "h-9 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary gap-1.5 transition-smooth",
            onClick: clearAllFilters,
            "data-ocid": "shop.clear_all_filters_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FunnelX, { size: 13 }),
              "Clear all filters",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center", children: activeFilterCount })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex gap-2 flex-wrap mb-8 border-b border-border pb-4",
          "data-ocid": "shop.category_tabs",
          children: allTabs.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setCategory(c.id),
              type: "button",
              className: cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-smooth border",
                category === c.id ? "bg-primary text-primary-foreground border-primary shadow-warm" : "bg-card text-foreground/80 border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5"
              ),
              "data-ocid": `shop.category_tab.${c.id}`,
              children: c.name
            },
            c.id
          ))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-5", children: [
        filtered.length,
        " product",
        filtered.length !== 1 ? "s" : "",
        " found",
        (minPrice !== "" || maxPrice !== "") && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-primary font-medium", children: [
          "· Price: ৳",
          minPrice !== "" ? minPrice.toLocaleString() : "0",
          " – ",
          maxPrice !== "" ? `৳${maxPrice.toLocaleString()}` : "any"
        ] })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5", children: ["a", "b", "c", "d", "e", "f"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square w-full rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/3 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" })
      ] }, k)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-center py-20 bg-card rounded-2xl border border-border",
          "data-ocid": "shop.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-5xl mb-4", children: "🍞" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold text-foreground mb-2", children: "No products found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-5", children: "Try adjusting your search, price range, or selecting a different category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: clearAllFilters,
                variant: "outline",
                className: "border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth",
                "data-ocid": "shop.clear_filters_button",
                children: "Clear All Filters"
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 },
          "data-ocid": "shop.products_list",
          children: filtered.map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: {
                delay: i % 8 * 0.05,
                duration: 0.35,
                ease: "easeOut"
              },
              "data-ocid": `shop.product_item.${i + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Card,
                {
                  className: "group overflow-hidden border-border bg-card h-full flex flex-col rounded-2xl shadow-warm",
                  style: {
                    transition: "transform 300ms ease, box-shadow 300ms ease"
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 16px 40px oklch(0.65 0.22 38 / 0.18), 0 4px 12px oklch(0 0 0 / 0.12)";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3] overflow-hidden rounded-t-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: product.imageUrl,
                          alt: product.name,
                          className: "w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110",
                          onError: (e) => {
                            e.target.src = "/assets/images/placeholder.svg";
                          }
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 left-2 flex flex-col gap-1", children: [
                        product.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[9px] px-1.5 bg-primary text-primary-foreground", children: "⭐ Featured" }),
                        !product.isAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            variant: "secondary",
                            className: "text-[9px] px-1.5",
                            children: "Out of Stock"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        WishlistButton,
                        {
                          product,
                          wishlistIds: wishlistSet,
                          isLoggedIn,
                          onToggle: handleWishlistToggle,
                          pending: pendingWishlist.has(product.id)
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-2 flex flex-col flex-1 gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Link,
                        {
                          to: "/shop/$productId",
                          params: { productId: product.id },
                          "data-ocid": `shop.product_link.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xs sm:text-sm font-bold text-foreground text-center uppercase tracking-wide leading-tight line-clamp-2 hover:text-primary transition-smooth", children: product.name })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] text-muted-foreground line-clamp-2 leading-relaxed", children: product.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center font-display font-bold text-primary text-base", children: [
                        "৳",
                        product.price.toLocaleString()
                      ] }),
                      product.isAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-2 mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border border-input rounded-xl overflow-hidden", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            className: "h-7 w-7 flex items-center justify-center hover:bg-primary/10 transition-smooth",
                            onClick: () => decQty(product.id),
                            "aria-label": "Decrease quantity",
                            "data-ocid": `shop.qty_decrease.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 11 })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "w-7 text-center text-xs font-semibold",
                            "data-ocid": `shop.qty_value.${i + 1}`,
                            children: getQty(product.id)
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            className: "h-7 w-7 flex items-center justify-center hover:bg-primary/10 transition-smooth",
                            onClick: () => incQty(product.id, product.stock),
                            "aria-label": "Increase quantity",
                            "data-ocid": `shop.qty_increase.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 11 })
                          }
                        )
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          size: "sm",
                          className: "w-full text-[11px] h-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 transition-smooth rounded-lg",
                          onClick: () => handleAddToCart(product),
                          disabled: !product.isAvailable,
                          "data-ocid": `shop.add_to_cart_button.${i + 1}`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 11 }),
                            product.isAvailable ? "Add to Cart" : "Unavailable"
                          ]
                        }
                      )
                    ] })
                  ]
                }
              )
            },
            product.id
          ))
        },
        category + sort + query + String(minPrice) + String(maxPrice)
      ) })
    ] })
  ] });
}
export {
  ShopPage as default
};

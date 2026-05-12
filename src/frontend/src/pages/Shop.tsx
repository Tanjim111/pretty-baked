import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { FilterX, Heart, Minus, Plus, Search, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  useAddToWishlist,
  useCategories,
  useGetMyWishlist,
  useProducts,
  useRemoveFromWishlist,
} from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
];

interface CartQty {
  [productId: string]: number;
}

// ---------------------------------------------------------------------------
// Price range input component
// ---------------------------------------------------------------------------

interface PriceRangeInputProps {
  min: number | "";
  max: number | "";
  onMinChange: (v: number | "") => void;
  onMaxChange: (v: number | "") => void;
}

function PriceRangeInputs({
  min,
  max,
  onMinChange,
  onMaxChange,
}: PriceRangeInputProps) {
  function parseVal(raw: string): number | "" {
    if (raw === "") return "";
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : "";
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col gap-1 min-w-0">
        <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          Min ৳
        </Label>
        <Input
          type="number"
          min={0}
          placeholder="0"
          value={min === "" ? "" : String(min)}
          onChange={(e) => onMinChange(parseVal(e.target.value))}
          className="h-9 w-24 text-sm border-input focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          data-ocid="shop.price_min_input"
        />
      </div>
      <span className="text-muted-foreground pb-2 select-none">–</span>
      <div className="flex flex-col gap-1 min-w-0">
        <Label className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          Max ৳
        </Label>
        <Input
          type="number"
          min={0}
          placeholder="∞"
          value={max === "" ? "" : String(max)}
          onChange={(e) => onMaxChange(parseVal(e.target.value))}
          className="h-9 w-24 text-sm border-input focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          data-ocid="shop.price_max_input"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wishlist heart button
// ---------------------------------------------------------------------------

interface WishlistButtonProps {
  product: Product;
  wishlistIds: Set<string>;
  isLoggedIn: boolean;
  onToggle: (productId: string, inWishlist: boolean) => void;
  pending: boolean;
}

function WishlistButton({
  product,
  wishlistIds,
  isLoggedIn,
  onToggle,
  pending,
}: WishlistButtonProps) {
  const inWishlist = wishlistIds.has(product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isLoggedIn) {
          toast.info("Please login to save to wishlist");
          return;
        }
        onToggle(product.id, inWishlist);
      }}
      disabled={pending}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm z-10",
        inWishlist
          ? "bg-primary border-primary text-primary-foreground hover:bg-primary/80"
          : "bg-card/90 backdrop-blur-sm border-border text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground",
        pending && "opacity-60 pointer-events-none",
      )}
      data-ocid={`shop.wishlist_button.${product.id}`}
    >
      {pending ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Heart size={13} className={cn(inWishlist && "fill-current")} />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ShopPage() {
  const { isLoggedIn } = useAuth();

  // ---------------------------------------------------------------------------
  // Local filter/sort state — replaces the broken URL-param approach that used
  // window.history.replaceState which doesn't trigger TanStack Router re-renders
  // ---------------------------------------------------------------------------
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const [cardQty, setCardQty] = useState<CartQty>({});
  const [pendingWishlist, setPendingWishlist] = useState<Set<string>>(
    new Set(),
  );

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: wishlistIds = [] } = useGetMyWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const wishlistSet = useMemo(
    () => new Set(wishlistIds.map(String)),
    [wishlistIds],
  );

  const allTabs = useMemo(
    () => [{ id: "all", name: "All" }, ...categories],
    [categories],
  );

  // ---------------------------------------------------------------------------
  // Filter logic
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    let list = [...products];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (minPrice !== "") {
      list = list.filter((p) => p.price >= (minPrice as number));
    }

    if (maxPrice !== "") {
      list = list.filter((p) => p.price <= (maxPrice as number));
    }

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "featured")
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, query, category, sort, minPrice, maxPrice]);

  // ---------------------------------------------------------------------------
  // Active filter count (for Clear All badge)
  // ---------------------------------------------------------------------------

  const activeFilterCount = useMemo(() => {
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

  // ---------------------------------------------------------------------------
  // Quantity helpers
  // ---------------------------------------------------------------------------

  function getQty(id: string) {
    return cardQty[id] ?? 1;
  }
  function incQty(id: string, max: number) {
    setCardQty((prev) => ({
      ...prev,
      [id]: Math.min(max, (prev[id] ?? 1) + 1),
    }));
  }
  function decQty(id: string) {
    setCardQty((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) - 1) }));
  }

  function handleAddToCart(product: Product) {
    const qty = getQty(product.id);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      imageUrl: product.imageUrl,
    });
    toast.success(
      qty === 1
        ? `${product.name} added to cart!`
        : `${product.name} ×${qty} added to cart!`,
    );
  }

  // ---------------------------------------------------------------------------
  // Wishlist toggle
  // ---------------------------------------------------------------------------

  async function handleWishlistToggle(productId: string, inWishlist: boolean) {
    setPendingWishlist((prev) => new Set([...prev, productId]));
    try {
      if (inWishlist) {
        await removeFromWishlist.mutateAsync(Number(productId));
        const productName =
          products.find((p) => p.id === productId)?.name ?? "Item";
        toast.success(`${productName} removed from wishlist`);
      } else {
        await addToWishlist.mutateAsync(Number(productId));
        const productName =
          products.find((p) => p.id === productId)?.name ?? "Item";
        toast.success(`${productName} saved to wishlist ❤️`);
      }
    } catch {
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setPendingWishlist((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="bg-background min-h-screen" data-ocid="shop.page">
      {/* Page Header */}
      <div className="bg-card border-b border-border py-8 sm:py-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Fresh Every Day
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Our Menu
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Browse our full selection of handcrafted baked goods
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search + Sort row */}
        <div
          className="flex flex-col sm:flex-row gap-3 mb-4"
          data-ocid="shop.filters_panel"
        >
          <div className="relative flex-1 min-w-0">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 border-input focus:border-primary"
              data-ocid="shop.search_input"
            />
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            {SORT_OPTIONS.map((o) => (
              <Button
                key={o.value}
                size="sm"
                variant={sort === o.value ? "default" : "outline"}
                className={cn(
                  "text-xs transition-smooth",
                  sort === o.value
                    ? "bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50 hover:text-primary",
                )}
                onClick={() => setSort(o.value)}
                data-ocid={`shop.sort_${o.value}_button`}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Range + Clear All row */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5 pb-5 border-b border-border">
          <div className="flex items-end gap-4 flex-wrap">
            <PriceRangeInputs
              min={minPrice}
              max={maxPrice}
              onMinChange={setMinPrice}
              onMaxChange={setMaxPrice}
            />
            {(minPrice !== "" || maxPrice !== "") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-muted-foreground hover:text-destructive gap-1.5 transition-smooth"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                data-ocid="shop.clear_price_button"
              >
                <FilterX size={13} />
                Clear price
              </Button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary gap-1.5 transition-smooth"
              onClick={clearAllFilters}
              data-ocid="shop.clear_all_filters_button"
            >
              <FilterX size={13} />
              Clear all filters
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            </Button>
          )}
        </div>

        {/* Category Tab Filters */}
        <div
          className="flex gap-2 flex-wrap mb-8 border-b border-border pb-4"
          data-ocid="shop.category_tabs"
        >
          {allTabs.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              type="button"
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-smooth border",
                category === c.id
                  ? "bg-primary text-primary-foreground border-primary shadow-warm"
                  : "bg-card text-foreground/80 border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5",
              )}
              data-ocid={`shop.category_tab.${c.id}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-5">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          {(minPrice !== "" || maxPrice !== "") && (
            <span className="ml-1 text-primary font-medium">
              · Price: ৳{minPrice !== "" ? minPrice.toLocaleString() : "0"}
              {" – "}
              {maxPrice !== ""
                ? `৳${(maxPrice as number).toLocaleString()}`
                : "any"}
            </span>
          )}
        </p>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 bg-card rounded-2xl border border-border"
            data-ocid="shop.empty_state"
          >
            <p className="text-5xl mb-4">🍞</p>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-5">
              Try adjusting your search, price range, or selecting a different
              category
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth"
              data-ocid="shop.clear_filters_button"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={
                category + sort + query + String(minPrice) + String(maxPrice)
              }
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              data-ocid="shop.products_list"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (i % 8) * 0.05,
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  data-ocid={`shop.product_item.${i + 1}`}
                >
                  <Card
                    className="group overflow-hidden border-border bg-card h-full flex flex-col rounded-2xl shadow-warm"
                    style={{
                      transition: "transform 300ms ease, box-shadow 300ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-4px) scale(1.03)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 16px 40px oklch(0.65 0.22 38 / 0.18), 0 4px 12px oklch(0 0 0 / 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "";
                      (e.currentTarget as HTMLElement).style.boxShadow = "";
                    }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden rounded-t-2xl">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/assets/images/placeholder.svg";
                          }}
                        />
                      </div>
                      {/* Subtle hover shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      {/* Badge row (left) */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isFeatured && (
                          <Badge className="text-[9px] px-1.5 bg-primary text-primary-foreground">
                            ⭐ Featured
                          </Badge>
                        )}
                        {!product.isAvailable && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5"
                          >
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      {/* Wishlist heart button (top-right) */}
                      <WishlistButton
                        product={product}
                        wishlistIds={wishlistSet}
                        isLoggedIn={isLoggedIn}
                        onToggle={handleWishlistToggle}
                        pending={pendingWishlist.has(product.id)}
                      />
                    </div>

                    <CardContent className="p-2 flex flex-col flex-1 gap-1.5">
                      <Link
                        to="/shop/$productId"
                        params={{ productId: product.id }}
                        data-ocid={`shop.product_link.${i + 1}`}
                      >
                        <h3 className="font-display text-xs sm:text-sm font-bold text-foreground text-center uppercase tracking-wide leading-tight line-clamp-2 hover:text-primary transition-smooth">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-center text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <p className="text-center font-display font-bold text-primary text-base">
                        ৳{product.price.toLocaleString()}
                      </p>

                      {/* Quantity selector */}
                      {product.isAvailable && (
                        <div className="flex items-center justify-center gap-2 mt-auto">
                          <div className="flex items-center border border-input rounded-xl overflow-hidden">
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center hover:bg-primary/10 transition-smooth"
                              onClick={() => decQty(product.id)}
                              aria-label="Decrease quantity"
                              data-ocid={`shop.qty_decrease.${i + 1}`}
                            >
                              <Minus size={11} />
                            </button>
                            <span
                              className="w-7 text-center text-xs font-semibold"
                              data-ocid={`shop.qty_value.${i + 1}`}
                            >
                              {getQty(product.id)}
                            </span>
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center hover:bg-primary/10 transition-smooth"
                              onClick={() => incQty(product.id, product.stock)}
                              aria-label="Increase quantity"
                              data-ocid={`shop.qty_increase.${i + 1}`}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="w-full text-[11px] h-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 transition-smooth rounded-lg"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.isAvailable}
                        data-ocid={`shop.add_to_cart_button.${i + 1}`}
                      >
                        <ShoppingBag size={11} />
                        {product.isAvailable ? "Add to Cart" : "Unavailable"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

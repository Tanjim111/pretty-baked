import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Star,
  ZoomIn,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddReview,
  useAverageRating,
  useCategories,
  useGetProductImages,
  useProductById,
  useProducts,
  useReviews,
} from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";

// ---------------------------------------------------------------------------
// ImageGallery — premium slideshow with thumbnails, arrows, dots, autoplay
// ---------------------------------------------------------------------------
function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = images.length;

  const goTo = useCallback(
    (index: number, dir: 1 | -1 = 1) => {
      setDirection(dir);
      setCurrent((index + total) % total);
    },
    [total],
  );

  const prev = useCallback(() => {
    goTo(current - 1, -1);
  }, [current, goTo]);

  const next = useCallback(() => {
    goTo(current + 1, 1);
  }, [current, goTo]);

  // Autoplay every 4s, pause on hover
  useEffect(() => {
    if (total <= 1) return;
    if (isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
      setDirection(1);
    }, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [total, isHovered]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (total === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
        <span className="text-4xl">🍰</span>
      </div>
    );
  }

  const isSingle = total === 1;

  return (
    <div className="space-y-3" data-ocid="product_detail.gallery">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-elevated group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img
              src={images[current]}
              alt={`${productName} — view ${current + 1} of ${total}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              style={{ cursor: "zoom-in" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/images/placeholder.svg";
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-foreground/10 backdrop-blur-sm rounded-full p-2.5">
            <ZoomIn size={20} className="text-card" />
          </div>
        </div>

        {/* Navigation arrows — only shown for multiple images */}
        {!isSingle && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-warm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110 focus-visible:opacity-100"
              aria-label="Previous image"
              data-ocid="product_detail.gallery_prev_button"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-warm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110 focus-visible:opacity-100"
              aria-label="Next image"
              data-ocid="product_detail.gallery_next_button"
            >
              <ChevronRight size={18} className="text-foreground" />
            </button>

            {/* Counter badge */}
            <div className="absolute bottom-3 right-3 bg-foreground/60 backdrop-blur-sm text-card text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
              {current + 1} / {total}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
              {images.slice(0, 4).map((src, i) => (
                <div
                  key={`dot-${i}-${src.slice(-8)}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-card/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip — only for multiple images */}
      {!isSingle && (
        <div
          className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none"
          data-ocid="product_detail.gallery_thumbnails"
        >
          {images.map((src, i) => (
            <button
              key={`thumb-${i}-${src.slice(-8)}`}
              type="button"
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`View photo ${i + 1}`}
              data-ocid={`product_detail.gallery_thumbnail.${i + 1}`}
              className={`flex-shrink-0 w-[62px] h-[62px] rounded-xl overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                i === current
                  ? "border-primary shadow-warm scale-105"
                  : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/images/placeholder.svg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StarRating — interactive star row
// ---------------------------------------------------------------------------
function StarRating({
  value,
  onChange,
  size = 20,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-0.5" aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={
            readonly
              ? "cursor-default"
              : "cursor-pointer transition-transform hover:scale-110"
          }
          aria-label={`${star} star`}
        >
          <Star
            size={size}
            className={
              star <= active
                ? "text-primary fill-primary"
                : "text-muted-foreground/40"
            }
          />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewCard
// ---------------------------------------------------------------------------
function ReviewCard({
  reviewerName,
  rating,
  text,
  createdAt,
}: {
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: bigint;
}) {
  const date = new Date(Number(createdAt) / 1_000_000).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary uppercase">
              {reviewerName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {reviewerName}
            </p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
        <StarRating value={rating} size={14} readonly />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReviewForm
// ---------------------------------------------------------------------------
function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const addReview = useAddReview();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    try {
      await addReview.mutateAsync({
        productId,
        reviewerName: name.trim(),
        rating,
        text: text.trim(),
      });
      toast.success("Review submitted! Thank you 🎉");
      setRating(0);
      setName("");
      setText("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-6 space-y-5"
      data-ocid="product_detail.review_form"
    >
      <h3 className="font-display font-bold text-foreground text-lg">
        Write a Review
      </h3>

      <div className="space-y-1.5">
        <Label className="text-sm text-foreground font-medium">
          Your Rating *
        </Label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="review-name"
          className="text-sm text-foreground font-medium"
        >
          Your Name *
        </Label>
        <Input
          id="review-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tasnim Ahmed"
          maxLength={60}
          className="bg-background border-input"
          data-ocid="product_detail.review_name_input"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="review-text"
          className="text-sm text-foreground font-medium"
        >
          Your Review
        </Label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you love about this product?"
          rows={3}
          maxLength={500}
          className="bg-background border-input resize-none"
          data-ocid="product_detail.review_textarea"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-smooth"
        disabled={addReview.isPending}
        data-ocid="product_detail.review_submit_button"
      >
        {addReview.isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function ProductDetailPage() {
  const { productId } = useParams({ from: "/layout/shop/$productId" });
  const { data: product, isLoading } = useProductById(productId);
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: reviews = [], isLoading: reviewsLoading } =
    useReviews(productId);
  const { data: avgRating } = useAverageRating(productId);
  const { data: galleryImages = [] } = useGetProductImages(productId);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  // Combine primary image with gallery images, deduplicated
  const allImages = product
    ? [product.imageUrl, ...galleryImages].filter(
        (url, idx, arr) => url && arr.indexOf(url) === idx,
      )
    : [];

  const related = allProducts
    .filter((p) => p.id !== productId && p.category === product?.category)
    .slice(0, 4);

  const categoryName =
    categories.find((c) => c.id === product?.category)?.name ?? "";

  const ingredients =
    product?.ingredients && product.ingredients.length > 0
      ? product.ingredients
      : ["Premium flour", "Butter", "Eggs", "Sugar", "Natural flavoring"];

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} ×${quantity} added to cart!`);
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-[62px] h-[62px] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="text-center py-24"
        data-ocid="product_detail.not_found_state"
      >
        <p className="text-5xl mb-5">🍰</p>
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Product Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          This product may no longer be available.
        </p>
        <Link to="/shop">
          <Button
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth"
          >
            <ArrowLeft size={16} /> Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const ratingDisplay = avgRating != null ? avgRating.toFixed(1) : null;
  const reviewCount = reviews.length;

  return (
    <div className="bg-background min-h-screen" data-ocid="product_detail.page">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border py-3">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-smooth">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary transition-smooth">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Product Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery images={allImages} productName={product.name} />
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Category + Availability */}
            <div className="flex items-center gap-2 mb-3">
              {categoryName && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {categoryName}
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="bg-secondary/20 text-foreground border-secondary/30 text-xs gap-1">
                  <Star size={9} fill="currentColor" /> Featured
                </Badge>
              )}
              <Badge
                variant={product.isAvailable ? "default" : "secondary"}
                className="ml-auto text-xs"
              >
                {product.isAvailable ? "✓ In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">
              {product.name}
            </h1>

            {/* Average Rating Summary */}
            {ratingDisplay != null && reviewCount > 0 ? (
              <div
                className="flex items-center gap-2 mb-3"
                data-ocid="product_detail.rating_summary"
              >
                <StarRating value={Math.round(avgRating!)} size={16} readonly />
                <span className="text-sm font-semibold text-primary">
                  {ratingDisplay}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">
                No reviews yet
              </p>
            )}

            {/* Price */}
            <p className="font-display text-3xl font-bold text-primary mb-4">
              ৳{product.price.toLocaleString()}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-5 text-base">
              {product.description}
            </p>

            {/* Meta */}
            <div className="flex gap-4 text-xs text-muted-foreground mb-5 flex-wrap">
              <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg">
                <Package size={13} className="text-primary" /> SKU:{" "}
                {product.sku}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg">
                <Star size={13} className="text-primary" /> Stock:{" "}
                {product.stock} left
              </span>
              <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg">
                <Clock size={13} className="text-primary" /> Baked Fresh Daily
              </span>
            </div>

            <Separator className="mb-5" />

            {/* Ingredients */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Key Ingredients
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2
                      size={13}
                      className="text-primary flex-shrink-0"
                    />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="mb-5" />

            {/* Quantity + CTA */}
            {product.isAvailable ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-input rounded-xl overflow-hidden shadow-warm">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 rounded-none hover:bg-primary/10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-ocid="product_detail.quantity_decrease_button"
                    >
                      <Minus size={14} />
                    </Button>
                    <span
                      className="w-12 text-center text-sm font-semibold"
                      data-ocid="product_detail.quantity_value"
                    >
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 rounded-none hover:bg-primary/10"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      data-ocid="product_detail.quantity_increase_button"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Total:{" "}
                    <strong className="text-primary">
                      ৳{(product.price * quantity).toLocaleString()}
                    </strong>
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm hover-lift transition-smooth"
                  onClick={handleAddToCart}
                  data-ocid="product_detail.add_to_cart_button"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </Button>

                <div className="flex gap-3">
                  <Link to="/cart" className="flex-1">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth"
                      data-ocid="product_detail.view_cart_button"
                    >
                      View Cart
                    </Button>
                  </Link>
                  <Link to="/shop">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="gap-2 hover:text-primary transition-smooth"
                      data-ocid="product_detail.back_to_shop_button"
                    >
                      <ArrowLeft size={15} /> Back to Shop
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className="p-5 bg-muted/40 rounded-2xl text-center border border-border"
                data-ocid="product_detail.unavailable_state"
              >
                <p className="text-muted-foreground mb-3">
                  This product is currently unavailable. Check back soon!
                </p>
                <Link to="/shop">
                  <Button
                    variant="outline"
                    className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth"
                  >
                    <ArrowLeft size={15} /> Continue Browsing
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16" data-ocid="product_detail.reviews_section">
          <Separator className="mb-10" />

          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">
                Customer Feedback
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare size={22} className="text-primary" />
                Reviews
                {reviewCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({reviewCount})
                  </span>
                )}
              </h2>
            </div>
            {ratingDisplay != null && reviewCount > 0 && (
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3">
                <span className="font-display text-4xl font-bold text-primary">
                  {ratingDisplay}
                </span>
                <div>
                  <StarRating
                    value={Math.round(avgRating!)}
                    size={18}
                    readonly
                  />
                  <p className="text-xs text-muted-foreground mt-0.5">
                    out of 5 stars
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4" data-ocid="product_detail.reviews_list">
              {reviewsLoading ? (
                <div
                  className="space-y-4"
                  data-ocid="product_detail.reviews_loading_state"
                >
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <motion.div
                  className="text-center py-12 bg-card border border-dashed border-border rounded-xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-ocid="product_detail.reviews_empty_state"
                >
                  <p className="text-4xl mb-3">✨</p>
                  <p className="font-display font-bold text-foreground text-lg mb-1">
                    Be the first to review this product!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Share your experience and help others decide.
                  </p>
                </motion.div>
              ) : (
                reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    data-ocid={`product_detail.review_item.${i + 1}`}
                  >
                    <ReviewCard
                      reviewerName={review.reviewerName}
                      rating={review.rating}
                      text={review.text}
                      createdAt={review.createdAt}
                    />
                  </motion.div>
                ))
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <ReviewForm productId={productId} />
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16" data-ocid="product_detail.related_section">
            <Separator className="mb-10" />
            <div className="text-center mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
                From the Same Collection
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`product_detail.related_item.${i + 1}`}
                >
                  <Card className="overflow-hidden hover-lift border-border bg-card group">
                    <Link to="/shop/$productId" params={{ productId: p.id }}>
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/assets/images/placeholder.svg";
                          }}
                        />
                      </div>
                      <CardContent className="p-3 text-center">
                        <p className="font-display text-xs font-bold text-foreground uppercase tracking-wide line-clamp-2 mb-1 group-hover:text-primary transition-smooth">
                          {p.name}
                        </p>
                        <p className="text-primary font-bold text-sm">
                          ৳{p.price.toLocaleString()}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

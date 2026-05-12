import { c as createLucideIcon, p as useParams, q as useProductById, u as useProducts, a as useCategories, s as useReviews, t as useAverageRating, v as useGetProductImages, d as useCartStore, r as reactExports, j as jsxRuntimeExports, f as Skeleton, L as Link, e as Button, m as motion, B as Badge, P as Package, w as Separator, S as ShoppingBag, g as ue, A as AnimatePresence, C as ChevronLeft, x as ChevronRight, y as useAddReview, o as Label, I as Input } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { A as ArrowLeft } from "./arrow-left-CWrfTQFu.js";
import { S as Star } from "./star-3CDJmN0E.js";
import { C as Clock } from "./clock-CQ7pTt6k.js";
import { C as CircleCheck } from "./circle-check-BrWsE1Gy.js";
import { M as Minus } from "./minus-B6-gqcJ-.js";
import { P as Plus } from "./plus-KifZePkW.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
];
const ZoomIn = createLucideIcon("zoom-in", __iconNode);
function ImageGallery({
  images,
  productName
}) {
  const [current, setCurrent] = reactExports.useState(0);
  const [direction, setDirection] = reactExports.useState(1);
  const [isHovered, setIsHovered] = reactExports.useState(false);
  const autoPlayRef = reactExports.useRef(null);
  const total = images.length;
  const goTo = reactExports.useCallback(
    (index, dir = 1) => {
      setDirection(dir);
      setCurrent((index + total) % total);
    },
    [total]
  );
  const prev = reactExports.useCallback(() => {
    goTo(current - 1, -1);
  }, [current, goTo]);
  const next = reactExports.useCallback(() => {
    goTo(current + 1, 1);
  }, [current, goTo]);
  reactExports.useEffect(() => {
    if (total <= 1) return;
    if (isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
      setDirection(1);
    }, 4e3);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [total, isHovered]);
  reactExports.useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);
  if (total === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded-2xl bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl", children: "🍰" }) });
  }
  const isSingle = total === 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", "data-ocid": "product_detail.gallery", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-elevated group",
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, custom: direction, mode: "popLayout", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              custom: direction,
              initial: { opacity: 0, x: direction * 40 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: direction * -40 },
              transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
              className: "absolute inset-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: images[current],
                  alt: `${productName} — view ${current + 1} of ${total}`,
                  className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]",
                  style: { cursor: "zoom-in" },
                  onError: (e) => {
                    e.target.src = "/assets/images/placeholder.svg";
                  }
                }
              )
            },
            current
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-foreground/10 backdrop-blur-sm rounded-full p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { size: 20, className: "text-card" }) }) }),
          !isSingle && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: prev,
                className: "absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-warm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110 focus-visible:opacity-100",
                "aria-label": "Previous image",
                "data-ocid": "product_detail.gallery_prev_button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 18, className: "text-foreground" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: next,
                className: "absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-warm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:scale-110 focus-visible:opacity-100",
                "aria-label": "Next image",
                "data-ocid": "product_detail.gallery_next_button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18, className: "text-foreground" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 right-3 bg-foreground/60 backdrop-blur-sm text-card text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none", children: [
              current + 1,
              " / ",
              total
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none", children: images.slice(0, 4).map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `rounded-full transition-all duration-300 ${i === current ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-card/60"}`
              },
              `dot-${i}-${src.slice(-8)}`
            )) })
          ] })
        ]
      }
    ),
    !isSingle && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex gap-2.5 overflow-x-auto pb-1 scrollbar-none",
        "data-ocid": "product_detail.gallery_thumbnails",
        children: images.map((src, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => goTo(i, i > current ? 1 : -1),
            "aria-label": `View photo ${i + 1}`,
            "data-ocid": `product_detail.gallery_thumbnail.${i + 1}`,
            className: `flex-shrink-0 w-[62px] h-[62px] rounded-xl overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${i === current ? "border-primary shadow-warm scale-105" : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src,
                alt: `Thumbnail ${i + 1}`,
                className: "w-full h-full object-cover",
                onError: (e) => {
                  e.target.src = "/assets/images/placeholder.svg";
                }
              }
            )
          },
          `thumb-${i}-${src.slice(-8)}`
        ))
      }
    )
  ] });
}
function StarRating({
  value,
  onChange,
  size = 20,
  readonly = false
}) {
  const [hovered, setHovered] = reactExports.useState(0);
  const active = hovered || value;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5", "aria-label": `Rating: ${value} out of 5`, children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      disabled: readonly,
      onClick: () => onChange == null ? void 0 : onChange(star),
      onMouseEnter: () => !readonly && setHovered(star),
      onMouseLeave: () => !readonly && setHovered(0),
      className: readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110",
      "aria-label": `${star} star`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Star,
        {
          size,
          className: star <= active ? "text-primary fill-primary" : "text-muted-foreground/40"
        }
      )
    },
    star
  )) });
}
function ReviewCard({
  reviewerName,
  rating,
  text,
  createdAt
}) {
  const date = new Date(Number(createdAt) / 1e6).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-primary uppercase", children: reviewerName.charAt(0) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm truncate", children: reviewerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: date })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StarRating, { value: rating, size: 14, readonly: true })
    ] }),
    text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: text })
  ] });
}
function ReviewForm({ productId }) {
  const [rating, setRating] = reactExports.useState(0);
  const [name, setName] = reactExports.useState("");
  const [text, setText] = reactExports.useState("");
  const addReview = useAddReview();
  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      ue.error("Please select a star rating.");
      return;
    }
    if (!name.trim()) {
      ue.error("Please enter your name.");
      return;
    }
    try {
      await addReview.mutateAsync({
        productId,
        reviewerName: name.trim(),
        rating,
        text: text.trim()
      });
      ue.success("Review submitted! Thank you 🎉");
      setRating(0);
      setName("");
      setText("");
    } catch (err) {
      ue.error(
        err instanceof Error ? err.message : "Failed to submit review."
      );
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      className: "bg-card border border-border rounded-xl p-6 space-y-5",
      "data-ocid": "product_detail.review_form",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-lg", children: "Write a Review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm text-foreground font-medium", children: "Your Rating *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StarRating, { value: rating, onChange: setRating, size: 28 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "review-name",
              className: "text-sm text-foreground font-medium",
              children: "Your Name *"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "review-name",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "e.g. Tasnim Ahmed",
              maxLength: 60,
              className: "bg-background border-input",
              "data-ocid": "product_detail.review_name_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "review-text",
              className: "text-sm text-foreground font-medium",
              children: "Your Review"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "review-text",
              value: text,
              onChange: (e) => setText(e.target.value),
              placeholder: "What did you love about this product?",
              rows: 3,
              maxLength: 500,
              className: "bg-background border-input resize-none",
              "data-ocid": "product_detail.review_textarea"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-smooth",
            disabled: addReview.isPending,
            "data-ocid": "product_detail.review_submit_button",
            children: addReview.isPending ? "Submitting…" : "Submit Review"
          }
        )
      ]
    }
  );
}
function ProductDetailPage() {
  var _a;
  const { productId } = useParams({ from: "/layout/shop/$productId" });
  const { data: product, isLoading } = useProductById(productId);
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(productId);
  const { data: avgRating } = useAverageRating(productId);
  const { data: galleryImages = [] } = useGetProductImages(productId);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = reactExports.useState(1);
  const allImages = product ? [product.imageUrl, ...galleryImages].filter(
    (url, idx, arr) => url && arr.indexOf(url) === idx
  ) : [];
  const related = allProducts.filter((p) => p.id !== productId && p.category === (product == null ? void 0 : product.category)).slice(0, 4);
  const categoryName = ((_a = categories.find((c) => c.id === (product == null ? void 0 : product.category))) == null ? void 0 : _a.name) ?? "";
  const ingredients = (product == null ? void 0 : product.ingredients) && product.ingredients.length > 0 ? product.ingredients : ["Premium flour", "Butter", "Eggs", "Sugar", "Natural flavoring"];
  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl
    });
    ue.success(`${product.name} ×${quantity} added to cart!`);
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-6xl mx-auto px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square rounded-2xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-[62px] h-[62px] rounded-xl" }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-3/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" })
      ] })
    ] }) });
  }
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-24",
        "data-ocid": "product_detail.not_found_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-5xl mb-5", children: "🍰" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-3", children: "Product Not Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6", children: "This product may no longer be available." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              className: "gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
                " Back to Shop"
              ]
            }
          ) })
        ]
      }
    );
  }
  const ratingDisplay = avgRating != null ? avgRating.toFixed(1) : null;
  const reviewCount = reviews.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background min-h-screen", "data-ocid": "product_detail.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-6xl mx-auto px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-primary transition-smooth", children: "Home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", className: "hover:text-primary transition-smooth", children: "Shop" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium truncate max-w-xs", children: product.name })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-6xl mx-auto px-4 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImageGallery, { images: allImages, productName: product.name })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "flex flex-col",
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5, delay: 0.1 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                categoryName && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-primary/10 text-primary border-primary/20 text-xs", children: categoryName }),
                product.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-secondary/20 text-foreground border-secondary/30 text-xs gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 9, fill: "currentColor" }),
                  " Featured"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: product.isAvailable ? "default" : "secondary",
                    className: "ml-auto text-xs",
                    children: product.isAvailable ? "✓ In Stock" : "Out of Stock"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2", children: product.name }),
              ratingDisplay != null && reviewCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-2 mb-3",
                  "data-ocid": "product_detail.rating_summary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StarRating, { value: Math.round(avgRating), size: 16, readonly: true }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-primary", children: ratingDisplay }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                      "(",
                      reviewCount,
                      " review",
                      reviewCount !== 1 ? "s" : "",
                      ")"
                    ] })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "No reviews yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display text-3xl font-bold text-primary mb-4", children: [
                "৳",
                product.price.toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed mb-5 text-base", children: product.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs text-muted-foreground mb-5 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 13, className: "text-primary" }),
                  " SKU:",
                  " ",
                  product.sku
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 13, className: "text-primary" }),
                  " Stock:",
                  " ",
                  product.stock,
                  " left"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 13, className: "text-primary" }),
                  " Baked Fresh Daily"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm text-foreground mb-3", children: "Key Ingredients" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5", children: ingredients.map((ing) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: "flex items-center gap-2 text-sm text-muted-foreground",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CircleCheck,
                        {
                          size: 13,
                          className: "text-primary flex-shrink-0"
                        }
                      ),
                      ing
                    ]
                  },
                  ing
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-5" }),
              product.isAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Quantity:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border border-input rounded-xl overflow-hidden shadow-warm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "h-10 w-10 rounded-none hover:bg-primary/10",
                        onClick: () => setQuantity(Math.max(1, quantity - 1)),
                        "data-ocid": "product_detail.quantity_decrease_button",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 14 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "w-12 text-center text-sm font-semibold",
                        "data-ocid": "product_detail.quantity_value",
                        children: quantity
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "h-10 w-10 rounded-none hover:bg-primary/10",
                        onClick: () => setQuantity(Math.min(product.stock, quantity + 1)),
                        "data-ocid": "product_detail.quantity_increase_button",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
                    "Total:",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-primary", children: [
                      "৳",
                      (product.price * quantity).toLocaleString()
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "lg",
                    className: "w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm hover-lift transition-smooth",
                    onClick: handleAddToCart,
                    "data-ocid": "product_detail.add_to_cart_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 18 }),
                      " Add to Cart"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cart", className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "lg",
                      variant: "outline",
                      className: "w-full gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth",
                      "data-ocid": "product_detail.view_cart_button",
                      children: "View Cart"
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "lg",
                      variant: "ghost",
                      className: "gap-2 hover:text-primary transition-smooth",
                      "data-ocid": "product_detail.back_to_shop_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
                        " Back to Shop"
                      ]
                    }
                  ) })
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "p-5 bg-muted/40 rounded-2xl text-center border border-border",
                  "data-ocid": "product_detail.unavailable_state",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-3", children: "This product is currently unavailable. Check back soon!" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        className: "gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
                          " Continue Browsing"
                        ]
                      }
                    ) })
                  ]
                }
              )
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16", "data-ocid": "product_detail.reviews_section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 mb-8 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-1", children: "Customer Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl font-bold text-foreground flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 22, className: "text-primary" }),
              "Reviews",
              reviewCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-muted-foreground ml-1", children: [
                "(",
                reviewCount,
                ")"
              ] })
            ] })
          ] }),
          ratingDisplay != null && reviewCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl font-bold text-primary", children: ratingDisplay }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                StarRating,
                {
                  value: Math.round(avgRating),
                  size: 18,
                  readonly: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "out of 5 stars" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", "data-ocid": "product_detail.reviews_list", children: reviewsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "space-y-4",
              "data-ocid": "product_detail.reviews_loading_state",
              children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "bg-card border border-border rounded-xl p-5 space-y-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "w-9 h-9 rounded-full" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" })
                  ]
                },
                i
              ))
            }
          ) : reviews.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "text-center py-12 bg-card border border-dashed border-border rounded-xl",
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0 },
              "data-ocid": "product_detail.reviews_empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl mb-3", children: "✨" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-bold text-foreground text-lg mb-1", children: "Be the first to review this product!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Share your experience and help others decide." })
              ]
            }
          ) : reviews.map((review, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 10 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: i * 0.07 },
              "data-ocid": `product_detail.review_item.${i + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ReviewCard,
                {
                  reviewerName: review.reviewerName,
                  rating: review.rating,
                  text: review.text,
                  createdAt: review.createdAt
                }
              )
            },
            review.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { delay: 0.15 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewForm, { productId })
            }
          )
        ] })
      ] }),
      related.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16", "data-ocid": "product_detail.related_section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-2", children: "From the Same Collection" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "You May Also Like" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-5", children: related.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { delay: i * 0.1 },
            "data-ocid": `product_detail.related_item.${i + 1}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "overflow-hidden hover-lift border-border bg-card group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/shop/$productId", params: { productId: p.id }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square overflow-hidden bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: p.imageUrl,
                  alt: p.name,
                  className: "w-full h-full object-cover group-hover:scale-105 transition-smooth",
                  onError: (e) => {
                    e.target.src = "/assets/images/placeholder.svg";
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xs font-bold text-foreground uppercase tracking-wide line-clamp-2 mb-1 group-hover:text-primary transition-smooth", children: p.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-primary font-bold text-sm", children: [
                  "৳",
                  p.price.toLocaleString()
                ] })
              ] })
            ] }) })
          },
          p.id
        )) })
      ] })
    ] })
  ] });
}
export {
  ProductDetailPage as default
};

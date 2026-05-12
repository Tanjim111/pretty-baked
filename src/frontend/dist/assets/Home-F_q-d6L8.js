import { c as createLucideIcon, u as useProducts, a as useCategories, b as useGetSiteContent, d as useCartStore, j as jsxRuntimeExports, m as motion, B as Badge, L as Link, e as Button, S as ShoppingBag, f as Skeleton, g as ue } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { A as ArrowRight } from "./arrow-right-C093tOIt.js";
import { C as Clock } from "./clock-CQ7pTt6k.js";
import { T as Truck } from "./truck-h-OKdrKh.js";
import { S as Star } from "./star-3CDJmN0E.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
];
const Award = createLucideIcon("award", __iconNode$1);
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
      d: "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z",
      key: "1qvrer"
    }
  ],
  ["path", { d: "M6 17h12", key: "1jwigz" }]
];
const ChefHat = createLucideIcon("chef-hat", __iconNode);
const WHY_CHOOSE_US = [
  {
    icon: Clock,
    title: "Fresh Daily",
    desc: "Every item is baked fresh each morning — never frozen, never old.",
    color: "bg-primary/10"
  },
  {
    icon: ChefHat,
    title: "Custom Orders",
    desc: "We craft bespoke cakes, pastry boxes, and catering for every occasion.",
    color: "bg-secondary/20"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day delivery across Dhaka. Order before 2pm to get it today.",
    color: "bg-primary/5"
  },
  {
    icon: Award,
    title: "Quality Assured",
    desc: "Dhaka's best artisan bakery 2023, using only premium local ingredients.",
    color: "bg-primary/10"
  }
];
const CATEGORY_FALLBACK = {
  cakes: {
    image: "/assets/generated/product-chocolate-cake.dim_600x600.jpg",
    desc: "Celebration & custom"
  },
  pastries: {
    image: "/assets/generated/product-croissant.dim_600x600.jpg",
    desc: "French-style artisan"
  },
  breads: {
    image: "/assets/generated/product-sourdough.dim_600x600.jpg",
    desc: "Stone-baked loaves"
  },
  cookies: {
    image: "/assets/generated/product-butter-cookies.dim_600x600.jpg",
    desc: "Gift boxes & treats"
  },
  cheesecakes: {
    image: "/assets/generated/product-cheesecake.dim_600x600.jpg",
    desc: "Creamy & indulgent"
  },
  custom: {
    image: "/assets/generated/product-wedding-cake.dim_600x600.jpg",
    desc: "Weddings & events"
  },
  donuts: {
    image: "/assets/generated/product-chocolate-cake.dim_600x600.jpg",
    desc: "Freshly glazed daily"
  },
  cupcakes: {
    image: "/assets/generated/product-butter-cookies.dim_600x600.jpg",
    desc: "Fluffy buttercream"
  },
  savory: {
    image: "/assets/generated/product-sourdough.dim_600x600.jpg",
    desc: "Baked savory snacks"
  }
};
const WHATSAPP_URL = "https://wa.me/8801701965947?text=Hello%20Pretty%20Baked,%20I'd%20like%20to%20place%20an%20order!";
function HomePage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: siteContent } = useGetSiteContent();
  const addItem = useCartStore((s) => s.addItem);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", "data-ocid": "home.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: "relative min-h-screen flex items-center overflow-hidden bg-accent",
        "data-ocid": "home.hero_section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0",
              style: {
                backgroundImage: "url('/assets/generated/hero-bakery.dim_1400x900.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center 40%",
                opacity: 0.18
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-accent/95 via-accent/80 to-accent/30 dark:from-background/95 dark:via-background/80 dark:to-background/30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10 sm:py-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "mb-5 bg-primary/10 text-primary border border-primary/25 backdrop-blur-sm text-sm px-3 py-1", children: "🥐 Artisan Bakery Since 2010" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.h1,
              {
                className: "font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[1.05] mb-6",
                initial: { opacity: 0, y: 30 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.1 },
                children: [
                  "Pretty Baked",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Handcrafted" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "with Love"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.p,
              {
                className: "text-foreground/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg",
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.2 },
                children: "Baked to perfection every morning. Discover our curated collection of gourmet pastries, cakes, and artisan breads — made fresh with the finest local ingredients."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                className: "flex flex-col sm:flex-row gap-3",
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5, delay: 0.35 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "home.hero_shop_button", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "lg",
                      className: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-elevated hover-lift px-8 text-base",
                      children: [
                        "Shop Now ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 18 })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#featured", "data-ocid": "home.hero_explore_button", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "lg",
                      variant: "outline",
                      className: "border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-smooth px-8 text-base",
                      children: [
                        "Explore Menu ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 18 })
                      ]
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "mt-10 sm:mt-12 flex gap-6 sm:gap-8 flex-wrap",
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { delay: 0.5, duration: 0.6 },
                children: [
                  {
                    val: (siteContent == null ? void 0 : siteContent.ourStoryYearsOfCraft) ?? "5+",
                    lbl: "Years"
                  },
                  {
                    val: (siteContent == null ? void 0 : siteContent.ourStoryProductCount) ?? "200+",
                    lbl: "Products"
                  },
                  {
                    val: (siteContent == null ? void 0 : siteContent.ourStoryHappyCustomers) ?? "50K+",
                    lbl: "Customers"
                  }
                ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-foreground/90", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl font-bold text-primary", children: s.val }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 uppercase tracking-widest", children: s.lbl })
                ] }, s.lbl))
              }
            )
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "bg-card border-y border-border py-16",
        "data-ocid": "home.why_us_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "text-center mb-12",
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-2", children: "Why Pretty Baked" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl md:text-4xl font-bold text-foreground", children: "Baked with Purpose" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5", children: WHY_CHOOSE_US.map((f, i) => {
            const Icon = f.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                className: "group p-6 rounded-2xl bg-background border border-border shadow-warm hover-lift text-center",
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { delay: i * 0.1 },
                "data-ocid": `home.why_us_item.${i + 1}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `w-12 h-12 mx-auto rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 22, className: "text-primary" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-2", children: f.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: f.desc })
                ]
              },
              f.title
            );
          }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "py-14 bg-muted/30",
        "data-ocid": "home.categories_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "text-center mb-8",
              initial: { opacity: 0, y: 16 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-2", children: "Browse by Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold text-foreground", children: "Our Categories" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4", children: categories.map((cat, i) => {
            const fallback = CATEGORY_FALLBACK[cat.slug];
            const image = cat.imageUrl || (fallback == null ? void 0 : fallback.image) || "/assets/images/placeholder.svg";
            const desc = cat.description || (fallback == null ? void 0 : fallback.desc) || "";
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.95 },
                whileInView: { opacity: 1, scale: 1 },
                viewport: { once: true },
                transition: { delay: i * 0.08 },
                "data-ocid": `home.category_item.${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: "/shop",
                    className: "block group rounded-2xl overflow-hidden hover-lift",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-32 sm:h-36 md:h-40 flex flex-col items-center justify-end overflow-hidden", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: image,
                          alt: cat.name,
                          className: "absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-smooth",
                          onError: (e) => {
                            e.target.style.display = "none";
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 text-center pb-3 px-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-bold text-white text-sm leading-none", children: cat.name }),
                        desc && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/70 text-[10px] mt-0.5", children: desc })
                      ] })
                    ] })
                  }
                )
              },
              cat.id
            );
          }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        id: "featured",
        className: "py-16 bg-background",
        "data-ocid": "home.featured_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "text-center mb-10",
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-2", children: "Handpicked for You" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl md:text-4xl font-bold text-foreground", children: "Our Signature Collection" })
              ]
            }
          ),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6", children: ["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-56 w-full rounded-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 mx-auto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/3 mx-auto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" })
          ] }, k)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6",
              "data-ocid": "home.featured_list",
              children: featured.map((product, i) => {
                var _a;
                const catName = ((_a = categories.find((c) => c.id === product.category)) == null ? void 0 : _a.name) ?? "";
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 30 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true },
                    transition: { delay: i * 0.08 },
                    "data-ocid": `home.featured_item.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group overflow-hidden border-border hover-lift cursor-pointer bg-card h-full flex flex-col rounded-2xl shadow-warm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/3] overflow-hidden rounded-t-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: product.imageUrl,
                            alt: product.name,
                            className: "w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500",
                            onError: (e) => {
                              e.target.src = "/assets/images/placeholder.svg";
                            }
                          }
                        ) }),
                        catName && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "absolute top-2 left-2 text-[10px] bg-primary/90 text-primary-foreground backdrop-blur-sm", children: catName }),
                        product.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "absolute top-2 right-2 text-[10px] bg-primary/10 text-primary border border-primary/25 backdrop-blur-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Star,
                            {
                              size: 8,
                              className: "mr-1",
                              fill: "currentColor"
                            }
                          ),
                          "Featured"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-2 flex flex-col flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Link,
                          {
                            to: "/shop/$productId",
                            params: { productId: product.id },
                            className: "flex-1",
                            "data-ocid": `home.featured_view_link.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xs md:text-sm font-bold text-foreground text-center uppercase tracking-wide leading-tight mb-1 line-clamp-2 hover:text-primary transition-smooth", children: product.name })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] text-muted-foreground line-clamp-1 mb-1.5", children: product.description }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center font-display font-bold text-primary text-base mb-2.5", children: [
                          "৳",
                          product.price.toLocaleString()
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 mt-auto", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(
                            Button,
                            {
                              size: "sm",
                              className: "flex-1 text-[11px] h-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-1 transition-smooth rounded-lg",
                              onClick: () => handleAddToCart(product),
                              "data-ocid": `home.add_to_cart_button.${i + 1}`,
                              children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 11 }),
                                " Add to Cart"
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Link,
                            {
                              to: "/shop/$productId",
                              params: { productId: product.id },
                              "data-ocid": `home.view_details_link.${i + 1}`,
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Button,
                                {
                                  size: "sm",
                                  variant: "outline",
                                  className: "text-[11px] h-7 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth px-2 rounded-lg",
                                  children: "Details"
                                }
                              )
                            }
                          )
                        ] })
                      ] })
                    ] })
                  },
                  product.id
                );
              })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "home.view_all_button", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "lg",
              className: "gap-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-smooth hover-lift px-8",
              children: [
                "View All Products ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
              ]
            }
          ) }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        id: "about",
        className: "py-16 bg-muted/30 border-t border-border",
        "data-ocid": "home.about_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "rounded-2xl overflow-hidden shadow-elevated aspect-[4/3]",
              initial: { opacity: 0, x: -30 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true },
              transition: { duration: 0.6 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: (siteContent == null ? void 0 : siteContent.ourStoryImageUrl) || "/assets/generated/about-bakery.dim_800x600.jpg",
                  alt: "Pretty Baked kitchen",
                  className: "w-full h-full object-cover",
                  onError: (e) => {
                    e.target.src = "/assets/generated/hero-bakery.dim_1400x900.jpg";
                  }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: 30 },
              whileInView: { opacity: 1, x: 0 },
              viewport: { once: true },
              transition: { duration: 0.6, delay: 0.1 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-widest text-primary mb-3", children: "Our Story" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-3xl md:text-4xl font-bold text-foreground mb-5", children: [
                  "Baking with Heart",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "Since 2010"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed mb-4", children: "Pretty Baked was born from a simple belief: great food starts with great ingredients and genuine care. Our master bakers bring decades of tradition and a passion for innovation to every creation — from our daily-baked croissants to elaborate wedding cakes." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed mb-6", children: "Every item that leaves our kitchen in Dhaka meets our highest standards of taste, quality, and presentation. We source locally, bake seasonally, and deliver with love." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [
                  {
                    value: (siteContent == null ? void 0 : siteContent.ourStoryYearsOfCraft) ?? "5+",
                    label: "Years of Craft"
                  },
                  {
                    value: (siteContent == null ? void 0 : siteContent.ourStoryProductCount) ?? "200+",
                    label: "Products"
                  },
                  {
                    value: (siteContent == null ? void 0 : siteContent.ourStoryHappyCustomers) ?? "50K+",
                    label: "Happy Customers"
                  }
                ].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "text-center p-3 bg-card rounded-xl border border-border shadow-warm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-2xl font-bold text-primary", children: stat.value }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: stat.label })
                    ]
                  },
                  stat.label
                )) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth",
                    "data-ocid": "home.about_shop_button",
                    children: [
                      "Explore Our Menu ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
                    ]
                  }
                ) })
              ]
            }
          )
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        id: "contact",
        className: "py-16 relative overflow-hidden bg-primary",
        "data-ocid": "home.contact_section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-widest text-black/70 dark:text-white/70 mb-3", children: "Special Occasions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl md:text-4xl font-bold text-black dark:text-white mb-4", children: "Order Custom Creations" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-black/80 dark:text-white/80 text-lg mb-8 max-w-2xl mx-auto", children: "Have a special occasion? We create bespoke cakes, pastry boxes, and catering packages for every celebration — weddings, birthdays, and corporate events." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", "data-ocid": "home.cta_shop_button", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "lg",
                    className: "bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-bold gap-2 hover-lift shadow-elevated px-8",
                    children: [
                      "Start Shopping ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 18 })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "tel:+8801701965947", "data-ocid": "home.cta_call_button", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "lg",
                    variant: "outline",
                    className: "border-black/50 dark:border-white/50 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-smooth px-8",
                    children: "📞 Call Us Now"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: WHATSAPP_URL,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "data-ocid": "home.cta_whatsapp_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        size: "lg",
                        className: "font-bold gap-2 hover-lift shadow-elevated px-8 text-white transition-smooth",
                        style: { backgroundColor: "#25D366", borderColor: "#25D366" },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "svg",
                            {
                              viewBox: "0 0 24 24",
                              width: "18",
                              height: "18",
                              fill: "currentColor",
                              "aria-hidden": "true",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" })
                            }
                          ),
                          "WhatsApp Us"
                        ]
                      }
                    )
                  }
                )
              ] })
            ]
          }
        ) })
      }
    )
  ] });
}
export {
  HomePage as default
};

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  ChefHat,
  Clock,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useCategories,
  useGetSiteContent,
  useProducts,
} from "../hooks/useBackend";
import { useCartStore } from "../store/cartStore";

const WHY_CHOOSE_US = [
  {
    icon: Clock,
    title: "Fresh Daily",
    desc: "Every item is baked fresh each morning — never frozen, never old.",
    color: "bg-primary/10",
  },
  {
    icon: ChefHat,
    title: "Custom Orders",
    desc: "We craft bespoke cakes, pastry boxes, and catering for every occasion.",
    color: "bg-secondary/20",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day delivery across Dhaka. Order before 2pm to get it today.",
    color: "bg-primary/5",
  },
  {
    icon: Award,
    title: "Quality Assured",
    desc: "Dhaka's best artisan bakery 2023, using only premium local ingredients.",
    color: "bg-primary/10",
  },
];

// Static fallback images keyed by category slug
const CATEGORY_FALLBACK: Record<string, { image: string; desc: string }> = {
  cakes: {
    image: "/assets/generated/product-chocolate-cake.dim_600x600.jpg",
    desc: "Celebration & custom",
  },
  pastries: {
    image: "/assets/generated/product-croissant.dim_600x600.jpg",
    desc: "French-style artisan",
  },
  breads: {
    image: "/assets/generated/product-sourdough.dim_600x600.jpg",
    desc: "Stone-baked loaves",
  },
  cookies: {
    image: "/assets/generated/product-butter-cookies.dim_600x600.jpg",
    desc: "Gift boxes & treats",
  },
  cheesecakes: {
    image: "/assets/generated/product-cheesecake.dim_600x600.jpg",
    desc: "Creamy & indulgent",
  },
  custom: {
    image: "/assets/generated/product-wedding-cake.dim_600x600.jpg",
    desc: "Weddings & events",
  },
  donuts: {
    image: "/assets/generated/product-chocolate-cake.dim_600x600.jpg",
    desc: "Freshly glazed daily",
  },
  cupcakes: {
    image: "/assets/generated/product-butter-cookies.dim_600x600.jpg",
    desc: "Fluffy buttercream",
  },
  savory: {
    image: "/assets/generated/product-sourdough.dim_600x600.jpg",
    desc: "Baked savory snacks",
  },
};

const WHATSAPP_URL =
  "https://wa.me/8801701965947?text=Hello%20Pretty%20Baked,%20I'd%20like%20to%20place%20an%20order!";

export default function HomePage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: siteContent } = useGetSiteContent();
  const addItem = useCartStore((s) => s.addItem);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);

  function handleAddToCart(product: (typeof products)[0]) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart!`);
  }

  return (
    <div className="flex flex-col" data-ocid="home.page">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden bg-accent"
        data-ocid="home.hero_section"
      >
        {/* Hero background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bakery.dim_1400x900.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            opacity: 0.18,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/95 via-accent/80 to-accent/30 dark:from-background/95 dark:via-background/80 dark:to-background/30" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-10 sm:py-14">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-5 bg-primary/10 text-primary border border-primary/25 backdrop-blur-sm text-sm px-3 py-1">
                🥐 Artisan Bakery Since 2010
              </Badge>
            </motion.div>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[1.05] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Pretty Baked
              <br />
              <span className="text-primary">Handcrafted</span>
              <br />
              with Love
            </motion.h1>

            <motion.p
              className="text-foreground/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Baked to perfection every morning. Discover our curated collection
              of gourmet pastries, cakes, and artisan breads — made fresh with
              the finest local ingredients.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Link to="/shop" data-ocid="home.hero_shop_button">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2 shadow-elevated hover-lift px-8 text-base"
                >
                  Shop Now <ShoppingBag size={18} />
                </Button>
              </Link>
              <a href="#featured" data-ocid="home.hero_explore_button">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-smooth px-8 text-base"
                >
                  Explore Menu <ArrowRight size={18} />
                </Button>
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              className="mt-10 sm:mt-12 flex gap-6 sm:gap-8 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {[
                {
                  val: siteContent?.ourStoryYearsOfCraft ?? "5+",
                  lbl: "Years",
                },
                {
                  val: siteContent?.ourStoryProductCount ?? "200+",
                  lbl: "Products",
                },
                {
                  val: siteContent?.ourStoryHappyCustomers ?? "50K+",
                  lbl: "Customers",
                },
              ].map((s) => (
                <div key={s.lbl} className="text-foreground/90">
                  <p className="font-display text-2xl font-bold text-primary">
                    {s.val}
                  </p>
                  <p className="text-xs text-foreground/50 uppercase tracking-widest">
                    {s.lbl}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <section
        className="bg-card border-y border-border py-16"
        data-ocid="home.why_us_section"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
              Why Pretty Baked
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Baked with Purpose
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {WHY_CHOOSE_US.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="group p-6 rounded-2xl bg-background border border-border shadow-warm hover-lift text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`home.why_us_item.${i + 1}`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}
                  >
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Category Strips ──────────────────────────────────── */}
      <section
        className="py-14 bg-muted/30"
        data-ocid="home.categories_section"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
              Browse by Type
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Our Categories
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, i) => {
              const fallback = CATEGORY_FALLBACK[cat.slug];
              const image =
                cat.imageUrl ||
                fallback?.image ||
                "/assets/images/placeholder.svg";
              const desc = cat.description || fallback?.desc || "";
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  data-ocid={`home.category_item.${i + 1}`}
                >
                  <Link
                    to="/shop"
                    className="block group rounded-2xl overflow-hidden hover-lift"
                  >
                    <div className="relative h-32 sm:h-36 md:h-40 flex flex-col items-center justify-end overflow-hidden">
                      <img
                        src={image}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-smooth"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="relative z-10 text-center pb-3 px-2">
                        <p className="font-display font-bold text-white text-sm leading-none">
                          {cat.name}
                        </p>
                        {desc && (
                          <p className="text-white/70 text-[10px] mt-0.5">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section
        id="featured"
        className="py-16 bg-background"
        data-ocid="home.featured_section"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
              Handpicked for You
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Our Signature Collection
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {(["a", "b", "c", "d", "e", "f", "g", "h"] as const).map((k) => (
                <div key={k} className="space-y-3">
                  <Skeleton className="h-56 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/3 mx-auto" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
              data-ocid="home.featured_list"
            >
              {featured.map((product, i) => {
                const catName =
                  categories.find((c) => c.id === product.category)?.name ?? "";
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    data-ocid={`home.featured_item.${i + 1}`}
                  >
                    <Card className="group overflow-hidden border-border hover-lift cursor-pointer bg-card h-full flex flex-col rounded-2xl shadow-warm">
                      <div className="relative overflow-hidden">
                        <div className="aspect-[4/3] overflow-hidden rounded-t-2xl">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/images/placeholder.svg";
                            }}
                          />
                        </div>
                        {catName && (
                          <Badge className="absolute top-2 left-2 text-[10px] bg-primary/90 text-primary-foreground backdrop-blur-sm">
                            {catName}
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="absolute top-2 right-2 text-[10px] bg-primary/10 text-primary border border-primary/25 backdrop-blur-sm">
                            <Star
                              size={8}
                              className="mr-1"
                              fill="currentColor"
                            />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-2 flex flex-col flex-1">
                        <Link
                          to="/shop/$productId"
                          params={{ productId: product.id }}
                          className="flex-1"
                          data-ocid={`home.featured_view_link.${i + 1}`}
                        >
                          <h3 className="font-display text-xs md:text-sm font-bold text-foreground text-center uppercase tracking-wide leading-tight mb-1 line-clamp-2 hover:text-primary transition-smooth">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-center text-[11px] text-muted-foreground line-clamp-1 mb-1.5">
                          {product.description}
                        </p>
                        <p className="text-center font-display font-bold text-primary text-base mb-2.5">
                          ৳{product.price.toLocaleString()}
                        </p>
                        <div className="flex gap-1.5 mt-auto">
                          <Button
                            size="sm"
                            className="flex-1 text-[11px] h-7 bg-primary hover:bg-primary/90 text-primary-foreground gap-1 transition-smooth rounded-lg"
                            onClick={() => handleAddToCart(product)}
                            data-ocid={`home.add_to_cart_button.${i + 1}`}
                          >
                            <ShoppingBag size={11} /> Add to Cart
                          </Button>
                          <Link
                            to="/shop/$productId"
                            params={{ productId: product.id }}
                            data-ocid={`home.view_details_link.${i + 1}`}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth px-2 rounded-lg"
                            >
                              Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/shop" data-ocid="home.view_all_button">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-primary/30 hover:bg-primary hover:text-primary-foreground transition-smooth hover-lift px-8"
              >
                View All Products <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── About Section ────────────────────────────────────── */}
      <section
        id="about"
        className="py-16 bg-muted/30 border-t border-border"
        data-ocid="home.about_section"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              className="rounded-2xl overflow-hidden shadow-elevated aspect-[4/3]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={
                  siteContent?.ourStoryImageUrl ||
                  "/assets/generated/about-bakery.dim_800x600.jpg"
                }
                alt="Pretty Baked kitchen"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/generated/hero-bakery.dim_1400x900.jpg";
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Our Story
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5">
                Baking with Heart
                <br />
                Since 2010
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pretty Baked was born from a simple belief: great food starts
                with great ingredients and genuine care. Our master bakers bring
                decades of tradition and a passion for innovation to every
                creation — from our daily-baked croissants to elaborate wedding
                cakes.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every item that leaves our kitchen in Dhaka meets our highest
                standards of taste, quality, and presentation. We source
                locally, bake seasonally, and deliver with love.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  {
                    value: siteContent?.ourStoryYearsOfCraft ?? "5+",
                    label: "Years of Craft",
                  },
                  {
                    value: siteContent?.ourStoryProductCount ?? "200+",
                    label: "Products",
                  },
                  {
                    value: siteContent?.ourStoryHappyCustomers ?? "50K+",
                    label: "Happy Customers",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-3 bg-card rounded-xl border border-border shadow-warm"
                  >
                    <p className="font-display text-2xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/shop">
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth"
                  data-ocid="home.about_shop_button"
                >
                  Explore Our Menu <ArrowRight size={16} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section
        id="contact"
        className="py-16 relative overflow-hidden bg-primary"
        data-ocid="home.contact_section"
      >
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm uppercase tracking-widest text-black/70 dark:text-white/70 mb-3">
              Special Occasions
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Order Custom Creations
            </h2>
            <p className="text-black/80 dark:text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Have a special occasion? We create bespoke cakes, pastry boxes,
              and catering packages for every celebration — weddings, birthdays,
              and corporate events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Link to="/shop" data-ocid="home.cta_shop_button">
                <Button
                  size="lg"
                  className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary font-bold gap-2 hover-lift shadow-elevated px-8"
                >
                  Start Shopping <ShoppingBag size={18} />
                </Button>
              </Link>
              <a href="tel:+8801701965947" data-ocid="home.cta_call_button">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-black/50 dark:border-white/50 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-smooth px-8"
                >
                  📞 Call Us Now
                </Button>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="home.cta_whatsapp_button"
              >
                <Button
                  size="lg"
                  className="font-bold gap-2 hover-lift shadow-elevated px-8 text-white transition-smooth"
                  style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

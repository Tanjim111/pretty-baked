import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  OrderStatus as BackendOrderStatus,
  DiscountType,
  PaymentMethod,
} from "../backend";
import type {
  AdminUserUpdate,
  AdminUserView,
  Category,
  Coupon,
  CouponInput,
  Order,
  Product,
  PromoAnnouncement,
  Review,
  SiteContent,
} from "../types";
import { getSharedActor, getSharedActorSync } from "../utils/backendActor";

// ---------------------------------------------------------------------------
// Actor accessors — delegate to the single shared actor module.
// This eliminates the independent retry system that was previously here and
// caused "Backend not ready" errors when both useBackend and useAuth each ran
// their own 30-second loops that could exhaust before injection.
// ---------------------------------------------------------------------------

// Synchronous getter — only for optional/best-effort calls (chat, etc.)
function backendActorSync(): import("../backend").backendInterface | null {
  return getSharedActorSync();
}

// Async getter with full retry — use for all real data operations
async function requireActor(): Promise<import("../backend").backendInterface> {
  return getSharedActor();
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ADMIN_LS_KEY = "pretty-baked-admin-claimed";
const ADMIN_EMAIL = "tanjimtazwor7777@gmail.com";
const ADMIN_PASSWORD = "@Escapethematrix1";

// ---------------------------------------------------------------------------
// Type-mapping helpers (Backend bigint types ↔ Frontend string/number types)
//
// The canister Product uses bigint IDs, bigint price, and stores frontend-only
// fields (imageUrl, stock, isAvailable, isFeatured, sku) encoded in the
// ingredients array as a JSON string in the first element.
//
// The canister Category stores the frontend slug inside the description field
// as "slug:<value>|<description>".
// ---------------------------------------------------------------------------

interface FrontendMeta {
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  sku: string;
}

function encodeMeta(meta: FrontendMeta): string {
  return JSON.stringify(meta);
}

function decodeMeta(ingredients: string[]): FrontendMeta {
  if (ingredients.length > 0) {
    try {
      const parsed = JSON.parse(ingredients[0]) as Partial<FrontendMeta>;
      return {
        imageUrl: parsed.imageUrl ?? "/assets/images/placeholder.svg",
        stock: parsed.stock ?? 10,
        isAvailable: parsed.isAvailable ?? true,
        isFeatured: parsed.isFeatured ?? false,
        sku: parsed.sku ?? "",
      };
    } catch {
      // fallthrough
    }
  }
  return {
    imageUrl: "/assets/images/placeholder.svg",
    stock: 10,
    isAvailable: true,
    isFeatured: false,
    sku: "",
  };
}

function encodeCategory(
  name: string,
  slug: string,
  description: string,
  displayOrder: number,
  imageUrl?: string,
): import("../backend").CategoryInput {
  // Format: slug:<slug>|imageUrl:<url>|<description>
  // imageUrl segment is optional — only written when an image is provided
  let encoded = `slug:${slug}|`;
  if (imageUrl) {
    encoded += `imageUrl:${imageUrl}|`;
  }
  encoded += description;
  return {
    name,
    description: encoded,
    displayOrder: BigInt(displayOrder),
  };
}

function decodeCategoryDescription(raw: string): {
  slug: string;
  description: string;
  imageUrl?: string;
} {
  if (raw.startsWith("slug:")) {
    const rest = raw.slice(5);
    // rest = "<slug>|imageUrl:<url>|<description>"  or  "<slug>|<description>"
    const firstPipe = rest.indexOf("|");
    if (firstPipe === -1) {
      return { slug: rest, description: "" };
    }
    const slug = rest.slice(0, firstPipe);
    const remainder = rest.slice(firstPipe + 1);

    if (remainder.startsWith("imageUrl:")) {
      const afterImageUrl = remainder.slice("imageUrl:".length);
      // The imageUrl itself may contain "|", but we stop at the NEXT "|" that
      // is followed by plain description text (not a data URL or http URL).
      // Strategy: find the pipe that separates imageUrl from description.
      // Data URLs never contain "|", so the first "|" after "imageUrl:" is the separator.
      const imgPipe = afterImageUrl.indexOf("|");
      if (imgPipe === -1) {
        return { slug, imageUrl: afterImageUrl, description: "" };
      }
      return {
        slug,
        imageUrl: afterImageUrl.slice(0, imgPipe),
        description: afterImageUrl.slice(imgPipe + 1),
      };
    }

    return { slug, description: remainder };
  }
  // Legacy: no slug encoding — derive slug from name
  return { slug: "", description: raw };
}

function mapCanisterProduct(cp: import("../backend").Product): Product {
  const meta = decodeMeta(cp.ingredients);
  // Actual ingredients are stored from index 1 onwards
  const ingredients = cp.ingredients.slice(1);
  return {
    id: cp.id.toString(),
    name: cp.name,
    description: cp.description,
    price: Number(cp.price),
    category: cp.category.toString(),
    imageUrl: meta.imageUrl,
    stock: meta.stock,
    isAvailable: meta.isAvailable,
    isFeatured: meta.isFeatured,
    sku: meta.sku || `SKU${cp.id}`,
    createdAt: Number(cp.createdAt),
    ingredients,
  };
}

function mapCanisterCategory(cc: import("../backend").Category): Category {
  const { slug, description, imageUrl } = decodeCategoryDescription(
    cc.description,
  );
  const derivedSlug =
    slug ||
    cc.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  return {
    id: cc.id.toString(),
    name: cc.name,
    slug: derivedSlug,
    description: description || undefined,
    imageUrl: imageUrl || undefined,
  };
}

// ---------------------------------------------------------------------------
// Sample data — seeded into the canister on first use if it is empty
// ---------------------------------------------------------------------------
const SEED_CATEGORIES = [
  {
    name: "Cakes",
    slug: "cakes",
    description: "Freshly baked celebration & premium cakes",
  },
  {
    name: "Pastries",
    slug: "pastries",
    description: "Artisan French-style pastries & rolls",
  },
  {
    name: "Breads",
    slug: "breads",
    description: "Stone-baked artisan breads & loaves",
  },
  {
    name: "Cookies",
    slug: "cookies",
    description: "Handcrafted cookies & baked treats",
  },
  {
    name: "Cheesecakes",
    slug: "cheesecakes",
    description: "Rich and creamy cheesecakes",
  },
  {
    name: "Custom Orders",
    slug: "custom",
    description: "Bespoke cakes for weddings & events",
  },
  {
    name: "Donuts",
    slug: "donuts",
    description: "Freshly glazed donuts in irresistible flavours",
  },
  {
    name: "Cupcakes",
    slug: "cupcakes",
    description: "Moist cupcakes topped with fluffy buttercream frosting",
  },
  {
    name: "Savory Items",
    slug: "savory",
    description: "Freshly baked savory snacks & naan breads",
  },
];

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  categoryIndex: number; // 0-based index into SEED_CATEGORIES
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  sku: string;
  ingredients: string[];
}

const SEED_PRODUCTS: SeedProduct[] = [
  // ── Cakes (categoryIndex: 0) ────────────────────────────────────────────────
  {
    name: "Chocolate Cake",
    description:
      "Rich, decadent chocolate cake with velvety fudge frosting and dark chocolate ganache drizzle.",
    price: 800,
    categoryIndex: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    stock: 15,
    isAvailable: true,
    isFeatured: true,
    sku: "CFC001",
    ingredients: [
      "all-purpose flour",
      "cocoa powder",
      "eggs",
      "unsalted butter",
      "granulated sugar",
      "heavy cream",
      "dark chocolate",
      "vanilla extract",
      "baking powder",
      "salt",
    ],
  },
  {
    name: "Red Velvet Cake",
    description:
      "Classic red velvet with cream cheese frosting. Moist, beautiful, and utterly irresistible.",
    price: 900,
    categoryIndex: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1586788680434-30d324626f39?w=400",
    stock: 10,
    isAvailable: true,
    isFeatured: true,
    sku: "RVC002",
    ingredients: [
      "all-purpose flour",
      "cocoa powder",
      "buttermilk",
      "red food coloring",
      "unsalted butter",
      "eggs",
      "granulated sugar",
      "cream cheese",
      "powdered sugar",
      "vanilla extract",
    ],
  },
  {
    name: "Vanilla Cake",
    description:
      "Light and airy vanilla sponge with Swiss meringue buttercream, infused with real vanilla bean.",
    price: 700,
    categoryIndex: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
    stock: 12,
    isAvailable: true,
    isFeatured: false,
    sku: "VBC003",
    ingredients: [
      "all-purpose flour",
      "eggs",
      "unsalted butter",
      "granulated sugar",
      "vanilla bean paste",
      "whole milk",
      "baking powder",
      "salt",
      "egg whites",
    ],
  },
  {
    name: "Black Forest Cake",
    description:
      "Layers of moist chocolate sponge, whipped cream, and Morello cherries. A timeless German classic.",
    price: 950,
    categoryIndex: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    stock: 8,
    isAvailable: true,
    isFeatured: true,
    sku: "BFC009",
    ingredients: [
      "chocolate sponge",
      "heavy cream",
      "morello cherries",
      "kirsch",
      "dark chocolate shavings",
      "cocoa powder",
      "granulated sugar",
      "eggs",
      "all-purpose flour",
    ],
  },
  // ── Pastries (categoryIndex: 1) ────────────────────────────────────────────
  {
    name: "Butter Croissant",
    description:
      "Flaky, golden-brown croissant made with 100% pure butter. Baked fresh every morning.",
    price: 100,
    categoryIndex: 1,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    stock: 40,
    isAvailable: true,
    isFeatured: true,
    sku: "BCC004",
    ingredients: [
      "all-purpose flour",
      "pure European butter",
      "active dry yeast",
      "whole milk",
      "salt",
      "granulated sugar",
      "egg wash",
    ],
  },
  {
    name: "Pastry",
    description:
      "Classic French Napoleon pastry with layers of crispy puff pastry and silky pastry cream.",
    price: 110,
    categoryIndex: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    stock: 18,
    isAvailable: true,
    isFeatured: false,
    sku: "PST008",
    ingredients: [
      "puff pastry dough",
      "whole milk",
      "egg yolks",
      "granulated sugar",
      "cornstarch",
      "unsalted butter",
      "vanilla bean",
      "powdered sugar",
    ],
  },
  {
    name: "Eclair",
    description:
      "Classic French éclair filled with silky vanilla pastry cream and topped with rich chocolate glaze.",
    price: 160,
    categoryIndex: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400",
    stock: 20,
    isAvailable: true,
    isFeatured: true,
    sku: "ECL015",
    ingredients: [
      "choux pastry",
      "all-purpose flour",
      "eggs",
      "unsalted butter",
      "whole milk",
      "vanilla bean",
      "dark chocolate",
      "heavy cream",
      "powdered sugar",
    ],
  },
  {
    name: "Lemon Bar",
    description:
      "Zesty lemon curd on a buttery shortbread base, dusted with powdered sugar. A bright, tangy treat.",
    price: 110,
    categoryIndex: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1606313564004-4cb8b5a4e6ea?w=400",
    stock: 25,
    isAvailable: true,
    isFeatured: false,
    sku: "LMB016",
    ingredients: [
      "all-purpose flour",
      "unsalted butter",
      "powdered sugar",
      "fresh lemon juice",
      "lemon zest",
      "eggs",
      "granulated sugar",
      "cornstarch",
      "salt",
    ],
  },
  // ── Breads (categoryIndex: 2) ──────────────────────────────────────────────
  {
    name: "Garlic Bread",
    description:
      "Stone-baked loaf generously rubbed with roasted garlic butter and fresh herbs. Crispy outside, soft inside.",
    price: 120,
    categoryIndex: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400",
    stock: 20,
    isAvailable: true,
    isFeatured: false,
    sku: "GAB005",
    ingredients: [
      "bread flour",
      "water",
      "salt",
      "roasted garlic",
      "fresh rosemary",
      "olive oil",
      "yeast",
      "unsalted butter",
    ],
  },
  {
    name: "Classic Sourdough Loaf",
    description:
      "Slow-fermented artisan sourdough with a thick crackly crust and chewy open crumb. Made with love over 48 hours.",
    price: 180,
    categoryIndex: 2,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    stock: 15,
    isAvailable: true,
    isFeatured: true,
    sku: "SOD011",
    ingredients: [
      "sourdough starter",
      "bread flour",
      "whole wheat flour",
      "water",
      "sea salt",
    ],
  },
  // ── Cookies (categoryIndex: 3) ─────────────────────────────────────────────
  {
    name: "Butter Cookies",
    description:
      "Melt-in-your-mouth butter cookies in an elegant gift box. Perfect for gifting or indulging.",
    price: 350,
    categoryIndex: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
    stock: 30,
    isAvailable: true,
    isFeatured: true,
    sku: "BCB006",
    ingredients: [
      "unsalted butter",
      "powdered sugar",
      "all-purpose flour",
      "eggs",
      "vanilla extract",
      "salt",
    ],
  },
  {
    name: "Macaron (Box of 6)",
    description:
      "Delicate Parisian macarons in assorted flavours — rose, pistachio, chocolate, and salted caramel.",
    price: 180,
    categoryIndex: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400",
    stock: 20,
    isAvailable: true,
    isFeatured: true,
    sku: "MAC013",
    ingredients: [
      "almond flour",
      "powdered sugar",
      "egg whites",
      "granulated sugar",
      "unsalted butter",
      "food coloring",
      "flavour extracts",
    ],
  },
  {
    name: "Brownie",
    description:
      "Fudgy, dense chocolate brownie with a shiny crackled top. Made with Belgian dark chocolate.",
    price: 130,
    categoryIndex: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1606312619070-d48b0c7e6888?w=400",
    stock: 28,
    isAvailable: true,
    isFeatured: false,
    sku: "BRW017",
    ingredients: [
      "Belgian dark chocolate",
      "unsalted butter",
      "granulated sugar",
      "eggs",
      "all-purpose flour",
      "cocoa powder",
      "vanilla extract",
      "salt",
      "walnuts (optional)",
    ],
  },
  // ── Cheesecakes (categoryIndex: 4) ────────────────────────────────────────
  {
    name: "New York Cheesecake",
    description:
      "Dense, velvety New York-style cheesecake on a buttery graham cracker crust with fresh berry coulis.",
    price: 900,
    categoryIndex: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
    stock: 12,
    isAvailable: true,
    isFeatured: true,
    sku: "NYC014",
    ingredients: [
      "cream cheese",
      "sour cream",
      "eggs",
      "granulated sugar",
      "vanilla extract",
      "graham crackers",
      "unsalted butter",
      "mixed berries",
      "lemon zest",
    ],
  },
  // ── Custom Orders (categoryIndex: 5) ──────────────────────────────────────
  {
    name: "Custom Wedding Cake",
    description:
      "Bespoke wedding cakes crafted to your vision. Multi-tier, fondant or buttercream — made with love.",
    price: 3500,
    categoryIndex: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400",
    stock: 5,
    isAvailable: true,
    isFeatured: true,
    sku: "CWC007",
    ingredients: [
      "vanilla sponge",
      "fondant",
      "buttercream",
      "sugar flowers",
      "gold leaf",
      "edible pearls",
      "premium flavours of your choice",
    ],
  },
  // ── Donuts (categoryIndex: 6) ──────────────────────────────────────────────
  {
    name: "Chocolate Glazed Donut",
    description:
      "Fluffy yeast donut dipped in rich dark chocolate glaze. A classic Dhaka bakery favourite.",
    price: 90,
    categoryIndex: 6,
    imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
    stock: 35,
    isAvailable: true,
    isFeatured: true,
    sku: "CGD018",
    ingredients: [
      "all-purpose flour",
      "yeast",
      "whole milk",
      "eggs",
      "unsalted butter",
      "granulated sugar",
      "dark chocolate",
      "heavy cream",
      "vanilla extract",
      "salt",
    ],
  },
  {
    name: "Strawberry Frosted Donut",
    description:
      "Light, airy donut crowned with vibrant strawberry icing and colorful sprinkles.",
    price: 95,
    categoryIndex: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400",
    stock: 30,
    isAvailable: true,
    isFeatured: true,
    sku: "SFD019",
    ingredients: [
      "all-purpose flour",
      "yeast",
      "whole milk",
      "eggs",
      "unsalted butter",
      "granulated sugar",
      "strawberry jam",
      "powdered sugar",
      "food coloring",
      "rainbow sprinkles",
    ],
  },
  {
    name: "Glazed Ring Donut",
    description:
      "Perfectly golden ring donut with a shiny sweet glaze. Simple, satisfying, and always fresh.",
    price: 80,
    categoryIndex: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1624379440810-0e82a78bfe8e?w=400",
    stock: 40,
    isAvailable: true,
    isFeatured: false,
    sku: "GRD020",
    ingredients: [
      "all-purpose flour",
      "yeast",
      "whole milk",
      "eggs",
      "unsalted butter",
      "granulated sugar",
      "powdered sugar glaze",
      "vanilla extract",
      "salt",
    ],
  },
  // ── Cupcakes (categoryIndex: 7) ────────────────────────────────────────────
  {
    name: "Red Velvet Cupcake",
    description:
      "Moist red velvet cupcake with a generous swirl of cream cheese frosting and red velvet crumble.",
    price: 150,
    categoryIndex: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400",
    stock: 25,
    isAvailable: true,
    isFeatured: true,
    sku: "RVC021",
    ingredients: [
      "all-purpose flour",
      "cocoa powder",
      "buttermilk",
      "red food coloring",
      "unsalted butter",
      "eggs",
      "granulated sugar",
      "cream cheese",
      "powdered sugar",
      "vanilla extract",
    ],
  },
  {
    name: "Chocolate Fudge Cupcake",
    description:
      "Decadent chocolate cupcake topped with silky chocolate fudge buttercream. Pure chocolate bliss.",
    price: 140,
    categoryIndex: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400",
    stock: 28,
    isAvailable: true,
    isFeatured: true,
    sku: "CFC022",
    ingredients: [
      "all-purpose flour",
      "cocoa powder",
      "unsalted butter",
      "granulated sugar",
      "eggs",
      "whole milk",
      "dark chocolate",
      "heavy cream",
      "vanilla extract",
      "baking powder",
    ],
  },
  {
    name: "Vanilla Rainbow Cupcake",
    description:
      "Cheerful vanilla cupcake with rainbow swirl buttercream frosting and edible glitter.",
    price: 130,
    categoryIndex: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400",
    stock: 30,
    isAvailable: true,
    isFeatured: false,
    sku: "VRC023",
    ingredients: [
      "all-purpose flour",
      "unsalted butter",
      "granulated sugar",
      "eggs",
      "whole milk",
      "vanilla extract",
      "baking powder",
      "powdered sugar",
      "food coloring",
      "edible glitter",
    ],
  },
  // ── Savory Items (categoryIndex: 8) ───────────────────────────────────────
  {
    name: "Cheese Naan",
    description:
      "Soft, tandoor-style naan stuffed with melted mozzarella and cheddar. Baked golden, served warm.",
    price: 60,
    categoryIndex: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    stock: 50,
    isAvailable: true,
    isFeatured: true,
    sku: "CNR024",
    ingredients: [
      "all-purpose flour",
      "yeast",
      "yogurt",
      "whole milk",
      "mozzarella cheese",
      "cheddar cheese",
      "unsalted butter",
      "garlic",
      "salt",
      "nigella seeds",
    ],
  },
  {
    name: "Butter Naan",
    description:
      "Classic soft naan brushed with generous amounts of melted butter and a hint of garlic.",
    price: 50,
    categoryIndex: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    stock: 60,
    isAvailable: true,
    isFeatured: false,
    sku: "BTN025",
    ingredients: [
      "all-purpose flour",
      "yeast",
      "yogurt",
      "whole milk",
      "unsalted butter",
      "garlic",
      "salt",
      "baking powder",
    ],
  },
  {
    name: "Chicken Patty",
    description:
      "Flaky puff pastry filled with spiced minced chicken, onion, and herbs. A Bangladeshi street food classic.",
    price: 120,
    categoryIndex: 8,
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    stock: 35,
    isAvailable: true,
    isFeatured: true,
    sku: "CKP026",
    ingredients: [
      "puff pastry",
      "minced chicken",
      "onion",
      "green chili",
      "ginger",
      "garlic",
      "cumin",
      "coriander",
      "egg wash",
      "salt",
    ],
  },
  {
    name: "Spinach Samosa",
    description:
      "Crispy triangular pastry filled with spiced spinach and paneer. Golden fried, served hot.",
    price: 80,
    categoryIndex: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    stock: 40,
    isAvailable: true,
    isFeatured: false,
    sku: "SSA027",
    ingredients: [
      "all-purpose flour",
      "fresh spinach",
      "paneer",
      "onion",
      "green chili",
      "garam masala",
      "cumin seeds",
      "oil for frying",
      "salt",
      "amchur powder",
    ],
  },
];

// Persist seeding state across page loads so deleted products never re-appear
const SEED_LS_KEY = "pretty-baked-seeded";

async function seedIfEmpty(
  actor: import("../backend").backendInterface,
): Promise<void> {
  if (localStorage.getItem(SEED_LS_KEY)) {
    // Flag is set — but verify the backend actually has data.
    // If the canister was upgraded and wiped, the flag will be stale.
    const existingCheck = await actor.getProducts();
    if (existingCheck.length > 0) {
      // Backend still has data — nothing to do.
      return;
    }
    // Backend is empty despite the flag — canister was likely reinstalled.
    // Clear the stale flag so we fall through and re-seed below.
    localStorage.removeItem(SEED_LS_KEY);
  }

  const existingProducts = await actor.getProducts();
  if (existingProducts.length > 0) {
    // Backend already has products — mark as seeded and skip
    localStorage.setItem(SEED_LS_KEY, "1");
    return;
  }

  // Claim admin so the canister permits addCategory/addProduct calls
  try {
    await actor.claimAdmin();
  } catch {
    // Already claimed or anonymous — continue
  }

  // Seed categories first
  const categoryIds: bigint[] = [];
  for (const cat of SEED_CATEGORIES) {
    const id = await actor.addCategory(
      encodeCategory(
        cat.name,
        cat.slug,
        cat.description,
        categoryIds.length + 1,
      ),
    );
    categoryIds.push(id);
  }

  // Seed products
  for (const p of SEED_PRODUCTS) {
    const meta: FrontendMeta = {
      imageUrl: p.imageUrl,
      stock: p.stock,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      sku: p.sku,
    };
    const catId = categoryIds[p.categoryIndex] ?? categoryIds[0];
    await actor.addProduct({
      name: p.name,
      description: p.description,
      price: BigInt(p.price),
      category: catId,
      // ingredients[0] = JSON meta, ingredients[1..] = actual ingredient list
      ingredients: [encodeMeta(meta), ...p.ingredients],
      images: [],
    });
  }

  // Mark seeding as done permanently — never re-seed on future page loads
  localStorage.setItem(SEED_LS_KEY, "1");
}

// ---------------------------------------------------------------------------
// Timeout helper — rejects after `ms` milliseconds with a clear error
// ---------------------------------------------------------------------------
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Request timed out after ${ms / 1000}s. Please try again.`,
            ),
          ),
        ms,
      ),
    ),
  ]);
}

// ---------------------------------------------------------------------------
// Public hooks
// ---------------------------------------------------------------------------

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const actor = await requireActor();

      // Use getBackendStatus() as a fast health check first.
      // If the canister reports no products, trigger reinitializeIfEmpty() before fetching.
      try {
        const status = await actor.getBackendStatus();
        if (!status.hasProducts || !status.hasCategories) {
          await actor.reinitializeIfEmpty();
        }
      } catch {
        // If status check fails, fall through to the normal seedIfEmpty path
        await seedIfEmpty(actor);
      }

      const raw = await actor.getProducts();
      // Treat an empty response as a failure so React Query retries
      if (raw.length === 0) {
        throw new Error("No products returned — canister still warming up");
      }
      return raw.map(mapCanisterProduct);
    },
    // Short staleTime: once real data arrives cache for 5 minutes; empty fetches
    // are thrown as errors so they don't get cached at all.
    staleTime: 1000 * 60 * 5,
    // Retry every 5 seconds (not exponential) for up to 25 seconds (5 attempts)
    retry: 5,
    retryDelay: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useProductById(id: string) {
  return useQuery<Product | undefined>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return undefined;
      const actor = await requireActor();
      const raw = await actor.getProductById(BigInt(id));
      return raw ? mapCanisterProduct(raw) : undefined;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const actor = await requireActor();
      const raw = await actor.getCategories();
      // Treat empty as a transient failure — retry until data is present
      if (raw.length === 0) {
        throw new Error("No categories returned — canister still warming up");
      }
      return raw.map(mapCanisterCategory);
    },
    staleTime: 1000 * 60 * 5,
    retry: 5,
    retryDelay: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useIsAdmin() {
  // Admin is gated purely by localStorage flag set after successful email/password check
  const claimed = !!localStorage.getItem(ADMIN_LS_KEY);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => claimed,
    staleTime: 1000 * 60,
  });
}

export function useClaimAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: { email: string; password: string }) => {
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error("Invalid email or password");
      }
      // Call canister claimAdmin so the backend registers this principal as admin
      const actor = await requireActor();
      try {
        await actor.claimAdmin();
      } catch {
        // claimAdmin may throw if already claimed — that's fine
      }
      // Persist a flag so we know admin is claimed
      localStorage.setItem(ADMIN_LS_KEY, "1");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "createdAt" | "sku">) => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      const meta: FrontendMeta = {
        imageUrl: product.imageUrl || "/assets/images/placeholder.svg",
        stock: product.stock,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        sku: `SKU${Date.now()}`,
      };
      const id = await actor.addProduct({
        name: product.name,
        description: product.description,
        price: BigInt(Math.round(product.price)),
        category: BigInt(product.category),
        ingredients: [encodeMeta(meta), ...product.ingredients],
        images: [],
      });
      const created: Product = {
        ...product,
        id: id.toString(),
        sku: meta.sku,
        createdAt: Date.now(),
      };
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Product) => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      const meta: FrontendMeta = {
        imageUrl: product.imageUrl || "/assets/images/placeholder.svg",
        stock: product.stock,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        sku: product.sku,
      };
      await actor.updateProduct(BigInt(product.id), {
        name: product.name,
        description: product.description,
        price: BigInt(Math.round(product.price)),
        category: BigInt(product.category),
        ingredients: [encodeMeta(meta), ...product.ingredients],
        images: [],
      });
      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      await actor.deleteProduct(BigInt(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const actor = await requireActor();
      const [rawOrders, rawProducts] = await Promise.all([
        actor.listOrders(),
        actor.getProducts(),
      ]);
      // Build productId → imageUrl and productName → imageUrl lookup maps
      const productImageMap = new Map<string, string>();
      const productNameImageMap = new Map<string, string>();
      for (const p of rawProducts) {
        const meta = decodeMeta(p.ingredients);
        productImageMap.set(p.id.toString(), meta.imageUrl);
        productNameImageMap.set(p.name.toLowerCase().trim(), meta.imageUrl);
      }
      return rawOrders.map((o) =>
        mapCanisterOrder(o, productImageMap, productNameImageMap),
      );
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Delimiter used to encode both delivery address and delivery note in the
// single backend `notes` field.  Must never appear in normal address/note text.
const NOTES_DELIM = "|||NOTE|||";

function mapCanisterOrder(
  o: import("../backend").Order,
  productImageMap?: Map<string, string>,
  productNameImageMap?: Map<string, string>,
): Order {
  // orderId is present in the backend schema (Text); older records may be empty
  const orderId =
    o.orderId && o.orderId.trim().length > 0
      ? o.orderId
      : `#${o.id.toString().slice(-6).toUpperCase()}`;

  // Decode delivery address and delivery note from the combined `notes` field.
  // Encoding format written by useAddOrder: "<address>|||NOTE|||<note>"
  // Legacy format (pre-fix): the entire value is the delivery address only.
  //
  // IMPORTANT: Candid `opt text` fields are returned by the JS binding as
  //   [] | [string]  — NOT as string | undefined.
  // We must use Array access to unwrap the optional correctly.
  let deliveryAddress = "";
  let deliveryNote: string | undefined;
  const notesField = o.notes as unknown;
  // Handle both Candid array form ([] | [string]) and plain string (for forward compat)
  const raw: string = Array.isArray(notesField)
    ? ((notesField as string[])[0] ?? "")
    : typeof notesField === "string"
      ? notesField
      : "";
  if (raw.includes(NOTES_DELIM)) {
    const idx = raw.indexOf(NOTES_DELIM);
    deliveryAddress = raw.slice(0, idx).trim();
    const notePart = raw.slice(idx + NOTES_DELIM.length).trim();
    deliveryNote = notePart.length > 0 ? notePart : undefined;
  } else {
    deliveryAddress = raw.trim();
  }

  // Backend Timestamp is nanoseconds (Int/bigint).
  // Divide by 1_000_000 to convert to milliseconds for the JS Date constructor.
  const createdAtNs = BigInt(o.createdAt);
  const createdAtMs = Number(createdAtNs / BigInt(1_000_000));

  // Decode Candid opt fields ([] | [value]) for coupon/points
  const couponCode = Array.isArray(o.couponCode)
    ? ((o.couponCode as unknown as string[])[0] ?? undefined)
    : (o.couponCode ?? undefined);
  const couponDiscount = Array.isArray(o.couponDiscount)
    ? (o.couponDiscount as unknown as bigint[])[0] !== undefined
      ? Number((o.couponDiscount as unknown as bigint[])[0])
      : undefined
    : o.couponDiscount !== undefined
      ? Number(o.couponDiscount)
      : undefined;
  const pointsRedeemed = Array.isArray(o.pointsRedeemed)
    ? (o.pointsRedeemed as unknown as bigint[])[0] !== undefined
      ? Number((o.pointsRedeemed as unknown as bigint[])[0])
      : undefined
    : o.pointsRedeemed !== undefined
      ? Number(o.pointsRedeemed)
      : undefined;
  const pointsEarned = Array.isArray(o.pointsEarned)
    ? (o.pointsEarned as unknown as bigint[])[0] !== undefined
      ? Number((o.pointsEarned as unknown as bigint[])[0])
      : undefined
    : o.pointsEarned !== undefined
      ? Number(o.pointsEarned)
      : undefined;

  return {
    id: o.id.toString(),
    orderId,
    customerId: o.customerEmail,
    items: o.items.map((item) => {
      const pid = item.productId.toString();
      // Try to find image by productId first, then fall back to product name lookup
      const imageUrl =
        productImageMap?.get(pid) ??
        productNameImageMap?.get(item.productName.toLowerCase().trim()) ??
        "/assets/images/placeholder.svg";
      return {
        productId: pid,
        name: item.productName,
        price: Number(item.unitPrice),
        quantity: Number(item.quantity),
        imageUrl,
      };
    }),
    total: Number(o.total),
    status: mapOrderStatus(o.status),
    createdAt: createdAtMs,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    deliveryAddress,
    deliveryNote,
    // Keep legacy `notes` alias pointing to the same value for backward compat
    notes: deliveryNote,
    customerPrincipal: o.customerPrincipal?.toString() ?? null,
    paymentMethod: o.paymentMethod === "stripe" ? "stripe" : "cod",
    // Candid `opt text` / `opt StripePaymentStatus` come as [] | [value] arrays
    stripePaymentIntentId: Array.isArray(o.stripePaymentIntentId)
      ? ((o.stripePaymentIntentId as unknown as string[])[0] ?? null)
      : (o.stripePaymentIntentId ?? null),
    stripePaymentStatus: Array.isArray(o.stripePaymentStatus)
      ? ((o.stripePaymentStatus as unknown as string[])[0] ?? null)
      : (o.stripePaymentStatus ?? null),
    couponCode,
    couponDiscount,
    pointsRedeemed,
    pointsEarned,
  };
}

function mapOrderStatus(
  status: import("../backend").OrderStatus,
): Order["status"] {
  switch (status) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "preparing":
      return "preparing";
    case "readyForPickup":
      return "ready";
    case "outForDelivery":
      return "ready";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

function frontendStatusToBackend(status: Order["status"]): BackendOrderStatus {
  switch (status) {
    case "ready":
      return BackendOrderStatus.readyForPickup;
    case "pending":
      return BackendOrderStatus.pending;
    case "confirmed":
      return BackendOrderStatus.confirmed;
    case "preparing":
      return BackendOrderStatus.preparing;
    case "delivered":
      return BackendOrderStatus.delivered;
    case "cancelled":
      return BackendOrderStatus.cancelled;
    default:
      return BackendOrderStatus.pending;
  }
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Order["status"];
    }) => {
      const actor = await requireActor();
      const success = await actor.updateOrderStatus(
        BigInt(id),
        frontendStatusToBackend(status),
      );
      if (!success) throw new Error("Failed to update order status");
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const actor = await requireActor();
      const success = await actor.deleteOrder(BigInt(id));
      if (!success) throw new Error("Failed to delete order");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

export function useAddOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Order) => {
      const actor = await requireActor();
      // Use the explicit deliveryNote field; fall back to legacy `notes` for
      // any callers that haven't been updated yet.
      const note = (order.deliveryNote ?? order.notes ?? "").trim();
      // Encode delivery address + optional delivery note into the single
      // backend `notes` field so both can be recovered on read.
      const encodedNotes =
        note.length > 0
          ? `${order.deliveryAddress}${NOTES_DELIM}${note}`
          : order.deliveryAddress;
      await actor.placeOrder({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerId,
        // Candid `opt text` must be passed as [string] (Some) or undefined (None)
        notes: encodedNotes.length > 0 ? encodedNotes : undefined,
        paymentMethod:
          order.paymentMethod === "stripe"
            ? PaymentMethod.stripe
            : PaymentMethod.cod,
        stripePaymentIntentId: order.stripePaymentIntentId ?? undefined,
        // Pass coupon code and points to backend so they are stored on the order
        couponCode: order.couponCode ?? undefined,
        pointsToRedeem:
          order.pointsRedeemed !== undefined && order.pointsRedeemed > 0
            ? BigInt(order.pointsRedeemed)
            : undefined,
        items: order.items.map((item) => ({
          productId: BigInt(item.productId),
          productName: item.name,
          quantity: BigInt(item.quantity),
          unitPrice: BigInt(Math.round(item.price)),
        })),
      });
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Invalidate all myOrders variants (keyed by token) so the new order
      // shows up immediately regardless of which token is active.
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// Ensure the backend knows this is an admin before running any category mutation.
// claimAdmin is idempotent on the backend — safe to call multiple times.
async function ensureAdminRegistered(
  actor: import("../backend").backendInterface,
): Promise<void> {
  if (!localStorage.getItem(ADMIN_LS_KEY)) return;
  try {
    await actor.claimAdmin();
  } catch {
    // Already claimed or anonymous caller — ignore
  }
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cat: Omit<Category, "id">) => {
      const actor = await requireActor();
      await withTimeout(ensureAdminRegistered(actor), 15_000);
      const existing = await withTimeout(actor.getCategories(), 15_000);
      const displayOrder = existing.length + 1;
      const id = await withTimeout(
        actor.addCategory(
          encodeCategory(
            cat.name,
            cat.slug,
            cat.description ?? "",
            displayOrder,
            cat.imageUrl,
          ),
        ),
        15_000,
      );
      const created: Category = { ...cat, id: id.toString() };
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cat: Category) => {
      const actor = await requireActor();
      await withTimeout(ensureAdminRegistered(actor), 15_000);
      // Preserve display order from existing record
      const existing = await withTimeout(actor.getCategories(), 15_000);
      const found = existing.find((c) => c.id.toString() === cat.id);
      const displayOrder = found ? Number(found.displayOrder) : 1;
      await withTimeout(
        actor.updateCategory(
          BigInt(cat.id),
          encodeCategory(
            cat.name,
            cat.slug,
            cat.description ?? "",
            displayOrder,
            cat.imageUrl,
          ),
        ),
        15_000,
      );
      return cat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      await actor.deleteCategory(BigInt(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useChatWithBakey() {
  return useMutation({
    mutationFn: async ({
      userMessage,
      conversationHistory,
    }: {
      userMessage: string;
      conversationHistory: { role: string; content: string }[];
    }): Promise<string> => {
      // Try the canister first — it may use HTTP outcalls for AI responses
      const actor = backendActorSync();
      if (actor) {
        try {
          const response = await actor.chatWithBakey(
            userMessage,
            conversationHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          );
          if (response && response.trim().length > 0) return response;
        } catch {
          // Fall through to local response
        }
      }

      // Local intelligent fallback
      return localBakeyResponse(userMessage);
    },
  });
}

function localBakeyResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! 👋 Welcome to Pretty Baked! I'm Bakey, your bakery assistant. How can I help you today? Ask me about our cakes, donuts, cupcakes, pastries, breads, cookies, savory items, or cheesecakes!";
  }
  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much")
  ) {
    return "Our products range from ৳50 (Butter Naan) to ৳3,500 (Custom Wedding Cake).\n• Cakes: ৳700–৳950\n• Pastries: ৳100–৳160\n• Donuts: ৳80–৳95\n• Cupcakes: ৳130–৳150\n• Savory Items: ৳50–৳120\n• Cookies & Treats: ৳130–৳350\n• Cheesecake: ৳900\n• Custom Orders: from ৳3,500\nWhich category interests you most?";
  }
  if (msg.includes("donut") || msg.includes("doughnut")) {
    return "Our freshly glazed donuts are amazing! 🍩\n• Chocolate Glazed Donut — ৳90\n• Strawberry Frosted Donut — ৳95\n• Glazed Ring Donut — ৳80\nAll made fresh daily with soft yeast dough and rich toppings!";
  }
  if (msg.includes("cupcake")) {
    return "Our cupcakes are mini masterpieces! 🧁\n• Red Velvet Cupcake — ৳150\n• Chocolate Fudge Cupcake — ৳140\n• Vanilla Rainbow Cupcake — ৳130\nEach topped with a generous swirl of buttercream frosting!";
  }
  if (
    msg.includes("savory") ||
    msg.includes("naan") ||
    msg.includes("patty") ||
    msg.includes("samosa")
  ) {
    return "Our savory baked goods are freshly made! 🥙\n• Cheese Naan — ৳60 (stuffed with mozzarella & cheddar)\n• Butter Naan — ৳50 (classic soft naan with garlic butter)\n• Chicken Patty — ৳120 (flaky puff pastry, spiced chicken)\n• Spinach Samosa — ৳80 (crispy, filled with spinach & paneer)\nPerfect as a snack or meal accompaniment!";
  }
  if (msg.includes("black forest")) {
    return "Our Black Forest Cake (৳950) is layers of moist chocolate sponge, whipped cream, and Morello cherries 🍒. A timeless classic, beautifully crafted!";
  }
  if (msg.includes("cake")) {
    return "We have wonderful cakes! 🎂\n• Chocolate Cake — ৳800\n• Red Velvet Cake — ৳900\n• Vanilla Cake — ৳700\n• Black Forest Cake — ৳950\n• Custom Wedding Cake — ৳3,500\nWould you like details about any of these?";
  }
  if (msg.includes("cheesecake") || msg.includes("new york")) {
    return "Our New York Cheesecake (৳900) is dense, velvety cheesecake on a buttery graham cracker crust with fresh berry coulis 🍰. Absolutely divine!";
  }
  if (msg.includes("macaron")) {
    return "Our Macaron Box of 6 (৳180) features assorted flavours — rose, pistachio, chocolate, and salted caramel 🎨. Gift-ready and absolutely beautiful!";
  }
  if (msg.includes("eclair")) {
    return "Our Classic Éclair (৳160) is filled with silky vanilla pastry cream and topped with rich chocolate glaze. A French pastry perfection! 🍫";
  }
  if (msg.includes("brownie")) {
    return "Our fudgy Brownie (৳130) is made with Belgian dark chocolate — dense, rich, with a beautiful shiny crackled top. Pure indulgence! 🍫";
  }
  if (msg.includes("lemon")) {
    return "Our Lemon Bar (৳110) has zesty lemon curd on a buttery shortbread base, dusted with powdered sugar. Bright, tangy, and irresistible! 🍋";
  }
  if (
    msg.includes("pastry") ||
    msg.includes("pastries") ||
    msg.includes("croissant")
  ) {
    return "Our pastries are baked fresh daily! 🥐\n• Butter Croissant — ৳100\n• Pastry — ৳110\n• Éclair — ৳160\n• Lemon Bar — ৳110\nAll made with pure butter and premium ingredients!";
  }
  if (msg.includes("sourdough") || msg.includes("bread")) {
    return "Our breads are stone-baked with love! 🍞\n• Garlic Bread — ৳120\n• Classic Sourdough Loaf — ৳180 (48-hour slow fermented!)\nCrispy crust, chewy interior — bakery perfection!";
  }
  if (msg.includes("cookie") || msg.includes("cookies")) {
    return "Cookies & treats! 🍪\n• Butter Cookies — ৳350\n• Macaron Box of 6 — ৳180\n• Brownie — ৳130\nAll made fresh with premium ingredients!";
  }
  if (
    msg.includes("wedding") ||
    msg.includes("custom") ||
    msg.includes("order")
  ) {
    return "We love creating custom cakes! 💍🎂 Our Custom Wedding Cakes start at ৳3,500, crafted to your exact vision. Contact us at hello@prettybaked.com to discuss your dream cake!";
  }
  if (
    msg.includes("recommend") ||
    msg.includes("popular") ||
    msg.includes("best")
  ) {
    return "Our most popular items right now! ⭐\n• Chocolate Glazed Donut — ৳90\n• Red Velvet Cupcake — ৳150\n• Chocolate Cake — ৳800\n• Butter Croissant — ৳100\n• Cheese Naan — ৳60\nAll made with the finest ingredients — visit the Shop to order!";
  }
  if (
    msg.includes("ingredient") ||
    msg.includes("contains") ||
    msg.includes("allerg")
  ) {
    return "All our products list full ingredients on their detail pages 📋. Click on any product to see the complete ingredient list. If you have specific allergies, feel free to contact us at hello@prettybaked.com!";
  }
  if (msg.includes("open") || msg.includes("hours") || msg.includes("time")) {
    return "We're open Monday to Saturday, 8am to 9pm. 🕐 You can also order online through our shop anytime!";
  }
  if (msg.includes("deliver") || msg.includes("delivery")) {
    return "We offer home delivery across Dhaka! 🚗 Delivery is ৳80 — FREE on orders over ৳1,000. Order through our Shop and we'll bring it to your door!";
  }
  return "Great question! 😊 At Pretty Baked, we offer artisan cakes, donuts, cupcakes, pastries, breads, cookies, savory items, cheesecakes, and custom orders — all made with love. Browse our full collection in the Shop. Is there a specific product you're looking for?";
}

// ---------------------------------------------------------------------------
// Customer account hooks
// ---------------------------------------------------------------------------

export function useIsCustomerRegistered() {
  const token = localStorage.getItem("pretty-baked-auth-token");

  return useQuery<boolean>({
    queryKey: ["isCustomerRegistered", token],
    queryFn: async () => {
      if (!token) return false;
      const actor = await requireActor();
      return actor.isCustomerRegistered(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useGetMyProfile() {
  const token = localStorage.getItem("pretty-baked-auth-token");

  return useQuery<import("../types").CustomerProfile | null>({
    queryKey: ["myProfile", token],
    queryFn: async () => {
      if (!token) return null;
      const actor = await requireActor();
      const raw = await actor.getMyProfile(token);
      if (!raw) return null;
      const rawExt = raw as typeof raw & {
        bio?: string;
        deliveryAddress?: string;
      };
      return {
        name: raw.name,
        email: raw.email,
        phone: raw.phone,
        createdAt: raw.createdAt,
        avatar: raw.avatar,
        bio: rawExt.bio,
        deliveryAddress: rawExt.deliveryAddress,
        loyaltyPoints: Number(raw.loyaltyPoints ?? 0),
        wishlist: (raw.wishlist ?? []).map(Number),
      };
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRegisterCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
      phone: string;
      securityQuestion: string;
      securityAnswer: string;
    }) => {
      const actor = await requireActor();
      await actor.registerCustomer(input);
      return input;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCustomerRegistered"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      updates,
    }: {
      token: string;
      updates: {
        name?: string;
        phone?: string;
        securityQuestion?: string;
        securityAnswer?: string;
        avatar?: string;
        bio?: string;
        deliveryAddress?: string;
      };
    }) => {
      const actor = await requireActor();
      return actor.updateMyProfile(
        token,
        updates as import("../backend").UpdateProfileInput,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const actor = await requireActor();
      const token = localStorage.getItem("pretty-baked-auth-token");
      if (!token) throw new Error("Not logged in");
      return actor.changePassword(token, currentPassword, newPassword);
    },
  });
}

export function useGetMyOrders() {
  // Read token at render time for the query key — changes to the token
  // (login/logout) will cause a new query to be created automatically.
  const token = localStorage.getItem("pretty-baked-auth-token");

  return useQuery<import("../types").Order[]>({
    queryKey: ["myOrders", token],
    queryFn: async () => {
      // Re-read token inside queryFn to always get the freshest value
      const currentToken = localStorage.getItem("pretty-baked-auth-token");
      if (!currentToken) return [];
      const actor = await requireActor();
      // Fetch orders and products in parallel so we can enrich items with images
      const [rawOrders, rawProducts] = await Promise.all([
        actor.getMyOrders(currentToken),
        actor.getProducts(),
      ]);
      // Build productId → imageUrl and productName → imageUrl lookup maps
      const productImageMap = new Map<string, string>();
      const productNameImageMap = new Map<string, string>();
      for (const p of rawProducts) {
        const meta = decodeMeta(p.ingredients);
        productImageMap.set(p.id.toString(), meta.imageUrl);
        productNameImageMap.set(p.name.toLowerCase().trim(), meta.imageUrl);
      }
      return rawOrders.map((o) =>
        mapCanisterOrder(o, productImageMap, productNameImageMap),
      );
    },
    enabled: !!token,
    staleTime: 1000 * 30,
    // Refresh more aggressively so new orders show up quickly
    refetchOnWindowFocus: true,
  });
}

// ---------------------------------------------------------------------------
// Payment hooks (Stripe extension)
// ---------------------------------------------------------------------------

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (input: {
      orderId: string;
      amountBDT: number;
      currency: string;
      customerEmail: string;
    }) => {
      const actor = await requireActor();
      const result = await actor.createPaymentIntent({
        orderId: BigInt(input.orderId),
        amountPaisa: BigInt(Math.round(input.amountBDT * 100)),
        currency: input.currency,
        customerEmail: input.customerEmail,
      });
      return {
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        status: result.status,
      };
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { orderId: string; paymentIntentId: string }) => {
      const actor = await requireActor();
      return actor.confirmPayment({
        orderId: BigInt(input.orderId),
        paymentIntentId: input.paymentIntentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Review hooks
// ---------------------------------------------------------------------------

export function useReviews(productId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const actor = await requireActor();
      const raw = await actor.getReviewsByProduct(BigInt(productId));
      return raw.map((r) => ({
        id: Number(r.id),
        productId: Number(r.productId),
        reviewerName: r.reviewerName,
        rating: Number(r.rating),
        text: r.text,
        createdAt: r.createdAt,
      }));
    },
    enabled: !!productId,
    staleTime: 1000 * 30,
  });
}

export function useAverageRating(productId: string) {
  return useQuery<number | null>({
    queryKey: ["averageRating", productId],
    queryFn: async () => {
      if (!productId) return null;
      const actor = await requireActor();
      return actor.getAverageRating(BigInt(productId));
    },
    enabled: !!productId,
    staleTime: 1000 * 30,
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      productId: string;
      reviewerName: string;
      rating: number;
      text: string;
    }) => {
      const actor = await requireActor();
      const result = await actor.addReview(
        BigInt(input.productId),
        input.reviewerName,
        BigInt(input.rating),
        input.text,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["averageRating", variables.productId],
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Coupon hooks
// ---------------------------------------------------------------------------

function mapBackendCoupon(c: import("../backend").Coupon): Coupon {
  return {
    id: c.id,
    code: c.code,
    discountType:
      c.discountType === DiscountType.percentage ? "percentage" : "fixed",
    discountValue: c.discountValue,
    maxUses: c.maxUses ?? undefined,
    currentUses: c.currentUses,
    expiresAt: c.expiresAt ?? undefined,
    isActive: c.isActive,
    createdAt: c.createdAt,
  };
}

function couponInputToBackend(
  input: CouponInput,
): import("../backend").CouponInput {
  return {
    code: input.code,
    discountType:
      input.discountType === "percentage"
        ? DiscountType.percentage
        : DiscountType.fixed,
    discountValue: input.discountValue,
    maxUses: input.maxUses ?? undefined,
    expiresAt: input.expiresAt ?? undefined,
    isActive: input.isActive,
  };
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (code: string): Promise<Coupon | null> => {
      const actor = await requireActor();
      // Trim and uppercase so the code matches however it was stored
      const normalised = code.trim().toUpperCase();
      console.log("[validateCoupon] sending code:", normalised);
      try {
        const result = await actor.validateCoupon(normalised);
        console.log("[validateCoupon] result:", result);
        return result ? mapBackendCoupon(result) : null;
      } catch (error) {
        console.error("[validateCoupon] backend error:", error);
        throw error;
      }
    },
  });
}

export function useGetCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      const raw = await actor.getCoupons();
      return raw.map(mapBackendCoupon);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useAddCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CouponInput): Promise<Coupon> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      const result = await actor.addCoupon(couponInputToBackend(input));
      return mapBackendCoupon(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: CouponInput;
    }): Promise<boolean> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      return actor.updateCoupon(id, couponInputToBackend(input));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint): Promise<boolean> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      return actor.deleteCoupon(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Loyalty points hooks
// ---------------------------------------------------------------------------

export function useGetMyPoints() {
  const token = localStorage.getItem("pretty-baked-auth-token");
  return useQuery<number>({
    queryKey: ["myPoints", token],
    queryFn: async () => {
      const currentToken = localStorage.getItem("pretty-baked-auth-token");
      if (!currentToken) return 0;
      const actor = await requireActor();
      const pts = await actor.getMyPoints(currentToken);
      return Number(pts);
    },
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

// ---------------------------------------------------------------------------
// Wishlist hooks
// ---------------------------------------------------------------------------

export function useGetMyWishlist() {
  const token = localStorage.getItem("pretty-baked-auth-token");
  return useQuery<number[]>({
    queryKey: ["myWishlist", token],
    queryFn: async () => {
      const currentToken = localStorage.getItem("pretty-baked-auth-token");
      if (!currentToken) return [];
      const actor = await requireActor();
      const raw = await actor.getMyWishlist(currentToken);
      return raw.map(Number);
    },
    enabled: !!token,
    staleTime: 1000 * 30,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number): Promise<boolean> => {
      const token = localStorage.getItem("pretty-baked-auth-token");
      if (!token) throw new Error("Not logged in");
      const actor = await requireActor();
      return actor.addToWishlist(token, BigInt(productId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myWishlist"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number): Promise<boolean> => {
      const token = localStorage.getItem("pretty-baked-auth-token");
      if (!token) throw new Error("Not logged in");
      const actor = await requireActor();
      return actor.removeFromWishlist(token, BigInt(productId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myWishlist"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Product images hooks
// ---------------------------------------------------------------------------

export function useGetProductImages(productId: string) {
  return useQuery<string[]>({
    queryKey: ["productImages", productId],
    queryFn: async () => {
      if (!productId) return [];
      const actor = await requireActor();
      const raw = await actor.getProductImages(BigInt(productId));
      // Convert Uint8Array blobs to data URLs
      return raw.map((bytes) => {
        const b64 = btoa(
          Array.from(bytes)
            .map((b) => String.fromCharCode(b))
            .join(""),
        );
        return `data:image/jpeg;base64,${b64}`;
      });
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSetProductImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      dataUrls,
    }: {
      productId: string;
      dataUrls: string[];
    }): Promise<boolean> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      // Convert data URLs back to Uint8Array
      const images = dataUrls.map((url) => {
        const base64 = url.split(",")[1] ?? "";
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      });
      return actor.setProductImages(BigInt(productId), images);
    },
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["productImages", productId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin analytics hooks
// ---------------------------------------------------------------------------

export function useGetLowStockProducts(threshold = 5) {
  return useQuery<Product[]>({
    queryKey: ["lowStockProducts", threshold],
    queryFn: async () => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      const raw = await actor.getLowStockProducts(BigInt(threshold));
      // Frontend safety: strictly enforce stock < threshold to match the
      // "below 3 = show, 3 or above = hide" requirement even if backend
      // returns edge cases.
      return raw.map(mapCanisterProduct).filter((p) => p.stock < threshold);
    },
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });
}

export function useGetOrdersByDateRange(
  startDate: number | null,
  endDate: number | null,
) {
  return useQuery<Order[]>({
    queryKey: ["ordersByDateRange", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      const actor = await requireActor();
      const [rawOrders, rawProducts] = await Promise.all([
        actor.getOrdersByDateRange(
          BigInt(startDate * 1_000_000), // ms to ns
          BigInt(endDate * 1_000_000),
        ),
        actor.getProducts(),
      ]);
      const productImageMap = new Map<string, string>();
      const productNameImageMap = new Map<string, string>();
      for (const p of rawProducts) {
        const meta = decodeMeta(p.ingredients);
        productImageMap.set(p.id.toString(), meta.imageUrl);
        productNameImageMap.set(p.name.toLowerCase().trim(), meta.imageUrl);
      }
      return rawOrders.map((o) =>
        mapCanisterOrder(o, productImageMap, productNameImageMap),
      );
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 30,
  });
}

// ---------------------------------------------------------------------------
// Promo announcement hooks
//
// Billboard images are stored BOTH in the backend canister (as a JSON-encoded
// array of compressed data URLs in the offerImageUrl field) AND in IndexedDB
// as a fast local cache.  Backend storage is the source of truth — images
// survive any deploy or browser storage clear.  Compression targets 400 KB per
// image so 4 images fit comfortably within the ~2 MB Candid message limit.
// ---------------------------------------------------------------------------

/**
 * Compress a data-URL image to a target size in KB using a canvas.
 * Returns the compressed data URL, or the original if compression fails.
 */
async function compressImageForBackend(
  dataUrl: string,
  targetKB = 400,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Start at the original size, then scale down if needed
      let { width, height } = img;
      const maxDim = 1400;
      if (width > maxDim || height > maxDim) {
        const ratio = maxDim / Math.max(width, height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);

      // Binary-search for the right quality level
      let lo = 0.1;
      let hi = 0.92;
      let best = dataUrl;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        const out = canvas.toDataURL("image/jpeg", mid);
        const sizeKB = Math.round((out.length * 3) / 4 / 1024);
        best = out;
        if (sizeKB <= targetKB) lo = mid;
        else hi = mid;
      }
      resolve(best);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const IDB_DB_NAME = "pretty-baked-db";
const IDB_STORE_NAME = "billboard-images";
const IDB_KEY = "images";

/** Open (or create) the IndexedDB database. */
function openBillboardDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Read the locally-stored billboard images (up to 4) from IndexedDB. */
async function loadLocalPromoImages(): Promise<string[]> {
  try {
    const db = await openBillboardDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE_NAME, "readonly");
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        const val = req.result as string[] | undefined;
        resolve(Array.isArray(val) ? val.filter(Boolean) : []);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/** Persist billboard images to IndexedDB. */
async function saveLocalPromoImages(images: string[]): Promise<void> {
  try {
    const db = await openBillboardDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.put(images.filter(Boolean), IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("[saveLocalPromoImages] IndexedDB write failed:", err);
  }
}

export function useGetPromoAnnouncement() {
  return useQuery<PromoAnnouncement | null>({
    queryKey: ["promoAnnouncement"],
    queryFn: async () => {
      const actor = await requireActor();
      const result = await actor.getPromoAnnouncement();
      if (!result) return null;

      // Safely unwrap each field — backend may return Candid opt values as arrays.
      const rawTitle = Array.isArray(result.title)
        ? ((result.title as unknown as string[])[0] ?? "")
        : (result.title ?? "");
      const rawMessage = Array.isArray(result.message)
        ? ((result.message as unknown as string[])[0] ?? "")
        : (result.message ?? "");
      const rawDeliveryHours = Array.isArray(result.deliveryHours)
        ? ((result.deliveryHours as unknown as string[])[0] ?? "")
        : (result.deliveryHours ?? "");
      const rawIsActive = Boolean(result.isActive);

      // Validate title: reject any value that looks like a timestamp/date string
      const cleanTitle = ((): string => {
        const t = rawTitle.trim();
        if (!t) return "";
        if (t === rawDeliveryHours.trim()) return "";
        if (/^\d{1,2}(am|pm).*\u2013.*\d{1,2}(am|pm)/i.test(t)) return "";
        return t;
      })();

      // Primary source: backend offerImageUrl field may be a JSON-encoded array
      let backendImages: string[] = [];
      const rawOfferImageUrl = Array.isArray(result.offerImageUrl)
        ? ((result.offerImageUrl as unknown as string[])[0] ?? null)
        : (result.offerImageUrl ?? null);

      if (rawOfferImageUrl) {
        const raw = rawOfferImageUrl;
        if (raw.startsWith("[[")) {
          // Legacy double-encoded — ignore
        } else if (raw.startsWith("[")) {
          try {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              backendImages = parsed.filter(Boolean);
            }
          } catch {
            backendImages = [raw];
          }
        } else if (raw.startsWith("data:") || raw.startsWith("http")) {
          backendImages = [raw];
        }
      }

      // If backend has images, cache them locally and use them.
      // Only fall back to IndexedDB when the backend truly has no images stored
      // (i.e. admin hasn't uploaded any yet). Do NOT fall back just because
      // the backend returned empty during a warm-up — that case is handled by
      // the retry logic below (we throw if active+no images so retries fire).
      const localImages =
        backendImages.length > 0 ? [] : await loadLocalPromoImages();
      const images = backendImages.length > 0 ? backendImages : localImages;

      if (backendImages.length > 0) {
        saveLocalPromoImages(backendImages).catch(() => {});
      }

      const safeTitle: string = cleanTitle;
      const safeMessage: string = rawMessage.trim();

      // If promo is active but we got no images from the backend, this is likely
      // a warm-up cache miss. Throw so React Query retries instead of showing
      // a broken/empty promo bar. Only throw when isActive is true — an inactive
      // promo with no images is perfectly valid (admin turned it off).
      if (rawIsActive && images.length === 0 && !safeTitle && !safeMessage) {
        throw new Error("Promo active but no content — retrying after warm-up");
      }

      return {
        title: safeTitle,
        message: safeMessage,
        isActive: rawIsActive,
        deliveryHours: rawDeliveryHours,
        offerImageUrl: images.length > 0 ? images[0] : undefined,
        offerImages: images.length > 0 ? images : undefined,
      };
    },
    // Reduce staleTime to 10s for fresh data; good data cached for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Retry aggressively so promo bar appears quickly after a canister restart
    retry: 24,
    retryDelay: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useSetPromoAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PromoAnnouncement): Promise<void> => {
      const actor = await requireActor();
      // Ensure admin principal is registered with the canister BEFORE making
      // the protected call — setPromoAnnouncement will trap if caller isn't admin.
      await ensureAdminRegistered(actor);

      // Compress each image and store them as a JSON-encoded array in the
      // offerImageUrl field.  This approach:
      //   1. Keeps every image in the backend canister (survives any deploy / browser clear)
      //   2. Respects the ~2 MB Candid message limit via aggressive compression
      //   3. Falls back to IndexedDB cache for the in-session preview
      let serialisedImages: string | undefined;
      const rawImages = (
        input.offerImages && input.offerImages.length > 0
          ? input.offerImages
          : input.offerImageUrl
            ? [input.offerImageUrl]
            : []
      ).filter(Boolean);

      if (rawImages.length > 0) {
        // Compress each image to fit inside Candid message budget.
        // Target: each image ≤ 400 KB after compression so 4 images ≤ ~1.6 MB.
        const compressed = await Promise.all(
          rawImages.map((dataUrl) => compressImageForBackend(dataUrl, 400)),
        );
        serialisedImages = JSON.stringify(compressed.filter(Boolean));

        // Also persist to IndexedDB for immediate in-session display
        // (the backend call is async and might take a moment to propagate)
        await saveLocalPromoImages(rawImages);
      }

      const payload: import("../backend").PromoAnnouncement = {
        title: input.title,
        message: input.message,
        isActive: input.isActive,
        deliveryHours: input.deliveryHours,
        offerImageUrl: serialisedImages,
      };
      await actor.setPromoAnnouncement(payload);
    },
    onSuccess: () => {
      // Invalidate AND refetch so PromoBar in Layout.tsx gets the new data.
      queryClient.invalidateQueries({ queryKey: ["promoAnnouncement"] });
      queryClient.refetchQueries({ queryKey: ["promoAnnouncement"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin user management hooks
// ---------------------------------------------------------------------------

export function useListAllUsers() {
  return useQuery<AdminUserView[]>({
    queryKey: ["adminUsers"],
    queryFn: async (): Promise<AdminUserView[]> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      const raw = await actor.listAllUsers();
      return raw.map((u) => ({
        email: u.email,
        password: u.password,
        name: u.name,
        phone: u.phone,
        createdAt: u.createdAt,
        loyaltyPoints: u.loyaltyPoints,
        wishlist: u.wishlist,
        avatar: Array.isArray(u.avatar)
          ? ((u.avatar as unknown as string[])[0] ?? undefined)
          : (u.avatar ?? undefined),
        bio: Array.isArray(u.bio)
          ? ((u.bio as unknown as string[])[0] ?? undefined)
          : (u.bio ?? undefined),
        deliveryAddress: Array.isArray(u.deliveryAddress)
          ? ((u.deliveryAddress as unknown as string[])[0] ?? undefined)
          : (u.deliveryAddress ?? undefined),
        securityQuestion: u.securityQuestion,
      }));
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      updates,
    }: {
      email: string;
      updates: AdminUserUpdate;
    }): Promise<boolean> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      return actor.adminUpdateUser(email, {
        displayName: updates.displayName,
        phone: updates.phone,
        bio: updates.bio,
        deliveryAddress: updates.deliveryAddress,
        newPassword: updates.newPassword,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string): Promise<boolean> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      return actor.adminDeleteUser(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Site Content hooks
// ---------------------------------------------------------------------------

// These 5 fields are frontend-only (not in the deployed backend SiteContent type).
// They are stored in localStorage and merged with the backend data on read.
const SITE_EXTRA_LS_KEY = "pretty-baked-site-extra-content";
function getSiteExtra(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SITE_EXTRA_LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
function saveSiteExtra(partial: Record<string, string>) {
  try {
    const current = getSiteExtra();
    localStorage.setItem(
      SITE_EXTRA_LS_KEY,
      JSON.stringify({ ...current, ...partial }),
    );
  } catch {
    /* ignore */
  }
}

/** Combined store init data — single call that replaces separate product/category fetches on admin dashboard */
/** Combined store init data — single call that replaces separate product/category fetches on admin dashboard */
export function useStoreInitData() {
  return useQuery<{
    products: Product[];
    categories: Category[];
    recentOrders: Order[];
    lowStockProducts: Product[];
  }>({
    queryKey: ["storeInitData"],
    queryFn: async () => {
      const actor = await requireActor();

      // Fast health check: use getBackendStatus() first — it responds in <1s
      // even during canister warm-up. If data is missing, trigger reseed.
      try {
        const status = await actor.getBackendStatus();
        if (!status.hasProducts || !status.hasCategories) {
          await actor.reinitializeIfEmpty();
        }
      } catch {
        // If status endpoint fails, try the old seedIfEmpty path
        await seedIfEmpty(actor);
      }

      // Fetch the combined init data with an extended timeout to avoid
      // false "backend too slow" errors during canister warm-up.
      const callWithTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
        Promise.race([
          p,
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Backend took too long to respond")),
              ms,
            ),
          ),
        ]);

      const raw = await callWithTimeout(actor.getStoreInitData(), 45_000);

      // If products came back empty, treat as transient — React Query will retry
      if (raw.products.length === 0) {
        throw new Error("No products in init data — canister still warming up");
      }

      // Build product image maps from already-fetched products (no extra call)
      const productImageMap = new Map<string, string>();
      const productNameImageMap = new Map<string, string>();
      for (const rp of raw.products) {
        const meta = decodeMeta(rp.ingredients);
        productImageMap.set(rp.id.toString(), meta.imageUrl);
        productNameImageMap.set(rp.name.toLowerCase().trim(), meta.imageUrl);
      }

      return {
        products: raw.products.map(mapCanisterProduct),
        categories: raw.categories.map(mapCanisterCategory),
        recentOrders: raw.recentOrders.map((o) =>
          mapCanisterOrder(o, productImageMap, productNameImageMap),
        ),
        lowStockProducts: raw.lowStockProducts
          .map(mapCanisterProduct)
          .filter((p) => p.stock < 3),
      };
    },
    // Cache good data for 5 minutes; after 3 retries (~15s) stop and show error
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetSiteContent() {
  return useQuery<SiteContent>({
    queryKey: ["siteContent"],
    queryFn: async (): Promise<SiteContent> => {
      const actor = await requireActor();
      const result = await actor.getSiteContent();
      return {
        siteName: result.siteName ?? "",
        logoImageUrl: result.logoImageUrl ?? "",
        headerTagline: result.headerTagline ?? "",
        siteSlogan:
          getSiteExtra().siteSlogan ??
          (result as unknown as Record<string, string>).siteSlogan ??
          "",
        footerAddress: result.footerAddress ?? "",
        footerPhone: result.footerPhone ?? "",
        footerEmail: result.footerEmail ?? "",
        footerSocialFacebook: result.footerSocialFacebook ?? "",
        footerSocialInstagram: result.footerSocialInstagram ?? "",
        footerSocialWhatsApp: result.footerSocialWhatsApp ?? "",
        contactAddress: result.contactAddress ?? "",
        contactPhone: result.contactPhone ?? "",
        contactEmail: result.contactEmail ?? "",
        contactHours: result.contactHours ?? "",
        contactMapEmbed: result.contactMapEmbed ?? "",
        aboutTitle: result.aboutTitle ?? "",
        aboutStory: result.aboutStory ?? "",
        aboutMission: result.aboutMission ?? "",
        aboutFoundedYear: result.aboutFoundedYear ?? "",
        aboutTeamInfo: result.aboutTeamInfo ?? "",
        ourStoryImageUrl:
          getSiteExtra().ourStoryImageUrl ??
          (result as unknown as Record<string, string>).ourStoryImageUrl ??
          "",
        ourStoryYearsOfCraft:
          getSiteExtra().ourStoryYearsOfCraft ??
          (result as unknown as Record<string, string>).ourStoryYearsOfCraft ??
          "5 years of craft",
        ourStoryProductCount:
          getSiteExtra().ourStoryProductCount ??
          (result as unknown as Record<string, string>).ourStoryProductCount ??
          "200+ Products",
        ourStoryHappyCustomers:
          getSiteExtra().ourStoryHappyCustomers ??
          (result as unknown as Record<string, string>)
            .ourStoryHappyCustomers ??
          "50K+ Happy Customers",
        specialOccasionsTitle: result.specialOccasionsTitle ?? "",
        specialOccasionsDescription: result.specialOccasionsDescription ?? "",
        specialOccasionsOfferings: result.specialOccasionsOfferings ?? "",
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSetSiteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: SiteContent): Promise<void> => {
      const actor = await requireActor();
      await ensureAdminRegistered(actor);
      // Strip frontend-only fields before sending to backend
      // (siteSlogan, ourStory* are not in the deployed backend SiteContent type)
      const backendContent = {
        siteName: content.siteName,
        logoImageUrl: content.logoImageUrl,
        headerTagline: content.headerTagline,
        footerAddress: content.footerAddress,
        footerPhone: content.footerPhone,
        footerEmail: content.footerEmail,
        footerSocialFacebook: content.footerSocialFacebook,
        footerSocialInstagram: content.footerSocialInstagram,
        footerSocialWhatsApp: content.footerSocialWhatsApp,
        contactAddress: content.contactAddress,
        contactPhone: content.contactPhone,
        contactEmail: content.contactEmail,
        contactHours: content.contactHours,
        contactMapEmbed: content.contactMapEmbed,
        aboutTitle: content.aboutTitle,
        aboutStory: content.aboutStory,
        aboutMission: content.aboutMission,
        aboutFoundedYear: content.aboutFoundedYear,
        aboutTeamInfo: content.aboutTeamInfo,
        specialOccasionsTitle: content.specialOccasionsTitle,
        specialOccasionsDescription: content.specialOccasionsDescription,
        specialOccasionsOfferings: content.specialOccasionsOfferings,
      };
      await actor.setSiteContent(backendContent as never);
      // Persist frontend-only fields to localStorage
      saveSiteExtra({
        siteSlogan: content.siteSlogan ?? "",
        ourStoryImageUrl: content.ourStoryImageUrl ?? "",
        ourStoryYearsOfCraft:
          content.ourStoryYearsOfCraft ?? "5 years of craft",
        ourStoryProductCount: content.ourStoryProductCount ?? "200+ Products",
        ourStoryHappyCustomers:
          content.ourStoryHappyCustomers ?? "50K+ Happy Customers",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteContent"] });
    },
  });
}

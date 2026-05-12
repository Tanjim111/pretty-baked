import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import CatalogTypes "../types/catalog";
import Common "../types/common";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  // ── Conversion ────────────────────────────────────────────────────────────

  public func toPublic(p : CatalogTypes.ProductInternal) : CatalogTypes.Product {
    {
      id = p.id;
      name = p.name;
      description = p.description;
      price = p.price;
      category = p.category;
      ingredients = p.ingredients;
      image = p.image;
      images = p.images;
      createdAt = p.createdAt;
    };
  };

  // ── Seeding ───────────────────────────────────────────────────────────────

  public func seedProducts(
    products : List.List<CatalogTypes.ProductInternal>,
    categories : List.List<CatalogTypes.Category>,
    nextProductId : { var value : Nat },
    nextCategoryId : { var value : Nat },
  ) {
    let now = Time.now();

    // ── Categories ────────────────────────────────────────────────────────
    // ID 1: Cakes
    categories.add({
      id = nextCategoryId.value;
      name = "Cakes";
      description = "Freshly baked cakes for all occasions";
      displayOrder = 1;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ID 2: Bread & Pastries
    categories.add({
      id = nextCategoryId.value;
      name = "Bread & Pastries";
      description = "Artisan breads and flaky pastries";
      displayOrder = 2;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ID 3: Cookies
    categories.add({
      id = nextCategoryId.value;
      name = "Cookies";
      description = "Handcrafted cookies baked fresh daily";
      displayOrder = 3;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ID 4: Custom Orders
    categories.add({
      id = nextCategoryId.value;
      name = "Custom Orders";
      description = "Bespoke cakes for weddings and special events";
      displayOrder = 4;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ID 5: Donuts
    categories.add({
      id = nextCategoryId.value;
      name = "Donuts";
      description = "Freshly fried and glazed donuts in delicious flavors";
      displayOrder = 5;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ID 6: Cupcakes
    categories.add({
      id = nextCategoryId.value;
      name = "Cupcakes";
      description = "Moist and fluffy cupcakes topped with creamy frosting";
      displayOrder = 6;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ID 7: Savory Items
    categories.add({
      id = nextCategoryId.value;
      name = "Savory Items";
      description = "Freshly baked savory snacks and breads";
      displayOrder = 7;
      createdAt = now;
    });
    nextCategoryId.value += 1;

    // ── Products (prices in BDT paisa: 1 BDT = 100 paisa) ─────────────────
    // Format: (name, description, price_paisa, categoryId, [ingredients])
    // ingredients[0] = JSON meta string with imageUrl/stock/isAvailable/isFeatured/sku
    // ingredients[1..] = actual ingredient strings

    let sampleProducts : [(Text, Text, Nat, Nat, [Text])] = [
      // ── Cakes (category 1) ──────────────────────────────────────────────
      (
        "Chocolate Cake",
        "Rich dark chocolate layers with silky ganache frosting, perfect for birthdays and celebrations",
        80000, // ৳800
        1,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400\",\"stock\":20,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-001\"}",
          "all-purpose flour",
          "dark cocoa powder",
          "free-range eggs",
          "unsalted butter",
          "granulated sugar",
          "heavy cream",
          "dark chocolate",
          "baking powder",
          "vanilla extract",
          "salt",
        ],
      ),
      (
        "Red Velvet Cake",
        "Classic red velvet with smooth cream cheese frosting and delicate velvet crumbs on top",
        90000, // ৳900
        1,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1586788680434-30d324626f39?w=400\",\"stock\":15,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-002\"}",
          "all-purpose flour",
          "cocoa powder",
          "buttermilk",
          "red food coloring",
          "cream cheese",
          "powdered sugar",
          "unsalted butter",
          "eggs",
          "white vinegar",
          "baking soda",
        ],
      ),
      (
        "Vanilla Cake",
        "Light and fluffy vanilla sponge with rich vanilla buttercream frosting",
        70000, // ৳700
        1,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400\",\"stock\":18,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-003\"}",
          "all-purpose flour",
          "free-range eggs",
          "unsalted butter",
          "granulated sugar",
          "pure vanilla extract",
          "whole milk",
          "baking powder",
          "salt",
        ],
      ),
      // ── Bread & Pastries (category 2) ───────────────────────────────────
      (
        "Croissant",
        "Flaky, buttery croissant baked to golden perfection — pairs beautifully with coffee",
        10000, // ৳100
        2,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400\",\"stock\":40,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-004\"}",
          "bread flour",
          "unsalted butter",
          "active dry yeast",
          "whole milk",
          "salt",
          "sugar",
          "egg wash",
        ],
      ),
      (
        "Garlic Bread",
        "Crispy artisan bread generously spread with garlic herb butter and toasted till golden",
        12000, // ৳120
        2,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400\",\"stock\":30,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-005\"}",
          "French baguette",
          "unsalted butter",
          "fresh garlic",
          "fresh parsley",
          "oregano",
          "salt",
          "mozzarella cheese",
        ],
      ),
      (
        "Pastry",
        "Assorted flaky pastries filled with fresh cream or seasonal fruit jam",
        11000, // ৳110
        2,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400\",\"stock\":25,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-008\"}",
          "puff pastry dough",
          "fresh cream",
          "fruit jam",
          "powdered sugar",
          "eggs",
          "unsalted butter",
          "vanilla extract",
        ],
      ),
      // ── Cookies (category 3) ────────────────────────────────────────────
      (
        "Butter Cookies",
        "Melt-in-your-mouth butter cookies with a hint of vanilla — sold by the dozen",
        35000, // ৳350 per dozen
        3,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400\",\"stock\":50,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-006\"}",
          "unsalted butter",
          "powdered sugar",
          "all-purpose flour",
          "free-range eggs",
          "pure vanilla extract",
          "cornstarch",
          "salt",
        ],
      ),
      // ── Custom Orders (category 4) ──────────────────────────────────────
      (
        "Custom Wedding Cake",
        "Fully customizable tiered wedding cake with premium fondant decorations and fresh flowers",
        350000, // ৳3500
        4,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400\",\"stock\":5,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-007\"}",
          "premium flour",
          "free-range eggs",
          "unsalted butter",
          "granulated sugar",
          "fondant",
          "edible glitter",
          "fresh flowers",
          "cream cheese frosting",
          "vanilla extract",
        ],
      ),
      // ── Donuts (category 5) ─────────────────────────────────────────────
      (
        "Chocolate Glazed Donut",
        "Soft, pillowy donut dipped in rich chocolate glaze — a crowd favorite",
        9000, // ৳90
        5,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400\",\"stock\":50,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-009\"}",
          "all-purpose flour",
          "active dry yeast",
          "whole milk",
          "eggs",
          "sugar",
          "unsalted butter",
          "dark chocolate",
          "heavy cream",
          "salt",
        ],
      ),
      (
        "Strawberry Frosted Donut",
        "Classic ring donut topped with sweet strawberry frosting and colorful sprinkles",
        9500, // ৳95
        5,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400\",\"stock\":45,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-010\"}",
          "all-purpose flour",
          "active dry yeast",
          "whole milk",
          "eggs",
          "sugar",
          "unsalted butter",
          "strawberry jam",
          "powdered sugar",
          "food coloring",
          "rainbow sprinkles",
        ],
      ),
      (
        "Glazed Ring Donut",
        "Light and airy ring donut coated in a classic sweet vanilla glaze",
        8000, // ৳80
        5,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1624379440810-0e82a78bfe8e?w=400\",\"stock\":60,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-011\"}",
          "all-purpose flour",
          "active dry yeast",
          "whole milk",
          "eggs",
          "sugar",
          "unsalted butter",
          "powdered sugar",
          "vanilla extract",
          "salt",
        ],
      ),
      // ── Cupcakes (category 6) ───────────────────────────────────────────
      (
        "Red Velvet Cupcake",
        "Moist red velvet cupcake topped with a generous swirl of cream cheese frosting",
        15000, // ৳150
        6,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400\",\"stock\":30,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-012\"}",
          "all-purpose flour",
          "cocoa powder",
          "buttermilk",
          "red food coloring",
          "cream cheese",
          "powdered sugar",
          "unsalted butter",
          "eggs",
          "vanilla extract",
          "baking soda",
        ],
      ),
      (
        "Chocolate Fudge Cupcake",
        "Decadent chocolate cupcake with silky fudge frosting and a chocolate ganache drizzle",
        14000, // ৳140
        6,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400\",\"stock\":35,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-013\"}",
          "all-purpose flour",
          "dark cocoa powder",
          "unsalted butter",
          "granulated sugar",
          "eggs",
          "whole milk",
          "dark chocolate",
          "heavy cream",
          "vanilla extract",
          "baking powder",
        ],
      ),
      (
        "Vanilla Rainbow Cupcake",
        "Fluffy vanilla cupcake with rainbow-colored swirl frosting — perfect for celebrations",
        13000, // ৳130
        6,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400\",\"stock\":40,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-014\"}",
          "all-purpose flour",
          "unsalted butter",
          "granulated sugar",
          "eggs",
          "whole milk",
          "pure vanilla extract",
          "food coloring (assorted)",
          "baking powder",
          "salt",
        ],
      ),
      // ── Savory Items (category 7) ───────────────────────────────────────
      (
        "Cheese Naan",
        "Soft, freshly baked naan bread stuffed with melted cheese — great as a snack",
        6000, // ৳60
        7,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400\",\"stock\":40,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-015\"}",
          "all-purpose flour",
          "active dry yeast",
          "plain yogurt",
          "mozzarella cheese",
          "cheddar cheese",
          "butter",
          "garlic",
          "salt",
          "sugar",
        ],
      ),
      (
        "Butter Naan",
        "Classic tandoor-style naan brushed with rich butter and fresh herbs",
        5000, // ৳50
        7,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400\",\"stock\":50,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-016\"}",
          "all-purpose flour",
          "active dry yeast",
          "plain yogurt",
          "unsalted butter",
          "fresh coriander",
          "salt",
          "sugar",
          "milk",
        ],
      ),
      (
        "Chicken Patty",
        "Golden flaky pastry shell filled with seasoned minced chicken and aromatic spices",
        12000, // ৳120
        7,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400\",\"stock\":30,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-017\"}",
          "puff pastry dough",
          "minced chicken",
          "onion",
          "green chili",
          "ginger-garlic paste",
          "garam masala",
          "turmeric",
          "salt",
          "coriander leaves",
          "egg wash",
        ],
      ),
      (
        "Spinach Samosa",
        "Crispy triangular pastry filled with spiced spinach and potato — a popular BD street snack",
        8000, // ৳80
        7,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400\",\"stock\":40,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-018\"}",
          "all-purpose flour",
          "fresh spinach",
          "potato",
          "onion",
          "green chili",
          "cumin seeds",
          "garam masala",
          "salt",
          "oil for frying",
        ],
      ),
      // ── Extras / Specials ───────────────────────────────────────────────
      (
        "Lemon Bar",
        "Buttery shortbread crust topped with tangy lemon curd and dusted with powdered sugar",
        11000, // ৳110
        3,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1606313564004-4cb8b5a4e6ea?w=400\",\"stock\":25,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-019\"}",
          "all-purpose flour",
          "unsalted butter",
          "powdered sugar",
          "fresh lemon juice",
          "lemon zest",
          "eggs",
          "granulated sugar",
          "salt",
        ],
      ),
      (
        "Macaron",
        "Delicate French macaron with crisp shells and a creamy ganache filling — assorted flavors",
        18000, // ৳180
        3,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400\",\"stock\":30,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-020\"}",
          "almond flour",
          "powdered sugar",
          "egg whites",
          "granulated sugar",
          "heavy cream",
          "dark chocolate",
          "unsalted butter",
          "food coloring",
        ],
      ),
      (
        "Eclair",
        "Choux pastry filled with smooth vanilla cream and topped with chocolate icing",
        16000, // ৳160
        2,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400\",\"stock\":20,\"isAvailable\":true,\"isFeatured\":false,\"sku\":\"PROD-021\"}",
          "all-purpose flour",
          "unsalted butter",
          "eggs",
          "whole milk",
          "heavy cream",
          "vanilla bean",
          "dark chocolate",
          "powdered sugar",
          "salt",
        ],
      ),
      (
        "Brownie",
        "Fudgy, dense chocolate brownie with a crackly top — the ultimate chocolate indulgence",
        13000, // ৳130
        3,
        [
          "{\"imageUrl\":\"https://images.unsplash.com/photo-1606312619070-d48b0c7e6888?w=400\",\"stock\":35,\"isAvailable\":true,\"isFeatured\":true,\"sku\":\"PROD-022\"}",
          "dark chocolate",
          "unsalted butter",
          "granulated sugar",
          "eggs",
          "all-purpose flour",
          "cocoa powder",
          "vanilla extract",
          "salt",
          "walnuts (optional)",
        ],
      ),
    ];

    for ((name, desc, price, catId, ingredients) in sampleProducts.vals()) {
      products.add({
        id = nextProductId.value;
        name;
        description = desc;
        price;
        category = catId;
        ingredients;
        image = null;
        images = [];
        createdAt = now;
      });
      nextProductId.value += 1;
    };
  };

  // ── Product operations ────────────────────────────────────────────────────

  public func getProduct(
    products : List.List<CatalogTypes.ProductInternal>,
    id : Common.ProductId,
  ) : ?CatalogTypes.Product {
    switch (products.find(func(p : CatalogTypes.ProductInternal) : Bool = p.id == id)) {
      case (?p) ?toPublic(p);
      case null null;
    };
  };

  public func listProducts(
    products : List.List<CatalogTypes.ProductInternal>,
  ) : [CatalogTypes.Product] {
    products.map<CatalogTypes.ProductInternal, CatalogTypes.Product>(toPublic).toArray();
  };

  public func listProductsByCategory(
    products : List.List<CatalogTypes.ProductInternal>,
    categoryId : Common.CategoryId,
  ) : [CatalogTypes.Product] {
    products.filter(func(p : CatalogTypes.ProductInternal) : Bool = p.category == categoryId)
      .map<CatalogTypes.ProductInternal, CatalogTypes.Product>(toPublic)
      .toArray();
  };

  public func addProduct(
    products : List.List<CatalogTypes.ProductInternal>,
    nextProductId : { var value : Nat },
    input : CatalogTypes.ProductInput,
  ) : Common.ProductId {
    let id = nextProductId.value;
    products.add({
      id;
      name = input.name;
      description = input.description;
      price = input.price;
      category = input.category;
      ingredients = input.ingredients;
      image = input.image;
      images = input.images;
      createdAt = Time.now();
    });
    nextProductId.value += 1;
    id;
  };

  public func updateProduct(
    products : List.List<CatalogTypes.ProductInternal>,
    id : Common.ProductId,
    input : CatalogTypes.ProductInput,
  ) : Bool {
    var found = false;
    products.mapInPlace(
      func(p : CatalogTypes.ProductInternal) : CatalogTypes.ProductInternal {
        if (p.id == id) {
          found := true;
          {
            id = p.id;
            name = input.name;
            description = input.description;
            price = input.price;
            category = input.category;
            ingredients = input.ingredients;
            image = input.image;
            images = input.images;
            createdAt = p.createdAt;
          };
        } else {
          p;
        };
      }
    );
    found;
  };

  public func deleteProduct(
    products : List.List<CatalogTypes.ProductInternal>,
    id : Common.ProductId,
  ) : Bool {
    let before = products.size();
    let kept = products.filter(func(p : CatalogTypes.ProductInternal) : Bool = p.id != id);
    products.clear();
    products.addAll(kept.values());
    products.size() < before;
  };

  // ── Category operations ───────────────────────────────────────────────────

  public func getCategory(
    categories : List.List<CatalogTypes.Category>,
    id : Common.CategoryId,
  ) : ?CatalogTypes.Category {
    categories.find(func(c : CatalogTypes.Category) : Bool = c.id == id);
  };

  public func listCategories(
    categories : List.List<CatalogTypes.Category>,
  ) : [CatalogTypes.Category] {
    categories.toArray();
  };

  public func addCategory(
    categories : List.List<CatalogTypes.Category>,
    nextCategoryId : { var value : Nat },
    input : CatalogTypes.CategoryInput,
  ) : Common.CategoryId {
    let id = nextCategoryId.value;
    categories.add({
      id;
      name = input.name;
      description = input.description;
      displayOrder = input.displayOrder;
      createdAt = Time.now();
    });
    nextCategoryId.value += 1;
    id;
  };

  public func updateCategory(
    categories : List.List<CatalogTypes.Category>,
    id : Common.CategoryId,
    input : CatalogTypes.CategoryInput,
  ) : Bool {
    var found = false;
    categories.mapInPlace(
      func(c : CatalogTypes.Category) : CatalogTypes.Category {
        if (c.id == id) {
          found := true;
          {
            id = c.id;
            name = input.name;
            description = input.description;
            displayOrder = input.displayOrder;
            createdAt = c.createdAt;
          };
        } else {
          c;
        };
      }
    );
    found;
  };

  public func deleteCategory(
    categories : List.List<CatalogTypes.Category>,
    id : Common.CategoryId,
  ) : Bool {
    let before = categories.size();
    let kept = categories.filter(func(c : CatalogTypes.Category) : Bool = c.id != id);
    categories.clear();
    categories.addAll(kept.values());
    categories.size() < before;
  };

  // ── Low stock helpers ─────────────────────────────────────────────────────

  /// Parse the stock quantity from the JSON meta string stored in ingredients[0].
  /// Meta format: {"imageUrl":"...","stock":20,"isAvailable":true,...}
  func parseStockFromMeta(meta : Text) : ?Nat {
    let stockKey = "\"stock\":"; 
    let parts = meta.split(#text stockKey);
    var partsArr : [Text] = [];
    for (p in parts) {
      partsArr := partsArr.concat([p]);
    };
    if (partsArr.size() < 2) return null;
    let afterKey = partsArr[1];
    var numStr : Text = "";
    label digitLoop for (ch in afterKey.toIter()) {
      if (ch >= '0' and ch <= '9') {
        numStr := numStr # Text.fromChar(ch);
      } else {
        break digitLoop;
      };
    };
    if (numStr.size() == 0) null
    else Nat.fromText(numStr);
  };

  /// Return all products whose stock quantity (from ingredients[0] meta) is below threshold.
  public func getLowStockProducts(
    products : List.List<CatalogTypes.ProductInternal>,
    threshold : Nat,
  ) : [CatalogTypes.Product] {
    products.filter(func(p : CatalogTypes.ProductInternal) : Bool {
      if (p.ingredients.size() > 0) {
        switch (parseStockFromMeta(p.ingredients[0])) {
          case (?qty) qty < threshold;
          case null false;
        };
      } else { false };
    }).map<CatalogTypes.ProductInternal, CatalogTypes.Product>(toPublic).toArray();
  };

  // ── Image operations ──────────────────────────────────────────────────────

  public func getProductImage(
    products : List.List<CatalogTypes.ProductInternal>,
    id : Common.ProductId,
  ) : ?Blob {
    switch (products.find(func(p : CatalogTypes.ProductInternal) : Bool = p.id == id)) {
      case (?p) p.image;
      case null null;
    };
  };

  public func setProductImage(
    products : List.List<CatalogTypes.ProductInternal>,
    id : Common.ProductId,
    image : ?Blob,
  ) : Bool {
    var found = false;
    products.mapInPlace(
      func(p : CatalogTypes.ProductInternal) : CatalogTypes.ProductInternal {
        if (p.id == id) {
          found := true;
          { p with image };
        } else {
          p;
        };
      }
    );
    found;
  };

};


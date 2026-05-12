import List "mo:core/List";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import CatalogLib "../lib/catalog";
import CatalogTypes "../types/catalog";
import Common "../types/common";

mixin (
  admins : Set.Set<Principal>,
  products : List.List<CatalogTypes.ProductInternal>,
  categories : List.List<CatalogTypes.Category>,
  nextProductId : { var value : Nat },
  nextCategoryId : { var value : Nat },
) {
  // ── Customer-facing queries ──────────────────────────────────────────────

  public query func getProducts() : async [CatalogTypes.Product] {
    CatalogLib.listProducts(products);
  };

  public query func getProductById(id : Common.ProductId) : async ?CatalogTypes.Product {
    CatalogLib.getProduct(products, id);
  };

  public query func getCategories() : async [CatalogTypes.Category] {
    CatalogLib.listCategories(categories);
  };

  public query func getProductsByCategory(categoryId : Common.CategoryId) : async [CatalogTypes.Product] {
    CatalogLib.listProductsByCategory(products, categoryId);
  };

  // ── Admin operations ─────────────────────────────────────────────────────

  public shared ({ caller }) func addProduct(input : CatalogTypes.ProductInput) : async Common.ProductId {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    CatalogLib.addProduct(products, nextProductId, input);
  };

  public shared ({ caller }) func updateProduct(id : Common.ProductId, input : CatalogTypes.ProductInput) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    CatalogLib.updateProduct(products, id, input);
  };

  public shared ({ caller }) func deleteProduct(id : Common.ProductId) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    CatalogLib.deleteProduct(products, id);
  };

  public shared ({ caller }) func addCategory(input : CatalogTypes.CategoryInput) : async Common.CategoryId {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    CatalogLib.addCategory(categories, nextCategoryId, input);
  };

  public shared ({ caller }) func updateCategory(id : Common.CategoryId, input : CatalogTypes.CategoryInput) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    CatalogLib.updateCategory(categories, id, input);
  };

  public shared ({ caller }) func deleteCategory(id : Common.CategoryId) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    CatalogLib.deleteCategory(categories, id);
  };

  // ── Image operations ─────────────────────────────────────────────────────

  public query func getProductImage(id : Common.ProductId) : async ?Blob {
    CatalogLib.getProductImage(products, id);
  };

  public shared ({ caller }) func setProductImage(id : Common.ProductId, image : ?Blob) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can set product images");
    };
    CatalogLib.setProductImage(products, id, image);
  };

  public shared ({ caller }) func uploadProductImage(id : Common.ProductId, imageBytes : Blob) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can upload product images");
    };
    CatalogLib.setProductImage(products, id, ?imageBytes);
  };

  // ── Gallery images (up to 4 additional per product) ──────────────────────

  /// Returns the additional gallery images for a product (not including primary image).
  public query func getProductImages(id : Common.ProductId) : async [Blob] {
    switch (products.find(func(p : CatalogTypes.ProductInternal) : Bool = p.id == id)) {
      case null [];
      case (?p) p.images;
    };
  };

  /// Admin: replace all gallery images for a product (max 4).
  public shared ({ caller }) func setProductImages(id : Common.ProductId, images : [Blob]) : async Bool {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can set product gallery images");
    };
    // Cap at 4 images
    let capped : [Blob] = if (images.size() > 4) {
      images.sliceToArray(0, 4);
    } else {
      images;
    };
    var found = false;
    products.mapInPlace(func(p : CatalogTypes.ProductInternal) : CatalogTypes.ProductInternal {
      if (p.id == id) {
        found := true;
        { p with images = capped };
      } else {
        p;
      };
    });
    found;
  };

  // ── Stock alerts ──────────────────────────────────────────────────────────

  /// Extract stock value from ingredients[0] JSON metadata string.
  /// The metadata looks like: {"imageUrl":"...","stock":20,"isAvailable":true,...}
  /// Parses by splitting on "stock": and extracting the leading number.
  func parseStockFromMeta(meta : Text) : ?Nat {
    let stockKey = "\"stock\":";
    let parts = meta.split(#text stockKey);
    // Collect into array so we can index
    var partsArr : [Text] = [];
    for (p in parts) {
      partsArr := partsArr.concat([p]);
    };
    if (partsArr.size() < 2) return null;
    let afterKey = partsArr[1];
    // Collect leading digit characters
    var numStr = "";
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

  /// Returns products with stock below the given threshold.
  /// Stock quantity is encoded as JSON in ingredients[0] metadata.
  public query ({ caller }) func getLowStockProducts(threshold : Nat) : async [CatalogTypes.Product] {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can view low stock alerts");
    };
    let result = products.filter(func(p : CatalogTypes.ProductInternal) : Bool {
      if (p.ingredients.size() == 0) return false;
      switch (parseStockFromMeta(p.ingredients[0])) {
        case null false;
        case (?stock) stock < threshold;
      };
    });
    result.map<CatalogTypes.ProductInternal, CatalogTypes.Product>(CatalogLib.toPublic).toArray();
  };
};

import List "mo:core/List";
import Text "mo:core/Text";
import CatalogTypes "../types/catalog";
import Common "../types/common";

module {
  // ── System prompt builder ─────────────────────────────────────────────────

  /// Format a price in paisa to a BDT string: e.g. 85000 -> "850.00 BDT"
  func formatPrice(paisa : Nat) : Text {
    let bdtWhole = paisa / 100;
    let bdtFrac = paisa % 100;
    let fracStr = if (bdtFrac < 10) ("0" # bdtFrac.toText()) else bdtFrac.toText();
    bdtWhole.toText() # "." # fracStr # " BDT";
  };

  /// Build the system prompt with the full product catalog injected
  public func buildSystemPrompt(
    products : List.List<CatalogTypes.ProductInternal>,
    categories : List.List<CatalogTypes.Category>,
  ) : Text {
    // Build category section
    var catSection = "";
    categories.forEach(func(c : CatalogTypes.Category) {
      catSection #= "- " # c.name # ": " # c.description # "\n";
    });

    // Build product section
    var productSection = "";
    products.forEach(func(p : CatalogTypes.ProductInternal) {
      let catName = switch (categories.find(func(c : CatalogTypes.Category) : Bool = c.id == p.category)) {
        case (?c) c.name;
        case null "Other";
      };
      var ingredientList = "";
      var first = true;
      for (ing in p.ingredients.vals()) {
        if (first) { first := false } else { ingredientList #= ", " };
        ingredientList #= ing;
      };
      productSection #= "- " # p.name # " (" # catName # ") — Price: " # formatPrice(p.price) #
        " | " # p.description #
        " | Ingredients: " # ingredientList # "\n";
    });

    "You are Bakey, a friendly and knowledgeable AI assistant for Pretty Baked, a premium online bakery shop in Bangladesh. " #
    "You help customers discover products, check prices, learn about ingredients, and make it easy to explore the bakery's offerings. " #
    "Always be warm, cheerful, and helpful. Answer in the same language the customer uses. " #
    "If a customer asks about a product not in the catalog, politely let them know it's not currently available and suggest similar items. " #
    "For ordering, guide customers to use the website's shopping cart.\n\n" #
    "=== PRETTY BAKED PRODUCT CATALOG ===\n\n" #
    "CATEGORIES:\n" # catSection # "\n" #
    "PRODUCTS:\n" # productSection # "\n" #
    "=== END OF CATALOG ===\n\n" #
    "Use the catalog above to answer any product-related questions accurately. " #
    "Always mention prices in BDT. Be concise but friendly.";
  };

  // ── JSON helpers ──────────────────────────────────────────────────────────

  /// Escape special characters in a JSON string value
  public func jsonEscape(s : Text) : Text {
    var result = s;
    result := result.replace(#text "\\", "\\\\");
    result := result.replace(#text "\"", "\\\"");
    result := result.replace(#text "\n", "\\n");
    result := result.replace(#text "\r", "\\r");
    result := result.replace(#text "\t", "\\t");
    result;
  };

  /// Serialize a ChatMessage to a JSON object string
  func serializeMessage(msg : Common.ChatMessage) : Text {
    "{\"role\":\"" # jsonEscape(msg.role) # "\",\"content\":\"" # jsonEscape(msg.content) # "\"}";
  };

  /// Build the full JSON request body for the Together AI chat endpoint
  public func buildRequestBody(
    systemPrompt : Text,
    history : [Common.ChatMessage],
    userMessage : Text,
  ) : Text {
    // Build messages array: system + history + current user message
    var messagesJson = "{\"role\":\"system\",\"content\":\"" # jsonEscape(systemPrompt) # "\"}";
    for (msg in history.vals()) {
      messagesJson #= "," # serializeMessage(msg);
    };
    messagesJson #= ",{\"role\":\"user\",\"content\":\"" # jsonEscape(userMessage) # "\"}";

    "{\"model\":\"mistralai/Mixtral-8x7B-Instruct-v0.1\",\"messages\":[" # messagesJson # "],\"max_tokens\":512,\"temperature\":0.7}";
  };

  // ── Response parser ───────────────────────────────────────────────────────

  /// Extract the assistant message content from a Together AI JSON response.
  /// Looks for the first occurrence of "content":" and extracts the value.
  public func extractContent(responseJson : Text) : ?Text {
    let marker = "\"content\":\"";
    // Split on the marker; if we get at least 2 parts, the second starts with the content
    let parts = responseJson.split(#text marker).toArray();
    if (parts.size() < 2) {
      return null;
    };
    // parts[1] starts right after the first "content":"
    // Read chars until an unescaped closing quote
    let dquote = Text.fromChar('\u{22}'); // double-quote character
    let chars = parts[1].toIter();
    var content = "";
    var escaped = false;
    var done = false;
    label scan for (c in chars) {
      if (done) { break scan };
      let ch = Text.fromChar(c);
      if (escaped) {
        if (ch == "\\") { content #= "\\" }
        else if (ch == dquote) { content #= dquote }
        else if (ch == "n") { content #= "\n" }
        else if (ch == "r") { content #= "\r" }
        else if (ch == "t") { content #= "\t" }
        else { content #= ch };
        escaped := false;
      } else if (ch == "\\") {
        escaped := true;
      } else if (ch == dquote) {
        done := true;
      } else {
        content #= ch;
      };
    };
    if (done) ?content else null;
  };
};

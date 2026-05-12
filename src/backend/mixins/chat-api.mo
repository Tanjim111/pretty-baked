import List "mo:core/List";
import Text "mo:core/Text";
import CatalogTypes "../types/catalog";
import Common "../types/common";
import ChatLib "../lib/chat";

mixin (
  products : List.List<CatalogTypes.ProductInternal>,
  categories : List.List<CatalogTypes.Category>,
) {
  let TOGETHER_API_KEY = "YOUR_TOGETHER_AI_KEY";
  let TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

  public shared func chatWithBakey(
    userMessage : Text,
    conversationHistory : [Common.ChatMessage],
  ) : async Text {
    // IC management canister reference for HTTP outcalls
    let ic = actor "aaaaa-aa" : actor {
      http_request : shared ({
        url : Text;
        max_response_bytes : ?Nat64;
        method : { #get; #head; #post };
        headers : [{ name : Text; value : Text }];
        body : ?Blob;
        transform : ?{
          function : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
          context : Blob;
        };
        is_replicated : ?Bool;
      }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
    };

    let systemPrompt = ChatLib.buildSystemPrompt(products, categories);
    let requestBody = ChatLib.buildRequestBody(systemPrompt, conversationHistory, userMessage);
    let bodyBlob = requestBody.encodeUtf8();

    let request = {
      url = TOGETHER_API_URL;
      max_response_bytes = ?(32768 : Nat64);
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # TOGETHER_API_KEY },
      ];
      body = ?bodyBlob;
      transform = null;
      is_replicated = ?(false);
    };

    try {
      let response = await ic.http_request(request);
      let responseText = switch (response.body.decodeUtf8()) {
        case (?t) t;
        case null "";
      };
      switch (ChatLib.extractContent(responseText)) {
        case (?content) content;
        case null "Sorry, I couldn't understand the response. Please try again!";
      };
    } catch (_) {
      "Sorry, I am having trouble connecting right now. Please try again!";
    };
  };
};

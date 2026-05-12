import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import SiteContentLib "../lib/site-content";
import Common "../types/common";

mixin (
  admins : Set.Set<Principal>,
  siteContentStore : { var content : Common.SiteContent },
) {
  // ── Public: get site content ──────────────────────────────────────────────
  public query func getSiteContent() : async Common.SiteContent {
    SiteContentLib.getSiteContent(siteContentStore);
  };

  // ── Admin: set site content ───────────────────────────────────────────────
  public shared ({ caller }) func setSiteContent(content : Common.SiteContent) : async () {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can update site content");
    };
    SiteContentLib.setSiteContent(siteContentStore, content);
  };
};

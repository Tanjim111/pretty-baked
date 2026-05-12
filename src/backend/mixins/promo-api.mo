import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import PromoLib "../lib/promo";
import Common "../types/common";

mixin (
  admins : Set.Set<Principal>,
  promoState : { var announcement : ?Common.PromoAnnouncement },
) {
  // ── Admin: set the promotional announcement ────────────────────────────────
  public shared ({ caller }) func setPromoAnnouncement(input : Common.PromoAnnouncement) : async () {
    if (not admins.contains(caller)) {
      Runtime.trap("Unauthorized: Only admins can set promo announcements");
    };
    PromoLib.setPromoAnnouncement(promoState, input);
  };

  // ── Public: get the current promotional announcement ──────────────────────
  public query func getPromoAnnouncement() : async ?Common.PromoAnnouncement {
    PromoLib.getPromoAnnouncement(promoState);
  };
};

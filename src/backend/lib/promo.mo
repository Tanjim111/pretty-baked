import Common "../types/common";

module {
  public type PromoAnnouncement = Common.PromoAnnouncement;

  // Set (replace) the current promo announcement
  public func setPromoAnnouncement(
    state : { var announcement : ?PromoAnnouncement },
    input : PromoAnnouncement,
  ) : () {
    state.announcement := ?input;
  };

  // Get the current promo announcement; returns null if none set
  public func getPromoAnnouncement(
    state : { var announcement : ?PromoAnnouncement },
  ) : ?PromoAnnouncement {
    state.announcement;
  };
};

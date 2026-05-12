import Common "../types/common";

module {
  public type SiteContent = Common.SiteContent;

  public let defaultSiteContent : SiteContent = {
    siteName = "Pretty Baked";
    logoImageUrl = "";
    headerTagline = "";
    footerAddress = "";
    footerPhone = "";
    footerEmail = "";
    footerSocialFacebook = "";
    footerSocialInstagram = "";
    footerSocialWhatsApp = "";
    contactAddress = "";
    contactPhone = "";
    contactEmail = "";
    contactHours = "";
    contactMapEmbed = "";
    aboutTitle = "";
    aboutStory = "";
    aboutMission = "";
    aboutFoundedYear = "";
    aboutTeamInfo = "";
    specialOccasionsTitle = "";
    specialOccasionsDescription = "";
    specialOccasionsOfferings = "";
  };

  public func getSiteContent(
    store : { var content : SiteContent },
  ) : SiteContent {
    store.content;
  };

  public func setSiteContent(
    store : { var content : SiteContent },
    input : SiteContent,
  ) : () {
    store.content := input;
  };
};

// SiteContentMigration.mo
// Explicit migration to add new fields to SiteContent:
//   siteSlogan, ourStoryImageUrl, ourStoryYearsOfCraft,
//   ourStoryProductCount, ourStoryHappyCustomers

module {
  // Old SiteContent type (before new fields were added)
  type OldSiteContent = {
    siteName : Text;
    logoImageUrl : Text;
    headerTagline : Text;
    footerAddress : Text;
    footerPhone : Text;
    footerEmail : Text;
    footerSocialFacebook : Text;
    footerSocialInstagram : Text;
    footerSocialWhatsApp : Text;
    contactAddress : Text;
    contactPhone : Text;
    contactEmail : Text;
    contactHours : Text;
    contactMapEmbed : Text;
    aboutTitle : Text;
    aboutStory : Text;
    aboutMission : Text;
    aboutFoundedYear : Text;
    aboutTeamInfo : Text;
    specialOccasionsTitle : Text;
    specialOccasionsDescription : Text;
    specialOccasionsOfferings : Text;
  };

  // New SiteContent type (with the five new fields)
  type NewSiteContent = {
    siteName : Text;
    logoImageUrl : Text;
    headerTagline : Text;
    footerAddress : Text;
    footerPhone : Text;
    footerEmail : Text;
    footerSocialFacebook : Text;
    footerSocialInstagram : Text;
    footerSocialWhatsApp : Text;
    contactAddress : Text;
    contactPhone : Text;
    contactEmail : Text;
    contactHours : Text;
    contactMapEmbed : Text;
    aboutTitle : Text;
    aboutStory : Text;
    aboutMission : Text;
    aboutFoundedYear : Text;
    aboutTeamInfo : Text;
    specialOccasionsTitle : Text;
    specialOccasionsDescription : Text;
    specialOccasionsOfferings : Text;
    siteSlogan : Text;
    ourStoryImageUrl : Text;
    ourStoryYearsOfCraft : Text;
    ourStoryProductCount : Text;
    ourStoryHappyCustomers : Text;
  };

  // Migration: fill new fields with sensible defaults
  public func migration(
    old : { var content : OldSiteContent }
  ) : { var content : NewSiteContent } {
    let newContent : NewSiteContent = {
      siteName = old.content.siteName;
      logoImageUrl = old.content.logoImageUrl;
      headerTagline = old.content.headerTagline;
      footerAddress = old.content.footerAddress;
      footerPhone = old.content.footerPhone;
      footerEmail = old.content.footerEmail;
      footerSocialFacebook = old.content.footerSocialFacebook;
      footerSocialInstagram = old.content.footerSocialInstagram;
      footerSocialWhatsApp = old.content.footerSocialWhatsApp;
      contactAddress = old.content.contactAddress;
      contactPhone = old.content.contactPhone;
      contactEmail = old.content.contactEmail;
      contactHours = old.content.contactHours;
      contactMapEmbed = old.content.contactMapEmbed;
      aboutTitle = old.content.aboutTitle;
      aboutStory = old.content.aboutStory;
      aboutMission = old.content.aboutMission;
      aboutFoundedYear = old.content.aboutFoundedYear;
      aboutTeamInfo = old.content.aboutTeamInfo;
      specialOccasionsTitle = old.content.specialOccasionsTitle;
      specialOccasionsDescription = old.content.specialOccasionsDescription;
      specialOccasionsOfferings = old.content.specialOccasionsOfferings;
      siteSlogan = "";
      ourStoryImageUrl = "/assets/generated/about-bakery.dim_800x600.jpg";
      ourStoryYearsOfCraft = "5 years of craft";
      ourStoryProductCount = "200+ Products";
      ourStoryHappyCustomers = "50K+ Happy Customers";
    };
    { var content = newContent };
  };
};

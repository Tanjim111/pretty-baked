import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Building2,
  FileEdit,
  Globe,
  ImageIcon,
  Loader2,
  MapPin,
  PartyPopper,
  Save,
  Store,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetSiteContent, useSetSiteContent } from "../../hooks/useBackend";
import type { SiteContent } from "../../types";

const DEFAULT_CONTENT: SiteContent = {
  siteName: "Pretty Baked",
  logoImageUrl: "",
  headerTagline: "Artisan Bakery Since 2010",
  siteSlogan: "",
  footerAddress: "123 Bakery Street, Thakurgaon, Bangladesh",
  footerPhone: "+880 1701-965947",
  footerEmail: "hello@prettybaked.com",
  footerSocialFacebook: "https://facebook.com/prettybaked",
  footerSocialInstagram: "https://instagram.com/prettybaked",
  footerSocialWhatsApp: "+8801701965947",
  contactAddress: "123 Bakery Street, Thakurgaon, Bangladesh",
  contactPhone: "+880 1701-965947",
  contactEmail: "hello@prettybaked.com",
  contactHours: "Mon–Sat: 8am–9pm, Sun: 9am–6pm",
  contactMapEmbed: "",
  aboutTitle: "Our Story",
  aboutStory:
    "Pretty Baked was born out of a passion for artisan baking and bringing joy through freshly baked goods. Every product is made with love and the finest ingredients.",
  aboutMission:
    "To craft bakery products that make every occasion sweeter, while supporting our local community.",
  aboutFoundedYear: "2010",
  aboutTeamInfo:
    "Our team of passionate bakers brings years of artisan experience to every product.",
  ourStoryImageUrl: "",
  ourStoryYearsOfCraft: "5 years of craft",
  ourStoryProductCount: "200+ Products",
  ourStoryHappyCustomers: "50K+ Happy Customers",
  specialOccasionsTitle: "Special Occasions",
  specialOccasionsDescription:
    "Make your celebrations unforgettable with our bespoke cakes and pastries for weddings, birthdays, and corporate events.",
  specialOccasionsOfferings:
    "Wedding Cakes, Birthday Cakes, Anniversary Cakes, Corporate Events, Eid Specials, Festival Gift Boxes",
};

// ---------------------------------------------------------------------------
// Image compression helper
// ---------------------------------------------------------------------------
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 512;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas error"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Image load error"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  ocid: string;
}

function Section({
  title,
  icon,
  children,
  onSave,
  saving,
  ocid,
}: SectionProps) {
  const Icon = icon;
  return (
    <Card className="bg-card border-border shadow-warm" data-ocid={ocid}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <Icon size={16} className="text-primary" />
            {title}
          </CardTitle>
          <Button
            size="sm"
            className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onSave}
            disabled={saving}
            data-ocid={`${ocid}.save_button`}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Save
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 space-y-4">{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------
function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminSiteContentPage() {
  const { data: remote, isLoading } = useGetSiteContent();
  const setContent = useSetSiteContent();

  const [form, setForm] = useState<SiteContent>(DEFAULT_CONTENT);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const ourStoryImageRef = useRef<HTMLInputElement>(null);

  // Hydrate form once remote data arrives
  useEffect(() => {
    if (remote) {
      setForm(remote);
    }
  }, [remote]);

  function update(field: keyof SiteContent, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, logoImageUrl: compressed }));
    } catch {
      toast.error("Failed to process image. Please try a different file.");
    }
  }

  async function handleOurStoryImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, ourStoryImageUrl: compressed }));
    } catch {
      toast.error("Failed to process image. Please try a different file.");
    }
  }

  async function save(section: string) {
    setSavingSection(section);
    try {
      await setContent.mutateAsync(form);
      toast.success(`${section} saved successfully!`);
    } catch {
      toast.error(`Failed to save ${section}. Please try again.`);
    } finally {
      setSavingSection(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="admin.site_content.page">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Site Content
          </h2>
          <p className="text-muted-foreground text-sm">Loading content…</p>
        </div>
        {[1, 2, 3, 4, 5].map((k) => (
          <div
            key={k}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="admin.site_content.page">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <FileEdit size={22} className="text-primary" />
          Site Content
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Edit website identity, header, footer, contact, about us, and special
          occasions content. Changes are saved per section.
        </p>
      </div>

      {/* ── Website Identity ────────────────────────────────────── */}
      <Section
        title="Website Identity"
        icon={Store}
        onSave={() => save("Website Identity")}
        saving={savingSection === "Website Identity"}
        ocid="admin.site_content.identity"
      >
        <Field label="Website Name" id="siteName">
          <Input
            id="siteName"
            value={form.siteName}
            onChange={(e) => update("siteName", e.target.value)}
            placeholder="Pretty Baked"
            className="border-input focus:border-primary"
            data-ocid="admin.site_content.identity.site_name_input"
          />
        </Field>

        <Field label="Website Logo" id="logoUpload">
          <div className="space-y-3">
            {/* Current logo preview */}
            {form.logoImageUrl ? (
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center flex-shrink-0">
                  <img
                    src={form.logoImageUrl}
                    alt="Website logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    className="gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary"
                    data-ocid="admin.site_content.identity.change_logo_button"
                  >
                    <ImageIcon size={13} />
                    Change Logo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => update("logoImageUrl", "")}
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    data-ocid="admin.site_content.identity.remove_logo_button"
                  >
                    <X size={13} />
                    Remove Logo
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-smooth p-6 text-muted-foreground hover:text-primary cursor-pointer"
                data-ocid="admin.site_content.identity.upload_button"
              >
                <ImageIcon size={24} />
                <span className="text-sm font-medium">
                  Click to upload logo
                </span>
                <span className="text-xs opacity-70">
                  JPG, PNG, WebP — max 2 MB
                </span>
              </button>
            )}

            {/* Hidden file input */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              data-ocid="admin.site_content.identity.logo_file_input"
            />
          </div>
        </Field>

        <Field label="Website Slogan" id="siteSlogan">
          <Input
            id="siteSlogan"
            value={form.siteSlogan}
            onChange={(e) => update("siteSlogan", e.target.value)}
            placeholder="e.g. Baked with love, every single day"
            className="border-input focus:border-primary"
            data-ocid="admin.site_content.identity.slogan_input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Short tagline shown below the site name or in promotional areas.
          </p>
        </Field>
      </Section>

      {/* ── Header Info ────────────────────────────────────────── */}
      <Section
        title="Header Info"
        icon={Globe}
        onSave={() => save("Header Info")}
        saving={savingSection === "Header Info"}
        ocid="admin.site_content.header"
      >
        <Field label="Header Tagline" id="headerTagline">
          <Input
            id="headerTagline"
            value={form.headerTagline}
            onChange={(e) => update("headerTagline", e.target.value)}
            placeholder="Artisan Bakery Since 2010"
            className="border-input focus:border-primary"
            data-ocid="admin.site_content.header.tagline_input"
          />
        </Field>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Section
        title="Footer"
        icon={Building2}
        onSave={() => save("Footer")}
        saving={savingSection === "Footer"}
        ocid="admin.site_content.footer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address" id="footerAddress">
            <Input
              id="footerAddress"
              value={form.footerAddress}
              onChange={(e) => update("footerAddress", e.target.value)}
              placeholder="123 Bakery Street, Dhaka"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.footer.address_input"
            />
          </Field>
          <Field label="Phone" id="footerPhone">
            <Input
              id="footerPhone"
              value={form.footerPhone}
              onChange={(e) => update("footerPhone", e.target.value)}
              placeholder="+880 1701-965947"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.footer.phone_input"
            />
          </Field>
          <Field label="Email" id="footerEmail">
            <Input
              id="footerEmail"
              type="email"
              value={form.footerEmail}
              onChange={(e) => update("footerEmail", e.target.value)}
              placeholder="hello@prettybaked.com"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.footer.email_input"
            />
          </Field>
          <Field label="Facebook URL" id="footerFacebook">
            <Input
              id="footerFacebook"
              value={form.footerSocialFacebook}
              onChange={(e) => update("footerSocialFacebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.footer.facebook_input"
            />
          </Field>
          <Field label="Instagram URL" id="footerInstagram">
            <Input
              id="footerInstagram"
              value={form.footerSocialInstagram}
              onChange={(e) => update("footerSocialInstagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.footer.instagram_input"
            />
          </Field>
          <Field label="WhatsApp Number" id="footerWhatsApp">
            <Input
              id="footerWhatsApp"
              value={form.footerSocialWhatsApp}
              onChange={(e) => update("footerSocialWhatsApp", e.target.value)}
              placeholder="+8801701965947"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.footer.whatsapp_input"
            />
          </Field>
        </div>
      </Section>

      {/* ── Contact Information ─────────────────────────────────── */}
      <Section
        title="Contact Information"
        icon={MapPin}
        onSave={() => save("Contact Information")}
        saving={savingSection === "Contact Information"}
        ocid="admin.site_content.contact"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Address" id="contactAddress">
            <Input
              id="contactAddress"
              value={form.contactAddress}
              onChange={(e) => update("contactAddress", e.target.value)}
              placeholder="123 Bakery Street, Dhaka"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.contact.address_input"
            />
          </Field>
          <Field label="Phone" id="contactPhone">
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+880 1701-965947"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.contact.phone_input"
            />
          </Field>
          <Field label="Email" id="contactEmail">
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="hello@prettybaked.com"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.contact.email_input"
            />
          </Field>
          <Field label="Business Hours" id="contactHours">
            <Input
              id="contactHours"
              value={form.contactHours}
              onChange={(e) => update("contactHours", e.target.value)}
              placeholder="Mon–Sat: 8am–9pm"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.contact.hours_input"
            />
          </Field>
        </div>
        <Field
          label="Map Embed URL (Google Maps iframe src)"
          id="contactMapEmbed"
        >
          <Textarea
            id="contactMapEmbed"
            value={form.contactMapEmbed}
            onChange={(e) => update("contactMapEmbed", e.target.value)}
            placeholder="https://maps.google.com/maps?..."
            className="border-input focus:border-primary resize-none h-20 text-sm"
            data-ocid="admin.site_content.contact.map_embed_textarea"
          />
        </Field>
      </Section>

      {/* ── About Us ───────────────────────────────────────────── */}
      <Section
        title="About Us"
        icon={BookOpen}
        onSave={() => save("About Us")}
        saving={savingSection === "About Us"}
        ocid="admin.site_content.about"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Page Title" id="aboutTitle">
            <Input
              id="aboutTitle"
              value={form.aboutTitle}
              onChange={(e) => update("aboutTitle", e.target.value)}
              placeholder="Our Story"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.about.title_input"
            />
          </Field>
          <Field label="Founded Year" id="aboutFoundedYear">
            <Input
              id="aboutFoundedYear"
              value={form.aboutFoundedYear}
              onChange={(e) => update("aboutFoundedYear", e.target.value)}
              placeholder="2010"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.about.founded_year_input"
            />
          </Field>
        </div>
        <Field label="Our Story" id="aboutStory">
          <Textarea
            id="aboutStory"
            value={form.aboutStory}
            onChange={(e) => update("aboutStory", e.target.value)}
            placeholder="Tell the story of how Pretty Baked started…"
            className="border-input focus:border-primary resize-none h-28 text-sm"
            data-ocid="admin.site_content.about.story_textarea"
          />
        </Field>
        <Field label="Our Mission" id="aboutMission">
          <Textarea
            id="aboutMission"
            value={form.aboutMission}
            onChange={(e) => update("aboutMission", e.target.value)}
            placeholder="Our mission is to…"
            className="border-input focus:border-primary resize-none h-20 text-sm"
            data-ocid="admin.site_content.about.mission_textarea"
          />
        </Field>
        <Field label="Team Info" id="aboutTeamInfo">
          <Textarea
            id="aboutTeamInfo"
            value={form.aboutTeamInfo}
            onChange={(e) => update("aboutTeamInfo", e.target.value)}
            placeholder="Meet our team of passionate bakers…"
            className="border-input focus:border-primary resize-none h-20 text-sm"
            data-ocid="admin.site_content.about.team_textarea"
          />
        </Field>
      </Section>

      {/* ── Our Story Section Details ───────────────────────────── */}
      <Section
        title="Our Story Section (Homepage)"
        icon={ImageIcon}
        onSave={() => save("Our Story Section")}
        saving={savingSection === "Our Story Section"}
        ocid="admin.site_content.our_story"
      >
        <Field label="Our Story Photo" id="ourStoryImage">
          <div className="space-y-3">
            {form.ourStoryImageUrl ? (
              <div className="flex items-start gap-3">
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center flex-shrink-0">
                  <img
                    src={form.ourStoryImageUrl}
                    alt="Our Story section preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => ourStoryImageRef.current?.click()}
                    className="gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary"
                    data-ocid="admin.site_content.our_story.change_image_button"
                  >
                    <ImageIcon size={13} />
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => update("ourStoryImageUrl", "")}
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    data-ocid="admin.site_content.our_story.remove_image_button"
                  >
                    <X size={13} />
                    Remove Photo
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => ourStoryImageRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-smooth p-6 text-muted-foreground hover:text-primary cursor-pointer"
                data-ocid="admin.site_content.our_story.upload_button"
              >
                <ImageIcon size={24} />
                <span className="text-sm font-medium">
                  Click to upload Our Story photo
                </span>
                <span className="text-xs opacity-70">
                  JPG, PNG, WebP — max 2 MB
                </span>
              </button>
            )}
            <input
              ref={ourStoryImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleOurStoryImageUpload}
              data-ocid="admin.site_content.our_story.image_file_input"
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Years of Craft" id="ourStoryYears">
            <Input
              id="ourStoryYears"
              value={form.ourStoryYearsOfCraft}
              onChange={(e) => update("ourStoryYearsOfCraft", e.target.value)}
              placeholder="5 years of craft"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.our_story.years_input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              e.g. "5 years of craft"
            </p>
          </Field>
          <Field label="Products Count" id="ourStoryProducts">
            <Input
              id="ourStoryProducts"
              value={form.ourStoryProductCount}
              onChange={(e) => update("ourStoryProductCount", e.target.value)}
              placeholder="200+ Products"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.our_story.products_input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              e.g. "200+ Products"
            </p>
          </Field>
          <Field label="Happy Customers" id="ourStoryCustomers">
            <Input
              id="ourStoryCustomers"
              value={form.ourStoryHappyCustomers}
              onChange={(e) => update("ourStoryHappyCustomers", e.target.value)}
              placeholder="50K+ Happy Customers"
              className="border-input focus:border-primary"
              data-ocid="admin.site_content.our_story.customers_input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              e.g. "50K+ Happy Customers"
            </p>
          </Field>
        </div>
      </Section>

      {/* ── Special Occasions ──────────────────────────────────── */}
      <Section
        title="Special Occasions"
        icon={PartyPopper}
        onSave={() => save("Special Occasions")}
        saving={savingSection === "Special Occasions"}
        ocid="admin.site_content.special_occasions"
      >
        <Field label="Section Title" id="specialTitle">
          <Input
            id="specialTitle"
            value={form.specialOccasionsTitle}
            onChange={(e) => update("specialOccasionsTitle", e.target.value)}
            placeholder="Special Occasions"
            className="border-input focus:border-primary"
            data-ocid="admin.site_content.special_occasions.title_input"
          />
        </Field>
        <Field label="Description" id="specialDescription">
          <Textarea
            id="specialDescription"
            value={form.specialOccasionsDescription}
            onChange={(e) =>
              update("specialOccasionsDescription", e.target.value)
            }
            placeholder="Make your celebrations unforgettable…"
            className="border-input focus:border-primary resize-none h-24 text-sm"
            data-ocid="admin.site_content.special_occasions.description_textarea"
          />
        </Field>
        <Field label="Offerings (comma separated)" id="specialOfferings">
          <Textarea
            id="specialOfferings"
            value={form.specialOccasionsOfferings}
            onChange={(e) =>
              update("specialOccasionsOfferings", e.target.value)
            }
            placeholder="Wedding Cakes, Birthday Cakes, Corporate Events…"
            className="border-input focus:border-primary resize-none h-20 text-sm"
            data-ocid="admin.site_content.special_occasions.offerings_textarea"
          />
        </Field>
      </Section>
    </div>
  );
}

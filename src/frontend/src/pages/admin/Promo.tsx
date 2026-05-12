import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Eye,
  ImagePlus,
  Loader2,
  Megaphone,
  Save,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useGetPromoAnnouncement,
  useSetPromoAnnouncement,
} from "../../hooks/useBackend";
import type { PromoAnnouncement } from "../../types";
import { fileToDataUrl } from "../../utils/imageUtils";

// Max billboard image size: 10 MB
const MAX_BILLBOARD_BYTES = 10 * 1024 * 1024;

interface FormState {
  title: string;
  message: string;
  isActive: boolean;
  deliveryHours: string;
  /** Up to 4 billboard images — stored as data URLs locally */
  offerImages: [string, string, string, string];
}

const EMPTY_IMAGES: [string, string, string, string] = ["", "", "", ""];

const DEFAULT_FORM: FormState = {
  title: "",
  message: "",
  isActive: true,
  deliveryHours: "10am – 10pm every day",
  offerImages: [...EMPTY_IMAGES] as [string, string, string, string],
};

// ── Single image upload slot ────────────────────────────────────────────────

function ImageSlot({
  label,
  value,
  onChange,
  slotIndex,
}: {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  slotIndex: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > MAX_BILLBOARD_BYTES) {
      setError("Image must be smaller than 10 MB");
      return;
    }
    setError("");
    setUploading(true);
    try {
      // Billboard images are NOT compressed — full original quality
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Failed to read image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>

      {value ? (
        <div className="relative inline-block w-full">
          <img
            src={value}
            alt={label}
            className="h-32 w-full object-cover rounded-xl border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive"
            onClick={() => onChange("")}
            aria-label={`Remove ${label}`}
            data-ocid={`admin.promo.remove_image_button.${slotIndex + 1}`}
          >
            <X size={11} />
          </Button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-smooth cursor-pointer"
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onDragOver={(e) => e.preventDefault()}
          htmlFor={`promo-img-${slotIndex}`}
          data-ocid={`admin.promo.image_dropzone.${slotIndex + 1}`}
        >
          {uploading ? (
            <>
              <Loader2 size={22} className="text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">
                Loading image…
              </p>
            </>
          ) : (
            <>
              <ImagePlus size={22} className="text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground font-medium">
                Click to upload or drag & drop
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Up to 10 MB · Full quality preserved
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth text-xs"
                onClick={() => fileRef.current?.click()}
                data-ocid={`admin.promo.upload_button.${slotIndex + 1}`}
              >
                <ImagePlus size={12} /> Add Photo
              </Button>
            </>
          )}
        </label>
      )}

      <input
        ref={fileRef}
        id={`promo-img-${slotIndex}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
        data-ocid={`admin.promo.image_input.${slotIndex + 1}`}
      />

      {error && (
        <p
          className="text-xs text-destructive"
          data-ocid={`admin.promo.image_error_state.${slotIndex + 1}`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPromoPage() {
  const { data: promo, isLoading } = useGetPromoAnnouncement();
  const saveMutation = useSetPromoAnnouncement();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  useEffect(() => {
    if (!promo) return;

    // Resolve the saved images into a 4-slot array
    let loaded: [string, string, string, string] = [...EMPTY_IMAGES] as [
      string,
      string,
      string,
      string,
    ];
    if (promo.offerImages && promo.offerImages.length > 0) {
      promo.offerImages.slice(0, 4).forEach((url, i) => {
        loaded[i] = url ?? "";
      });
    } else if (promo.offerImageUrl) {
      loaded[0] = promo.offerImageUrl;
    }

    setForm({
      title: promo.title ?? "",
      message: promo.message ?? "",
      isActive: promo.isActive ?? true,
      deliveryHours: promo.deliveryHours ?? "10am – 10pm every day",
      offerImages: loaded,
    });
  }, [promo]);

  function setImage(slotIndex: number, value: string) {
    setForm((f) => {
      const next = [...f.offerImages] as [string, string, string, string];
      next[slotIndex] = value;
      return { ...f, offerImages: next };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const filledImages = form.offerImages.filter(Boolean);
      const payload: PromoAnnouncement = {
        title: form.title.trim(),
        message: form.message.trim(),
        isActive: form.isActive,
        deliveryHours: form.deliveryHours.trim(),
        // Images are persisted to localStorage by the mutation — pass them here
        ...(filledImages.length > 0
          ? {
              offerImages: filledImages,
              offerImageUrl: filledImages[0],
            }
          : {}),
      };
      await saveMutation.mutateAsync(payload);
      toast.success("Promo announcement saved!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Promo] save error:", msg);
      toast.error(`Failed to save promo: ${msg}`);
    }
  }

  if (isLoading) {
    return (
      <div
        className="space-y-6 max-w-3xl"
        data-ocid="admin.promo.loading_state"
      >
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const previewImages = form.offerImages.filter(Boolean);

  return (
    <div className="space-y-6 max-w-3xl" data-ocid="admin.promo.page">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Promotional Announcement Bar
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Edit the billboard shown on every page. Title &amp; message appear
          above the header; the image slideshow appears below it.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Content */}
        <Card className="bg-card border-border shadow-warm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone size={16} className="text-primary" />
              Announcement Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="promo-title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="promo-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. 🎉 Free delivery on orders over ৳1,000!"
                className="mt-1"
                data-ocid="admin.promo.title_input"
              />
            </div>
            <div>
              <Label htmlFor="promo-message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="promo-message"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Additional details, limited time offer description..."
                className="mt-1 resize-none"
                rows={3}
                data-ocid="admin.promo.message_textarea"
              />
            </div>
            <div>
              <Label
                htmlFor="promo-hours"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <Clock size={14} className="text-muted-foreground" />
                Delivery Hours
              </Label>
              <Input
                id="promo-hours"
                value={form.deliveryHours}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryHours: e.target.value }))
                }
                placeholder="e.g. 10am – 10pm every day"
                className="mt-1"
                data-ocid="admin.promo.hours_input"
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Show this bar on the website
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                data-ocid="admin.promo.active_switch"
              />
            </div>
          </CardContent>
        </Card>

        {/* Billboard Photos — 4 slots */}
        <Card className="bg-card border-border shadow-warm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <ImagePlus size={16} className="text-primary" />
              Billboard Photos
              <span className="text-xs font-normal text-muted-foreground">
                (up to 4 — shown as a slideshow below the header)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {([0, 1, 2, 3] as const).map((idx) => (
                <ImageSlot
                  key={idx}
                  label={`Photo ${idx + 1}`}
                  value={form.offerImages[idx]}
                  onChange={(val) => setImage(idx, val)}
                  slotIndex={idx}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Billboard images are stored at full original quality (up to 10 MB
              each). They are saved locally in your browser — the slideshow
              plays on the same device/browser where you save them. Each photo
              auto-advances every 4 seconds.
            </p>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="bg-card border-border shadow-warm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Eye size={16} className="text-primary" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-xl overflow-hidden ${form.isActive ? "opacity-100" : "opacity-40"}`}
              data-ocid="admin.promo.preview_panel"
            >
              {/* Title bar preview */}
              {(form.title || form.message) && (
                <div className="bg-primary px-4 py-2 flex items-center justify-between gap-4 rounded-t-xl">
                  <div className="min-w-0">
                    <p className="text-primary-foreground text-sm font-semibold truncate">
                      {form.title || "Your announcement title here"}
                    </p>
                    {form.message && (
                      <p className="text-primary-foreground/80 text-xs truncate">
                        {form.message}
                      </p>
                    )}
                  </div>
                  {form.deliveryHours && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 bg-primary-foreground/20 px-2.5 py-1 rounded-full">
                      <Clock size={11} className="text-primary-foreground" />
                      <span className="text-primary-foreground text-xs font-medium whitespace-nowrap">
                        {form.deliveryHours}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Image preview */}
              {previewImages.length > 0 && (
                <div className="relative overflow-hidden rounded-b-xl">
                  <img
                    src={previewImages[0]}
                    alt="Preview"
                    className="w-full max-h-40 object-cover block"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {previewImages.length > 1 && (
                    <div className="absolute bottom-1 right-2">
                      <span className="text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded-full">
                        +{previewImages.length - 1} more photo
                        {previewImages.length > 2 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback when nothing set */}
              {!form.title && !form.message && previewImages.length === 0 && (
                <div className="bg-muted rounded-xl px-4 py-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Fill in the title or upload a photo to see a preview.
                  </p>
                </div>
              )}
            </div>
            {!form.isActive && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ⚠️ The bar is currently inactive and won't be shown on the
                website
              </p>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth min-w-36"
            data-ocid="admin.promo.save_button"
          >
            {saveMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saveMutation.isPending ? "Saving..." : "Save Announcement"}
          </Button>
        </div>
      </form>
    </div>
  );
}

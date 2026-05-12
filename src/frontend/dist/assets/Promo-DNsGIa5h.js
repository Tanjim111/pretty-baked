import { av as useGetPromoAnnouncement, aw as useSetPromoAnnouncement, r as reactExports, j as jsxRuntimeExports, f as Skeleton, ax as Megaphone, o as Label, I as Input, e as Button, g as ue, X } from "./index-YPmBzU2g.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-y8MOlqQc.js";
import { S as Switch } from "./switch-BC7UpI0g.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { f as fileToDataUrl } from "./imageUtils-DRam8RY6.js";
import { C as Clock } from "./clock-CQ7pTt6k.js";
import { I as ImagePlus } from "./image-plus-C0mJGg2E.js";
import { E as Eye } from "./eye-BkZbYeCW.js";
import { L as LoaderCircle } from "./loader-circle-De99uBSv.js";
import { S as Save } from "./save-DNf1rTGg.js";
const MAX_BILLBOARD_BYTES = 10 * 1024 * 1024;
const EMPTY_IMAGES = ["", "", "", ""];
const DEFAULT_FORM = {
  title: "",
  message: "",
  isActive: true,
  deliveryHours: "10am – 10pm every day",
  offerImages: [...EMPTY_IMAGES]
};
function ImageSlot({
  label,
  value,
  onChange,
  slotIndex
}) {
  const fileRef = reactExports.useRef(null);
  const [error, setError] = reactExports.useState("");
  const [uploading, setUploading] = reactExports.useState(false);
  async function handleFile(file) {
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
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Failed to read image. Please try again.");
    } finally {
      setUploading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-foreground", children: label }),
    value ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: value,
          alt: label,
          className: "h-32 w-full object-cover rounded-xl border border-border",
          onError: (e) => {
            e.target.src = "/assets/images/placeholder.svg";
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "sm",
          className: "absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive",
          onClick: () => onChange(""),
          "aria-label": `Remove ${label}`,
          "data-ocid": `admin.promo.remove_image_button.${slotIndex + 1}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 })
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "label",
      {
        className: "flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-smooth cursor-pointer",
        onDrop: (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        },
        onDragOver: (e) => e.preventDefault(),
        htmlFor: `promo-img-${slotIndex}`,
        "data-ocid": `admin.promo.image_dropzone.${slotIndex + 1}`,
        children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 22, className: "text-primary animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Loading image…" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 22, className: "text-muted-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Click to upload or drag & drop" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/60", children: "Up to 10 MB · Full quality preserved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "gap-1 border-primary/30 hover:bg-primary/10 hover:text-primary transition-smooth text-xs",
              onClick: () => {
                var _a;
                return (_a = fileRef.current) == null ? void 0 : _a.click();
              },
              "data-ocid": `admin.promo.upload_button.${slotIndex + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 12 }),
                " Add Photo"
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileRef,
        id: `promo-img-${slotIndex}`,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: (e) => {
          var _a;
          const f = (_a = e.target.files) == null ? void 0 : _a[0];
          if (f) handleFile(f);
          e.target.value = "";
        },
        "data-ocid": `admin.promo.image_input.${slotIndex + 1}`
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-destructive",
        "data-ocid": `admin.promo.image_error_state.${slotIndex + 1}`,
        children: error
      }
    )
  ] });
}
function AdminPromoPage() {
  const { data: promo, isLoading } = useGetPromoAnnouncement();
  const saveMutation = useSetPromoAnnouncement();
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  reactExports.useEffect(() => {
    if (!promo) return;
    let loaded = [...EMPTY_IMAGES];
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
      offerImages: loaded
    });
  }, [promo]);
  function setImage(slotIndex, value) {
    setForm((f) => {
      const next = [...f.offerImages];
      next[slotIndex] = value;
      return { ...f, offerImages: next };
    });
  }
  async function handleSave(e) {
    e.preventDefault();
    try {
      const filledImages = form.offerImages.filter(Boolean);
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        isActive: form.isActive,
        deliveryHours: form.deliveryHours.trim(),
        // Images are persisted to localStorage by the mutation — pass them here
        ...filledImages.length > 0 ? {
          offerImages: filledImages,
          offerImageUrl: filledImages[0]
        } : {}
      };
      await saveMutation.mutateAsync(payload);
      ue.success("Promo announcement saved!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Promo] save error:", msg);
      ue.error(`Failed to save promo: ${msg}`);
    }
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "space-y-6 max-w-3xl",
        "data-ocid": "admin.promo.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-56" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-xl" })
        ]
      }
    );
  }
  const previewImages = form.offerImages.filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", "data-ocid": "admin.promo.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Promotional Announcement Bar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Edit the billboard shown on every page. Title & message appear above the header; the image slideshow appears below it." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border shadow-warm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-base font-bold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { size: 16, className: "text-primary" }),
          "Announcement Content"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "promo-title", className: "text-sm font-medium", children: "Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "promo-title",
                value: form.title,
                onChange: (e) => setForm((f) => ({ ...f, title: e.target.value })),
                placeholder: "e.g. 🎉 Free delivery on orders over ৳1,000!",
                className: "mt-1",
                "data-ocid": "admin.promo.title_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "promo-message", className: "text-sm font-medium", children: "Message" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "promo-message",
                value: form.message,
                onChange: (e) => setForm((f) => ({ ...f, message: e.target.value })),
                placeholder: "Additional details, limited time offer description...",
                className: "mt-1 resize-none",
                rows: 3,
                "data-ocid": "admin.promo.message_textarea"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "promo-hours",
                className: "text-sm font-medium flex items-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, className: "text-muted-foreground" }),
                  "Delivery Hours"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "promo-hours",
                value: form.deliveryHours,
                onChange: (e) => setForm((f) => ({ ...f, deliveryHours: e.target.value })),
                placeholder: "e.g. 10am – 10pm every day",
                className: "mt-1",
                "data-ocid": "admin.promo.hours_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show this bar on the website" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: form.isActive,
                onCheckedChange: (v) => setForm((f) => ({ ...f, isActive: v })),
                "data-ocid": "admin.promo.active_switch"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border shadow-warm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-base font-bold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 16, className: "text-primary" }),
          "Billboard Photos",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground", children: "(up to 4 — shown as a slideshow below the header)" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: [0, 1, 2, 3].map((idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ImageSlot,
            {
              label: `Photo ${idx + 1}`,
              value: form.offerImages[idx],
              onChange: (val) => setImage(idx, val),
              slotIndex: idx
            },
            idx
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-3", children: "Billboard images are stored at full original quality (up to 10 MB each). They are saved locally in your browser — the slideshow plays on the same device/browser where you save them. Each photo auto-advances every 4 seconds." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border shadow-warm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-base font-bold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 16, className: "text-primary" }),
          "Preview"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-xl overflow-hidden ${form.isActive ? "opacity-100" : "opacity-40"}`,
              "data-ocid": "admin.promo.preview_panel",
              children: [
                (form.title || form.message) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary px-4 py-2 flex items-center justify-between gap-4 rounded-t-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground text-sm font-semibold truncate", children: form.title || "Your announcement title here" }),
                    form.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground/80 text-xs truncate", children: form.message })
                  ] }),
                  form.deliveryHours && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-shrink-0 bg-primary-foreground/20 px-2.5 py-1 rounded-full", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11, className: "text-primary-foreground" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-foreground text-xs font-medium whitespace-nowrap", children: form.deliveryHours })
                  ] })
                ] }),
                previewImages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-b-xl", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: previewImages[0],
                      alt: "Preview",
                      className: "w-full max-h-40 object-cover block",
                      onError: (e) => {
                        e.target.style.display = "none";
                      }
                    }
                  ),
                  previewImages.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded-full", children: [
                    "+",
                    previewImages.length - 1,
                    " more photo",
                    previewImages.length > 2 ? "s" : ""
                  ] }) })
                ] }),
                !form.title && !form.message && previewImages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted rounded-xl px-4 py-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Fill in the title or upload a photo to see a preview." }) })
              ]
            }
          ),
          !form.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 text-center", children: "⚠️ The bar is currently inactive and won't be shown on the website" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "submit",
          disabled: saveMutation.isPending,
          className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth min-w-36",
          "data-ocid": "admin.promo.save_button",
          children: [
            saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 15, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 15 }),
            saveMutation.isPending ? "Saving..." : "Save Announcement"
          ]
        }
      ) })
    ] })
  ] });
}
export {
  AdminPromoPage as default
};

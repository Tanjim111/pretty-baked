import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImagePlus, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCategories,
  useCreateProduct,
  useSetProductImages,
} from "../../hooks/useBackend";
import { compressImage } from "../../utils/imageUtils";

interface ImageSlot {
  preview: string;
  dataUrl: string;
}

const SLOT_KEYS = ["primary", "gallery-1", "gallery-2", "gallery-3"] as const;
const EMPTY_SLOT: ImageSlot = { preview: "", dataUrl: "" };

function ImageSlotCard({
  slot,
  index,
  onFile,
  onRemove,
  isPrimary,
}: {
  slot: ImageSlot;
  index: number;
  onFile: (file: File) => void;
  onRemove: () => void;
  isPrimary: boolean;
}) {
  const inputId = `img-slot-new-${index}`;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">
        {isPrimary ? "Primary Image" : `Gallery ${index}`}
        {isPrimary && <span className="text-destructive ml-1">*</span>}
      </p>
      <label
        htmlFor={inputId}
        className="relative w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-smooth cursor-pointer overflow-hidden flex items-center justify-center"
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) onFile(f);
        }}
        onDragOver={(e) => e.preventDefault()}
        data-ocid={`admin.product_form.image_slot.${index + 1}`}
      >
        {slot.preview ? (
          <>
            <img
              src={slot.preview}
              alt={`Slot ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive"
              aria-label="Remove image"
              data-ocid={`admin.product_form.remove_image_button.${index + 1}`}
            >
              <X size={11} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground p-3 text-center">
            <ImagePlus size={22} className="text-muted-foreground/40" />
            <p className="text-[10px] leading-tight">Click or drop</p>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
          data-ocid={`admin.product_form.image_input.${index + 1}`}
        />
      </label>
    </div>
  );
}

export default function AdminProductFormPage() {
  const createMutation = useCreateProduct();
  const setImagesMutation = useSetProductImages();
  const { data: categories = [] } = useCategories();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "10",
    isAvailable: true,
    isFeatured: false,
    imageUrl: "",
    ingredientsText: "",
  });

  // 4 image slots: index 0 = primary, indices 1-3 = gallery
  const [slots, setSlots] = useState<ImageSlot[]>([
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
  ]);
  const [imageError, setImageError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSlotFile(index: number, file: File) {
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image must be smaller than 10MB");
      return;
    }
    setImageError("");
    // Compress before storing — high quality, max 800px
    const dataUrl = await compressImage(file, 800, 0.85);
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { preview: dataUrl, dataUrl };
      return next;
    });
    if (index === 0) {
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    }
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = EMPTY_SLOT;
      return next;
    });
    if (index === 0) setForm((f) => ({ ...f, imageUrl: "" }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0)
      errs.price = "Valid price is required";
    if (!form.category) errs.category = "Please select a category";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const created = await createMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        imageUrl: form.imageUrl || "/assets/images/placeholder.svg",
        ingredients: form.ingredientsText
          ? form.ingredientsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });

      // Upload gallery images (slots 1-3) if any exist
      const galleryUrls = slots
        .slice(1)
        .map((s) => s.dataUrl)
        .filter(Boolean);
      if (galleryUrls.length > 0 && created.id) {
        try {
          await setImagesMutation.mutateAsync({
            productId: created.id,
            dataUrls: galleryUrls,
          });
        } catch {
          // Gallery upload failure is non-fatal — product was created
        }
      }

      toast.success(`"${form.name}" created successfully!`);
      window.location.href = "/admin/products";
    } catch {
      toast.error("Failed to create product. Please try again.");
    }
  }

  const isPending = createMutation.isPending || setImagesMutation.isPending;

  return (
    <div className="space-y-6 max-w-3xl" data-ocid="admin.product_form.page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = "/admin/products";
          }}
          className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-smooth"
          data-ocid="admin.product_form.back_button"
        >
          <ArrowLeft size={15} /> Back
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Add New Product
          </h2>
          <p className="text-muted-foreground text-sm">
            Fill in the details to add a product to your store
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        data-ocid="admin.product_form.form"
        noValidate
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload — 4 slots */}
          <Card className="p-5 bg-card border-border shadow-warm lg:col-span-2">
            <Label className="text-sm font-semibold text-foreground mb-1 block">
              Product Images
            </Label>
            <p className="text-xs text-muted-foreground mb-4">
              Slot 1 is the primary image shown in listings. Slots 2-4 are
              gallery images visible in the product slideshow.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {slots.map((slot, i) => (
                <ImageSlotCard
                  key={SLOT_KEYS[i]}
                  slot={slot}
                  index={i}
                  onFile={(f) => handleSlotFile(i, f)}
                  onRemove={() => removeSlot(i)}
                  isPrimary={i === 0}
                />
              ))}
            </div>
            {imageError && (
              <p
                className="text-xs text-destructive mt-2"
                data-ocid="admin.product_form.image_error_state"
              >
                {imageError}
              </p>
            )}
            {/* URL fallback for primary image */}
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">
                Or paste a URL for the primary image
              </Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={
                  slots[0].dataUrl.startsWith("data:") ? "" : form.imageUrl
                }
                onChange={(e) => {
                  setForm((f) => ({ ...f, imageUrl: e.target.value }));
                  setSlots((prev) => {
                    const next = [...prev];
                    next[0] = {
                      preview: e.target.value,
                      dataUrl: e.target.value,
                    };
                    return next;
                  });
                }}
                className="mt-1 text-sm"
                data-ocid="admin.product_form.image_url_input"
              />
            </div>
          </Card>

          {/* Basic Details */}
          <Card className="p-5 bg-card border-border shadow-warm">
            <h3 className="font-semibold text-foreground mb-4">
              Basic Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pf-name" className="text-sm font-medium">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pf-name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (errors.name) setErrors((er) => ({ ...er, name: "" }));
                  }}
                  placeholder="e.g. Chocolate Fudge Cake"
                  className="mt-1"
                  data-ocid="admin.product_form.name_input"
                />
                {errors.name && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="admin.product_form.name_field_error"
                  >
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pf-desc" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="pf-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe this product..."
                  className="mt-1 resize-none"
                  rows={3}
                  data-ocid="admin.product_form.description_textarea"
                />
              </div>
              <div>
                <Label htmlFor="pf-ingredients" className="text-sm font-medium">
                  Ingredients (comma-separated)
                </Label>
                <Textarea
                  id="pf-ingredients"
                  value={form.ingredientsText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ingredientsText: e.target.value }))
                  }
                  placeholder="flour, butter, eggs, sugar, vanilla..."
                  className="mt-1 resize-none"
                  rows={2}
                  data-ocid="admin.product_form.ingredients_textarea"
                />
              </div>
              <div>
                <Label htmlFor="pf-category" className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => {
                    setForm((f) => ({ ...f, category: v }));
                    if (errors.category)
                      setErrors((er) => ({ ...er, category: "" }));
                  }}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="admin.product_form.category_select"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="admin.product_form.category_field_error"
                  >
                    {errors.category}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Pricing & Stock */}
          <Card className="p-5 bg-card border-border shadow-warm">
            <h3 className="font-semibold text-foreground mb-4">
              Pricing & Stock
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pf-price" className="text-sm font-medium">
                  Price (BDT) <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ৳
                  </span>
                  <Input
                    id="pf-price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, price: e.target.value }));
                      if (errors.price)
                        setErrors((er) => ({ ...er, price: "" }));
                    }}
                    placeholder="0"
                    className="pl-7"
                    data-ocid="admin.product_form.price_input"
                  />
                </div>
                {errors.price && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="admin.product_form.price_field_error"
                  >
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pf-stock" className="text-sm font-medium">
                  Stock Quantity
                </Label>
                <Input
                  id="pf-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="admin.product_form.stock_input"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <Label className="text-sm font-medium">
                    Available for Sale
                  </Label>
                  <p className="text-xs text-muted-foreground">Show in store</p>
                </div>
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isAvailable: v }))
                  }
                  data-ocid="admin.product_form.available_switch"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <Label className="text-sm font-medium">
                    Featured Product
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage
                  </p>
                </div>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isFeatured: v }))
                  }
                  data-ocid="admin.product_form.featured_switch"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href = "/admin/products";
            }}
            className="border-border hover:border-primary/40 transition-smooth"
            data-ocid="admin.product_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth min-w-32"
            data-ocid="admin.product_form.submit_button"
          >
            <Upload size={14} />
            {isPending ? "Saving..." : "Add Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

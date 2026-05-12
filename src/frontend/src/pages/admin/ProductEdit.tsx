import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImagePlus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCategories,
  useDeleteProduct,
  useGetProductImages,
  useProductById,
  useSetProductImages,
  useUpdateProduct,
} from "../../hooks/useBackend";
import { compressImage } from "../../utils/imageUtils";

interface ImageSlot {
  preview: string;
  dataUrl: string;
}

const EMPTY_SLOT: ImageSlot = { preview: "", dataUrl: "" };

const SLOT_KEYS = ["primary", "gallery-1", "gallery-2", "gallery-3"] as const;

function getProductIdFromUrl() {
  const parts = window.location.pathname.split("/");
  const idx = parts.indexOf("products");
  return idx >= 0 ? parts[idx + 1] : "";
}

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
  const inputId = `img-slot-edit-${index}`;
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
        data-ocid={`admin.product_edit.image_slot.${index + 1}`}
      >
        {slot.preview ? (
          <>
            <img
              src={slot.preview}
              alt={`Slot ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/images/placeholder.svg";
              }}
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
              data-ocid={`admin.product_edit.remove_image_button.${index + 1}`}
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
          data-ocid={`admin.product_edit.image_input.${index + 1}`}
        />
      </label>
    </div>
  );
}

export default function AdminProductEditPage() {
  const id = getProductIdFromUrl();
  const { data: product, isLoading } = useProductById(id);
  const { data: galleryImages = [] } = useGetProductImages(id);
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
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

  // 4 image slots: 0 = primary, 1-3 = gallery
  const [slots, setSlots] = useState<ImageSlot[]>([
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
  ]);
  const [imageError, setImageError] = useState("");
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        category: product.category,
        stock: String(product.stock),
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        imageUrl: product.imageUrl,
        ingredientsText: product.ingredients.join(", "),
      });
      setSlots((prev) => {
        const next = [...prev];
        next[0] = { preview: product.imageUrl, dataUrl: product.imageUrl };
        return next;
      });
    }
  }, [product]);

  // Load gallery images into slots 1-3 once
  useEffect(() => {
    if (galleryImages.length > 0 && !galleryLoaded) {
      setGalleryLoaded(true);
      setSlots((prev) => {
        const next = [...prev];
        galleryImages.slice(0, 3).forEach((url, i) => {
          next[i + 1] = { preview: url, dataUrl: url };
        });
        return next;
      });
    }
  }, [galleryImages, galleryLoaded]);

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
    if (index === 0) setForm((f) => ({ ...f, imageUrl: dataUrl }));
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = EMPTY_SLOT;
      return next;
    });
    if (index === 0) setForm((f) => ({ ...f, imageUrl: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        ...product,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        isAvailable: form.isAvailable,
        isFeatured: form.isFeatured,
        imageUrl: form.imageUrl || product.imageUrl,
        ingredients: form.ingredientsText
          ? form.ingredientsText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : product.ingredients,
      });

      // Save gallery images (slots 1-3)
      const galleryUrls = slots
        .slice(1)
        .map((s) => s.dataUrl)
        .filter(Boolean);
      try {
        await setImagesMutation.mutateAsync({
          productId: product.id,
          dataUrls: galleryUrls,
        });
      } catch {
        // Non-fatal
      }

      toast.success(`"${form.name}" updated successfully!`);
      window.location.href = "/admin/products";
    } catch {
      toast.error("Failed to update product.");
    }
  }

  async function handleDelete() {
    if (!product) return;
    await deleteMutation.mutateAsync(product.id);
    toast.success(`"${product.name}" deleted`);
    window.location.href = "/admin/products";
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="text-center py-16"
        data-ocid="admin.product_edit.not_found_state"
      >
        <p className="text-4xl mb-3">😕</p>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          Product Not Found
        </h3>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/admin/products";
          }}
          className="gap-2 mt-2"
        >
          <ArrowLeft size={15} /> Back to Products
        </Button>
      </div>
    );
  }

  const isPending = updateMutation.isPending || setImagesMutation.isPending;

  return (
    <div className="space-y-6 max-w-3xl" data-ocid="admin.product_edit.page">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = "/admin/products";
            }}
            className="gap-1.5 hover:bg-primary/10 hover:text-primary transition-smooth"
            data-ocid="admin.product_edit.back_button"
          >
            <ArrowLeft size={15} /> Back
          </Button>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Edit Product
            </h2>
            <p className="text-muted-foreground text-sm truncate max-w-xs">
              {product.name}
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive transition-smooth"
              data-ocid="admin.product_edit.delete_button"
            >
              <Trash2 size={14} /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="admin.product_edit.delete_dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The product will be permanently
                removed from your store.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="admin.product_edit.delete_cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                data-ocid="admin.product_edit.delete_confirm_button"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        data-ocid="admin.product_edit.form"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image slots */}
          <Card className="p-5 bg-card border-border shadow-warm lg:col-span-2">
            <Label className="text-sm font-semibold text-foreground mb-1 block">
              Product Images
            </Label>
            <p className="text-xs text-muted-foreground mb-4">
              Slot 1 is the primary image. Slots 2-4 are shown as a gallery
              slideshow on the product page.
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
                data-ocid="admin.product_edit.image_error_state"
              >
                {imageError}
              </p>
            )}
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
                data-ocid="admin.product_edit.image_url_input"
              />
            </div>
          </Card>

          {/* Details */}
          <Card className="p-5 bg-card border-border shadow-warm">
            <h3 className="font-semibold text-foreground mb-4">
              Basic Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pe-name" className="text-sm font-medium">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pe-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1"
                  required
                  data-ocid="admin.product_edit.name_input"
                />
              </div>
              <div>
                <Label htmlFor="pe-desc" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="pe-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="mt-1 resize-none"
                  rows={3}
                  data-ocid="admin.product_edit.description_textarea"
                />
              </div>
              <div>
                <Label htmlFor="pe-ingredients" className="text-sm font-medium">
                  Ingredients (comma-separated)
                </Label>
                <Textarea
                  id="pe-ingredients"
                  value={form.ingredientsText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ingredientsText: e.target.value }))
                  }
                  className="mt-1 resize-none"
                  rows={2}
                  data-ocid="admin.product_edit.ingredients_textarea"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="admin.product_edit.category_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-5 bg-card border-border shadow-warm">
            <h3 className="font-semibold text-foreground mb-4">
              Pricing & Stock
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pe-price" className="text-sm font-medium">
                  Price (BDT) <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ৳
                  </span>
                  <Input
                    id="pe-price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    className="pl-7"
                    required
                    data-ocid="admin.product_edit.price_input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pe-stock" className="text-sm font-medium">
                  Stock Quantity
                </Label>
                <Input
                  id="pe-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="admin.product_edit.stock_input"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-border">
                <div>
                  <Label className="text-sm font-medium">Available</Label>
                  <p className="text-xs text-muted-foreground">Show in store</p>
                </div>
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isAvailable: v }))
                  }
                  data-ocid="admin.product_edit.available_switch"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-border">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage
                  </p>
                </div>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isFeatured: v }))
                  }
                  data-ocid="admin.product_edit.featured_switch"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.href = "/admin/products";
            }}
            data-ocid="admin.product_edit.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth min-w-32"
            data-ocid="admin.product_edit.save_button"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

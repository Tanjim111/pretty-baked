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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import {
  Edit,
  Filter,
  ImagePlus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useIsAdmin,
  useProducts,
  useSetProductImages,
} from "../../hooks/useBackend";
import type { Product } from "../../types";
import { compressImage } from "../../utils/imageUtils";

// ---------------------------------------------------------------------------
// Add Product Dialog — mirrors the Add Category popup pattern
// ---------------------------------------------------------------------------

const EMPTY_PRODUCT_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "10",
  isAvailable: true,
  isFeatured: false,
  ingredientsText: "",
  imageUrl: "",
  imagePreview: "",
};

function AddProductDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateProduct();
  const setImagesMutation = useSetProductImages();
  const { data: categories = [] } = useCategories();

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    try {
      const dataUrl = await compressImage(file, 800, 0.85);
      setForm((f) => ({ ...f, imageUrl: dataUrl, imagePreview: dataUrl }));
    } catch {
      toast.error("Failed to process image");
    }
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
      // Upload gallery images if any (none in this popup, but keep API consistent)
      if (created?.id) {
        try {
          await setImagesMutation.mutateAsync({
            productId: created.id,
            dataUrls: [],
          });
        } catch {
          /* non-fatal */
        }
      }
      toast.success(`"${form.name}" created successfully!`);
      setForm(EMPTY_PRODUCT_FORM);
      setErrors({});
      setOpen(false);
      onCreated();
    } catch {
      toast.error("Failed to create product. Please try again.");
    }
  }

  const isPending = createMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setForm(EMPTY_PRODUCT_FORM);
          setErrors({});
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-smooth hover-lift shadow-sm"
        data-ocid="admin.products.add_product_button"
      >
        <Plus size={15} /> Add Product
      </button>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="admin.products.add_dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            New Product
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary image */}
          <div>
            <Label className="text-sm font-medium">
              Product Image{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </Label>
            {form.imagePreview ? (
              <div className="relative mt-1.5 w-full h-32 rounded-xl overflow-hidden border border-border bg-muted group">
                <img
                  src={form.imagePreview}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, imageUrl: "", imagePreview: "" }))
                  }
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-smooth opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X size={13} />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-3">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-white/90 text-xs hover:text-white transition-smooth"
                  >
                    Click to replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Upload product image"
                onClick={() => imageInputRef.current?.click()}
                className="mt-1.5 w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-smooth"
                data-ocid="admin.products.add_image_dropzone"
              >
                <ImagePlus size={20} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">
                  Click to upload image
                </p>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await handleImageFile(f);
                e.target.value = "";
              }}
              data-ocid="admin.products.add_image_input"
            />
            <div className="mt-2">
              <Label className="text-xs text-muted-foreground">
                Or paste image URL
              </Label>
              <Input
                value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    imageUrl: e.target.value,
                    imagePreview: e.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
                className="mt-1 text-sm"
                data-ocid="admin.products.add_image_url_input"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (errors.name) setErrors((er) => ({ ...er, name: "" }));
              }}
              placeholder="e.g. Chocolate Fudge Cake"
              className="mt-1"
              data-ocid="admin.products.add_name_input"
            />
            {errors.name && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="admin.products.add_name_error"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe this product..."
              className="mt-1 resize-none"
              rows={2}
              data-ocid="admin.products.add_description_textarea"
            />
          </div>

          {/* Price + Stock + Category row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm font-medium">
                Price (BDT) <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  ৳
                </span>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, price: e.target.value }));
                    if (errors.price) setErrors((er) => ({ ...er, price: "" }));
                  }}
                  placeholder="0"
                  className="pl-7"
                  data-ocid="admin.products.add_price_input"
                />
              </div>
              {errors.price && (
                <p
                  className="text-xs text-destructive mt-1"
                  data-ocid="admin.products.add_price_error"
                >
                  {errors.price}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Stock</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value }))
                }
                className="mt-1"
                data-ocid="admin.products.add_stock_input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">
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
                  data-ocid="admin.products.add_category_select"
                >
                  <SelectValue placeholder="Select" />
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
                  data-ocid="admin.products.add_category_error"
                >
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <Label className="text-sm font-medium">
              Ingredients (comma-separated)
            </Label>
            <Textarea
              value={form.ingredientsText}
              onChange={(e) =>
                setForm((f) => ({ ...f, ingredientsText: e.target.value }))
              }
              placeholder="flour, butter, eggs, sugar..."
              className="mt-1 resize-none"
              rows={2}
              data-ocid="admin.products.add_ingredients_textarea"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6 py-2 border-t border-border">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, isAvailable: v }))
                }
                data-ocid="admin.products.add_available_switch"
              />
              <Label className="text-sm cursor-pointer">
                Available for Sale
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, isFeatured: v }))
                }
                data-ocid="admin.products.add_featured_switch"
              />
              <Label className="text-sm cursor-pointer">Featured</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="admin.products.add_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              data-ocid="admin.products.add_submit_button"
            >
              {isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const {
    data: products = [],
    isLoading,
    refetch: refetchProducts,
  } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: isAdmin } = useIsAdmin();
  const deleteMutation = useDeleteProduct();

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <Package
            size={40}
            className="mx-auto mb-3 text-muted-foreground/40"
          />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">
            Admin Access Required
          </h3>
          <Button
            onClick={() => {
              window.location.href = "/admin";
            }}
            className="gap-2"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  function getCategoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? id;
  }

  async function handleDelete(product: Product) {
    await deleteMutation.mutateAsync(product.id);
    toast.success(`"${product.name}" deleted`);
  }

  return (
    <div className="space-y-6" data-ocid="admin.products.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Products
          </h2>
          <p className="text-muted-foreground text-sm">
            {products.length} total products
          </p>
        </div>
        <AddProductDialog onCreated={() => refetchProducts()} />
      </div>

      {/* Filters */}
      <Card
        className="p-4 bg-card border-border shadow-warm"
        data-ocid="admin.products.filters_panel"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="admin.products.search_input"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger
              className="w-full sm:w-44"
              data-ocid="admin.products.category_filter_select"
            >
              <Filter size={13} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <div key={k} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="admin.products.empty_state"
        >
          <Package
            size={40}
            className="mx-auto mb-3 text-muted-foreground/50"
          />
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            No products found
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Try adjusting your search or add a new product.
          </p>
          <a href="/admin/products/new">
            <Button
              className="gap-2"
              data-ocid="admin.products.empty_add_button"
            >
              <Plus size={14} /> Add Product
            </Button>
          </a>
        </div>
      ) : (
        <Card
          className="bg-card border-border shadow-warm overflow-hidden"
          data-ocid="admin.products.table"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    className="hover:bg-muted/30 transition-smooth"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    data-ocid={`admin.products.row.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/assets/images/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[140px]">
                            {product.name}
                          </p>
                          {product.isFeatured && (
                            <Badge className="text-[9px] px-1 h-4 bg-primary/10 text-primary border-0">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryName(product.category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      ৳{product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      <span
                        className={
                          product.stock < 5
                            ? "text-destructive font-semibold"
                            : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={product.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.isAvailable ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <a href={`/admin/products/${product.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth"
                            data-ocid={`admin.products.edit_button.${i + 1}`}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit size={13} />
                          </Button>
                        </a>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth"
                              data-ocid={`admin.products.delete_button.${i + 1}`}
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="admin.products.delete_dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete "{product.name}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The product will
                                be permanently removed from your store.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="admin.products.delete_cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                data-ocid="admin.products.delete_confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

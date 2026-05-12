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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, ImagePlus, Package, Plus, Tag, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useProducts,
  useUpdateCategory,
} from "../../hooks/useBackend";
import { compressImage } from "../../utils/imageUtils";

// ---------------------------------------------------------------------------
// Image upload sub-component (mirrors the product form image upload pattern)
// ---------------------------------------------------------------------------

interface CategoryImageUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  onClear: () => void;
}

function CategoryImageUpload({
  value,
  onChange,
  onClear,
}: CategoryImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }
    try {
      // Compress before storing — max 800px, high quality
      const dataUrl = await compressImage(file, 800, 0.85);
      onChange(dataUrl);
    } catch {
      toast.error("Failed to read image");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">
        Category Image{" "}
        <span className="text-muted-foreground font-normal text-xs">
          (optional)
        </span>
      </Label>

      {value ? (
        /* Preview */
        <div className="relative w-full rounded-xl overflow-hidden border border-border bg-muted/40 group">
          <img
            src={value}
            alt="Category preview"
            className="w-full h-36 object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-smooth opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X size={13} />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-white/90 text-xs hover:text-white transition-smooth"
            >
              Click to replace
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <button
          type="button"
          aria-label="Upload category image"
          className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-smooth ${
            dragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/60 hover:bg-primary/5"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          data-ocid="admin.categories.image_dropzone"
        >
          <ImagePlus size={20} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">
            Drag & drop or{" "}
            <span className="text-primary underline underline-offset-2">
              browse
            </span>
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            JPG, PNG, WEBP · max 2 MB
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const updateMutation = useUpdateCategory();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function getProductCount(catId: string) {
    return products.filter((p) => p.category === catId).length;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        imageUrl: form.imageUrl || undefined,
      });
      toast.success(`Category "${form.name}" created!`);
      setForm({ name: "", slug: "", description: "", imageUrl: "" });
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category",
      );
    }
  }

  function openEdit(cat: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }) {
    setEditForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? "",
    });
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editForm.id,
        name: editForm.name.trim(),
        slug: editForm.slug || generateSlug(editForm.name),
        description: editForm.description,
        imageUrl: editForm.imageUrl || undefined,
      });
      toast.success(`Category "${editForm.name}" updated!`);
      setEditOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category",
      );
    }
  }

  return (
    <div className="space-y-6" data-ocid="admin.categories.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Categories
          </h2>
          <p className="text-muted-foreground text-sm">
            {categories.length} categories
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth"
              data-ocid="admin.categories.add_category_button"
            >
              <Plus size={15} /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="admin.categories.add_dialog">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                New Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  placeholder="e.g. Cakes"
                  className="mt-1"
                  required
                  data-ocid="admin.categories.name_input"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="e.g. cakes"
                  className="mt-1 font-mono text-sm"
                  data-ocid="admin.categories.slug_input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from name. Used in URLs.
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Brief description of this category"
                  className="mt-1 resize-none"
                  rows={2}
                  data-ocid="admin.categories.description_input"
                />
              </div>

              {/* Image Upload */}
              <CategoryImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                onClear={() => setForm((f) => ({ ...f, imageUrl: "" }))}
              />

              <Separator />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="admin.categories.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  data-ocid="admin.categories.submit_button"
                >
                  {createMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-ocid="admin.categories.edit_dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit Category
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
                required
                data-ocid="admin.categories.edit_name_input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="mt-1 font-mono text-sm"
                data-ocid="admin.categories.edit_slug_input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1 resize-none"
                rows={2}
                data-ocid="admin.categories.edit_description_input"
              />
            </div>

            {/* Image Upload */}
            <CategoryImageUpload
              value={editForm.imageUrl}
              onChange={(url) => setEditForm((f) => ({ ...f, imageUrl: url }))}
              onClear={() => setEditForm((f) => ({ ...f, imageUrl: "" }))}
            />

            <Separator />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                data-ocid="admin.categories.edit_cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                data-ocid="admin.categories.edit_save_button"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(["a", "b", "c"] as const).map((k) => (
            <div key={k} className="h-36 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="admin.categories.empty_state"
        >
          <Tag size={40} className="mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            No categories yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create categories to organize your products.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="admin.categories.list"
        >
          {categories.map((cat, i) => {
            const count = getProductCount(cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                data-ocid={`admin.categories.item.${i + 1}`}
              >
                <Card className="overflow-hidden bg-card border-border shadow-warm hover-lift">
                  {/* Category image thumbnail (when set) */}
                  {cat.imageUrl && (
                    <div className="relative h-24 overflow-hidden bg-muted">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                          ) : (
                            <Tag size={14} className="text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {cat.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono mt-0.5"
                          >
                            {cat.slug}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth"
                          onClick={() => openEdit(cat)}
                          aria-label={`Edit ${cat.name}`}
                          data-ocid={`admin.categories.edit_button.${i + 1}`}
                        >
                          <Edit2 size={12} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth"
                              aria-label={`Delete ${cat.name}`}
                              data-ocid={`admin.categories.delete_button.${i + 1}`}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="admin.categories.delete_dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete "{cat.name}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the category.
                                {count > 0 && (
                                  <span className="block mt-1 text-destructive font-medium">
                                    ⚠️ {count} product
                                    {count !== 1 ? "s" : ""} use this category
                                    and will become uncategorized.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="admin.categories.delete_cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    await deleteMutation.mutateAsync(cat.id);
                                    toast.success(`"${cat.name}" deleted`);
                                  } catch (err) {
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Failed to delete category",
                                    );
                                  }
                                }}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                data-ocid="admin.categories.delete_confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mt-2 ml-11 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <div className="mt-3 ml-11 flex items-center gap-1 text-xs text-muted-foreground">
                      <Package size={11} />
                      <span>
                        {count} product{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

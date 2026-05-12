import { q as useProductById, v as useGetProductImages, ac as useUpdateProduct, a9 as useDeleteProduct, ab as useSetProductImages, a as useCategories, r as reactExports, j as jsxRuntimeExports, f as Skeleton, e as Button, o as Label, I as Input, W as Select, Y as SelectTrigger, Z as SelectValue, $ as SelectContent, a0 as SelectItem, g as ue, X } from "./index-YPmBzU2g.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Hws5YtRC.js";
import { C as Card } from "./card-y8MOlqQc.js";
import { S as Switch } from "./switch-BC7UpI0g.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { c as compressImage } from "./imageUtils-DRam8RY6.js";
import { A as ArrowLeft } from "./arrow-left-CWrfTQFu.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import { I as ImagePlus } from "./image-plus-C0mJGg2E.js";
import "./index-DfMnyd6p.js";
const EMPTY_SLOT = { preview: "", dataUrl: "" };
const SLOT_KEYS = ["primary", "gallery-1", "gallery-2", "gallery-3"];
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
  isPrimary
}) {
  const inputId = `img-slot-edit-${index}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground", children: [
      isPrimary ? "Primary Image" : `Gallery ${index}`,
      isPrimary && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        htmlFor: inputId,
        className: "relative w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-smooth cursor-pointer overflow-hidden flex items-center justify-center",
        onDrop: (e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) onFile(f);
        },
        onDragOver: (e) => e.preventDefault(),
        "data-ocid": `admin.product_edit.image_slot.${index + 1}`,
        children: [
          slot.preview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: slot.preview,
                alt: `Slot ${index + 1}`,
                className: "w-full h-full object-cover",
                onError: (e) => {
                  e.target.src = "/assets/images/placeholder.svg";
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                },
                className: "absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive",
                "aria-label": "Remove image",
                "data-ocid": `admin.product_edit.remove_image_button.${index + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 11 })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 text-muted-foreground p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 22, className: "text-muted-foreground/40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-tight", children: "Click or drop" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: inputId,
              type: "file",
              accept: "image/*",
              className: "hidden",
              onChange: (e) => {
                var _a;
                const f = (_a = e.target.files) == null ? void 0 : _a[0];
                if (f) onFile(f);
              },
              "data-ocid": `admin.product_edit.image_input.${index + 1}`
            }
          )
        ]
      }
    )
  ] });
}
function AdminProductEditPage() {
  const id = getProductIdFromUrl();
  const { data: product, isLoading } = useProductById(id);
  const { data: galleryImages = [] } = useGetProductImages(id);
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const setImagesMutation = useSetProductImages();
  const { data: categories = [] } = useCategories();
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "10",
    isAvailable: true,
    isFeatured: false,
    imageUrl: "",
    ingredientsText: ""
  });
  const [slots, setSlots] = reactExports.useState([
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT,
    EMPTY_SLOT
  ]);
  const [imageError, setImageError] = reactExports.useState("");
  const [galleryLoaded, setGalleryLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
        ingredientsText: product.ingredients.join(", ")
      });
      setSlots((prev) => {
        const next = [...prev];
        next[0] = { preview: product.imageUrl, dataUrl: product.imageUrl };
        return next;
      });
    }
  }, [product]);
  reactExports.useEffect(() => {
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
  async function handleSlotFile(index, file) {
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image must be smaller than 10MB");
      return;
    }
    setImageError("");
    const dataUrl = await compressImage(file, 800, 0.85);
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { preview: dataUrl, dataUrl };
      return next;
    });
    if (index === 0) setForm((f) => ({ ...f, imageUrl: dataUrl }));
  }
  function removeSlot(index) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = EMPTY_SLOT;
      return next;
    });
    if (index === 0) setForm((f) => ({ ...f, imageUrl: "" }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!product) return;
    if (!form.name.trim() || !form.price || !form.category) {
      ue.error("Please fill in all required fields");
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
        ingredients: form.ingredientsText ? form.ingredientsText.split(",").map((s) => s.trim()).filter(Boolean) : product.ingredients
      });
      const galleryUrls = slots.slice(1).map((s) => s.dataUrl).filter(Boolean);
      try {
        await setImagesMutation.mutateAsync({
          productId: product.id,
          dataUrls: galleryUrls
        });
      } catch {
      }
      ue.success(`"${form.name}" updated successfully!`);
      window.location.href = "/admin/products";
    } catch {
      ue.error("Failed to update product.");
    }
  }
  async function handleDelete() {
    if (!product) return;
    await deleteMutation.mutateAsync(product.id);
    ue.success(`"${product.name}" deleted`);
    window.location.href = "/admin/products";
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-xl" })
      ] })
    ] });
  }
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-16",
        "data-ocid": "admin.product_edit.not_found_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl mb-3", children: "😕" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold text-foreground mb-2", children: "Product Not Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => {
                window.location.href = "/admin/products";
              },
              className: "gap-2 mt-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
                " Back to Products"
              ]
            }
          )
        ]
      }
    );
  }
  const isPending = updateMutation.isPending || setImagesMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", "data-ocid": "admin.product_edit.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => {
              window.location.href = "/admin/products";
            },
            className: "gap-1.5 hover:bg-primary/10 hover:text-primary transition-smooth",
            "data-ocid": "admin.product_edit.back_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
              " Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Edit Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm truncate max-w-xs", children: product.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive transition-smooth",
            "data-ocid": "admin.product_edit.delete_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
              " Delete"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.product_edit.delete_dialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
              'Delete "',
              product.name,
              '"?'
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone. The product will be permanently removed from your store." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.product_edit.delete_cancel_button", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: handleDelete,
                disabled: deleteMutation.isPending,
                className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                "data-ocid": "admin.product_edit.delete_confirm_button",
                children: deleteMutation.isPending ? "Deleting..." : "Delete"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "space-y-6",
        "data-ocid": "admin.product_edit.form",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card border-border shadow-warm lg:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold text-foreground mb-1 block", children: "Product Images" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Slot 1 is the primary image. Slots 2-4 are shown as a gallery slideshow on the product page." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: slots.map((slot, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                ImageSlotCard,
                {
                  slot,
                  index: i,
                  onFile: (f) => handleSlotFile(i, f),
                  onRemove: () => removeSlot(i),
                  isPrimary: i === 0
                },
                SLOT_KEYS[i]
              )) }),
              imageError && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-xs text-destructive mt-2",
                  "data-ocid": "admin.product_edit.image_error_state",
                  children: imageError
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Or paste a URL for the primary image" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "https://example.com/image.jpg",
                    value: slots[0].dataUrl.startsWith("data:") ? "" : form.imageUrl,
                    onChange: (e) => {
                      setForm((f) => ({ ...f, imageUrl: e.target.value }));
                      setSlots((prev) => {
                        const next = [...prev];
                        next[0] = {
                          preview: e.target.value,
                          dataUrl: e.target.value
                        };
                        return next;
                      });
                    },
                    className: "mt-1 text-sm",
                    "data-ocid": "admin.product_edit.image_url_input"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card border-border shadow-warm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-4", children: "Basic Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "pe-name", className: "text-sm font-medium", children: [
                    "Product Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "pe-name",
                      value: form.name,
                      onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
                      className: "mt-1",
                      required: true,
                      "data-ocid": "admin.product_edit.name_input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pe-desc", className: "text-sm font-medium", children: "Description" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "pe-desc",
                      value: form.description,
                      onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                      className: "mt-1 resize-none",
                      rows: 3,
                      "data-ocid": "admin.product_edit.description_textarea"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pe-ingredients", className: "text-sm font-medium", children: "Ingredients (comma-separated)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "pe-ingredients",
                      value: form.ingredientsText,
                      onChange: (e) => setForm((f) => ({ ...f, ingredientsText: e.target.value })),
                      className: "mt-1 resize-none",
                      rows: 2,
                      "data-ocid": "admin.product_edit.ingredients_textarea"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                    "Category ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: form.category,
                      onValueChange: (v) => setForm((f) => ({ ...f, category: v })),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectTrigger,
                          {
                            className: "mt-1",
                            "data-ocid": "admin.product_edit.category_select",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
                      ]
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card border-border shadow-warm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-4", children: "Pricing & Stock" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "pe-price", className: "text-sm font-medium", children: [
                    "Price (BDT) ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: "৳" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "pe-price",
                        type: "number",
                        min: 0,
                        value: form.price,
                        onChange: (e) => setForm((f) => ({ ...f, price: e.target.value })),
                        className: "pl-7",
                        required: true,
                        "data-ocid": "admin.product_edit.price_input"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pe-stock", className: "text-sm font-medium", children: "Stock Quantity" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "pe-stock",
                      type: "number",
                      min: 0,
                      value: form.stock,
                      onChange: (e) => setForm((f) => ({ ...f, stock: e.target.value })),
                      className: "mt-1",
                      "data-ocid": "admin.product_edit.stock_input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Available" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show in store" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: form.isAvailable,
                      onCheckedChange: (v) => setForm((f) => ({ ...f, isAvailable: v })),
                      "data-ocid": "admin.product_edit.available_switch"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-1 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Featured" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show on homepage" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: form.isFeatured,
                      onCheckedChange: (v) => setForm((f) => ({ ...f, isFeatured: v })),
                      "data-ocid": "admin.product_edit.featured_switch"
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => {
                  window.location.href = "/admin/products";
                },
                "data-ocid": "admin.product_edit.cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: isPending,
                className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth min-w-32",
                "data-ocid": "admin.product_edit.save_button",
                children: isPending ? "Saving..." : "Save Changes"
              }
            )
          ] })
        ]
      }
    )
  ] });
}
export {
  AdminProductEditPage as default
};

import { c as createLucideIcon, aa as useCreateProduct, ab as useSetProductImages, a as useCategories, r as reactExports, j as jsxRuntimeExports, e as Button, o as Label, I as Input, W as Select, Y as SelectTrigger, Z as SelectValue, $ as SelectContent, a0 as SelectItem, g as ue, X } from "./index-YPmBzU2g.js";
import { C as Card } from "./card-y8MOlqQc.js";
import { S as Switch } from "./switch-BC7UpI0g.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { c as compressImage } from "./imageUtils-DRam8RY6.js";
import { A as ArrowLeft } from "./arrow-left-CWrfTQFu.js";
import { I as ImagePlus } from "./image-plus-C0mJGg2E.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
const SLOT_KEYS = ["primary", "gallery-1", "gallery-2", "gallery-3"];
const EMPTY_SLOT = { preview: "", dataUrl: "" };
function ImageSlotCard({
  slot,
  index,
  onFile,
  onRemove,
  isPrimary
}) {
  const inputId = `img-slot-new-${index}`;
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
        "data-ocid": `admin.product_form.image_slot.${index + 1}`,
        children: [
          slot.preview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: slot.preview,
                alt: `Slot ${index + 1}`,
                className: "w-full h-full object-cover"
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
                "data-ocid": `admin.product_form.remove_image_button.${index + 1}`,
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
              "data-ocid": `admin.product_form.image_input.${index + 1}`
            }
          )
        ]
      }
    )
  ] });
}
function AdminProductFormPage() {
  const createMutation = useCreateProduct();
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
  const [errors, setErrors] = reactExports.useState({});
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
    if (index === 0) {
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    }
  }
  function removeSlot(index) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = EMPTY_SLOT;
      return next;
    });
    if (index === 0) setForm((f) => ({ ...f, imageUrl: "" }));
  }
  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0)
      errs.price = "Valid price is required";
    if (!form.category) errs.category = "Please select a category";
    return errs;
  }
  async function handleSubmit(e) {
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
        ingredients: form.ingredientsText ? form.ingredientsText.split(",").map((s) => s.trim()).filter(Boolean) : []
      });
      const galleryUrls = slots.slice(1).map((s) => s.dataUrl).filter(Boolean);
      if (galleryUrls.length > 0 && created.id) {
        try {
          await setImagesMutation.mutateAsync({
            productId: created.id,
            dataUrls: galleryUrls
          });
        } catch {
        }
      }
      ue.success(`"${form.name}" created successfully!`);
      window.location.href = "/admin/products";
    } catch {
      ue.error("Failed to create product. Please try again.");
    }
  }
  const isPending = createMutation.isPending || setImagesMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", "data-ocid": "admin.product_form.page", children: [
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
          "data-ocid": "admin.product_form.back_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
            " Back"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Add New Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Fill in the details to add a product to your store" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "space-y-6",
        "data-ocid": "admin.product_form.form",
        noValidate: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card border-border shadow-warm lg:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-semibold text-foreground mb-1 block", children: "Product Images" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Slot 1 is the primary image shown in listings. Slots 2-4 are gallery images visible in the product slideshow." }),
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
                  "data-ocid": "admin.product_form.image_error_state",
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
                    "data-ocid": "admin.product_form.image_url_input"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card border-border shadow-warm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-4", children: "Basic Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "pf-name", className: "text-sm font-medium", children: [
                    "Product Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "pf-name",
                      value: form.name,
                      onChange: (e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        if (errors.name) setErrors((er) => ({ ...er, name: "" }));
                      },
                      placeholder: "e.g. Chocolate Fudge Cake",
                      className: "mt-1",
                      "data-ocid": "admin.product_form.name_input"
                    }
                  ),
                  errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-xs text-destructive mt-1",
                      "data-ocid": "admin.product_form.name_field_error",
                      children: errors.name
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pf-desc", className: "text-sm font-medium", children: "Description" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "pf-desc",
                      value: form.description,
                      onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                      placeholder: "Describe this product...",
                      className: "mt-1 resize-none",
                      rows: 3,
                      "data-ocid": "admin.product_form.description_textarea"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pf-ingredients", className: "text-sm font-medium", children: "Ingredients (comma-separated)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "pf-ingredients",
                      value: form.ingredientsText,
                      onChange: (e) => setForm((f) => ({ ...f, ingredientsText: e.target.value })),
                      placeholder: "flour, butter, eggs, sugar, vanilla...",
                      className: "mt-1 resize-none",
                      rows: 2,
                      "data-ocid": "admin.product_form.ingredients_textarea"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "pf-category", className: "text-sm font-medium", children: [
                    "Category ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: form.category,
                      onValueChange: (v) => {
                        setForm((f) => ({ ...f, category: v }));
                        if (errors.category)
                          setErrors((er) => ({ ...er, category: "" }));
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectTrigger,
                          {
                            className: "mt-1",
                            "data-ocid": "admin.product_form.category_select",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
                      ]
                    }
                  ),
                  errors.category && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-xs text-destructive mt-1",
                      "data-ocid": "admin.product_form.category_field_error",
                      children: errors.category
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5 bg-card border-border shadow-warm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-4", children: "Pricing & Stock" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "pf-price", className: "text-sm font-medium", children: [
                    "Price (BDT) ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: "৳" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "pf-price",
                        type: "number",
                        min: 0,
                        value: form.price,
                        onChange: (e) => {
                          setForm((f) => ({ ...f, price: e.target.value }));
                          if (errors.price)
                            setErrors((er) => ({ ...er, price: "" }));
                        },
                        placeholder: "0",
                        className: "pl-7",
                        "data-ocid": "admin.product_form.price_input"
                      }
                    )
                  ] }),
                  errors.price && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-xs text-destructive mt-1",
                      "data-ocid": "admin.product_form.price_field_error",
                      children: errors.price
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pf-stock", className: "text-sm font-medium", children: "Stock Quantity" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "pf-stock",
                      type: "number",
                      min: 0,
                      value: form.stock,
                      onChange: (e) => setForm((f) => ({ ...f, stock: e.target.value })),
                      className: "mt-1",
                      "data-ocid": "admin.product_form.stock_input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Available for Sale" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show in store" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: form.isAvailable,
                      onCheckedChange: (v) => setForm((f) => ({ ...f, isAvailable: v })),
                      "data-ocid": "admin.product_form.available_switch"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Featured Product" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Show on homepage" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Switch,
                    {
                      checked: form.isFeatured,
                      onCheckedChange: (v) => setForm((f) => ({ ...f, isFeatured: v })),
                      "data-ocid": "admin.product_form.featured_switch"
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
                className: "border-border hover:border-primary/40 transition-smooth",
                "data-ocid": "admin.product_form.cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "submit",
                disabled: isPending,
                className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth min-w-32",
                "data-ocid": "admin.product_form.submit_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 14 }),
                  isPending ? "Saving..." : "Add Product"
                ]
              }
            )
          ] })
        ]
      }
    )
  ] });
}
export {
  AdminProductFormPage as default
};

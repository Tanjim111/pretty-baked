import { c as createLucideIcon, r as reactExports, u as useProducts, a as useCategories, a4 as useIsAdmin, a9 as useDeleteProduct, j as jsxRuntimeExports, P as Package, e as Button, I as Input, W as Select, Y as SelectTrigger, Z as SelectValue, $ as SelectContent, a0 as SelectItem, m as motion, B as Badge, g as ue, aa as useCreateProduct, ab as useSetProductImages, o as Label, X } from "./index-YPmBzU2g.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Hws5YtRC.js";
import { C as Card } from "./card-y8MOlqQc.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-CYJVCNc-.js";
import { S as Switch } from "./switch-BC7UpI0g.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { c as compressImage } from "./imageUtils-DRam8RY6.js";
import { S as Search } from "./search-DbXcbU19.js";
import { P as Plus } from "./plus-KifZePkW.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import { I as ImagePlus } from "./image-plus-C0mJGg2E.js";
import "./index-DfMnyd6p.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
      key: "sc7q7i"
    }
  ]
];
const Funnel = createLucideIcon("funnel", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode);
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
  imagePreview: ""
};
function AddProductDialog({ onCreated }) {
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = reactExports.useState({});
  const imageInputRef = reactExports.useRef(null);
  const createMutation = useCreateProduct();
  const setImagesMutation = useSetProductImages();
  const { data: categories = [] } = useCategories();
  async function handleImageFile(file) {
    if (!file.type.startsWith("image/")) {
      ue.error("Please select a valid image file");
      return;
    }
    try {
      const dataUrl = await compressImage(file, 800, 0.85);
      setForm((f) => ({ ...f, imageUrl: dataUrl, imagePreview: dataUrl }));
    } catch {
      ue.error("Failed to process image");
    }
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
      if (created == null ? void 0 : created.id) {
        try {
          await setImagesMutation.mutateAsync({
            productId: created.id,
            dataUrls: []
          });
        } catch {
        }
      }
      ue.success(`"${form.name}" created successfully!`);
      setForm(EMPTY_PRODUCT_FORM);
      setErrors({});
      setOpen(false);
      onCreated();
    } catch {
      ue.error("Failed to create product. Please try again.");
    }
  }
  const isPending = createMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        setOpen(v);
        if (!v) {
          setForm(EMPTY_PRODUCT_FORM);
          setErrors({});
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setOpen(true),
            className: "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-smooth hover-lift shadow-sm",
            "data-ocid": "admin.products.add_product_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
              " Add Product"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-2xl max-h-[90vh] overflow-y-auto",
            "data-ocid": "admin.products.add_dialog",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-xl", children: "New Product" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                    "Product Image",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
                  ] }),
                  form.imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1.5 w-full h-32 rounded-xl overflow-hidden border border-border bg-muted group", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: form.imagePreview,
                        alt: "Product preview",
                        className: "w-full h-full object-cover"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setForm((f) => ({ ...f, imageUrl: "", imagePreview: "" })),
                        className: "absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-smooth opacity-0 group-hover:opacity-100",
                        "aria-label": "Remove image",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          var _a;
                          return (_a = imageInputRef.current) == null ? void 0 : _a.click();
                        },
                        className: "text-white/90 text-xs hover:text-white transition-smooth",
                        children: "Click to replace"
                      }
                    ) })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Upload product image",
                      onClick: () => {
                        var _a;
                        return (_a = imageInputRef.current) == null ? void 0 : _a.click();
                      },
                      className: "mt-1.5 w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-smooth",
                      "data-ocid": "admin.products.add_image_dropzone",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 20, className: "text-muted-foreground" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "Click to upload image" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      ref: imageInputRef,
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: async (e) => {
                        var _a;
                        const f = (_a = e.target.files) == null ? void 0 : _a[0];
                        if (f) await handleImageFile(f);
                        e.target.value = "";
                      },
                      "data-ocid": "admin.products.add_image_input"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Or paste image URL" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        value: form.imageUrl.startsWith("data:") ? "" : form.imageUrl,
                        onChange: (e) => setForm((f) => ({
                          ...f,
                          imageUrl: e.target.value,
                          imagePreview: e.target.value
                        })),
                        placeholder: "https://example.com/image.jpg",
                        className: "mt-1 text-sm",
                        "data-ocid": "admin.products.add_image_url_input"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                    "Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: form.name,
                      onChange: (e) => {
                        setForm((f) => ({ ...f, name: e.target.value }));
                        if (errors.name) setErrors((er) => ({ ...er, name: "" }));
                      },
                      placeholder: "e.g. Chocolate Fudge Cake",
                      className: "mt-1",
                      "data-ocid": "admin.products.add_name_input"
                    }
                  ),
                  errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-xs text-destructive mt-1",
                      "data-ocid": "admin.products.add_name_error",
                      children: errors.name
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Description" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      value: form.description,
                      onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                      placeholder: "Describe this product...",
                      className: "mt-1 resize-none",
                      rows: 2,
                      "data-ocid": "admin.products.add_description_textarea"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                      "Price (BDT) ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: "৳" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "number",
                          min: 0,
                          value: form.price,
                          onChange: (e) => {
                            setForm((f) => ({ ...f, price: e.target.value }));
                            if (errors.price) setErrors((er) => ({ ...er, price: "" }));
                          },
                          placeholder: "0",
                          className: "pl-7",
                          "data-ocid": "admin.products.add_price_input"
                        }
                      )
                    ] }),
                    errors.price && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-xs text-destructive mt-1",
                        "data-ocid": "admin.products.add_price_error",
                        children: errors.price
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Stock" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "number",
                        min: 0,
                        value: form.stock,
                        onChange: (e) => setForm((f) => ({ ...f, stock: e.target.value })),
                        className: "mt-1",
                        "data-ocid": "admin.products.add_stock_input"
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
                              "data-ocid": "admin.products.add_category_select",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" })
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
                        "data-ocid": "admin.products.add_category_error",
                        children: errors.category
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Ingredients (comma-separated)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      value: form.ingredientsText,
                      onChange: (e) => setForm((f) => ({ ...f, ingredientsText: e.target.value })),
                      placeholder: "flour, butter, eggs, sugar...",
                      className: "mt-1 resize-none",
                      rows: 2,
                      "data-ocid": "admin.products.add_ingredients_textarea"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 py-2 border-t border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: form.isAvailable,
                        onCheckedChange: (v) => setForm((f) => ({ ...f, isAvailable: v })),
                        "data-ocid": "admin.products.add_available_switch"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm cursor-pointer", children: "Available for Sale" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: form.isFeatured,
                        onCheckedChange: (v) => setForm((f) => ({ ...f, isFeatured: v })),
                        "data-ocid": "admin.products.add_featured_switch"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm cursor-pointer", children: "Featured" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      onClick: () => setOpen(false),
                      "data-ocid": "admin.products.add_cancel_button",
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "submit",
                      disabled: isPending,
                      className: "bg-primary hover:bg-primary/90 text-primary-foreground gap-2",
                      "data-ocid": "admin.products.add_submit_button",
                      children: isPending ? "Creating..." : "Create Product"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function AdminProductsPage() {
  const [search, setSearch] = reactExports.useState("");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("all");
  const {
    data: products = [],
    isLoading,
    refetch: refetchProducts
  } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: isAdmin } = useIsAdmin();
  const deleteMutation = useDeleteProduct();
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[50vh] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Package,
        {
          size: 40,
          className: "mx-auto mb-3 text-muted-foreground/40"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-2", children: "Admin Access Required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => {
            window.location.href = "/admin";
          },
          className: "gap-2",
          children: "Go to Login"
        }
      )
    ] }) });
  }
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });
  function getCategoryName(id) {
    var _a;
    return ((_a = categories.find((c) => c.id === id)) == null ? void 0 : _a.name) ?? id;
  }
  async function handleDelete(product) {
    await deleteMutation.mutateAsync(product.id);
    ue.success(`"${product.name}" deleted`);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.products.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
          products.length,
          " total products"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddProductDialog, { onCreated: () => refetchProducts() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "p-4 bg-card border-border shadow-warm",
        "data-ocid": "admin.products.filters_panel",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Search,
              {
                size: 15,
                className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search products or SKU...",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                className: "pl-9",
                "data-ocid": "admin.products.search_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: categoryFilter, onValueChange: setCategoryFilter, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              SelectTrigger,
              {
                className: "w-full sm:w-44",
                "data-ocid": "admin.products.category_filter_select",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 13, className: "mr-2 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Category" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
              categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id))
            ] })
          ] })
        ] })
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: ["a", "b", "c", "d"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 bg-muted animate-pulse rounded-xl" }, k)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-16 bg-card rounded-xl border border-border",
        "data-ocid": "admin.products.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Package,
            {
              size: 40,
              className: "mx-auto mb-3 text-muted-foreground/50"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: "No products found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Try adjusting your search or add a new product." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/admin/products/new", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "gap-2",
              "data-ocid": "admin.products.empty_add_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                " Add Product"
              ]
            }
          ) })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "bg-card border-border shadow-warm overflow-hidden",
        "data-ocid": "admin.products.table",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 border-b border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell", children: "SKU" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell", children: "Stock" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filtered.map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.tr,
            {
              className: "hover:bg-muted/30 transition-smooth",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: i * 0.03 },
              "data-ocid": `admin.products.row.${i + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: product.imageUrl,
                      alt: product.name,
                      className: "w-full h-full object-cover",
                      onError: (e) => {
                        e.target.src = "/assets/images/placeholder.svg";
                      }
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate max-w-[140px]", children: product.name }),
                    product.isFeatured && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[9px] px-1 h-4 bg-primary/10 text-primary border-0", children: "Featured" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell", children: product.sku }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: getCategoryName(product.category) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right font-semibold text-primary", children: [
                  "৳",
                  product.price.toLocaleString()
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-muted-foreground hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: product.stock < 5 ? "text-destructive font-semibold" : "",
                    children: product.stock
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: product.isAvailable ? "default" : "secondary",
                    className: "text-xs",
                    children: product.isAvailable ? "Active" : "Inactive"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/admin/products/${product.id}/edit`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      className: "h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth",
                      "data-ocid": `admin.products.edit_button.${i + 1}`,
                      "aria-label": `Edit ${product.name}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { size: 13 })
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        className: "h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth",
                        "data-ocid": `admin.products.delete_button.${i + 1}`,
                        "aria-label": `Delete ${product.name}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.products.delete_dialog", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
                          'Delete "',
                          product.name,
                          '"?'
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone. The product will be permanently removed from your store." })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.products.delete_cancel_button", children: "Cancel" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          AlertDialogAction,
                          {
                            onClick: () => handleDelete(product),
                            className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                            "data-ocid": "admin.products.delete_confirm_button",
                            children: "Delete"
                          }
                        )
                      ] })
                    ] })
                  ] })
                ] }) })
              ]
            },
            product.id
          )) })
        ] }) })
      }
    )
  ] });
}
export {
  AdminProductsPage as default
};

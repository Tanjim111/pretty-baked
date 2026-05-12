import { a as useCategories, u as useProducts, ad as useCreateCategory, ae as useDeleteCategory, af as useUpdateCategory, r as reactExports, j as jsxRuntimeExports, e as Button, o as Label, I as Input, w as Separator, T as Tag, m as motion, B as Badge, g as ue, P as Package, X } from "./index-YPmBzU2g.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Hws5YtRC.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-CYJVCNc-.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { c as compressImage } from "./imageUtils-DRam8RY6.js";
import { P as Plus } from "./plus-KifZePkW.js";
import { P as Pen } from "./pen-CaQa3muJ.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import { I as ImagePlus } from "./image-plus-C0mJGg2E.js";
import "./index-DfMnyd6p.js";
function CategoryImageUpload({
  value,
  onChange,
  onClear
}) {
  const inputRef = reactExports.useRef(null);
  const [dragging, setDragging] = reactExports.useState(false);
  async function handleFile(file) {
    if (!file.type.startsWith("image/")) {
      ue.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      ue.error("Image must be under 10 MB");
      return;
    }
    try {
      const dataUrl = await compressImage(file, 800, 0.85);
      onChange(dataUrl);
    } catch {
      ue.error("Failed to read image");
    }
  }
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium mb-1.5 block", children: [
      "Category Image",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal text-xs", children: "(optional)" })
    ] }),
    value ? (
      /* Preview */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full rounded-xl overflow-hidden border border-border bg-muted/40 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: value,
            alt: "Category preview",
            className: "w-full h-36 object-cover"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClear,
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
              return (_a = inputRef.current) == null ? void 0 : _a.click();
            },
            className: "text-white/90 text-xs hover:text-white transition-smooth",
            children: "Click to replace"
          }
        ) })
      ] })
    ) : (
      /* Drop zone */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "aria-label": "Upload category image",
          className: `w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-smooth ${dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/60 hover:bg-primary/5"}`,
          onClick: () => {
            var _a;
            return (_a = inputRef.current) == null ? void 0 : _a.click();
          },
          onDragOver: (e) => {
            e.preventDefault();
            setDragging(true);
          },
          onDragLeave: () => setDragging(false),
          onDrop: handleDrop,
          "data-ocid": "admin.categories.image_dropzone",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 20, className: "text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-medium", children: [
              "Drag & drop or",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary underline underline-offset-2", children: "browse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/70", children: "JPG, PNG, WEBP · max 2 MB" })
          ]
        }
      )
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: async (e) => {
          var _a;
          const file = (_a = e.target.files) == null ? void 0 : _a[0];
          if (file) await handleFile(file);
          e.target.value = "";
        }
      }
    )
  ] });
}
function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const updateMutation = useUpdateCategory();
  const [open, setOpen] = reactExports.useState(false);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: ""
  });
  const [editForm, setEditForm] = reactExports.useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    imageUrl: ""
  });
  function generateSlug(name) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  function getProductCount(catId) {
    return products.filter((p) => p.category === catId).length;
  }
  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      ue.error("Category name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        imageUrl: form.imageUrl || void 0
      });
      ue.success(`Category "${form.name}" created!`);
      setForm({ name: "", slug: "", description: "", imageUrl: "" });
      setOpen(false);
    } catch (err) {
      ue.error(
        err instanceof Error ? err.message : "Failed to create category"
      );
    }
  }
  function openEdit(cat) {
    setEditForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? ""
    });
    setEditOpen(true);
  }
  async function handleEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim()) {
      ue.error("Category name is required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editForm.id,
        name: editForm.name.trim(),
        slug: editForm.slug || generateSlug(editForm.name),
        description: editForm.description,
        imageUrl: editForm.imageUrl || void 0
      });
      ue.success(`Category "${editForm.name}" updated!`);
      setEditOpen(false);
    } catch (err) {
      ue.error(
        err instanceof Error ? err.message : "Failed to update category"
      );
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.categories.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Categories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
          categories.length,
          " categories"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth",
            "data-ocid": "admin.categories.add_category_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
              " Add Category"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "admin.categories.add_dialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-xl", children: "New Category" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
                "Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.name,
                  onChange: (e) => setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })),
                  placeholder: "e.g. Cakes",
                  className: "mt-1",
                  required: true,
                  "data-ocid": "admin.categories.name_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Slug" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: form.slug,
                  onChange: (e) => setForm((f) => ({ ...f, slug: e.target.value })),
                  placeholder: "e.g. cakes",
                  className: "mt-1 font-mono text-sm",
                  "data-ocid": "admin.categories.slug_input"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-generated from name. Used in URLs." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: form.description,
                  onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                  placeholder: "Brief description of this category",
                  className: "mt-1 resize-none",
                  rows: 2,
                  "data-ocid": "admin.categories.description_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CategoryImageUpload,
              {
                value: form.imageUrl,
                onChange: (url) => setForm((f) => ({ ...f, imageUrl: url })),
                onClear: () => setForm((f) => ({ ...f, imageUrl: "" }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  onClick: () => setOpen(false),
                  "data-ocid": "admin.categories.cancel_button",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  disabled: createMutation.isPending,
                  className: "bg-primary hover:bg-primary/90 text-primary-foreground gap-2",
                  "data-ocid": "admin.categories.submit_button",
                  children: createMutation.isPending ? "Creating..." : "Create Category"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "admin.categories.edit_dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-xl", children: "Edit Category" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleEdit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: editForm.name,
              onChange: (e) => setEditForm((f) => ({ ...f, name: e.target.value })),
              className: "mt-1",
              required: true,
              "data-ocid": "admin.categories.edit_name_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Slug" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: editForm.slug,
              onChange: (e) => setEditForm((f) => ({ ...f, slug: e.target.value })),
              className: "mt-1 font-mono text-sm",
              "data-ocid": "admin.categories.edit_slug_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: editForm.description,
              onChange: (e) => setEditForm((f) => ({ ...f, description: e.target.value })),
              className: "mt-1 resize-none",
              rows: 2,
              "data-ocid": "admin.categories.edit_description_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CategoryImageUpload,
          {
            value: editForm.imageUrl,
            onChange: (url) => setEditForm((f) => ({ ...f, imageUrl: url })),
            onClear: () => setEditForm((f) => ({ ...f, imageUrl: "" }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => setEditOpen(false),
              "data-ocid": "admin.categories.edit_cancel_button",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              disabled: updateMutation.isPending,
              className: "bg-primary hover:bg-primary/90 text-primary-foreground gap-2",
              "data-ocid": "admin.categories.edit_save_button",
              children: updateMutation.isPending ? "Saving..." : "Save Changes"
            }
          )
        ] })
      ] })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-36 bg-muted animate-pulse rounded-xl" }, k)) }) : categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-16 bg-card rounded-xl border border-border",
        "data-ocid": "admin.categories.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 40, className: "mx-auto mb-3 text-muted-foreground/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: "No categories yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mb-4", children: "Create categories to organize your products." })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        "data-ocid": "admin.categories.list",
        children: categories.map((cat, i) => {
          const count = getProductCount(cat.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 15 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: i * 0.07 },
              "data-ocid": `admin.categories.item.${i + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden bg-card border-border shadow-warm hover-lift", children: [
                cat.imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-24 overflow-hidden bg-muted", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: cat.imageUrl,
                      alt: cat.name,
                      className: "w-full h-full object-cover",
                      onError: (e) => {
                        e.target.style.display = "none";
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: cat.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: cat.imageUrl,
                          alt: "",
                          className: "w-9 h-9 rounded-lg object-cover"
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 14, className: "text-primary" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm truncate", children: cat.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Badge,
                          {
                            variant: "secondary",
                            className: "text-[10px] font-mono mt-0.5",
                            children: cat.slug
                          }
                        )
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth",
                          onClick: () => openEdit(cat),
                          "aria-label": `Edit ${cat.name}`,
                          "data-ocid": `admin.categories.edit_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 12 })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth",
                            "aria-label": `Delete ${cat.name}`,
                            "data-ocid": `admin.categories.delete_button.${i + 1}`,
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.categories.delete_dialog", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
                              'Delete "',
                              cat.name,
                              '"?'
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                              "This will remove the category.",
                              count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block mt-1 text-destructive font-medium", children: [
                                "⚠️ ",
                                count,
                                " product",
                                count !== 1 ? "s" : "",
                                " use this category and will become uncategorized."
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.categories.delete_cancel_button", children: "Cancel" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              AlertDialogAction,
                              {
                                onClick: async () => {
                                  try {
                                    await deleteMutation.mutateAsync(cat.id);
                                    ue.success(`"${cat.name}" deleted`);
                                  } catch (err) {
                                    ue.error(
                                      err instanceof Error ? err.message : "Failed to delete category"
                                    );
                                  }
                                },
                                className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                                "data-ocid": "admin.categories.delete_confirm_button",
                                children: "Delete"
                              }
                            )
                          ] })
                        ] })
                      ] })
                    ] })
                  ] }),
                  cat.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 ml-11 line-clamp-2", children: cat.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 ml-11 flex items-center gap-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 11 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      count,
                      " product",
                      count !== 1 ? "s" : ""
                    ] })
                  ] })
                ] })
              ] })
            },
            cat.id
          );
        })
      }
    )
  ] });
}
export {
  AdminCategoriesPage as default
};

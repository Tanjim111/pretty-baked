import { aq as useGetCoupons, ar as useAddCoupon, as as useUpdateCoupon, at as useDeleteCoupon, r as reactExports, j as jsxRuntimeExports, e as Button, au as Ticket, B as Badge, f as Skeleton, g as ue, o as Label, I as Input, W as Select, Y as SelectTrigger, Z as SelectValue, $ as SelectContent, a0 as SelectItem } from "./index-YPmBzU2g.js";
import { A as AlertDialog, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Hws5YtRC.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-y8MOlqQc.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-CYJVCNc-.js";
import { S as Switch } from "./switch-BC7UpI0g.js";
import { P as Plus } from "./plus-KifZePkW.js";
import { P as Pen } from "./pen-CaQa3muJ.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import "./index-DfMnyd6p.js";
function couponBadges(coupon) {
  const badges = [];
  if (coupon.maxUses === 1n) {
    badges.push({
      label: "One-time",
      color: "bg-primary/10 text-primary border-primary/20"
    });
  } else if (coupon.maxUses && coupon.maxUses > 1n) {
    badges.push({
      label: "Multi-use",
      color: "bg-accent text-accent-foreground border-accent/20"
    });
  } else {
    badges.push({
      label: "Unlimited",
      color: "bg-muted text-foreground border-border"
    });
  }
  if (coupon.expiresAt) {
    badges.push({
      label: "Limited Time",
      color: "bg-destructive/10 text-destructive border-destructive/20"
    });
  }
  return badges;
}
function bigintToDateInput(ts) {
  if (!ts) return "";
  const ms = Number(ts / 1000000n);
  return new Date(ms).toISOString().slice(0, 10);
}
function dateInputToBigint(val) {
  if (!val) return void 0;
  return BigInt(new Date(val).getTime()) * 1000000n;
}
function couponToForm(c) {
  return {
    code: c.code,
    discountType: c.discountType,
    discountValueStr: c.discountValue.toString(),
    maxUsesStr: c.maxUses != null ? c.maxUses.toString() : "",
    expiryDate: bigintToDateInput(c.expiresAt),
    isActive: c.isActive
  };
}
const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  discountValueStr: "",
  maxUsesStr: "",
  expiryDate: "",
  isActive: true
};
function formToCouponInput(f) {
  return {
    code: f.code.toUpperCase().trim(),
    discountType: f.discountType,
    discountValue: BigInt(Math.max(0, Number(f.discountValueStr) || 0)),
    maxUses: f.maxUsesStr ? BigInt(Math.max(1, Number(f.maxUsesStr))) : void 0,
    expiresAt: dateInputToBigint(f.expiryDate),
    isActive: f.isActive
  };
}
function CouponForm({
  initial,
  onSave,
  onClose,
  isSaving,
  isEdit
}) {
  const [form, setForm] = reactExports.useState({ ...initial });
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.code.trim()) {
      ue.error("Coupon code is required");
      return;
    }
    const val = Number(form.discountValueStr);
    if (!val || val <= 0) {
      ue.error("Discount value must be greater than 0");
      return;
    }
    if (form.discountType === "percentage" && val > 100) {
      ue.error("Percentage discount cannot exceed 100%");
      return;
    }
    await onSave(formToCouponInput(form));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
          "Coupon Code ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.code,
            onChange: (e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() })),
            placeholder: "e.g. SAVE20",
            className: "mt-1 font-mono tracking-wider uppercase",
            "data-ocid": "admin.coupons.code_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Discount Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: form.discountType,
            onValueChange: (v) => setForm((f) => ({
              ...f,
              discountType: v
            })),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectTrigger,
                {
                  className: "mt-1",
                  "data-ocid": "admin.coupons.type_select",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: "Percentage (%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "Fixed Amount (৳)" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm font-medium", children: [
          "Discount Value ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: form.discountType === "percentage" ? "%" : "৳" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              max: form.discountType === "percentage" ? 100 : void 0,
              value: form.discountValueStr,
              onChange: (e) => setForm((f) => ({ ...f, discountValueStr: e.target.value })),
              placeholder: "0",
              className: "pl-7",
              "data-ocid": "admin.coupons.value_input"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Max Uses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 1,
            value: form.maxUsesStr,
            onChange: (e) => setForm((f) => ({ ...f, maxUsesStr: e.target.value })),
            placeholder: "Unlimited",
            className: "mt-1",
            "data-ocid": "admin.coupons.max_uses_input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Leave empty for unlimited uses" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Expiry Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: form.expiryDate,
            onChange: (e) => setForm((f) => ({ ...f, expiryDate: e.target.value })),
            className: "mt-1",
            "data-ocid": "admin.coupons.expiry_input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Leave empty for no expiry" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Active" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enable this coupon for use" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          checked: form.isActive,
          onCheckedChange: (v) => setForm((f) => ({ ...f, isActive: v })),
          "data-ocid": "admin.coupons.active_switch"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-end pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: onClose,
          "data-ocid": "admin.coupons.cancel_button",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          disabled: isSaving,
          className: "bg-primary hover:bg-primary/90 text-primary-foreground gap-2",
          "data-ocid": "admin.coupons.save_button",
          children: isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Coupon"
        }
      )
    ] })
  ] });
}
function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useGetCoupons();
  const addMutation = useAddCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [editingCoupon, setEditingCoupon] = reactExports.useState(null);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  function openAdd() {
    setEditingCoupon(null);
    setModalOpen(true);
  }
  function openEdit(coupon) {
    setEditingCoupon(coupon);
    setModalOpen(true);
  }
  async function handleSave(input) {
    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({ id: editingCoupon.id, input });
        ue.success("Coupon updated!");
      } else {
        await addMutation.mutateAsync(input);
        ue.success(`Coupon "${input.code}" created!`);
      }
      setModalOpen(false);
    } catch {
      ue.error("Failed to save coupon. Please try again.");
    }
  }
  async function handleDelete(id) {
    try {
      await deleteMutation.mutateAsync(id);
      ue.success("Coupon deleted");
      setDeletingId(null);
    } catch {
      ue.error("Failed to delete coupon.");
    }
  }
  const isSaving = addMutation.isPending || updateMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.coupons.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Coupon Codes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Create and manage discount codes for your customers" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openAdd,
          className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth",
          "data-ocid": "admin.coupons.add_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
            " Add New Coupon"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border shadow-warm",
        "data-ocid": "admin.coupons.table",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "font-display text-base font-bold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { size: 16, className: "text-primary" }),
            "All Coupons",
            coupons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1", children: coupons.length })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "admin.coupons.loading_state", children: [1, 2, 3].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 rounded-lg" }, k)) }) : coupons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "py-14 flex flex-col items-center text-center",
              "data-ocid": "admin.coupons.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { size: 40, className: "text-muted-foreground/40 mb-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground mb-1", children: "No coupons yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Create your first discount code to get started" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    onClick: openAdd,
                    className: "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground",
                    "data-ocid": "admin.coupons.empty_add_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                      " Add Coupon"
                    ]
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Code" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Value" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Max Uses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Used" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Expires" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Tags" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: coupons.map((coupon, i) => {
              const badges = couponBadges(coupon);
              const isExpired = coupon.expiresAt ? Number(BigInt(String(coupon.expiresAt)) / 1000000n) < Date.now() : false;
              const isExhausted = coupon.maxUses ? coupon.currentUses >= coupon.maxUses : false;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  className: "border-b border-border/50 hover:bg-muted/30 transition-colors",
                  "data-ocid": `admin.coupons.item.${i + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-semibold text-foreground tracking-wider text-xs bg-primary/10 px-2 py-0.5 rounded", children: coupon.code }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-muted-foreground", children: coupon.discountType === "percentage" ? "Percentage" : "Fixed Amount" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right font-semibold text-primary", children: coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `৳${coupon.discountValue}` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right text-muted-foreground", children: coupon.maxUses != null ? coupon.maxUses.toString() : "∞" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right text-muted-foreground", children: coupon.currentUses.toString() }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-muted-foreground text-xs", children: coupon.expiresAt ? new Date(
                      Number(
                        BigInt(String(coupon.expiresAt)) / 1000000n
                      )
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }) : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: badges.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${b.color}`,
                        children: b.label
                      },
                      b.label
                    )) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `text-[10px] px-2 py-0.5 rounded-full font-semibold border ${!coupon.isActive || isExpired || isExhausted ? "bg-muted text-muted-foreground border-border" : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"}`,
                        children: isExpired ? "Expired" : isExhausted ? "Exhausted" : coupon.isActive ? "Active" : "Inactive"
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 w-7 p-0 hover:text-primary transition-smooth",
                          onClick: () => openEdit(coupon),
                          "data-ocid": `admin.coupons.edit_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 13 })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 w-7 p-0 hover:text-destructive transition-smooth",
                          onClick: () => setDeletingId(coupon.id),
                          "data-ocid": `admin.coupons.delete_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                        }
                      )
                    ] }) })
                  ]
                },
                coupon.id.toString()
              );
            }) })
          ] }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: modalOpen, onOpenChange: setModalOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "admin.coupons.dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display font-bold", children: editingCoupon ? "Edit Coupon" : "Create New Coupon" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CouponForm,
        {
          initial: editingCoupon ? couponToForm(editingCoupon) : EMPTY_FORM,
          onSave: handleSave,
          onClose: () => setModalOpen(false),
          isSaving,
          isEdit: !!editingCoupon
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: !!deletingId,
        onOpenChange: (open) => {
          if (!open) setDeletingId(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.coupons.delete_dialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this coupon?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone. The coupon code will be permanently removed." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.coupons.delete_cancel_button", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: () => {
                  if (deletingId) handleDelete(deletingId);
                },
                disabled: deleteMutation.isPending,
                className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                "data-ocid": "admin.coupons.delete_confirm_button",
                children: deleteMutation.isPending ? "Deleting..." : "Delete"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  AdminCouponsPage as default
};

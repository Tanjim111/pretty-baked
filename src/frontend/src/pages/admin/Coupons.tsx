import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Edit2, Plus, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddCoupon,
  useDeleteCoupon,
  useGetCoupons,
  useUpdateCoupon,
} from "../../hooks/useBackend";
import type { Coupon, CouponInput } from "../../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function couponBadges(coupon: Coupon) {
  const badges: { label: string; color: string }[] = [];
  if (coupon.maxUses === 1n) {
    badges.push({
      label: "One-time",
      color: "bg-primary/10 text-primary border-primary/20",
    });
  } else if (coupon.maxUses && coupon.maxUses > 1n) {
    badges.push({
      label: "Multi-use",
      color: "bg-accent text-accent-foreground border-accent/20",
    });
  } else {
    badges.push({
      label: "Unlimited",
      color: "bg-muted text-foreground border-border",
    });
  }
  if (coupon.expiresAt) {
    badges.push({
      label: "Limited Time",
      color: "bg-destructive/10 text-destructive border-destructive/20",
    });
  }
  return badges;
}

function bigintToDateInput(ts?: bigint): string {
  if (!ts) return "";
  // ts is stored in nanoseconds — divide by 1_000_000 to get milliseconds
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toISOString().slice(0, 10);
}

function dateInputToBigint(val: string): bigint | undefined {
  if (!val) return undefined;
  // Backend Time.now() is in nanoseconds — multiply ms timestamp by 1_000_000
  // so the stored expiresAt is in the same nanosecond unit as Time.now().
  // Without this, every coupon with an expiry date appears expired immediately
  // because Time.now() (~1.7e18 ns) >> getTime() (~1.7e12 ms).
  return BigInt(new Date(val).getTime()) * 1_000_000n;
}

// ─── Form state uses plain numbers for easier inputs ────────────────────────

interface FormState {
  code: string;
  discountType: "percentage" | "fixed";
  discountValueStr: string;
  maxUsesStr: string;
  expiryDate: string;
  isActive: boolean;
}

function couponToForm(c: Coupon): FormState {
  return {
    code: c.code,
    discountType: c.discountType,
    discountValueStr: c.discountValue.toString(),
    maxUsesStr: c.maxUses != null ? c.maxUses.toString() : "",
    expiryDate: bigintToDateInput(c.expiresAt),
    isActive: c.isActive,
  };
}

const EMPTY_FORM: FormState = {
  code: "",
  discountType: "percentage",
  discountValueStr: "",
  maxUsesStr: "",
  expiryDate: "",
  isActive: true,
};

function formToCouponInput(f: FormState): CouponInput {
  return {
    code: f.code.toUpperCase().trim(),
    discountType: f.discountType,
    discountValue: BigInt(Math.max(0, Number(f.discountValueStr) || 0)),
    maxUses: f.maxUsesStr
      ? BigInt(Math.max(1, Number(f.maxUsesStr)))
      : undefined,
    expiresAt: dateInputToBigint(f.expiryDate),
    isActive: f.isActive,
  };
}

// ─── Coupon form modal ───────────────────────────────────────────────────────

interface CouponFormProps {
  initial: FormState;
  onSave: (input: CouponInput) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
  isEdit: boolean;
}

function CouponForm({
  initial,
  onSave,
  onClose,
  isSaving,
  isEdit,
}: CouponFormProps) {
  const [form, setForm] = useState<FormState>({ ...initial });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    const val = Number(form.discountValueStr);
    if (!val || val <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    if (form.discountType === "percentage" && val > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }
    await onSave(formToCouponInput(form));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-sm font-medium">
            Coupon Code <span className="text-destructive">*</span>
          </Label>
          <Input
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
            }
            placeholder="e.g. SAVE20"
            className="mt-1 font-mono tracking-wider uppercase"
            data-ocid="admin.coupons.code_input"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Discount Type</Label>
          <Select
            value={form.discountType}
            onValueChange={(v) =>
              setForm((f) => ({
                ...f,
                discountType: v as "percentage" | "fixed",
              }))
            }
          >
            <SelectTrigger
              className="mt-1"
              data-ocid="admin.coupons.type_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium">
            Discount Value <span className="text-destructive">*</span>
          </Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {form.discountType === "percentage" ? "%" : "৳"}
            </span>
            <Input
              type="number"
              min={0}
              max={form.discountType === "percentage" ? 100 : undefined}
              value={form.discountValueStr}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountValueStr: e.target.value }))
              }
              placeholder="0"
              className="pl-7"
              data-ocid="admin.coupons.value_input"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Max Uses</Label>
          <Input
            type="number"
            min={1}
            value={form.maxUsesStr}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxUsesStr: e.target.value }))
            }
            placeholder="Unlimited"
            className="mt-1"
            data-ocid="admin.coupons.max_uses_input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for unlimited uses
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">Expiry Date</Label>
          <Input
            type="date"
            value={form.expiryDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, expiryDate: e.target.value }))
            }
            className="mt-1"
            data-ocid="admin.coupons.expiry_input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty for no expiry
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          <Label className="text-sm font-medium">Active</Label>
          <p className="text-xs text-muted-foreground">
            Enable this coupon for use
          </p>
        </div>
        <Switch
          checked={form.isActive}
          onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
          data-ocid="admin.coupons.active_switch"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          data-ocid="admin.coupons.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          data-ocid="admin.coupons.save_button"
        >
          {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useGetCoupons();
  const addMutation = useAddCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  function openAdd() {
    setEditingCoupon(null);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setModalOpen(true);
  }

  async function handleSave(input: CouponInput) {
    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({ id: editingCoupon.id, input });
        toast.success("Coupon updated!");
      } else {
        await addMutation.mutateAsync(input);
        toast.success(`Coupon "${input.code}" created!`);
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save coupon. Please try again.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Coupon deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete coupon.");
    }
  }

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6" data-ocid="admin.coupons.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Coupon Codes
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Create and manage discount codes for your customers
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground hover-lift transition-smooth"
          data-ocid="admin.coupons.add_button"
        >
          <Plus size={15} /> Add New Coupon
        </Button>
      </div>

      {/* Table */}
      <Card
        className="bg-card border-border shadow-warm"
        data-ocid="admin.coupons.table"
      >
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Ticket size={16} className="text-primary" />
            All Coupons
            {coupons.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {coupons.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-ocid="admin.coupons.loading_state">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div
              className="py-14 flex flex-col items-center text-center"
              data-ocid="admin.coupons.empty_state"
            >
              <Ticket size={40} className="text-muted-foreground/40 mb-3" />
              <p className="font-medium text-foreground mb-1">No coupons yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first discount code to get started
              </p>
              <Button
                onClick={openAdd}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="admin.coupons.empty_add_button"
              >
                <Plus size={14} /> Add Coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Code
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Value
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Max Uses
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Used
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon, i) => {
                    const badges = couponBadges(coupon);
                    const isExpired = coupon.expiresAt
                      ? Number(BigInt(String(coupon.expiresAt)) / 1_000_000n) <
                        Date.now()
                      : false;
                    const isExhausted = coupon.maxUses
                      ? coupon.currentUses >= coupon.maxUses
                      : false;
                    return (
                      <tr
                        key={coupon.id.toString()}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        data-ocid={`admin.coupons.item.${i + 1}`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-mono font-semibold text-foreground tracking-wider text-xs bg-primary/10 px-2 py-0.5 rounded">
                            {coupon.code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {coupon.discountType === "percentage"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-primary">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `৳${coupon.discountValue}`}
                        </td>
                        <td className="py-3 px-3 text-right text-muted-foreground">
                          {coupon.maxUses != null
                            ? coupon.maxUses.toString()
                            : "∞"}
                        </td>
                        <td className="py-3 px-3 text-right text-muted-foreground">
                          {coupon.currentUses.toString()}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground text-xs">
                          {coupon.expiresAt
                            ? new Date(
                                Number(
                                  BigInt(String(coupon.expiresAt)) / 1_000_000n,
                                ),
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {badges.map((b) => (
                              <span
                                key={b.label}
                                className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${b.color}`}
                              >
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              !coupon.isActive || isExpired || isExhausted
                                ? "bg-muted text-muted-foreground border-border"
                                : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
                            }`}
                          >
                            {isExpired
                              ? "Expired"
                              : isExhausted
                                ? "Exhausted"
                                : coupon.isActive
                                  ? "Active"
                                  : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-primary transition-smooth"
                              onClick={() => openEdit(coupon)}
                              data-ocid={`admin.coupons.edit_button.${i + 1}`}
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-destructive transition-smooth"
                              onClick={() => setDeletingId(coupon.id)}
                              data-ocid={`admin.coupons.delete_button.${i + 1}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md" data-ocid="admin.coupons.dialog">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>
          <CouponForm
            initial={editingCoupon ? couponToForm(editingCoupon) : EMPTY_FORM}
            onSave={handleSave}
            onClose={() => setModalOpen(false)}
            isSaving={isSaving}
            isEdit={!!editingCoupon}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.coupons.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The coupon code will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.coupons.delete_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) handleDelete(deletingId);
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="admin.coupons.delete_confirm_button"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

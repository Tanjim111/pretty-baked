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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Search,
  Star,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAdminDeleteUser,
  useAdminUpdateUser,
  useListAllUsers,
} from "../../hooks/useBackend";
import type { AdminUserView } from "../../types";

export default function AdminUsersPage() {
  const { data: users = [], isLoading, error } = useListAllUsers();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [deletingEmails, setDeletingEmails] = useState<Set<string>>(new Set());

  // Edit state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers =
    searchQuery.trim().length === 0
      ? users.filter((u) => !deletingEmails.has(u.email))
      : users
          .filter((u) => !deletingEmails.has(u.email))
          .filter((u) =>
            u.email.toLowerCase().includes(searchQuery.trim().toLowerCase()),
          );

  function openUser(user: AdminUserView) {
    setSelectedUser(user);
    setEditName(user.name ?? "");
    setEditPhone(user.phone ?? "");
    setEditBio(user.bio ?? "");
    setEditAddress(user.deliveryAddress ?? "");
    setEditPassword(user.password ?? "");
    setShowPassword(false);
  }

  function closeUser() {
    setSelectedUser(null);
    setShowPassword(false);
  }

  async function handleSave() {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await updateUser.mutateAsync({
        email: selectedUser.email,
        updates: {
          displayName: editName || undefined,
          phone: editPhone || undefined,
          bio: editBio || undefined,
          deliveryAddress: editAddress || undefined,
          // Only send newPassword if it was changed from the stored value
          newPassword:
            editPassword !== selectedUser.password && editPassword.trim()
              ? editPassword.trim()
              : undefined,
        },
      });
      toast.success(`User ${selectedUser.email} updated successfully`);
      closeUser();
    } catch {
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(email: string) {
    setDeletingEmails((s) => new Set([...s, email]));
    try {
      await deleteUser.mutateAsync(email);
      if (selectedUser?.email === email) closeUser();
      toast.success("User deleted successfully");
    } catch {
      setDeletingEmails((s) => {
        const next = new Set(s);
        next.delete(email);
        return next;
      });
      toast.error("Failed to delete user. Please try again.");
    }
  }

  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    {
      label: "Active",
      value: users.filter((u) => !deletingEmails.has(u.email)).length,
      icon: UserCircle2,
    },
    {
      label: "With Points",
      value: users.filter((u) => Number(u.loyaltyPoints) > 0).length,
      icon: Star,
    },
    {
      label: "With Wishlists",
      value: users.filter((u) => u.wishlist.length > 0).length,
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-6" data-ocid="admin.users.page">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Users
        </h2>
        <p className="text-muted-foreground text-sm">
          {filteredUsers.length} registered user
          {filteredUsers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-card border-border shadow-warm"
              data-ocid={`admin.users.stat.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} className="text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="font-display text-xl font-bold text-foreground">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users Table */}
      <Card
        className="bg-card border-border shadow-warm"
        data-ocid="admin.users.users_panel"
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="font-display text-base font-bold text-foreground">
              Registered Users
            </CardTitle>
            {/* Search bar */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                type="search"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs border-border bg-background focus-visible:ring-primary/40 rounded-lg"
                data-ocid="admin.users.search_input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {(["a", "b", "c"] as const).map((k) => (
                <div
                  key={k}
                  className="h-12 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div
              className="text-center py-14"
              data-ocid="admin.users.error_state"
            >
              <UserCircle2
                size={40}
                className="mx-auto mb-3 text-destructive/40"
              />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                Failed to load users
              </h3>
              <p className="text-muted-foreground text-sm">
                Could not fetch user list. Please refresh and try again.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div
              className="text-center py-14"
              data-ocid="admin.users.empty_state"
            >
              <Users
                size={40}
                className="mx-auto mb-3 text-muted-foreground/40"
              />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                No users yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Users will appear here once customers register on your store.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="admin.users.search_empty_state"
            >
              <Search
                size={36}
                className="mx-auto mb-3 text-muted-foreground/40"
              />
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                No users found
              </h3>
              <p className="text-muted-foreground text-sm">
                No user matches &ldquo;{searchQuery}&rdquo;. Try a different
                email.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                      Display Name
                    </th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">
                      Points
                    </th>
                    <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user, i) => (
                    <motion.tr
                      key={user.email}
                      className="hover:bg-muted/30 transition-smooth"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      data-ocid={`admin.users.row.${i + 1}`}
                    >
                      <td className="px-3 py-3">
                        <span className="text-sm font-medium text-foreground truncate max-w-[180px] block">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {user.name || (
                            <span className="italic text-muted-foreground/50 text-xs">
                              Not set
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell text-center">
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono"
                        >
                          {Number(user.loyaltyPoints)} pts
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth"
                            onClick={() => openUser(user)}
                            aria-label="View user details"
                            data-ocid={`admin.users.view_button.${i + 1}`}
                          >
                            <Eye size={13} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth"
                                aria-label="Delete user"
                                disabled={deletingEmails.has(user.email)}
                                data-ocid={`admin.users.delete_button.${i + 1}`}
                              >
                                {deletingEmails.has(user.email) ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-ocid="admin.users.delete_dialog">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete user?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This will permanently delete{" "}
                                  <strong>{user.email}</strong> and cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.users.delete_cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.email)}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  data-ocid="admin.users.delete_confirm_button"
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
              {searchQuery.trim().length > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Showing {filteredUsers.length} of{" "}
                  {users.filter((u) => !deletingEmails.has(u.email)).length}{" "}
                  users
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail / Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && closeUser()}>
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-ocid="admin.users.detail_dialog"
        >
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg flex items-center gap-2">
                  <UserCircle2 size={20} className="text-primary" />
                  User Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                {/* Avatar + Email */}
                <div className="flex items-center gap-4">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name || selectedUser.email}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                      <UserCircle2 size={28} className="text-primary/60" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {Number(selectedUser.loyaltyPoints)} pts
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {selectedUser.wishlist.length} wishlist item
                        {selectedUser.wishlist.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined{" "}
                      {new Date(
                        Number(selectedUser.createdAt) / 1_000_000,
                      ).toLocaleDateString("en-BD", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Password field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="user-password"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Password (stored)
                  </Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="pr-9 text-sm font-mono bg-background"
                      data-ocid="admin.users.password_input"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      data-ocid="admin.users.password_toggle"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Change the value above to set a new password for this user.
                  </p>
                </div>

                <Separator />

                {/* Editable profile fields */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Profile Details
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="user-name" className="text-xs">
                        Display Name
                      </Label>
                      <Input
                        id="user-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Full name"
                        className="text-sm bg-background"
                        data-ocid="admin.users.name_input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="user-phone" className="text-xs">
                        Phone
                      </Label>
                      <Input
                        id="user-phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Phone number"
                        className="text-sm bg-background"
                        data-ocid="admin.users.phone_input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="user-address" className="text-xs">
                      Delivery Address
                    </Label>
                    <Input
                      id="user-address"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Saved delivery address"
                      className="text-sm bg-background"
                      data-ocid="admin.users.address_input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="user-bio" className="text-xs">
                      Bio
                    </Label>
                    <Textarea
                      id="user-bio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Short bio..."
                      rows={2}
                      className="text-sm resize-none bg-background"
                      data-ocid="admin.users.bio_input"
                    />
                  </div>
                </div>

                {/* Security question (read-only) */}
                {selectedUser.securityQuestion && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Security Question
                      </p>
                      <p className="text-sm text-foreground">
                        {selectedUser.securityQuestion}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleSave}
                    disabled={isSaving}
                    data-ocid="admin.users.save_button"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={closeUser}
                    data-ocid="admin.users.close_button"
                  >
                    Close
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                        disabled={deletingEmails.has(selectedUser.email)}
                        data-ocid="admin.users.detail_delete_button"
                      >
                        {deletingEmails.has(selectedUser.email) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This will permanently delete{" "}
                          <strong>{selectedUser.email}</strong> and cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="admin.users.detail_delete_cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(selectedUser.email)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          data-ocid="admin.users.detail_delete_confirm_button"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

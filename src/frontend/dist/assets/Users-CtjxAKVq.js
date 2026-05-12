import { c as createLucideIcon, aF as useListAllUsers, aG as useAdminUpdateUser, aH as useAdminDeleteUser, r as reactExports, aI as Users, H as Heart, j as jsxRuntimeExports, I as Input, m as motion, B as Badge, e as Button, w as Separator, o as Label, g as ue } from "./index-YPmBzU2g.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-Hws5YtRC.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-y8MOlqQc.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-CYJVCNc-.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { S as Star } from "./star-3CDJmN0E.js";
import { S as Search } from "./search-DbXcbU19.js";
import { E as Eye } from "./eye-BkZbYeCW.js";
import { L as LoaderCircle } from "./loader-circle-De99uBSv.js";
import { T as Trash2 } from "./trash-2-c2VuJcnZ.js";
import { E as EyeOff } from "./eye-off-oHnP-IQX.js";
import "./index-DfMnyd6p.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M18 20a6 6 0 0 0-12 0", key: "1qehca" }],
  ["circle", { cx: "12", cy: "10", r: "4", key: "1h16sb" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const CircleUserRound = createLucideIcon("circle-user-round", __iconNode);
function AdminUsersPage() {
  const { data: users = [], isLoading, error } = useListAllUsers();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedUser, setSelectedUser] = reactExports.useState(null);
  const [deletingEmails, setDeletingEmails] = reactExports.useState(/* @__PURE__ */ new Set());
  const [editName, setEditName] = reactExports.useState("");
  const [editPhone, setEditPhone] = reactExports.useState("");
  const [editBio, setEditBio] = reactExports.useState("");
  const [editAddress, setEditAddress] = reactExports.useState("");
  const [editPassword, setEditPassword] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const filteredUsers = searchQuery.trim().length === 0 ? users.filter((u) => !deletingEmails.has(u.email)) : users.filter((u) => !deletingEmails.has(u.email)).filter(
    (u) => u.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  function openUser(user) {
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
          displayName: editName || void 0,
          phone: editPhone || void 0,
          bio: editBio || void 0,
          deliveryAddress: editAddress || void 0,
          // Only send newPassword if it was changed from the stored value
          newPassword: editPassword !== selectedUser.password && editPassword.trim() ? editPassword.trim() : void 0
        }
      });
      ue.success(`User ${selectedUser.email} updated successfully`);
      closeUser();
    } catch {
      ue.error("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }
  async function handleDelete(email) {
    setDeletingEmails((s) => /* @__PURE__ */ new Set([...s, email]));
    try {
      await deleteUser.mutateAsync(email);
      if ((selectedUser == null ? void 0 : selectedUser.email) === email) closeUser();
      ue.success("User deleted successfully");
    } catch {
      setDeletingEmails((s) => {
        const next = new Set(s);
        next.delete(email);
        return next;
      });
      ue.error("Failed to delete user. Please try again.");
    }
  }
  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    {
      label: "Active",
      value: users.filter((u) => !deletingEmails.has(u.email)).length,
      icon: CircleUserRound
    },
    {
      label: "With Points",
      value: users.filter((u) => Number(u.loyaltyPoints) > 0).length,
      icon: Star
    },
    {
      label: "With Wishlists",
      value: users.filter((u) => u.wishlist.length > 0).length,
      icon: Heart
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.users.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground", children: "Users" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
        filteredUsers.length,
        " registered user",
        filteredUsers.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat, i) => {
      const Icon = stat.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "bg-card border-border shadow-warm",
          "data-ocid": `admin.users.stat.${i + 1}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 15, className: "text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: stat.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-xl font-bold text-foreground", children: stat.value })
          ] })
        },
        stat.label
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border shadow-warm",
        "data-ocid": "admin.users.users_panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-display text-base font-bold text-foreground", children: "Registered Users" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Search,
                {
                  size: 14,
                  className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "search",
                  placeholder: "Search by email...",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "pl-8 h-8 text-xs border-border bg-background focus-visible:ring-primary/40 rounded-lg",
                  "data-ocid": "admin.users.search_input"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: ["a", "b", "c"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-12 bg-muted animate-pulse rounded-lg"
            },
            k
          )) }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-14",
              "data-ocid": "admin.users.error_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CircleUserRound,
                  {
                    size: 40,
                    className: "mx-auto mb-3 text-destructive/40"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: "Failed to load users" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Could not fetch user list. Please refresh and try again." })
              ]
            }
          ) : users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-14",
              "data-ocid": "admin.users.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Users,
                  {
                    size: 40,
                    className: "mx-auto mb-3 text-muted-foreground/40"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: "No users yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Users will appear here once customers register on your store." })
              ]
            }
          ) : filteredUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center py-12",
              "data-ocid": "admin.users.search_empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Search,
                  {
                    size: 36,
                    className: "mx-auto mb-3 text-muted-foreground/40"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground mb-1", children: "No users found" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
                  "No user matches “",
                  searchQuery,
                  "”. Try a different email."
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/50 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell", children: "Display Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell", children: "Points" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider", children: "Actions" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filteredUsers.map((user, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                motion.tr,
                {
                  className: "hover:bg-muted/30 transition-smooth",
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: i * 0.03 },
                  "data-ocid": `admin.users.row.${i + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground truncate max-w-[180px] block", children: user.email }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: user.name || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-muted-foreground/50 text-xs", children: "Not set" }) }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 hidden md:table-cell text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Badge,
                      {
                        variant: "secondary",
                        className: "text-xs font-mono",
                        children: [
                          Number(user.loyaltyPoints),
                          " pts"
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-smooth",
                          onClick: () => openUser(user),
                          "aria-label": "View user details",
                          "data-ocid": `admin.users.view_button.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13 })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive transition-smooth",
                            "aria-label": "Delete user",
                            disabled: deletingEmails.has(user.email),
                            "data-ocid": `admin.users.delete_button.${i + 1}`,
                            children: deletingEmails.has(user.email) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 })
                          }
                        ) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.users.delete_dialog", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete user?" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                              "Are you sure? This will permanently delete",
                              " ",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: user.email }),
                              " and cannot be undone."
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.users.delete_cancel_button", children: "Cancel" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              AlertDialogAction,
                              {
                                onClick: () => handleDelete(user.email),
                                className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                                "data-ocid": "admin.users.delete_confirm_button",
                                children: "Delete"
                              }
                            )
                          ] })
                        ] })
                      ] })
                    ] }) })
                  ]
                },
                user.email
              )) })
            ] }),
            searchQuery.trim().length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-center mt-3", children: [
              "Showing ",
              filteredUsers.length,
              " of",
              " ",
              users.filter((u) => !deletingEmails.has(u.email)).length,
              " ",
              "users"
            ] })
          ] }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!selectedUser, onOpenChange: (o) => !o && closeUser(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContent,
      {
        className: "max-w-lg max-h-[85vh] overflow-y-auto",
        "data-ocid": "admin.users.detail_dialog",
        children: selectedUser && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display text-lg flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUserRound, { size: 20, className: "text-primary" }),
            "User Details"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              selectedUser.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: selectedUser.avatar,
                  alt: selectedUser.name || selectedUser.email,
                  className: "w-14 h-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0",
                  onError: (e) => {
                    e.target.style.display = "none";
                  }
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUserRound, { size: 28, className: "text-primary/60" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm truncate", children: selectedUser.email }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                    Number(selectedUser.loyaltyPoints),
                    " pts"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
                    selectedUser.wishlist.length,
                    " wishlist item",
                    selectedUser.wishlist.length !== 1 ? "s" : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                  "Joined",
                  " ",
                  new Date(
                    Number(selectedUser.createdAt) / 1e6
                  ).toLocaleDateString("en-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Label,
                {
                  htmlFor: "user-password",
                  className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
                  children: "Password (stored)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "user-password",
                    type: showPassword ? "text" : "password",
                    value: editPassword,
                    onChange: (e) => setEditPassword(e.target.value),
                    className: "pr-9 text-sm font-mono bg-background",
                    "data-ocid": "admin.users.password_input"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                    onClick: () => setShowPassword((v) => !v),
                    "aria-label": showPassword ? "Hide password" : "Show password",
                    "data-ocid": "admin.users.password_toggle",
                    children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Change the value above to set a new password for this user." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Profile Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "user-name", className: "text-xs", children: "Display Name" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "user-name",
                      value: editName,
                      onChange: (e) => setEditName(e.target.value),
                      placeholder: "Full name",
                      className: "text-sm bg-background",
                      "data-ocid": "admin.users.name_input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "user-phone", className: "text-xs", children: "Phone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "user-phone",
                      value: editPhone,
                      onChange: (e) => setEditPhone(e.target.value),
                      placeholder: "Phone number",
                      className: "text-sm bg-background",
                      "data-ocid": "admin.users.phone_input"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "user-address", className: "text-xs", children: "Delivery Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "user-address",
                    value: editAddress,
                    onChange: (e) => setEditAddress(e.target.value),
                    placeholder: "Saved delivery address",
                    className: "text-sm bg-background",
                    "data-ocid": "admin.users.address_input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "user-bio", className: "text-xs", children: "Bio" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "user-bio",
                    value: editBio,
                    onChange: (e) => setEditBio(e.target.value),
                    placeholder: "Short bio...",
                    rows: 2,
                    className: "text-sm resize-none bg-background",
                    "data-ocid": "admin.users.bio_input"
                  }
                )
              ] })
            ] }),
            selectedUser.securityQuestion && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Security Question" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: selectedUser.securityQuestion })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground",
                  onClick: handleSave,
                  disabled: isSaving,
                  "data-ocid": "admin.users.save_button",
                  children: isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin mr-1.5" }),
                    "Saving…"
                  ] }) : "Save Changes"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: closeUser,
                  "data-ocid": "admin.users.close_button",
                  children: "Close"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    className: "gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10",
                    disabled: deletingEmails.has(selectedUser.email),
                    "data-ocid": "admin.users.detail_delete_button",
                    children: deletingEmails.has(selectedUser.email) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete this user?" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                      "Are you sure? This will permanently delete",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedUser.email }),
                      " and cannot be undone."
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { "data-ocid": "admin.users.detail_delete_cancel_button", children: "Cancel" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AlertDialogAction,
                      {
                        onClick: () => handleDelete(selectedUser.email),
                        className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                        "data-ocid": "admin.users.detail_delete_confirm_button",
                        children: "Delete"
                      }
                    )
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] })
      }
    ) })
  ] });
}
export {
  AdminUsersPage as default
};

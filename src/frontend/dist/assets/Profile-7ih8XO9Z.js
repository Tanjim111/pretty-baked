import { c as createLucideIcon, h as useAuth, Q as useRouter, F as useGetMyProfile, J as useGetMyPoints, R as useUpdateProfile, U as useChangePassword, r as reactExports, j as jsxRuntimeExports, V as User, L as Link, f as Skeleton, B as Badge, o as Label, I as Input, W as Select, Y as SelectTrigger, Z as SelectValue, $ as SelectContent, a0 as SelectItem, e as Button } from "./index-YPmBzU2g.js";
import { C as Card, a as CardContent } from "./card-y8MOlqQc.js";
import { T as Textarea } from "./textarea-CFuq6zlC.js";
import { c as compressImage } from "./imageUtils-DRam8RY6.js";
import { A as ArrowLeft } from "./arrow-left-CWrfTQFu.js";
import { S as Star } from "./star-3CDJmN0E.js";
import { S as Sparkles } from "./sparkles-lxR0n97q.js";
import { G as Gift, L as Lock } from "./lock-CuqEYU-b.js";
import { C as CircleCheck } from "./circle-check-BrWsE1Gy.js";
import { S as Save } from "./save-DNf1rTGg.js";
import { E as EyeOff } from "./eye-off-oHnP-IQX.js";
import { E as Eye } from "./eye-BkZbYeCW.js";
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
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t"
    }
  ],
  ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
];
const KeyRound = createLucideIcon("key-round", __iconNode);
const SECURITY_QUESTIONS = [
  "What is your favorite food?",
  "What is your pet's name?",
  "What is your lucky number?",
  "What is your favorite color?",
  "What is your favorite place?"
];
const USER_NAME_KEY = "pretty-baked-user-name";
function ProfilePage() {
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading } = useGetMyProfile();
  const { data: points = 0 } = useGetMyPoints();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [bio, setBio] = reactExports.useState("");
  const [deliveryAddress, setDeliveryAddress] = reactExports.useState("");
  const [securityQuestion, setSecurityQuestion] = reactExports.useState("");
  const [securityAnswer, setSecurityAnswer] = reactExports.useState("");
  const [successMsg, setSuccessMsg] = reactExports.useState("");
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const [avatarPreview, setAvatarPreview] = reactExports.useState(null);
  const [avatarUploading, setAvatarUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [currentPassword, setCurrentPassword] = reactExports.useState("");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [showCurrentPw, setShowCurrentPw] = reactExports.useState(false);
  const [showNewPw, setShowNewPw] = reactExports.useState(false);
  const [showConfirmPw, setShowConfirmPw] = reactExports.useState(false);
  const [pwSuccess, setPwSuccess] = reactExports.useState("");
  const [pwError, setPwError] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setDeliveryAddress(profile.deliveryAddress ?? "");
      if (profile.avatar) setAvatarPreview(profile.avatar);
    }
  }, [profile]);
  reactExports.useEffect(() => {
    if (!isLoggedIn) {
      router.navigate({ to: "/" });
    }
  }, [isLoggedIn, router]);
  if (!isLoggedIn) return null;
  async function handleAvatarChange(e) {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file || !token) return;
    setAvatarUploading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const dataUrl = await compressImage(file, 400, 0.8);
      setAvatarPreview(dataUrl);
      const result = await updateProfile.mutateAsync({
        token,
        updates: { avatar: dataUrl }
      });
      if (result.__kind__ === "ok") {
        setSuccessMsg("Profile picture updated!");
      } else {
        setErrorMsg("Failed to save profile picture.");
        setAvatarPreview((profile == null ? void 0 : profile.avatar) ?? null);
      }
    } catch {
      setErrorMsg("An error occurred uploading the image.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    if (!token) {
      setErrorMsg("You are not logged in.");
      return;
    }
    const updates = {};
    if (name.trim()) updates.name = name.trim();
    if (phone.trim()) updates.phone = phone.trim();
    if (securityQuestion) updates.securityQuestion = securityQuestion;
    if (securityAnswer.trim()) updates.securityAnswer = securityAnswer.trim();
    updates.bio = bio.trim() || void 0;
    updates.deliveryAddress = deliveryAddress.trim() || void 0;
    try {
      const result = await updateProfile.mutateAsync({ token, updates });
      if (result.__kind__ === "ok") {
        setSuccessMsg("Profile updated successfully!");
        if (name.trim()) localStorage.setItem(USER_NAME_KEY, name.trim());
        setSecurityAnswer("");
      } else if (result.__kind__ === "invalidCredentials") {
        setErrorMsg("Session expired. Please log in again.");
      } else if (result.__kind__ === "notFound") {
        setErrorMsg("Account not found. Please log in again.");
      } else {
        setErrorMsg("Failed to update profile. Please try again.");
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    }
  }
  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    try {
      const result = await changePassword.mutateAsync({
        currentPassword,
        newPassword
      });
      if (result.__kind__ === "ok") {
        setPwSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (result.__kind__ === "invalidCredentials") {
        setPwError("Current password is incorrect.");
      } else if (result.__kind__ === "notFound") {
        setPwError("Account not found. Please log in again.");
      } else {
        setPwError("Failed to change password. Please try again.");
      }
    } catch {
      setPwError("An error occurred. Please try again.");
    }
  }
  function getPointsTier(pts) {
    if (pts >= 500)
      return {
        label: "Gold Member",
        color: "text-yellow-600 dark:text-yellow-400"
      };
    if (pts >= 200)
      return { label: "Silver Member", color: "text-muted-foreground" };
    return { label: "Bronze Member", color: "text-primary/70" };
  }
  const tier = getPointsTier(points);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container max-w-2xl mx-auto px-4 sm:px-6 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", "data-ocid": "profile.page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "aria-label": "Change profile picture",
            "data-ocid": "profile.avatar_upload_button",
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            className: "group relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            children: [
              avatarPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: avatarPreview,
                  alt: "Profile avatar",
                  className: "w-full h-full object-cover"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-primary/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 28, className: "text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: avatarUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-primary-foreground/60 border-t-primary-foreground rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 18, className: "text-primary-foreground" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/*",
            className: "hidden",
            onChange: handleAvatarChange,
            "data-ocid": "profile.avatar_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight", children: "My Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Manage your account details and security settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { size: 11, className: "text-primary" }),
          "Tap your photo to change it"
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/my-orders",
          className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors",
          "data-ocid": "profile.back_link",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 15 }),
            "Back to My Orders"
          ]
        }
      ),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-32 rounded-lg" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-lg",
            "data-ocid": "profile.loyalty_points_card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-foreground/10 pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-primary-foreground/10 pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-6 sm:p-7", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Star,
                        {
                          size: 16,
                          className: "text-primary-foreground/80 fill-primary-foreground/80"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-widest text-primary-foreground/80", children: "Loyalty Rewards" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-5xl font-bold tracking-tight leading-none mb-1", children: points.toLocaleString() }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-primary-foreground/90", children: "Available Points" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "mt-2 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 10, className: "mr-1" }),
                      tier.label
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { size: 28, className: "text-primary-foreground" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 pt-4 border-t border-primary-foreground/20 grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary-foreground/10 rounded-xl px-3 py-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70 mb-0.5", children: "How to Earn" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-primary-foreground", children: "Spend ৳100 → 1 point" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary-foreground/10 rounded-xl px-3 py-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70 mb-0.5", children: "Redemption" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-primary-foreground", children: "1 point = ৳1 discount" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-[11px] text-primary-foreground/60", children: [
                  "Use your points at checkout before placing an order.",
                  points > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary-foreground/80", children: [
                    " ",
                    "You can save up to ৳",
                    points.toLocaleString(),
                    " on your next order!"
                  ] })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border shadow-warm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Personal Details" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "form",
            {
              onSubmit: handleSubmit,
              className: "space-y-5",
              "data-ocid": "profile.form",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "profile-name",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "Full Name ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "profile-name",
                      type: "text",
                      value: name,
                      onChange: (e) => setName(e.target.value),
                      placeholder: "Your full name",
                      required: true,
                      "data-ocid": "profile.name_input",
                      className: "bg-background border-input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium text-foreground", children: "Email Address" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2.5 rounded-md border border-border bg-muted/40 text-sm text-muted-foreground", children: (profile == null ? void 0 : profile.email) ?? "—" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Email cannot be changed" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "profile-phone",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "Phone Number",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "profile-phone",
                      type: "tel",
                      value: phone,
                      onChange: (e) => setPhone(e.target.value),
                      placeholder: "+880 1700-000000",
                      "data-ocid": "profile.phone_input",
                      className: "bg-background border-input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "profile-bio",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "Short Bio",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional, max 200 chars)" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      id: "profile-bio",
                      value: bio,
                      onChange: (e) => setBio(e.target.value.slice(0, 200)),
                      placeholder: "Tell us a little about yourself…",
                      maxLength: 200,
                      rows: 3,
                      "data-ocid": "profile.bio_textarea",
                      className: "bg-background border-input resize-none"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-right", children: [
                    bio.length,
                    "/200"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "profile-delivery-address",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "Default Delivery Address",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "profile-delivery-address",
                      type: "text",
                      value: deliveryAddress,
                      onChange: (e) => setDeliveryAddress(e.target.value),
                      placeholder: "e.g. 123 Main Road, Dhaka 1200",
                      "data-ocid": "profile.delivery_address_input",
                      className: "bg-background border-input"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Saved here to pre-fill your checkout address" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-semibold text-foreground mb-1", children: "Update Security Question" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Leave both fields blank to keep your current security question unchanged." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Label,
                      {
                        htmlFor: "profile-security-question",
                        className: "text-sm font-medium text-foreground",
                        children: "Security Question"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Select,
                      {
                        value: securityQuestion,
                        onValueChange: setSecurityQuestion,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            SelectTrigger,
                            {
                              id: "profile-security-question",
                              "data-ocid": "profile.security_question_select",
                              className: "bg-background border-input",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a security question…" })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SECURITY_QUESTIONS.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: q, children: q }, q)) })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Label,
                      {
                        htmlFor: "profile-security-answer",
                        className: "text-sm font-medium text-foreground",
                        children: [
                          "Security Answer",
                          securityQuestion && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ml-1", children: "*" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "profile-security-answer",
                        type: "text",
                        value: securityAnswer,
                        onChange: (e) => setSecurityAnswer(e.target.value),
                        placeholder: "Your answer",
                        required: !!securityQuestion,
                        "data-ocid": "profile.security_answer_input",
                        className: "bg-background border-input"
                      }
                    )
                  ] })
                ] }),
                successMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm",
                    "data-ocid": "profile.success_state",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "shrink-0" }),
                      successMsg
                    ]
                  }
                ),
                errorMsg && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm",
                    "data-ocid": "profile.error_state",
                    children: errorMsg
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    disabled: updateProfile.isPending,
                    "data-ocid": "profile.save_button",
                    className: "gap-2",
                    children: updateProfile.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" }),
                      "Saving…"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 15 }),
                      "Save Changes"
                    ] })
                  }
                )
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border shadow-warm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { size: 16, className: "text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: "Change Password" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "form",
            {
              onSubmit: handlePasswordChange,
              className: "space-y-5",
              "data-ocid": "profile.password_form",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "current-password",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "Current Password",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Lock,
                      {
                        size: 15,
                        className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "current-password",
                        type: showCurrentPw ? "text" : "password",
                        value: currentPassword,
                        onChange: (e) => setCurrentPassword(e.target.value),
                        placeholder: "Your current password",
                        required: true,
                        className: "pl-9 pr-10 bg-background border-input",
                        "data-ocid": "profile.current_password_input"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowCurrentPw((v) => !v),
                        "aria-label": showCurrentPw ? "Hide password" : "Show password",
                        className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                        "data-ocid": "profile.toggle_current_pw",
                        children: showCurrentPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "new-password",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "New Password ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Lock,
                      {
                        size: 15,
                        className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "new-password",
                        type: showNewPw ? "text" : "password",
                        value: newPassword,
                        onChange: (e) => setNewPassword(e.target.value),
                        placeholder: "Min. 6 characters",
                        required: true,
                        minLength: 6,
                        className: "pl-9 pr-10 bg-background border-input",
                        "data-ocid": "profile.new_password_input"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowNewPw((v) => !v),
                        "aria-label": showNewPw ? "Hide password" : "Show password",
                        className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                        "data-ocid": "profile.toggle_new_pw",
                        children: showNewPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Label,
                    {
                      htmlFor: "confirm-password",
                      className: "text-sm font-medium text-foreground",
                      children: [
                        "Confirm New Password",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Lock,
                      {
                        size: 15,
                        className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        id: "confirm-password",
                        type: showConfirmPw ? "text" : "password",
                        value: confirmPassword,
                        onChange: (e) => setConfirmPassword(e.target.value),
                        placeholder: "Repeat new password",
                        required: true,
                        className: "pl-9 pr-10 bg-background border-input",
                        "data-ocid": "profile.confirm_password_input"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowConfirmPw((v) => !v),
                        "aria-label": showConfirmPw ? "Hide password" : "Show password",
                        className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                        "data-ocid": "profile.toggle_confirm_pw",
                        children: showConfirmPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 15 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 15 })
                      }
                    )
                  ] }),
                  confirmPassword && newPassword !== confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive mt-1", children: "Passwords do not match" })
                ] }),
                pwSuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm",
                    "data-ocid": "profile.pw_success_state",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "shrink-0" }),
                      pwSuccess
                    ]
                  }
                ),
                pwError && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm",
                    "data-ocid": "profile.pw_error_state",
                    children: pwError
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "submit",
                    disabled: changePassword.isPending || !currentPassword || !newPassword || !confirmPassword,
                    "data-ocid": "profile.change_password_button",
                    className: "gap-2",
                    children: changePassword.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" }),
                      "Updating…"
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { size: 15 }),
                      "Update Password"
                    ] })
                  }
                )
              ]
            }
          )
        ] }) })
      ] })
    ] })
  ] });
}
export {
  ProfilePage as default
};

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  Lock,
  Save,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useChangePassword,
  useGetMyPoints,
  useGetMyProfile,
  useUpdateProfile,
} from "../hooks/useBackend";
import { compressImage } from "../utils/imageUtils";

const SECURITY_QUESTIONS = [
  "What is your favorite food?",
  "What is your pet's name?",
  "What is your lucky number?",
  "What is your favorite color?",
  "What is your favorite place?",
];

const USER_NAME_KEY = "pretty-baked-user-name";

export default function ProfilePage() {
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();

  const { data: profile, isLoading } = useGetMyProfile();
  const { data: points = 0 } = useGetMyPoints();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Prefill form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setDeliveryAddress(profile.deliveryAddress ?? "");
      if (profile.avatar) setAvatarPreview(profile.avatar);
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.navigate({ to: "/" });
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  // ── Avatar upload ──────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setAvatarUploading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      // Compress avatar — max 400px, slightly lower quality to keep it small
      const dataUrl = await compressImage(file, 400, 0.8);
      setAvatarPreview(dataUrl);
      const result = await updateProfile.mutateAsync({
        token,
        updates: { avatar: dataUrl },
      });
      if (result.__kind__ === "ok") {
        setSuccessMsg("Profile picture updated!");
      } else {
        setErrorMsg("Failed to save profile picture.");
        setAvatarPreview(profile?.avatar ?? null);
      }
    } catch {
      setErrorMsg("An error occurred uploading the image.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Profile form submit ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!token) {
      setErrorMsg("You are not logged in.");
      return;
    }

    const updates: {
      name?: string;
      phone?: string;
      securityQuestion?: string;
      securityAnswer?: string;
      bio?: string;
      deliveryAddress?: string;
    } = {};

    if (name.trim()) updates.name = name.trim();
    if (phone.trim()) updates.phone = phone.trim();
    if (securityQuestion) updates.securityQuestion = securityQuestion;
    if (securityAnswer.trim()) updates.securityAnswer = securityAnswer.trim();
    updates.bio = bio.trim() || undefined;
    updates.deliveryAddress = deliveryAddress.trim() || undefined;

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

  // ── Password change submit ─────────────────────────────────────────────────
  async function handlePasswordChange(e: React.FormEvent) {
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
        newPassword,
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

  // Points tier label
  function getPointsTier(pts: number): { label: string; color: string } {
    if (pts >= 500)
      return {
        label: "Gold Member",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    if (pts >= 200)
      return { label: "Silver Member", color: "text-muted-foreground" };
    return { label: "Bronze Member", color: "text-primary/70" };
  }
  const tier = getPointsTier(points);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header band */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4" data-ocid="profile.page">
            {/* Avatar in header */}
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="Change profile picture"
                data-ocid="profile.avatar_upload_button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/15 flex items-center justify-center">
                    <User size={28} className="text-primary" />
                  </div>
                )}
                <span className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/60 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Camera size={18} className="text-primary-foreground" />
                  )}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                data-ocid="profile.avatar_input"
              />
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                My Profile
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your account details and security settings
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Camera size={11} className="text-primary" />
                Tap your photo to change it
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back link */}
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          data-ocid="profile.back_link"
        >
          <ArrowLeft size={15} />
          Back to My Orders
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        ) : (
          <>
            {/* ── Loyalty Points Card ─────────────────────────────────────── */}
            <div
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-lg"
              data-ocid="profile.loyalty_points_card"
            >
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-foreground/10 pointer-events-none" />
              <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-primary-foreground/10 pointer-events-none" />

              <div className="relative p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Star
                        size={16}
                        className="text-primary-foreground/80 fill-primary-foreground/80"
                      />
                      <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
                        Loyalty Rewards
                      </span>
                    </div>
                    <p className="font-display text-5xl font-bold tracking-tight leading-none mb-1">
                      {points.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-primary-foreground/90">
                      Available Points
                    </p>
                    <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20 text-xs">
                      <Sparkles size={10} className="mr-1" />
                      {tier.label}
                    </Badge>
                  </div>

                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                      <Gift size={28} className="text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* How to earn / redeem */}
                <div className="mt-5 pt-4 border-t border-primary-foreground/20 grid grid-cols-2 gap-3">
                  <div className="bg-primary-foreground/10 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70 mb-0.5">
                      How to Earn
                    </p>
                    <p className="text-xs font-medium text-primary-foreground">
                      Spend ৳100 → 1 point
                    </p>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70 mb-0.5">
                      Redemption
                    </p>
                    <p className="text-xs font-medium text-primary-foreground">
                      1 point = ৳1 discount
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-primary-foreground/60">
                  Use your points at checkout before placing an order.
                  {points > 0 && (
                    <span className="font-semibold text-primary-foreground/80">
                      {" "}
                      You can save up to ৳{points.toLocaleString()} on your next
                      order!
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* ── Profile Details Card ───────────────────────────────────── */}
            <Card className="bg-card border-border shadow-warm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <User size={16} className="text-primary" />
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Personal Details
                  </h2>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  data-ocid="profile.form"
                >
                  {/* Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-name"
                      className="text-sm font-medium text-foreground"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      data-ocid="profile.name_input"
                      className="bg-background border-input"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <div className="px-3 py-2.5 rounded-md border border-border bg-muted/40 text-sm text-muted-foreground">
                      {profile?.email ?? "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-phone"
                      className="text-sm font-medium text-foreground"
                    >
                      Phone Number{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1700-000000"
                      data-ocid="profile.phone_input"
                      className="bg-background border-input"
                    />
                  </div>

                  {/* Short Bio */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-bio"
                      className="text-sm font-medium text-foreground"
                    >
                      Short Bio{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional, max 200 chars)
                      </span>
                    </Label>
                    <Textarea
                      id="profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 200))}
                      placeholder="Tell us a little about yourself…"
                      maxLength={200}
                      rows={3}
                      data-ocid="profile.bio_textarea"
                      className="bg-background border-input resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {bio.length}/200
                    </p>
                  </div>

                  {/* Default Delivery Address */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="profile-delivery-address"
                      className="text-sm font-medium text-foreground"
                    >
                      Default Delivery Address{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="profile-delivery-address"
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. 123 Main Road, Dhaka 1200"
                      data-ocid="profile.delivery_address_input"
                      className="bg-background border-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Saved here to pre-fill your checkout address
                    </p>
                  </div>

                  {/* Security Question */}
                  <div className="border-t border-border pt-5">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-1">
                      Update Security Question
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Leave both fields blank to keep your current security
                      question unchanged.
                    </p>

                    <div className="space-y-2 mb-4">
                      <Label
                        htmlFor="profile-security-question"
                        className="text-sm font-medium text-foreground"
                      >
                        Security Question
                      </Label>
                      <Select
                        value={securityQuestion}
                        onValueChange={setSecurityQuestion}
                      >
                        <SelectTrigger
                          id="profile-security-question"
                          data-ocid="profile.security_question_select"
                          className="bg-background border-input"
                        >
                          <SelectValue placeholder="Choose a security question…" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECURITY_QUESTIONS.map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-security-answer"
                        className="text-sm font-medium text-foreground"
                      >
                        Security Answer
                        {securityQuestion && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      <Input
                        id="profile-security-answer"
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Your answer"
                        required={!!securityQuestion}
                        data-ocid="profile.security_answer_input"
                        className="bg-background border-input"
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  {successMsg && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm"
                      data-ocid="profile.success_state"
                    >
                      <CheckCircle2 size={15} className="shrink-0" />
                      {successMsg}
                    </div>
                  )}
                  {errorMsg && (
                    <div
                      className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                      data-ocid="profile.error_state"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    data-ocid="profile.save_button"
                    className="gap-2"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* ── Change Password Card ───────────────────────────────────── */}
            <Card className="bg-card border-border shadow-warm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <KeyRound size={16} className="text-primary" />
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Change Password
                  </h2>
                </div>
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-5"
                  data-ocid="profile.password_form"
                >
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-password"
                      className="text-sm font-medium text-foreground"
                    >
                      Current Password{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="current-password"
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Your current password"
                        required
                        className="pl-9 pr-10 bg-background border-input"
                        data-ocid="profile.current_password_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        aria-label={
                          showCurrentPw ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        data-ocid="profile.toggle_current_pw"
                      >
                        {showCurrentPw ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-sm font-medium text-foreground"
                    >
                      New Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="new-password"
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                        className="pl-9 pr-10 bg-background border-input"
                        data-ocid="profile.new_password_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        aria-label={
                          showNewPw ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        data-ocid="profile.toggle_new_pw"
                      >
                        {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-foreground"
                    >
                      Confirm New Password{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        id="confirm-password"
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        className="pl-9 pr-10 bg-background border-input"
                        data-ocid="profile.confirm_password_input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        aria-label={
                          showConfirmPw ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        data-ocid="profile.toggle_confirm_pw"
                      >
                        {showConfirmPw ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Feedback */}
                  {pwSuccess && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm"
                      data-ocid="profile.pw_success_state"
                    >
                      <CheckCircle2 size={15} className="shrink-0" />
                      {pwSuccess}
                    </div>
                  )}
                  {pwError && (
                    <div
                      className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                      data-ocid="profile.pw_error_state"
                    >
                      {pwError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      changePassword.isPending ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    data-ocid="profile.change_password_button"
                    className="gap-2"
                  >
                    {changePassword.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

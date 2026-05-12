import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createActor } from "../backend";

// ---------------------------------------------------------------------------
// Module-level actor (same pattern as useAuth.ts)
// ---------------------------------------------------------------------------
const noopUpload = async (_file: unknown): Promise<Uint8Array> =>
  new Uint8Array();
const noopDownload = async (_bytes: Uint8Array): Promise<unknown> => ({
  directURL: "",
  getBytes: async () => new Uint8Array(),
  getDirectURL: () => "",
  withUploadProgress: () => ({}) as unknown,
});

const canisterId: string =
  (typeof process !== "undefined" &&
    (process.env.CANISTER_ID_BACKEND as string | undefined)) ||
  "";

const host =
  typeof process !== "undefined" && process.env.DFX_NETWORK === "local"
    ? "http://127.0.0.1:4943"
    : "https://icp-api.io";

const backendActor = canisterId
  ? createActor(canisterId, noopUpload as never, noopDownload as never, {
      agentOptions: { host },
    })
  : null;
// ---------------------------------------------------------------------------

type PageState = "loading" | "form" | "expired" | "invalid" | "success";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  // Read ?token= from URL
  const search = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const token: string | null = search?.token ?? null;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    // Token is present — show the form optimistically; backend will validate on submit
    setPageState("form");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!backendActor || !token) return;
    setLoading(true);
    try {
      const result = await backendActor.resetPasswordWithToken(
        token,
        newPassword,
      );
      if (
        result.__kind__ === "ok" ||
        result.__kind__ === "passwordResetSuccess"
      ) {
        setPageState("success");
      } else if (result.__kind__ === "resetTokenExpired") {
        setPageState("expired");
      } else if (result.__kind__ === "resetTokenNotFound") {
        setPageState("expired");
      } else {
        setError("Reset failed. The link may be invalid or expired.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function goHome() {
    navigate({ to: "/" });
  }

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-4"
      data-ocid="reset_password.page"
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border text-center">
          <h1 className="font-display text-xl font-bold text-foreground">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Pretty Baked</p>
        </div>

        <div className="p-6">
          {pageState === "loading" && (
            <div
              className="text-center py-6 text-muted-foreground text-sm"
              data-ocid="reset_password.loading_state"
            >
              Verifying your link...
            </div>
          )}

          {pageState === "invalid" && (
            <div
              className="text-center space-y-4 py-4"
              data-ocid="reset_password.error_state"
            >
              <div className="text-3xl">🔗</div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Invalid reset link
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This link doesn't look right. Please request a new password
                  reset.
                </p>
              </div>
              <Button
                type="button"
                onClick={goHome}
                className="w-full"
                data-ocid="reset_password.back_to_home_button"
              >
                Back to Home
              </Button>
            </div>
          )}

          {pageState === "expired" && (
            <div
              className="text-center space-y-4 py-4"
              data-ocid="reset_password.expired_state"
            >
              <div className="text-3xl">⏱️</div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Reset link expired
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This reset link has expired. Please request a new one.
                </p>
              </div>
              <Button
                type="button"
                onClick={goHome}
                className="w-full"
                data-ocid="reset_password.back_to_login_button"
              >
                Back to Login
              </Button>
            </div>
          )}

          {pageState === "success" && (
            <div
              className="text-center space-y-4 py-4"
              data-ocid="reset_password.success_state"
            >
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Password updated!
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your password has been reset successfully. You can now sign in
                  with your new password.
                </p>
              </div>
              <Button
                type="button"
                onClick={goHome}
                className="w-full"
                data-ocid="reset_password.go_to_login_button"
              >
                Go to Home
              </Button>
            </div>
          )}

          {pageState === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Enter your new password below.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="rp-new-password">New Password</Label>
                <Input
                  id="rp-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  autoComplete="new-password"
                  data-ocid="reset_password.new_password_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-confirm-password">Confirm Password</Label>
                <Input
                  id="rp-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  autoComplete="new-password"
                  data-ocid="reset_password.confirm_password_input"
                />
              </div>

              {error && (
                <p
                  className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
                  data-ocid="reset_password.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-ocid="reset_password.submit_button"
              >
                {loading ? "Resetting..." : "Set New Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { z as useNavigate, a1 as useSearch, r as reactExports, j as jsxRuntimeExports, e as Button, o as Label, I as Input, a3 as createActor } from "./index-YPmBzU2g.js";
var define_process_env_default = {};
const noopUpload = async (_file) => new Uint8Array();
const noopDownload = async (_bytes) => ({
  directURL: "",
  getBytes: async () => new Uint8Array(),
  getDirectURL: () => "",
  withUploadProgress: () => ({})
});
const canisterId = typeof process !== "undefined" && define_process_env_default.CANISTER_ID_BACKEND || "";
const host = typeof process !== "undefined" && define_process_env_default.DFX_NETWORK === "local" ? "http://127.0.0.1:4943" : "https://icp-api.io";
const backendActor = canisterId ? createActor(canisterId, noopUpload, noopDownload, {
  agentOptions: { host }
}) : null;
function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const token = (search == null ? void 0 : search.token) ?? null;
  const [pageState, setPageState] = reactExports.useState("loading");
  const [newPassword, setNewPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    setPageState("form");
  }, [token]);
  async function handleSubmit(e) {
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
        newPassword
      );
      if (result.__kind__ === "ok" || result.__kind__ === "passwordResetSuccess") {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "min-h-[60vh] flex items-center justify-center p-4",
      "data-ocid": "reset_password.page",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-6 pb-4 border-b border-border text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-xl font-bold text-foreground", children: "Reset Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Pretty Baked" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          pageState === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "text-center py-6 text-muted-foreground text-sm",
              "data-ocid": "reset_password.loading_state",
              children: "Verifying your link..."
            }
          ),
          pageState === "invalid" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center space-y-4 py-4",
              "data-ocid": "reset_password.error_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "🔗" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Invalid reset link" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This link doesn't look right. Please request a new password reset." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    onClick: goHome,
                    className: "w-full",
                    "data-ocid": "reset_password.back_to_home_button",
                    children: "Back to Home"
                  }
                )
              ]
            }
          ),
          pageState === "expired" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center space-y-4 py-4",
              "data-ocid": "reset_password.expired_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "⏱️" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Reset link expired" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This reset link has expired. Please request a new one." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    onClick: goHome,
                    className: "w-full",
                    "data-ocid": "reset_password.back_to_login_button",
                    children: "Back to Login"
                  }
                )
              ]
            }
          ),
          pageState === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "text-center space-y-4 py-4",
              "data-ocid": "reset_password.success_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto text-2xl", children: "✓" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Password updated!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Your password has been reset successfully. You can now sign in with your new password." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    onClick: goHome,
                    className: "w-full",
                    "data-ocid": "reset_password.go_to_login_button",
                    children: "Go to Home"
                  }
                )
              ]
            }
          ),
          pageState === "form" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Enter your new password below." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rp-new-password", children: "New Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rp-new-password",
                  type: "password",
                  value: newPassword,
                  onChange: (e) => setNewPassword(e.target.value),
                  placeholder: "Min 6 characters",
                  required: true,
                  autoComplete: "new-password",
                  "data-ocid": "reset_password.new_password_input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rp-confirm-password", children: "Confirm Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rp-confirm-password",
                  type: "password",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  placeholder: "Repeat new password",
                  required: true,
                  autoComplete: "new-password",
                  "data-ocid": "reset_password.confirm_password_input"
                }
              )
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg",
                "data-ocid": "reset_password.error_state",
                children: error
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: loading,
                className: "w-full",
                "data-ocid": "reset_password.submit_button",
                children: loading ? "Resetting..." : "Set New Password"
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
export {
  ResetPasswordPage as default
};

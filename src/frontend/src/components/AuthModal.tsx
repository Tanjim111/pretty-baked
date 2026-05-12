import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

type MainTab = "login" | "register";
type ResetMethod = "security" | "email";
type ResetStep = "email" | "question" | "success";

const SECURITY_QUESTIONS = [
  "What is your favorite food?",
  "What is your pet's name?",
  "What is your lucky number?",
  "What is your favorite color?",
  "What is your favorite place?",
];

function ErrorMessage({ msg, ocid }: { msg: string; ocid: string }) {
  return (
    <p
      className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
      data-ocid={ocid}
    >
      {msg}
    </p>
  );
}

export function AuthModal({
  open,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const {
    login,
    register,
    resetPasswordWithSecurityQuestion,
    requestPasswordReset,
    getSecurityQuestion,
  } = useAuth();

  const [tab, setTab] = useState<MainTab>(defaultTab);
  const [showReset, setShowReset] = useState(false);
  const [resetMethod, setResetMethod] = useState<ResetMethod>("security");
  const [resetStep, setResetStep] = useState<ResetStep>("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regSecQuestion, setRegSecQuestion] = useState("");
  const [regSecAnswer, setRegSecAnswer] = useState("");

  // Reset fields
  const [resetEmail, setResetEmail] = useState("");
  const [resetQuestion, setResetQuestion] = useState("");
  const [resetAnswer, setResetAnswer] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [emailResetSent, setEmailResetSent] = useState(false);

  function resetAllFields() {
    setError("");
    setLoginEmail("");
    setLoginPassword("");
    setRememberMe(false);
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setRegSecQuestion("");
    setRegSecAnswer("");
    setResetEmail("");
    setResetQuestion("");
    setResetAnswer("");
    setResetNewPassword("");
    setEmailResetSent(false);
  }

  function switchTab(t: MainTab) {
    setTab(t);
    setShowReset(false);
    setError("");
  }

  function openReset() {
    setShowReset(true);
    setResetStep("email");
    setResetMethod("security");
    setError("");
    setResetEmail("");
    setResetQuestion("");
    setResetAnswer("");
    setResetNewPassword("");
    setEmailResetSent(false);
  }

  function backToLogin() {
    setShowReset(false);
    setResetStep("email");
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword.trim(), rememberMe);
      resetAllFields();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!regSecQuestion) {
      setError("Please select a security question.");
      return;
    }
    if (!regSecAnswer.trim()) {
      setError("Please provide an answer to your security question.");
      return;
    }
    setLoading(true);
    try {
      await register(
        regEmail.trim(),
        regPassword.trim(),
        regName.trim(),
        regSecQuestion,
        regSecAnswer.trim(),
      );
      resetAllFields();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFindAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const question = await getSecurityQuestion(resetEmail.trim());
      if (!question) {
        setError("No account found with that email address.");
        return;
      }
      setResetQuestion(question);
      setResetStep("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find account.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSecurityReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (resetNewPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithSecurityQuestion(
        resetEmail.trim(),
        resetAnswer.trim(),
        resetNewPassword,
      );
      setResetStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Reset failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(resetEmail.trim());
      setEmailResetSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset link.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-ocid="auth.dialog"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={(e) => {
              // Only close if the click target is the backdrop itself, not a portaled element (e.g. Select dropdown)
              if (e.target === e.currentTarget) onClose();
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-elevated overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              data-ocid="auth.close_button"
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors z-10"
            >
              <X size={16} />
            </button>

            {showReset ? (
              /* ── Reset Password Panel ── */
              <div>
                {/* Header */}
                <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-border">
                  <button
                    type="button"
                    onClick={backToLogin}
                    aria-label="Back to login"
                    data-ocid="auth.reset_back_button"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-semibold text-foreground">
                    Reset Password
                  </span>
                </div>

                {/* Reset method toggle */}
                {resetStep !== "success" && (
                  <div className="flex border-b border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setResetMethod("security");
                        setError("");
                      }}
                      data-ocid="auth.reset_security_tab"
                      className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                        resetMethod === "security"
                          ? "text-primary border-b-2 border-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Security Question
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetMethod("email");
                        setError("");
                      }}
                      data-ocid="auth.reset_email_tab"
                      className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                        resetMethod === "email"
                          ? "text-primary border-b-2 border-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Email Link
                    </button>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {resetMethod === "security" ? (
                    <>
                      {resetStep === "success" ? (
                        /* Step 3: Success */
                        <div
                          className="text-center space-y-4 py-4"
                          data-ocid="auth.reset_success_state"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto text-2xl">
                            ✓
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Password reset!
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your password has been updated successfully.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={backToLogin}
                            className="w-full"
                            data-ocid="auth.reset_back_to_login_button"
                          >
                            Back to Login
                          </Button>
                        </div>
                      ) : resetStep === "email" ? (
                        /* Step 1: Find account */
                        <form
                          onSubmit={handleFindAccount}
                          className="space-y-4"
                        >
                          <div className="text-center mb-2">
                            <p className="text-sm text-muted-foreground">
                              Enter your email to find your account
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reset-email">Email Address</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="you@example.com"
                              required
                              autoComplete="email"
                              data-ocid="auth.reset_email_input"
                            />
                          </div>
                          {error && (
                            <ErrorMessage
                              msg={error}
                              ocid="auth.reset_error_state"
                            />
                          )}
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            data-ocid="auth.reset_find_account_button"
                          >
                            {loading ? "Finding account..." : "Find Account"}
                          </Button>
                        </form>
                      ) : (
                        /* Step 2: Answer question + new password */
                        <form
                          onSubmit={handleSecurityReset}
                          className="space-y-4"
                        >
                          <div className="bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Security question
                            </p>
                            <p className="text-sm font-medium text-foreground">
                              {resetQuestion}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reset-answer">Your Answer</Label>
                            <Input
                              id="reset-answer"
                              type="text"
                              value={resetAnswer}
                              onChange={(e) => setResetAnswer(e.target.value)}
                              placeholder="Your answer"
                              required
                              data-ocid="auth.reset_answer_input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reset-new-password">
                              New Password
                            </Label>
                            <Input
                              id="reset-new-password"
                              type="password"
                              value={resetNewPassword}
                              onChange={(e) =>
                                setResetNewPassword(e.target.value)
                              }
                              placeholder="Min 6 characters"
                              required
                              autoComplete="new-password"
                              data-ocid="auth.reset_new_password_input"
                            />
                          </div>
                          {error && (
                            <ErrorMessage
                              msg={error}
                              ocid="auth.reset_error_state"
                            />
                          )}
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            data-ocid="auth.reset_submit_button"
                          >
                            {loading ? "Resetting..." : "Reset Password"}
                          </Button>
                        </form>
                      )}
                    </>
                  ) : (
                    /* Email link flow */
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                        Email sending is not active on the current plan — your
                        reset link cannot be sent right now. Please use the{" "}
                        <strong>Security Question</strong> method instead.
                      </div>
                      {emailResetSent ? (
                        <div
                          className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2.5 text-sm text-primary text-center"
                          data-ocid="auth.email_reset_success_state"
                        >
                          Reset link request submitted. You'll receive an email
                          when this feature is active.
                        </div>
                      ) : (
                        <form onSubmit={handleEmailReset} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="email-reset-addr">
                              Email Address
                            </Label>
                            <Input
                              id="email-reset-addr"
                              type="email"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="you@example.com"
                              required
                              autoComplete="email"
                              data-ocid="auth.email_reset_input"
                            />
                          </div>
                          {error && (
                            <ErrorMessage
                              msg={error}
                              ocid="auth.reset_error_state"
                            />
                          )}
                          <Button
                            type="submit"
                            disabled={loading}
                            variant="outline"
                            className="w-full"
                            data-ocid="auth.email_reset_send_button"
                          >
                            {loading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Login / Register Panel ── */
              <div>
                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    data-ocid="auth.login_tab"
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      tab === "login"
                        ? "text-primary border-b-2 border-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("register")}
                    data-ocid="auth.register_tab"
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      tab === "register"
                        ? "text-primary border-b-2 border-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Register
                  </button>
                </div>

                <div className="p-6">
                  {tab === "login" ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="text-center mb-5">
                        <h2 className="font-display text-xl font-bold text-foreground">
                          Welcome back
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sign in to your Pretty Baked account
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          data-ocid="auth.login_email_input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Your password"
                          required
                          autoComplete="current-password"
                          data-ocid="auth.login_password_input"
                        />
                      </div>

                      {/* Remember Me */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(v) => setRememberMe(v === true)}
                          data-ocid="auth.remember_me_checkbox"
                        />
                        <Label
                          htmlFor="remember-me"
                          className="text-sm text-muted-foreground cursor-pointer select-none"
                        >
                          Remember me for 30 days
                        </Label>
                      </div>

                      {error && (
                        <ErrorMessage
                          msg={error}
                          ocid="auth.login_error_state"
                        />
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        data-ocid="auth.login_submit_button"
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>

                      {/* Forgot Password link */}
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={openReset}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          data-ocid="auth.forgot_password_link"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <p className="text-center text-xs text-muted-foreground">
                        New here?{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("register")}
                          className="text-primary font-medium hover:underline"
                          data-ocid="auth.switch_to_register_link"
                        >
                          Create an account
                        </button>
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="text-center mb-5">
                        <h2 className="font-display text-xl font-bold text-foreground">
                          Create account
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Join Pretty Baked today
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-name">Full Name</Label>
                        <Input
                          id="reg-name"
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Your name"
                          required
                          autoComplete="name"
                          data-ocid="auth.register_name_input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          data-ocid="auth.register_email_input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          autoComplete="new-password"
                          data-ocid="auth.register_password_input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-confirm">Confirm Password</Label>
                        <Input
                          id="reg-confirm"
                          type="password"
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          placeholder="Repeat your password"
                          required
                          autoComplete="new-password"
                          data-ocid="auth.register_confirm_input"
                        />
                      </div>

                      {/* Security Question section */}
                      <div className="space-y-3 pt-1 border-t border-border">
                        <p className="text-xs font-semibold text-foreground pt-2">
                          Security Question
                          <span className="text-muted-foreground font-normal ml-1">
                            — used to recover your account
                          </span>
                        </p>
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-sec-question">Question</Label>
                          <Select
                            value={regSecQuestion}
                            onValueChange={setRegSecQuestion}
                          >
                            <SelectTrigger
                              id="reg-sec-question"
                              data-ocid="auth.register_security_question_select"
                            >
                              <SelectValue placeholder="Select a question..." />
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
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-sec-answer">Answer</Label>
                          <Input
                            id="reg-sec-answer"
                            type="text"
                            value={regSecAnswer}
                            onChange={(e) => setRegSecAnswer(e.target.value)}
                            placeholder="Your answer"
                            required
                            data-ocid="auth.register_security_answer_input"
                          />
                        </div>
                      </div>

                      {error && (
                        <ErrorMessage
                          msg={error}
                          ocid="auth.register_error_state"
                        />
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        data-ocid="auth.register_submit_button"
                      >
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>

                      <p className="text-center text-xs text-muted-foreground">
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("login")}
                          className="text-primary font-medium hover:underline"
                          data-ocid="auth.switch_to_login_link"
                        >
                          Sign in
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

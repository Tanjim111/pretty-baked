import { useCallback, useEffect, useState } from "react";
import type { ResetRequestResult } from "../backend.d";
import { useCartStore } from "../store/cartStore";
import { getSharedActor, getSharedActorSync } from "../utils/backendActor";

const TOKEN_KEY = "pretty-baked-auth-token";
const USER_NAME_KEY = "pretty-baked-user-name";
const USER_EMAIL_KEY = "pretty-baked-user-email";
const TOKEN_EXPIRY_KEY = "pretty-baked-token-expiry";

export interface AuthState {
  token: string | null;
  email: string | null;
  name: string | null;
  isLoggedIn: boolean;
}

// Global listeners for cross-component sync
const listeners = new Set<() => void>();

function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() > Number.parseInt(expiry, 10);
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

function getStoredState(): AuthState {
  if (isTokenExpired()) {
    clearStorage();
    return { token: null, email: null, name: null, isLoggedIn: false };
  }
  const token = localStorage.getItem(TOKEN_KEY);
  const email = localStorage.getItem(USER_EMAIL_KEY);
  const name = localStorage.getItem(USER_NAME_KEY);
  return { token, email, name, isLoggedIn: !!token };
}

function notifyListeners() {
  for (const fn of listeners) fn();
}

// ---------------------------------------------------------------------------
// All actor access goes through the shared backendActor module.
// This eliminates the independent cachedActor + getActorWithRetry() system
// that previously lived here and competed with the identical system in
// useBackend.ts — each running their own 30-second retry loops that could
// both exhaust before window.__CANISTER_IDS__ was injected.
// ---------------------------------------------------------------------------

export function useAuth() {
  const [state, setState] = useState<AuthState>(getStoredState);

  useEffect(() => {
    if (isTokenExpired()) {
      clearStorage();
      setState({ token: null, email: null, name: null, isLoggedIn: false });
    }
    const sync = () => setState(getStoredState());
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
    ): Promise<void> => {
      const actor = await getSharedActor();
      const result = await actor.loginCustomer(email, password);
      if (result.__kind__ === "ok") {
        const token = result.ok;
        let name = email;
        try {
          const profile = await actor.getMyProfile(token);
          if (profile) name = profile.name;
        } catch {
          // ignore
        }
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_EMAIL_KEY, email);
        localStorage.setItem(USER_NAME_KEY, name);
        if (rememberMe) {
          const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
        } else {
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
        setState({ token, email, name, isLoggedIn: true });
        notifyListeners();

        // Restore the user's saved cart from the backend.
        useCartStore
          .getState()
          .loadCartFromBackend(token)
          .catch(() => {
            // Silently ignore — local persisted cart stays intact as fallback
          });
      } else if (result.__kind__ === "notFound") {
        throw new Error("Account not found. Please register first.");
      } else if (result.__kind__ === "invalidCredentials") {
        throw new Error(
          "Invalid email or password. If you had an account before, please register again — account data may have been reset.",
        );
      } else {
        throw new Error("Login failed. Please try again.");
      }
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      securityQuestion: string,
      securityAnswer: string,
    ): Promise<void> => {
      const actor = await getSharedActor();
      const result = await actor.registerCustomer({
        email,
        password,
        name,
        phone: "",
        securityQuestion,
        securityAnswer,
      });
      if (result.__kind__ === "ok") {
        const token = result.ok;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_EMAIL_KEY, email);
        localStorage.setItem(USER_NAME_KEY, name);
        setState({ token, email, name, isLoggedIn: true });
        notifyListeners();
      } else if (result.__kind__ === "emailTaken") {
        throw new Error(
          "An account with this email already exists. Please log in.",
        );
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // Use sync getter for logout — it's best-effort, not critical
      const actor = getSharedActorSync();
      if (actor) {
        try {
          // Clear the user's cart on the backend before local wipe
          await actor.clearMyCart(token).catch(() => {
            // Silently ignore errors
          });
        } catch {
          // ignore
        }
        try {
          await actor.logoutCustomer(token);
        } catch {
          // ignore logout errors
        }
      }
    }
    clearStorage();
    // Clear the shopping cart on logout — three-layer approach to ensure
    // the cart is fully gone on the next page load:
    // 1. Remove the persisted localStorage key directly (fastest, most reliable)
    // 2. Call Zustand persist.clearStorage() to clear via the middleware API
    // 3. Call clearCart() to reset in-memory state so current session is clean
    localStorage.removeItem("bakecraft-cart");
    try {
      useCartStore.persist.clearStorage();
    } catch {
      // Already removed manually above — ignore if API is unavailable
    }
    useCartStore.getState().clearCart();
    setState({ token: null, email: null, name: null, isLoggedIn: false });
    notifyListeners();
  }, []);

  const resetPasswordWithSecurityQuestion = useCallback(
    async (
      email: string,
      answer: string,
      newPassword: string,
    ): Promise<void> => {
      const actor = await getSharedActor();
      const result = await actor.resetPasswordWithSecurityQuestion(
        email,
        answer,
        newPassword,
      );
      if (
        result.__kind__ === "ok" ||
        result.__kind__ === "passwordResetSuccess"
      ) {
        return;
      }
      if (result.__kind__ === "notFound") {
        throw new Error("No account found with that email address.");
      }
      if (result.__kind__ === "invalidSecurityAnswer") {
        throw new Error("Incorrect answer. Please try again.");
      }
      throw new Error("Password reset failed. Please try again.");
    },
    [],
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<ResetRequestResult> => {
      const actor = await getSharedActor();
      return actor.requestPasswordReset(email);
    },
    [],
  );

  const getSecurityQuestion = useCallback(
    async (email: string): Promise<string | null> => {
      const actor = await getSharedActor();
      return actor.getSecurityQuestion(email);
    },
    [],
  );

  return {
    ...state,
    login,
    register,
    logout,
    resetPasswordWithSecurityQuestion,
    requestPasswordReset,
    getSecurityQuestion,
  };
}

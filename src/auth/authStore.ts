import { create } from "zustand";
import type { AuthResponse, AuthUser } from "../api/auth";
import { loadAuth, saveAuth, clearAuth } from "./authStorage";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  /**
   * Set session after successful login/register.
   * Expects already validated AuthResponse from auth.ts.
   */
  setSession: (auth: AuthResponse) => void;

  /**
   * Clear session and persisted auth data.
   */
  logout: () => void;
};

/**
 * Auth store using Zustand.
 *
 * Scope:
 * - Authentication/session state only
 * - No API calls
 * - No server state
 */
export const useAuthStore = create<AuthState>((set) => {
  // Lazy hydration from localStorage on store creation
  const stored = loadAuth();

  return {
    accessToken: stored?.accessToken ?? null,
    user: stored?.user ?? null,
    isAuthenticated: Boolean(stored?.accessToken),

    setSession: (auth) => {
      saveAuth(auth);
      set({
        accessToken: auth.accessToken,
        user: auth.user,
        isAuthenticated: true,
      });
    },

    logout: () => {
      clearAuth();
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    },
  };
});

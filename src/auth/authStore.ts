import { create } from "zustand";
import type { AuthResponse, AuthUser } from "../api/auth";
import { loadAuth, saveAuth, clearAuth } from "./authStorage";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Keeps auth persistence out of React components.
  setSession: (auth: AuthResponse) => void;

  // Allows profile updates (e.g. avatar) without forcing a re-login.
  updateUser: (patch: Partial<AuthUser>) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const stored = loadAuth();

  return {
    accessToken: stored?.accessToken ?? null,
    user: stored?.user ?? null,
    isAuthenticated: Boolean(stored?.accessToken),

    setSession: (auth) => {
      saveAuth(auth);
      set({ accessToken: auth.accessToken, user: auth.user, isAuthenticated: true });
    },

    updateUser: (patch) => {
      const { accessToken, user } = get();
      if (!accessToken || !user) return;

      const next: AuthResponse = { accessToken, user: { ...user, ...patch } };

      saveAuth(next);
      set({ user: next.user });
    },

    logout: () => {
      clearAuth();
      set({ accessToken: null, user: null, isAuthenticated: false });
    },
  };
});

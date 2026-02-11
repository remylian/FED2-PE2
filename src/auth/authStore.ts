import { create } from "zustand";
import type { AuthResponse, AuthUser } from "../api/auth";
import { loadAuth, saveAuth, clearAuth } from "./authStorage";

export type ActiveRole = "customer" | "manager";

type PersistedAuth = AuthResponse & { activeRole?: ActiveRole };

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;

  setSession: (auth: AuthResponse) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const stored = loadAuth() as PersistedAuth | null;

  const storedUserIsManager = Boolean(stored?.user?.venueManager);
  const initialRole: ActiveRole =
    stored?.activeRole ?? (storedUserIsManager ? "manager" : "customer");

  return {
    accessToken: stored?.accessToken ?? null,
    user: stored?.user ?? null,
    isAuthenticated: Boolean(stored?.accessToken),

    activeRole: initialRole,

    setActiveRole: (role) => {
      const { accessToken, user } = get();
      if (!accessToken || !user) return;
      if (role === "manager" && !user.venueManager) return;

      const next: PersistedAuth = { accessToken, user, activeRole: role };
      saveAuth(next as unknown as AuthResponse);
      set({ activeRole: role });
    },

    setSession: (auth) => {
      const role: ActiveRole = auth.user.venueManager ? "manager" : "customer";
      const next: PersistedAuth = { ...auth, activeRole: role };

      saveAuth(next as unknown as AuthResponse);
      set({
        accessToken: auth.accessToken,
        user: auth.user,
        isAuthenticated: true,
        activeRole: role,
      });
    },

    updateUser: (patch) => {
      const { accessToken, user, activeRole } = get();
      if (!accessToken || !user) return;

      const next: PersistedAuth = {
        accessToken,
        user: { ...user, ...patch },
        activeRole,
      };

      saveAuth(next as unknown as AuthResponse);
      set({ user: next.user });
    },

    logout: () => {
      clearAuth();
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        activeRole: "customer",
      });
    },
  };
});

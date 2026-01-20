import type { AuthResponse } from "../api/auth";

const STORAGE_KEY = "holidaze_auth";

/**
 * Persist auth data so the session survives refresh.
 */
export function saveAuth(auth: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

/**
 * Load auth data on app start. Returns null if missing or invalid JSON.
 */
export function loadAuth(): AuthResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

/**
 * Clear auth data on logout.
 */
export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

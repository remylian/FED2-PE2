export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://v2.api.noroff.dev";

/**
 * Required for all platform requests.
 * Failing fast here prevents hard-to-debug request errors later.
 */
export const NOROFF_API_KEY = import.meta.env.VITE_NOROFF_API_KEY ?? "";

if (!NOROFF_API_KEY) {
  throw new Error("Missing VITE_NOROFF_API_KEY");
}

export const AUTH_BASE = `${API_BASE_URL}/auth`;
export const HOLIDAZE_BASE = `${API_BASE_URL}/holidaze`;

export const API_HEADER_NAMES = {
  AUTHORIZATION: "Authorization",
  API_KEY: "X-Noroff-API-Key",
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
} as const;

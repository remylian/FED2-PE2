export const API_BASE_URL = "https://v2.api.noroff.dev";

export const AUTH_BASE = `${API_BASE_URL}/auth`;
export const HOLIDAZE_BASE = `${API_BASE_URL}/holidaze`;

export const API_HEADER_NAMES = {
  AUTHORIZATION: "Authorization",
  API_KEY: "X-Noroff-API-Key",
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
} as const;

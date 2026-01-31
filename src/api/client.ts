import { API_BASE_URL, API_HEADER_NAMES, NOROFF_API_KEY } from "./constants";

/**
 * Normalized API error used across the application.
 * We throw this instead of raw fetch errors so the UI
 * can reliably access HTTP status and message.
 */
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;

  /**
   * Optional override for the API key.
   * This exists primarily to support testing / special cases without
   * changing global config.
   */
  apiKey?: string;

  init?: RequestInit;
};

/**
 * Core request helper for the API.
 *
 * Design decisions:
 * - All network requests go through this function
 * - Authentication is opt-in (via accessToken)
 * - API configuration is kept in constants.ts
 * - The API key is always included to avoid “works here, fails there”
 *
 * This keeps data fetching predictable and removes scattered header logic.
 */
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, accessToken, apiKey, init } = options;

  // Resolve API key once so all endpoints behave consistently.
  // In a client-rendered app this is not a true secret, but keeping it
  // centralized prevents accidental missing headers.
  const resolvedApiKey = apiKey ?? NOROFF_API_KEY;

  if (!resolvedApiKey) {
    // Fail fast on misconfiguration so debugging is immediate,
    // instead of surfacing as random “No API key header” errors later.
    throw new Error("Missing Noroff API key. Set VITE_NOROFF_API_KEY in your .env file.");
  }

  // Start with default headers and allow callers to extend them.
  // This makes apiRequest flexible without allowing random code paths
  // to “forget” required headers.
  const headers: Record<string, string> = {
    [API_HEADER_NAMES.ACCEPT]: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  // Only set Content-Type when sending a request body.
  // This avoids unnecessary headers on GET requests and keeps requests
  // closer to what the browser would naturally send.
  if (body !== undefined) {
    headers[API_HEADER_NAMES.CONTENT_TYPE] = "application/json";
  }

  // Attach Bearer token only when required.
  // This keeps public endpoints public, and avoids accidentally coupling
  // anonymous browsing to auth state.
  if (accessToken) {
    headers[API_HEADER_NAMES.AUTHORIZATION] = `Bearer ${accessToken}`;
  }

  // An API key header is required for protected platform access.
  // Including it consistently removes “endpoint-by-endpoint surprises”.
  headers[API_HEADER_NAMES.API_KEY] = resolvedApiKey;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Read response as text first to safely handle empty or non-JSON responses.
  // This prevents a thrown JSON parse error from masking the real HTTP error.
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  // Normalize all non-2xx responses into ApiError
  // so UI logic can depend on a consistent error shape.
  if (!res.ok) {
    const message = extractErrorMessage(data) ?? res.statusText;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

/**
 * Safely attempts to parse JSON without throwing.
 * This prevents runtime crashes on malformed API responses.
 */
function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Extracts an error message from various API error response shapes.
 */
function extractErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;

  if (typeof record.message === "string") return record.message;

  const errors = record.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as Record<string, unknown>;
    if (typeof first.message === "string") return first.message;
  }

  return undefined;
}

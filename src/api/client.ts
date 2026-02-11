import { API_BASE_URL, API_HEADER_NAMES, NOROFF_API_KEY } from "./constants";

/**
 * Unified error shape so UI logic can depend on status + message.
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
  apiKey?: string;
  init?: RequestInit;
};

/**
 * Centralizes request behavior to keep headers and error handling consistent.
 */
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, accessToken, apiKey, init } = options;

  const resolvedApiKey = apiKey ?? NOROFF_API_KEY;

  if (!resolvedApiKey) {
    throw new Error("Missing Noroff API key. Set VITE_NOROFF_API_KEY in your .env file.");
  }

  const headers: Record<string, string> = {
    [API_HEADER_NAMES.ACCEPT]: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (body !== undefined) {
    headers[API_HEADER_NAMES.CONTENT_TYPE] = "application/json";
  }

  if (accessToken) {
    headers[API_HEADER_NAMES.AUTHORIZATION] = `Bearer ${accessToken}`;
  }

  headers[API_HEADER_NAMES.API_KEY] = resolvedApiKey;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message = extractErrorMessage(data) ?? res.statusText;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Avoid masking real HTTP errors with JSON parse failures.
    return text;
  }
}

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

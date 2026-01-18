import { z } from "zod";
import { AUTH_BASE } from "./constants";
import { apiRequest } from "./client";

/**
 * Zod schemas for API data
 *
 *  Validate external API data at runtime.
 *
 * TypeScript alone will not protect against malformed responses.
 */

const AuthUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().nullable().optional(),
  venueManager: z.boolean(),
});

const AuthResponseSchema = z.object({
  accessToken: z.string(),
  user: AuthUserSchema,
});

/**
 *
 * Input schemas
 *
 * Validate payloads before sending them to the API.
 */

const RegisterInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().endsWith("@stud.noroff.no"),
  password: z.string().min(8),
  venueManager: z.boolean(),
});

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Register a new user (customer/venue manager).
 */
export async function registerUser(input: unknown) {
  const payload = RegisterInputSchema.parse(input);

  const response = await apiRequest<unknown>(`${AUTH_BASE}/register`, {
    method: "POST",
    body: payload,
  });

  return AuthResponseSchema.parse(response);
}

/**
 * Log in an existing user.
 */
export async function loginUser(input: unknown) {
  const payload = LoginInputSchema.parse(input);

  const response = await apiRequest<unknown>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: payload,
  });

  return AuthResponseSchema.parse(response);
}

/**
 * Export inferred types for internal use.
 */
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

import { z } from "zod";
import { apiRequest } from "./client";

/**
 * Noroff v2 returns data wrapped in an envelope:
 * { data: ..., meta: ... }
 *
 * We validate the envelope to avoid assuming response shapes.
 */
const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.unknown().optional(),
  });

/**
 * Noroff media fields (avatar/banner) are objects, not strings.
 * They can also be null/undefined.
 */
const MediaSchema = z
  .object({
    url: z.string().url(),
    alt: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

/**
 * Shared profile fields returned by auth endpoints.
 * Note: Some fields may exist depending on endpoint, so keep it tolerant.
 */
const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  venueManager: z.boolean().optional().default(false),
  avatar: MediaSchema,
  banner: MediaSchema,
  bio: z.string().nullable().optional(),
});

/**
 * Login returns the same profile fields PLUS accessToken.
 */
const LoginDataSchema = ProfileSchema.extend({
  accessToken: z.string(),
});

const RegisterResponseSchema = ApiEnvelopeSchema(ProfileSchema);
const LoginResponseSchema = ApiEnvelopeSchema(LoginDataSchema);

/**
 * Input schemas
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
 * Internal types used across the app (what Zustand stores).
 * We normalize avatar into optional primitive fields to keep the UI simple.
 */
export type AuthUser = {
  name: string;
  email: string;
  venueManager: boolean;
  avatarUrl?: string;
  avatarAlt?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Register a new user.
 *
 * IMPORTANT:
 * Noroff v2 register does NOT return accessToken.
 * It returns the created profile data only.
 */
export async function registerUser(input: unknown) {
  const payload = RegisterInputSchema.parse(input);

  const raw = await apiRequest<unknown>("/auth/register", {
    method: "POST",
    body: payload,
  });

  // Returns the created profile (no token)
  return RegisterResponseSchema.parse(raw).data;
}

/**
 * Log in an existing user.
 *
 * Login returns accessToken + profile fields (inside data).
 * We normalize to { accessToken, user } for the rest of the app.
 */
export async function loginUser(input: unknown): Promise<AuthResponse> {
  const payload = LoginInputSchema.parse(input);

  const raw = await apiRequest<unknown>("/auth/login?_holidaze=true", {
    method: "POST",
    body: payload,
  });

  const data = LoginResponseSchema.parse(raw).data;

  return {
    accessToken: data.accessToken,
    user: {
      name: data.name,
      email: data.email,
      venueManager: data.venueManager ?? false,
      ...(data.avatar?.url
        ? { avatarUrl: data.avatar.url, avatarAlt: data.avatar.alt ?? null }
        : {}),
    },
  };
}

/**
 * Convenience helper for the UI:
 * - Create the account
 * - Immediately log in to obtain accessToken
 *
 * This keeps RegisterPage simple and avoids duplicating flow logic in the UI.
 */
export async function registerAndLogin(input: unknown): Promise<AuthResponse> {
  const payload = RegisterInputSchema.parse(input);

  // 1) Create user profile (no token returned)
  await registerUser(payload);

  // 2) Log in to receive accessToken + normalized user
  return loginUser({ email: payload.email, password: payload.password });
}

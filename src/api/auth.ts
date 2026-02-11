import { z } from "zod";
import { apiRequest } from "./client";

/**
 * Noroff v2 responses are wrapped in { data, meta }.
 * Validating the envelope prevents silent shape mismatches.
 */
const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.unknown().optional(),
  });

/**
 * Media fields are structured objects (not strings) and may be null.
 */
const MediaSchema = z
  .object({
    url: z.string().url(),
    alt: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  venueManager: z.boolean().optional().default(false),
  avatar: MediaSchema,
  banner: MediaSchema,
  bio: z.string().nullable().optional(),
});

const LoginDataSchema = ProfileSchema.extend({
  accessToken: z.string(),
});

const RegisterResponseSchema = ApiEnvelopeSchema(ProfileSchema);
const LoginResponseSchema = ApiEnvelopeSchema(LoginDataSchema);

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
 * Internal normalized shape used by the app.
 * We flatten media objects to keep UI logic simple.
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

export async function registerUser(input: unknown) {
  const payload = RegisterInputSchema.parse(input);

  const raw = await apiRequest<unknown>("/auth/register", {
    method: "POST",
    body: payload,
  });

  return RegisterResponseSchema.parse(raw).data;
}

/**
 * Normalizes Noroff login response into the app's internal auth shape.
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
 * Keeps the register flow simple by handling login immediately after creation.
 */
export async function registerAndLogin(input: unknown): Promise<AuthResponse> {
  const payload = RegisterInputSchema.parse(input);

  await registerUser(payload);

  return loginUser({ email: payload.email, password: payload.password });
}

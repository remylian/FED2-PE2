import { z } from "zod";
import { apiRequest } from "./client";

const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.unknown().optional(),
  });

const MediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().nullable().optional(),
});

const ProfileSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    bio: z.string().nullable().optional(),
    venueManager: z.boolean(),
    avatar: MediaSchema.nullable().optional(),
    banner: MediaSchema.nullable().optional(),
  })
  .passthrough();

export type Profile = z.infer<typeof ProfileSchema>;

export type UpdateAvatarInput = {
  url: string;
  alt?: string | null;
};

/**
 * Update profile avatar
 * PUT /holidaze/profiles/<name>
 */
export async function updateProfileAvatar(
  profileName: string,
  avatar: UpdateAvatarInput,
  accessToken: string,
): Promise<Profile> {
  const raw = await apiRequest<unknown>(`/holidaze/profiles/${encodeURIComponent(profileName)}`, {
    method: "PUT",
    accessToken,
    body: {
      avatar: {
        url: avatar.url,
        alt: avatar.alt ?? "",
      },
    },
  });

  return ApiEnvelopeSchema(ProfileSchema).parse(raw).data;
}

import { z } from "zod";
import { apiRequest } from "./client";

const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.unknown().optional(),
  });

const BookingResponseSchema = z
  .object({
    id: z.string(),
    dateFrom: z.string(),
    dateTo: z.string(),
    guests: z.number(),
    venue: z.unknown().optional(),
    created: z.string().optional(),
    updated: z.string().optional(),
  })
  .passthrough();

export type BookingResponse = z.infer<typeof BookingResponseSchema>;

export type CreateBookingInput = {
  venueId: string;
  dateFrom: string; // ISO string
  dateTo: string; // ISO string
  guests: number;
};

export async function createBooking(
  input: CreateBookingInput,
  accessToken: string,
): Promise<BookingResponse> {
  const raw = await apiRequest<unknown>("/holidaze/bookings", {
    method: "POST",
    accessToken,
    body: input, // apiRequest stringifies automatically
  });

  return ApiEnvelopeSchema(BookingResponseSchema).parse(raw).data;
}

/**
 * Minimal venue shape needed by the bookings UI.
 * We keep it permissive (passthrough) to avoid brittle coupling.
 */
const VenueSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    media: z
      .array(
        z.object({
          url: z.string(),
          alt: z.string().nullable().optional(),
        }),
      )
      .optional()
      .default([]),
  })
  .passthrough();

/**
 * Booking returned from GET /holidaze/bookings?_venue=true
 * (includes a `venue` object).
 */
const BookingWithVenueSchema = BookingResponseSchema.extend({
  venue: VenueSummarySchema.optional(),
});

export type BookingWithVenue = z.infer<typeof BookingWithVenueSchema>;

const BookingListWithVenueSchema = z.array(BookingWithVenueSchema);

/**
 * Fetch bookings for the currently logged-in user.
 * `_venue=true` is used so we can show venue info and link back to venue details.
 */
export async function getMyBookings(
  profileName: string,
  accessToken: string,
): Promise<BookingWithVenue[]> {
  const raw = await apiRequest<unknown>(
    `/holidaze/profiles/${encodeURIComponent(profileName)}/bookings?_venue=true`,
    {
      method: "GET",
      accessToken,
    },
  );

  return ApiEnvelopeSchema(BookingListWithVenueSchema).parse(raw).data;
}

export async function cancelBooking(bookingId: string, accessToken: string): Promise<void> {
  await apiRequest<void>(`/holidaze/bookings/${bookingId}`, {
    method: "DELETE",
    accessToken,
  });
}

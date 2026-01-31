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

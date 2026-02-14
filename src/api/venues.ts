import { z } from "zod";
import { apiRequest } from "./client";

const ApiEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T, metaSchema?: z.ZodTypeAny) =>
  z.object({
    data: dataSchema,
    meta: (metaSchema ?? z.unknown()).optional(),
  });

const MediaItemSchema = z.object({
  url: z.string().url(),
  alt: z.string().nullable().optional(),
});

const MetaSchema = z
  .object({
    wifi: z.boolean().optional(),
    parking: z.boolean().optional(),
    breakfast: z.boolean().optional(),
    pets: z.boolean().optional(),
  })
  .partial()
  .optional();

const LocationSchema = z
  .object({
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    continent: z.string().nullable().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
  })
  .partial()
  .optional();

const BookingSchema = z
  .object({
    id: z.string(),
    dateFrom: z.string(),
    dateTo: z.string(),
    guests: z.number().optional(),
    created: z.string().optional(),
    updated: z.string().optional(),
  })
  .passthrough();

export type Booking = z.infer<typeof BookingSchema>;

const OwnerSchema = z
  .object({
    name: z.string(),
    email: z.string().email().optional(),
    bio: z.string().nullable().optional(),
    avatar: z
      .object({
        url: z.string().url(),
        alt: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    banner: z
      .object({
        url: z.string().url(),
        alt: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

const VenueSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    media: z.array(MediaItemSchema).optional().default([]),
    price: z.number().optional().default(0),
    maxGuests: z.number().optional().default(0),
    rating: z.number().optional().default(0),
    created: z.string().optional(),
    updated: z.string().optional(),
    meta: MetaSchema,
    location: LocationSchema,

    owner: OwnerSchema.optional(), // present when _owner=true
    bookings: z.array(BookingSchema).optional().default([]), // present when _bookings=true
  })
  .passthrough();

const VenueListSchema = z.array(VenueSchema);

const PaginationMetaSchema = z.object({
  isFirstPage: z.boolean(),
  isLastPage: z.boolean(),
  currentPage: z.number(),
  previousPage: z.number().nullable(),
  nextPage: z.number().nullable(),
  pageCount: z.number(),
  totalCount: z.number(),
});

export type Venue = z.infer<typeof VenueSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export type PagedResult<T> = {
  data: T;
  meta: PaginationMeta;
};

function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

type ListParams = {
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
  owner?: boolean;
};

export async function listVenues(params: ListParams = {}): Promise<PagedResult<Venue[]>> {
  const query = toQuery({
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    sortOrder: params.sortOrder,
    _owner: params.owner ?? false,
  });

  const raw = await apiRequest<unknown>(`/holidaze/venues${query}`);
  const parsed = ApiEnvelopeSchema(VenueListSchema, PaginationMetaSchema).parse(raw);

  return {
    data: parsed.data,
    meta: parsed.meta as PaginationMeta,
  };
}

export async function searchVenues(
  q: string,
  params: ListParams = {},
): Promise<PagedResult<Venue[]>> {
  const query = toQuery({
    q,
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    sortOrder: params.sortOrder,
    _owner: params.owner ?? false,
  });

  const raw = await apiRequest<unknown>(`/holidaze/venues/search${query}`);
  const parsed = ApiEnvelopeSchema(VenueListSchema, PaginationMetaSchema).parse(raw);

  return {
    data: parsed.data,
    meta: parsed.meta as PaginationMeta,
  };
}

export async function getVenueById(
  id: string,
  opts?: { bookings?: boolean; owner?: boolean },
): Promise<Venue> {
  const query = toQuery({
    _bookings: opts?.bookings ?? false,
    _owner: opts?.owner ?? false,
  });

  const raw = await apiRequest<unknown>(`/holidaze/venues/${id}${query}`);
  return ApiEnvelopeSchema(VenueSchema).parse(raw).data;
}

export async function listVenuesByProfile(
  profileName: string,
  accessToken: string,
  opts?: { bookings?: boolean; owner?: boolean },
): Promise<Venue[]> {
  const safeName = encodeURIComponent(profileName);

  const query = toQuery({
    _bookings: opts?.bookings ?? false,
    _owner: opts?.owner ?? false,
  });

  const raw = await apiRequest<unknown>(`/holidaze/profiles/${safeName}/venues${query}`, {
    method: "GET",
    accessToken,
  });

  return ApiEnvelopeSchema(VenueListSchema).parse(raw).data;
}

export type VenueMediaInput = {
  url: string;
  alt?: string | null;
};

export type VenueMetaInput = {
  wifi?: boolean;
  parking?: boolean;
  breakfast?: boolean;
  pets?: boolean;
};

export type VenueLocationInput = {
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  continent?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type CreateVenueInput = {
  name: string;
  description?: string;
  media?: VenueMediaInput[];
  price: number;
  maxGuests: number;
  rating?: number;
  meta?: VenueMetaInput;
  location?: VenueLocationInput;
};

export async function createVenue(input: CreateVenueInput, accessToken: string): Promise<Venue> {
  const raw = await apiRequest<unknown>("/holidaze/venues", {
    method: "POST",
    accessToken,
    body: input,
  });

  return ApiEnvelopeSchema(VenueSchema).parse(raw).data;
}

export type UpdateVenueInput = Partial<CreateVenueInput>;

export async function updateVenue(
  id: string,
  input: UpdateVenueInput,
  accessToken: string,
): Promise<Venue> {
  const raw = await apiRequest<unknown>(`/holidaze/venues/${id}`, {
    method: "PUT",
    accessToken,
    body: input,
  });

  return ApiEnvelopeSchema(VenueSchema).parse(raw).data;
}

export async function deleteVenue(id: string, accessToken: string): Promise<void> {
  await apiRequest<unknown>(`/holidaze/venues/${id}`, {
    method: "DELETE",
    accessToken,
  });
}

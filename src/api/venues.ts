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

const VenueSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    media: z.array(MediaItemSchema).optional().default([]),
    price: z.number().optional().default(0),
    maxGuests: z.number().optional().default(0),
    rating: z.number().optional().default(0),
    meta: MetaSchema,
    location: LocationSchema,
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

function toQuery(params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

type ListParams = {
  page?: number;
  limit?: number;
  sort?: string;
  sortOrder?: "asc" | "desc";
};

export async function listVenues(params: ListParams = {}): Promise<PagedResult<Venue[]>> {
  const query = toQuery({
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    sortOrder: params.sortOrder,
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
  });

  const raw = await apiRequest<unknown>(`/holidaze/venues/search${query}`);
  const parsed = ApiEnvelopeSchema(VenueListSchema, PaginationMetaSchema).parse(raw);

  return {
    data: parsed.data,
    meta: parsed.meta as PaginationMeta,
  };
}

export async function getVenueById(id: string): Promise<Venue> {
  const raw = await apiRequest<unknown>(`/holidaze/venues/${id}`);
  return ApiEnvelopeSchema(VenueSchema).parse(raw).data;
}

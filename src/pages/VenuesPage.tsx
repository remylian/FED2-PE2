import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { listVenues, searchVenues, type PagedResult, type Venue } from "../api/venues";
import VenueCard from "../components/venues/VenueCard";
import VenuesToolbar, { type SortKey, type SortOrder } from "../components/venues/VenuesToolbar";
import PaginationControls from "../components/venues/PaginationControls";
import VenueCardSkeleton from "../components/venues/VenueCardSkeleton";

const DEFAULT_LIMIT = 12;

export default function VenuesPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);

  const [sort, setSort] = useState<SortKey>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Reset page in handlers (not in an effect)
  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleSortChange(value: SortKey) {
    setSort(value);
    setPage(1);
  }

  function handleSortOrderChange(value: SortOrder) {
    setSortOrder(value);
    setPage(1);
  }

  const trimmed = query.trim();

  const venuesQuery = useQuery<PagedResult<Venue[]>, Error>({
    queryKey: ["venues", { q: trimmed || null, page, limit, sort, sortOrder }],
    queryFn: () => {
      const params = { page, limit, sort, sortOrder } as const;
      return trimmed.length > 0 ? searchVenues(trimmed, params) : listVenues(params);
    },
    placeholderData: keepPreviousData,
  });

  const venues = venuesQuery.data?.data ?? [];
  const meta = venuesQuery.data?.meta ?? null;

  const isInitialLoading = venuesQuery.isLoading && !venuesQuery.data;
  const isRefreshing = venuesQuery.isFetching && !isInitialLoading;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">Venues</h1>

        <VenuesToolbar
          query={query}
          onQueryChange={handleQueryChange}
          sort={sort}
          onSortChange={handleSortChange}
          sortOrder={sortOrder}
          onSortOrderChange={handleSortOrderChange}
        />

        <div className="flex items-center justify-between gap-3">
          {meta ? (
            <p className="text-sm opacity-80">
              Page {meta.currentPage} of {meta.pageCount}
              <br /> {meta.totalCount} venues
            </p>
          ) : (
            <span />
          )}

          {isRefreshing && (
            <span className="rounded-full border px-3 py-1 text-xs opacity-80">Updating…</span>
          )}
        </div>
      </header>

      {venuesQuery.isError && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t load venues</p>
          <p className="mt-1 opacity-80">{venuesQuery.error.message}</p>
        </div>
      )}

      {isInitialLoading && (
        <ul className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </ul>
      )}

      {!venuesQuery.isError && !isInitialLoading && venues.length === 0 && (
        <p className="text-sm opacity-80">No venues found.</p>
      )}

      {!venuesQuery.isError && !isInitialLoading && venues.length > 0 && (
        <>
          <ul className="grid gap-5 sm:grid-cols-3">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </ul>

          <PaginationControls
            meta={meta}
            isLoading={venuesQuery.isFetching}
            onPrev={(p) => setPage(p)}
            onNext={(p) => setPage(p)}
          />
        </>
      )}
    </main>
  );
}

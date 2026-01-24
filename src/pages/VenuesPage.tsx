import { useEffect, useState } from "react";

import { listVenues, searchVenues, type PaginationMeta, type Venue } from "../api/venues";
import VenueCard from "../components/venues/VenueCard";
import VenuesToolbar, { type SortKey, type SortOrder } from "../components/venues/VenuesToolbar";
import PaginationControls from "../components/venues/PaginationControls";

const DEFAULT_LIMIT = 12;

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);

  const [sort, setSort] = useState<SortKey>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 1 when search or sort changes (keeps UX sane)
  useEffect(() => {
    setPage(1);
  }, [query, sort, sortOrder]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setIsLoading(true);
      setError(null);

      try {
        const trimmed = query.trim();
        const params = { page, limit, sort, sortOrder } as const;

        const result =
          trimmed.length > 0 ? await searchVenues(trimmed, params) : await listVenues(params);

        if (!alive) return;

        setVenues(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Failed to load venues");
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [query, page, limit, sort, sortOrder]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">Venues</h1>

        <VenuesToolbar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />

        {meta && (
          <p className="text-sm opacity-80">
            Page {meta.currentPage} of {meta.pageCount} • {meta.totalCount} venues
          </p>
        )}
      </header>

      {isLoading && <p className="text-sm opacity-80">Loading venues…</p>}

      {error && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t load venues</p>
          <p className="mt-1 opacity-80">{error}</p>
        </div>
      )}

      {!isLoading && !error && venues.length === 0 && (
        <p className="text-sm opacity-80">No venues found.</p>
      )}

      {!isLoading && !error && venues.length > 0 && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </ul>

          <PaginationControls
            meta={meta}
            isLoading={isLoading}
            onPrev={(p) => setPage(p)}
            onNext={(p) => setPage(p)}
          />
        </>
      )}
    </main>
  );
}

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "../auth/authStore";
import { listVenuesByProfile, type Venue } from "../api/venues";
import Skeleton from "../components/ui/Skeleton";
import { usePageMeta } from "../hooks/usePageMeta";
import { formatDDMMYYYYFromKey } from "../utils/bookingDates";

function isoToDayKey(iso: string) {
  return iso.slice(0, 10); // yyyy-mm-dd
}

type BookingRow = {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests?: number;
  venueId: string;
  venueName: string;
};

export default function ManagerBookingsPage() {
  usePageMeta({
    title: "Upcoming Bookings | Holidaze",
    description: "View upcoming bookings for your venues on Holidaze.",
  });

  const { user, accessToken } = useAuthStore();
  const profileName = user?.name ?? null;

  const venuesQuery = useQuery<Venue[], Error>({
    queryKey: ["venues", "profile", profileName, { bookings: true }],
    queryFn: async () => {
      if (!accessToken) throw new Error("Missing access token");
      if (!profileName) throw new Error("Missing profile name");
      return listVenuesByProfile(profileName, accessToken, { bookings: true });
    },
    enabled: Boolean(accessToken && profileName),
    staleTime: 30_000,
  });

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const upcomingRows: BookingRow[] = useMemo(() => {
    const venues = venuesQuery.data ?? [];
    const rows: BookingRow[] = [];

    for (const v of venues) {
      const bookings = v.bookings ?? [];
      for (const b of bookings) {
        // bookings schema is permissive; guard a bit
        if (!b?.id || !b?.dateFrom || !b?.dateTo) continue;

        rows.push({
          id: b.id,
          dateFrom: b.dateFrom,
          dateTo: b.dateTo,
          guests: b.guests,
          venueId: v.id,
          venueName: v.name,
        });
      }
    }

    return rows
      .filter((r) => isoToDayKey(r.dateTo) >= todayKey)
      .sort((a, b) => isoToDayKey(a.dateFrom).localeCompare(isoToDayKey(b.dateFrom)));
  }, [venuesQuery.data, todayKey]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Upcoming bookings</h1>
            <p className="opacity-80">Bookings across your venues</p>
          </div>

          <Link to="/manager" className="rounded-md border px-3 py-2 text-sm hover:bg-white/60">
            Back to dashboard
          </Link>
        </div>
      </header>

      {venuesQuery.isLoading && (
        <ul className="space-y-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="rounded-md border p-4 space-y-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-44" />
            </li>
          ))}
        </ul>
      )}

      {venuesQuery.isError && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t load bookings</p>
          <p className="mt-1 opacity-80">{venuesQuery.error.message}</p>
        </div>
      )}

      {!venuesQuery.isLoading && !venuesQuery.isError && (
        <>
          {upcomingRows.length === 0 ? (
            <p className="text-sm opacity-80">No upcoming bookings yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 items-stretch">
              {upcomingRows.map((r) => {
                const fromKey = isoToDayKey(r.dateFrom);
                const toKey = isoToDayKey(r.dateTo);

                return (
                  <li
                    key={r.id}
                    className="rounded-md border feature-card p-4 flex h-full flex-col gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm opacity-70">Venue</p>
                      <p className="font-semibold truncate">{r.venueName}</p>
                    </div>

                    <div className="text-sm opacity-80 space-y-1">
                      <div>
                        <span className="opacity-70">Check-in:</span>{" "}
                        <span className="font-medium">{formatDDMMYYYYFromKey(fromKey)}</span>
                      </div>
                      <div>
                        <span className="opacity-70">Check-out:</span>{" "}
                        <span className="font-medium">{formatDDMMYYYYFromKey(toKey)}</span>
                      </div>
                      <div>
                        <span className="opacity-70">Guests:</span>{" "}
                        <span className="font-medium">
                          {typeof r.guests === "number"
                            ? `${r.guests} guest${r.guests === 1 ? "" : "s"}`
                            : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-end pt-1">
                      <Link
                        to={`/venues/${r.venueId}`}
                        className="btn-secondary px-3 py-2 rounded shadow-md hover:bg-orange-300 text-sm"
                        title="View venue"
                      >
                        View venue
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </main>
  );
}

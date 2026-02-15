import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../auth/authStore";
import { cancelBooking, getMyBookings, type BookingWithVenue } from "../api/bookings";
import { formatDDMMYYYYFromKey } from "../utils/bookingDates";
import { usePageMeta } from "../hooks/usePageMeta";

function isoToDayKey(iso: string) {
  return iso.slice(0, 10); // yyyy-mm-dd
}

export default function MyBookingsPage() {
  usePageMeta({
    title: "My Bookings | Holidaze",
    description: "View and manage your upcoming and past bookings on Holidaze.",
  });

  const { accessToken, user } = useAuthStore();
  const profileName = user?.name ?? null;

  const queryClient = useQueryClient();

  const bookingsQuery = useQuery<BookingWithVenue[], Error>({
    queryKey: ["bookings", "profile", profileName, { venue: true }],
    queryFn: async () => {
      if (!accessToken) throw new Error("Missing access token");
      if (!profileName) throw new Error("Missing profile name");
      return getMyBookings(profileName, accessToken);
    },
    enabled: Boolean(accessToken && profileName),
    staleTime: 30_000,
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      if (!accessToken) throw new Error("Missing access token");
      await cancelBooking(bookingId, accessToken);
    },
    onSuccess: async () => {
      toast.success("Booking cancelled");
      await queryClient.invalidateQueries({
        queryKey: ["bookings", "profile", profileName, { venue: true }],
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to cancel booking";
      toast.error(message);
    },
  });

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const bookings = bookingsQuery.data ?? [];

  const upcoming = bookings
    .filter((b) => isoToDayKey(b.dateTo) >= todayKey)
    .sort((a, b) => isoToDayKey(a.dateFrom).localeCompare(isoToDayKey(b.dateFrom)));

  const past = bookings
    .filter((b) => isoToDayKey(b.dateTo) < todayKey)
    .sort((a, b) => isoToDayKey(b.dateFrom).localeCompare(isoToDayKey(a.dateFrom)));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-8">
      <header className="space-y-1 border-b">
        <h1 className="text-2xl font-semibold">My bookings</h1>
        <p className="opacity-80">Upcoming and past trips</p>
      </header>

      {bookingsQuery.isLoading && <p className="text-sm opacity-80">Loading bookings…</p>}

      {bookingsQuery.isError && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t load bookings</p>
          <p className="mt-1 opacity-80">{bookingsQuery.error.message}</p>
        </div>
      )}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && (
        <div className="space-y-10">
          {/* UPCOMING */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Upcoming</h2>

            {upcoming.length === 0 ? (
              <p className="text-sm opacity-80">No upcoming bookings yet.</p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2">
                {upcoming.map((b) => {
                  const fromKey = isoToDayKey(b.dateFrom);
                  const toKey = isoToDayKey(b.dateTo);
                  const venue = b.venue;
                  const cover = venue?.media?.[0];

                  return (
                    <li key={b.id} className="rounded-md border feature-card p-4 space-y-3">
                      {/* Title */}
                      <div className="min-w-0">
                        <p className="font-medium justify-self-start truncate">
                          {venue?.name ?? "Venue"}
                        </p>
                      </div>

                      {/* Image (clickable) */}
                      {venue?.id ? (
                        <Link
                          to={`/venues/${venue.id}`}
                          className="block h-48 w-full overflow-hidden rounded-md border bg-slate-100"
                        >
                          {cover?.url ? (
                            <img
                              src={cover.url}
                              alt={cover.alt ?? `${venue?.name ?? "Venue"} image`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-sm opacity-60">No image</span>
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="h-48 w-full overflow-hidden rounded-md border bg-slate-100 flex items-center justify-center">
                          <span className="text-sm opacity-60">No image</span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="text-sm space-y-2 text-left">
                        <div>
                          <p className="text-xs opacity-60">Check-in</p>
                          <p className="font-medium">{formatDDMMYYYYFromKey(fromKey)}</p>
                        </div>

                        <div>
                          <p className="text-xs opacity-60">Check-out</p>
                          <p className="font-medium">{formatDDMMYYYYFromKey(toKey)}</p>
                        </div>

                        <div>
                          <p className="text-xs opacity-60">Guests</p>
                          <p className="font-medium">{b.guests}</p>
                        </div>
                      </div>

                      {/* Cancel button */}
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          className="btn-secondary px-2 py-1 btn-secondary rounded shadow-md "
                          disabled={cancelMutation.isPending}
                          onClick={() => {
                            const ok = window.confirm("Cancel this booking?");
                            if (ok) cancelMutation.mutate(b.id);
                          }}
                        >
                          {cancelMutation.isPending ? "Cancelling…" : "Cancel booking"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* PAST */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Past</h2>

            {past.length === 0 ? (
              <p className="text-sm opacity-80">No past bookings.</p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2">
                {past.map((b) => {
                  const fromKey = isoToDayKey(b.dateFrom);
                  const toKey = isoToDayKey(b.dateTo);
                  const venue = b.venue;
                  const cover = venue?.media?.[0];

                  return (
                    <li key={b.id} className="rounded-md border feature-card p-4 space-y-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{venue?.name ?? "Venue"}</p>
                      </div>

                      {venue?.id ? (
                        <Link
                          to={`/venues/${venue.id}`}
                          className="block h-48 w-full overflow-hidden rounded-md border bg-slate-100"
                        >
                          {cover?.url ? (
                            <img
                              src={cover.url}
                              alt={cover.alt ?? `${venue?.name ?? "Venue"} image`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-sm opacity-60">No image</span>
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="h-48 w-full overflow-hidden rounded-md border bg-slate-100 flex items-center justify-center">
                          <span className="text-sm opacity-60">No image</span>
                        </div>
                      )}

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
                            {b.guests} guest
                            {b.guests === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs opacity-60 pt-1">This booking has ended.</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

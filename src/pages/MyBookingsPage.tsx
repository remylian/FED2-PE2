import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../auth/authStore";
import { cancelBooking, getMyBookings, type BookingWithVenue } from "../api/bookings";
import { formatDDMMYYYYFromKey } from "../utils/bookingDates";

function isoToDayKey(iso: string) {
  // Noroff returns ISO strings; yyyy-mm-dd is the first 10 chars
  return iso.slice(0, 10);
}

export default function MyBookingsPage() {
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
      return cancelBooking(bookingId, accessToken);
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({
        queryKey: ["bookings", "profile", profileName, { venue: true }],
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to cancel booking";
      toast.error(message);
    },
  });

  const todayKey = new Date().toISOString().slice(0, 10);
  const bookings = bookingsQuery.data ?? [];

  const upcoming = bookings
    .filter((b) => isoToDayKey(b.dateTo) >= todayKey)
    .sort((a, b) => isoToDayKey(a.dateFrom).localeCompare(isoToDayKey(b.dateFrom)));

  const past = bookings
    .filter((b) => isoToDayKey(b.dateTo) < todayKey)
    .sort((a, b) => isoToDayKey(b.dateFrom).localeCompare(isoToDayKey(a.dateFrom)));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
      <header className="space-y-1">
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
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Upcoming</h2>

            {upcoming.length === 0 ? (
              <p className="text-sm opacity-80">No upcoming bookings yet.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((b) => {
                  const fromKey = isoToDayKey(b.dateFrom);
                  const toKey = isoToDayKey(b.dateTo);
                  const venue = b.venue;

                  return (
                    <li key={b.id} className="rounded-md border p-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{venue?.name ?? "Venue"}</p>
                          <p className="text-sm opacity-80">
                            {formatDDMMYYYYFromKey(fromKey)} → {formatDDMMYYYYFromKey(toKey)} •{" "}
                            {b.guests} guest{b.guests === 1 ? "" : "s"}
                          </p>
                        </div>

                        {venue?.id && (
                          <Link to={`/venues/${venue.id}`} className="text-sm underline">
                            View venue
                          </Link>
                        )}
                      </div>

                      {venue?.media?.[0]?.url && (
                        <img
                          src={venue.media[0].url}
                          alt={venue.media[0].alt ?? `${venue.name} image`}
                          className="h-40 w-full rounded-md border object-cover"
                          loading="lazy"
                        />
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          className="btn-secondary"
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

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Past</h2>

            {past.length === 0 ? (
              <p className="text-sm opacity-80">No past bookings.</p>
            ) : (
              <ul className="space-y-3">
                {past.map((b) => {
                  const fromKey = isoToDayKey(b.dateFrom);
                  const toKey = isoToDayKey(b.dateTo);
                  const venue = b.venue;

                  return (
                    <li key={b.id} className="rounded-md border p-4">
                      <p className="font-medium">{venue?.name ?? "Venue"}</p>
                      <p className="text-sm opacity-80">
                        {formatDDMMYYYYFromKey(fromKey)} → {formatDDMMYYYYFromKey(toKey)} •{" "}
                        {b.guests} guest{b.guests === 1 ? "" : "s"}
                      </p>

                      {venue?.id && (
                        <Link
                          to={`/venues/${venue.id}`}
                          className="mt-2 inline-block text-sm underline"
                        >
                          View venue
                        </Link>
                      )}
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

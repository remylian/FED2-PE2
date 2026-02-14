import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getVenueById, type Venue } from "../api/venues";
import { createBooking } from "../api/bookings";
import { useAuthStore } from "../auth/authStore";
import VenueAvailabilityCalendar from "../components/venues/VenueAvailabilityCalendar";
import BookingPanel from "../components/bookings/BookingPanel";
import { usePageMeta } from "../hooks/usePageMeta";
import { useBookingSelection } from "../hooks/useBookingSelection";
import { dayKeyToIsoUtc } from "../utils/bookingDates";
import Skeleton from "../components/ui/Skeleton";

/* ---------- Amenities Helper ---------- */

function getAmenities(meta?: Venue["meta"]) {
  if (!meta) return [];

  const items = [
    { key: "wifi" as const, label: "WiFi" },
    { key: "parking" as const, label: "Parking" },
    { key: "breakfast" as const, label: "Breakfast" },
    { key: "pets" as const, label: "Pets allowed" },
  ];

  return items.filter((i) => Boolean(meta[i.key]));
}

export default function VenuePage() {
  usePageMeta({
    title: "Venue | Holidaze",
    description: "View venue details, availability, pricing, and amenities on Holidaze.",
  });

  const { id } = useParams();
  const location = useLocation();
  const qc = useQueryClient();

  const { isAuthenticated, accessToken, user, activeRole } = useAuthStore();

  const isManagerAccount = Boolean(user?.venueManager);
  const canBookAsCustomer = !isManagerAccount || activeRole === "customer";

  const [guests, setGuests] = useState<number>(1);

  const venueQuery = useQuery<Venue, Error>({
    queryKey: ["venue", id, { bookings: true, owner: true }],
    queryFn: () => {
      if (!id) throw new Error("Missing venue id");
      return getVenueById(id, { bookings: true, owner: true });
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const venue = venueQuery.data;
  console.log("VENUE META:", venue?.meta);

  const selection = useBookingSelection({
    bookings: venue?.bookings ?? [],
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!canBookAsCustomer) throw new Error("Switch to customer mode to book venues.");
      if (!id) throw new Error("Missing venue id");
      if (!venue) throw new Error("Venue not loaded");
      if (!accessToken) throw new Error("You must be logged in to book.");
      if (!selection.startKey || !selection.endKey)
        throw new Error("Select check-in and check-out dates first.");

      const todayKey = new Date().toISOString().slice(0, 10);
      if (selection.startKey < todayKey) throw new Error("Check-in cannot be in the past.");

      if (guests < 1) throw new Error("Guests must be at least 1.");
      if (guests > venue.maxGuests) throw new Error(`Max guests is ${venue.maxGuests}.`);

      return createBooking(
        {
          venueId: id,
          dateFrom: dayKeyToIsoUtc(selection.startKey),
          dateTo: dayKeyToIsoUtc(selection.endKey),
          guests,
        },
        accessToken,
      );
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["venue", id, { bookings: true, owner: true }],
      });
      selection.clearDates();
      setGuests(1);
      toast.success("Booking confirmed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    },
  });

  const loginHref = `/login?redirect=${encodeURIComponent(location.pathname)}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      {venueQuery.isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      )}

      {venueQuery.isError && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Couldn’t load venue</p>
          <p className="mt-1 opacity-80">{venueQuery.error.message}</p>
        </div>
      )}

      {!venueQuery.isLoading && !venueQuery.isError && venue && (
        <>
          <header className="space-y-1">
            <h1 className="text-2xl font-bold">{venue.name}</h1>

            {venue.owner?.name && (
              <p className="text-sm opacity-70">
                Hosted by <span className="font-medium">{venue.owner.name}</span>
              </p>
            )}
          </header>

          {venue.media?.[0]?.url && (
            <img
              src={venue.media[0].url}
              alt={venue.media[0].alt ?? `${venue.name} image`}
              className="h-96 w-full rounded-md border object-cover"
              loading="lazy"
            />
          )}

          <p className="text-sm opacity-80">
            Price: {venue.price} • Guests: {venue.maxGuests} • Rating: {venue.rating}
          </p>

          {/* ---------- Amenities Section ---------- */}
          {(() => {
            const amenities = getAmenities(venue.meta);
            if (amenities.length === 0) return null;

            return (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold opacity-80">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span
                      key={a.key}
                      className="rounded-full border bg-white/70 px-3 py-1 text-xs font-medium"
                    >
                      {a.label}
                    </span>
                  ))}
                </div>
              </section>
            );
          })()}

          {venue.description && <p className="opacity-90">{venue.description}</p>}

          {/* Booking + Availability */}
          <details className="group rounded-md py-2 ">
            <summary className="cursor-pointer list-none select-none">
              <span className="inline-flex h-9 items-center justify-center rounded-md border bg-white/70 px-3 text-sm font-medium">
                Check Availability
              </span>
            </summary>

            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div>
                {canBookAsCustomer ? (
                  <BookingPanel
                    venuePrice={venue.price}
                    maxGuests={venue.maxGuests}
                    startKey={selection.startKey}
                    endKey={selection.endKey}
                    activeField={selection.activeField}
                    onActiveFieldChange={selection.setActiveField}
                    guests={guests}
                    onGuestsChange={setGuests}
                    hint={selection.hint}
                    onClear={selection.clearDates}
                    isAuthenticated={isAuthenticated}
                    loginHref={loginHref}
                    isSubmitting={bookingMutation.isPending}
                    onConfirm={() => bookingMutation.mutate()}
                    errorMessage={
                      bookingMutation.isError
                        ? bookingMutation.error instanceof Error
                          ? bookingMutation.error.message
                          : "Something went wrong"
                        : null
                    }
                    success={bookingMutation.isSuccess}
                  />
                ) : (
                  <div className="rounded-md border p-4 text-sm">
                    <p className="font-medium">Booking disabled</p>
                    <p className="mt-1 opacity-80">
                      You’re in manager mode. Switch to customer mode from your profile to book
                      venues.
                    </p>
                  </div>
                )}
              </div>

              <VenueAvailabilityCalendar
                bookings={venue.bookings ?? []}
                startKey={selection.startKey}
                endKey={selection.endKey}
                activeField={selection.activeField}
                onSelectDay={selection.handleSelectDay}
              />
            </div>
          </details>
        </>
      )}
    </main>
  );
}

import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getVenueById, type Venue } from "../api/venues";
import { createBooking } from "../api/bookings";
import { useAuthStore } from "../auth/authStore";
import VenueAvailabilityCalendar from "../components/venues/VenueAvailabilityCalendar";
import BookingPanel from "../components/bookings/BookingPanel";
import { useBookingSelection } from "../hooks/useBookingSelection";
import { dayKeyToIsoUtc } from "../utils/bookingDates";

export default function VenuePage() {
  const { id } = useParams();
  const location = useLocation();
  const qc = useQueryClient();

  const { isAuthenticated, accessToken } = useAuthStore();

  const [guests, setGuests] = useState<number>(1);

  const venueQuery = useQuery<Venue, Error>({
    queryKey: ["venue", id, { bookings: true }],
    queryFn: () => {
      if (!id) throw new Error("Missing venue id");
      return getVenueById(id, { bookings: true });
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });

  const venue = venueQuery.data;

  const selection = useBookingSelection({
    bookings: venue?.bookings ?? [],
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      /**
       * Why we validate here:
       * The UI is not the source of truth.
       * Mutations must be correct even if UI state becomes inconsistent.
       */
      if (!id) throw new Error("Missing venue id");
      if (!venue) throw new Error("Venue not loaded");
      if (!accessToken) throw new Error("You must be logged in to book.");
      if (!selection.startKey || !selection.endKey) {
        throw new Error("Select check-in and check-out dates first.");
      }

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
      // Keeping the calendar accurate matters more than keeping local optimistic state.
      await qc.invalidateQueries({ queryKey: ["venue", id, { bookings: true }] });
      selection.clearDates();
      setGuests(1);
    },
  });

  const loginHref = `/login?redirect=${encodeURIComponent(location.pathname)}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <Link to="/venues" className="text-sm underline">
        ← Back to venues
      </Link>

      {venueQuery.isLoading && <p className="text-sm opacity-80">Loading venue…</p>}

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
            <p className="text-sm opacity-80">
              Price: {venue.price} • Guests: {venue.maxGuests} • Rating: {venue.rating}
            </p>
          </header>

          {venue.media?.[0]?.url && (
            <img
              src={venue.media[0].url}
              alt={venue.media[0].alt ?? `${venue.name} image`}
              className="h-64 w-full rounded-md border object-cover"
              loading="lazy"
            />
          )}

          {venue.description && <p className="opacity-90">{venue.description}</p>}

          <BookingPanel
            venuePrice={venue.price}
            maxGuests={venue.maxGuests}
            startKey={selection.startKey}
            endKey={selection.endKey}
            activeField={selection.activeField}
            onActiveFieldChange={(next) => {
              selection.setActiveField(next);
              // Keeps the UI hint relevant when users manually switch fields.
              // (We clear hint via the hook’s internal click handler, but switching is separate.)
            }}
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

          <VenueAvailabilityCalendar
            bookings={venue.bookings ?? []}
            startKey={selection.startKey}
            endKey={selection.endKey}
            activeField={selection.activeField}
            onSelectDay={selection.handleSelectDay}
          />
        </>
      )}
    </main>
  );
}

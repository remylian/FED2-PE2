import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getVenueById, type Venue } from "../api/venues";
import { createBooking } from "../api/bookings";
import { useAuthStore } from "../auth/authStore";
import { usePageMeta } from "../hooks/usePageMeta";
import { useBookingSelection } from "../hooks/useBookingSelection";
import { dayKeyToIsoUtc } from "../utils/bookingDates";
import Skeleton from "../components/ui/Skeleton";

import VenueHero from "../components/venues/VenueHero";
import AmenitiesChips from "../components/venues/AmenitiesChips";
import VenueBookingSection from "../components/venues/VenueBookingSection";

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

  const selection = useBookingSelection({
    bookings: venue?.bookings ?? [],
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!canBookAsCustomer) throw new Error("Switch to customer mode to book venues.");
      if (!id) throw new Error("Missing venue id");
      if (!venue) throw new Error("Venue not loaded");
      if (!accessToken) throw new Error("You must be logged in to book.");
      if (!selection.startKey || !selection.endKey) {
        throw new Error("Select check-in and check-out dates first.");
      }

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
      await qc.invalidateQueries({ queryKey: ["venue", id, { bookings: true, owner: true }] });
      selection.clearDates();
      setGuests(1);
      toast.success("Booking confirmed");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    },
  });

  const loginHref = `/login?redirect=${encodeURIComponent(location.pathname)}`;

  const bookingError =
    bookingMutation.isError && bookingMutation.error
      ? bookingMutation.error instanceof Error
        ? bookingMutation.error.message
        : "Something went wrong"
      : null;

  // ✅ Clear both: calendar selection + mutation success/error UI
  const handleClearBookingPanel = () => {
    bookingMutation.reset(); // clears isSuccess/isError (so "Dismiss" works)
    selection.clearDates();
    // Optional: keep or remove depending on your desired UX
    // setGuests(1);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      {venueQuery.isLoading && (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
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
          <VenueHero venue={venue} />

          {/* Amenities */}
          <AmenitiesChips meta={venue.meta} />

          {/* Booking */}
          <VenueBookingSection
            venue={venue}
            canBookAsCustomer={canBookAsCustomer}
            isAuthenticated={isAuthenticated}
            loginHref={loginHref}
            guests={guests}
            onGuestsChange={setGuests}
            startKey={selection.startKey}
            endKey={selection.endKey}
            activeField={selection.activeField}
            onActiveFieldChange={selection.setActiveField}
            onSelectDay={selection.handleSelectDay}
            hint={selection.hint}
            onClear={handleClearBookingPanel}
            isSubmitting={bookingMutation.isPending}
            onConfirm={() => bookingMutation.mutate()}
            errorMessage={bookingError}
            success={bookingMutation.isSuccess}
          />
        </>
      )}
    </main>
  );
}

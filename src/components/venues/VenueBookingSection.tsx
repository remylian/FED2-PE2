import type { Venue } from "../../api/venues";
import VenueAvailabilityCalendar from "./VenueAvailabilityCalendar";
import BookingPanel from "../bookings/BookingPanel";
import type { ActiveField } from "../../hooks/useBookingSelection";

type Props = {
  venue: Venue;
  canBookAsCustomer: boolean;
  isAuthenticated: boolean;
  loginHref: string;

  guests: number;
  onGuestsChange: (n: number) => void;

  startKey: string | null;
  endKey: string | null;

  activeField: ActiveField;
  onActiveFieldChange: (field: ActiveField) => void;

  onSelectDay: (dayKey: string) => void;

  hint: string | null;
  onClear: () => void;

  isSubmitting: boolean;
  onConfirm: () => void;

  errorMessage: string | null;
  success: boolean;
};

export default function VenueBookingSection({
  venue,
  canBookAsCustomer,
  isAuthenticated,
  loginHref,
  guests,
  onGuestsChange,
  startKey,
  endKey,
  activeField,
  onActiveFieldChange,
  onSelectDay,
  hint,
  onClear,
  isSubmitting,
  onConfirm,
  errorMessage,
  success,
}: Props) {
  return (
    <details className="group rounded-md py-2">
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
              startKey={startKey}
              endKey={endKey}
              activeField={activeField}
              onActiveFieldChange={onActiveFieldChange}
              guests={guests}
              onGuestsChange={onGuestsChange}
              hint={hint}
              onClear={onClear}
              isAuthenticated={isAuthenticated}
              loginHref={loginHref}
              isSubmitting={isSubmitting}
              onConfirm={onConfirm}
              errorMessage={errorMessage}
              success={success}
            />
          ) : (
            <div className="rounded-md border p-4 text-sm">
              <p className="font-medium">Booking disabled</p>
              <p className="mt-1 opacity-80">
                You’re in manager mode. Switch to customer mode from your profile to book venues.
              </p>
            </div>
          )}
        </div>

        <VenueAvailabilityCalendar
          bookings={venue.bookings ?? []}
          startKey={startKey}
          endKey={endKey}
          activeField={activeField}
          onSelectDay={onSelectDay}
        />
      </div>
    </details>
  );
}

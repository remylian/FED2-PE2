import { Link } from "react-router-dom";
import type { ActiveField } from "../../hooks/useBookingSelection";
import { formatDDMMYYYYFromKey, nightsBetweenUtc } from "../../utils/bookingDates";

type Props = {
  venuePrice: number;
  maxGuests: number;

  startKey: string | null;
  endKey: string | null;

  activeField: ActiveField;
  onActiveFieldChange: (next: ActiveField) => void;

  guests: number;
  onGuestsChange: (next: number) => void;

  hint: string | null;
  onClear: () => void;

  isAuthenticated: boolean;
  loginHref: string;

  isSubmitting: boolean;
  onConfirm: () => void;

  errorMessage: string | null;
  success: boolean;
};

/**
 * Booking panel UI.
 *
 * - Keeps the VenuePage focused on data + composition
 * - Makes it easy to reuse the booking UI later (e.g. in a modal)
 */
export default function BookingPanel({
  venuePrice,
  maxGuests,
  startKey,
  endKey,
  activeField,
  onActiveFieldChange,
  guests,
  onGuestsChange,
  hint,
  onClear,
  isAuthenticated,
  loginHref,
  isSubmitting,
  onConfirm,
  errorMessage,
  success,
}: Props) {
  const checkInText = startKey ? formatDDMMYYYYFromKey(startKey) : "Select date";
  const checkOutText = endKey ? formatDDMMYYYYFromKey(endKey) : "Select date";

  const canShowSummary = Boolean(startKey && endKey);
  const nights = startKey && endKey ? nightsBetweenUtc(startKey, endKey) : 0;
  const total = canShowSummary ? venuePrice * nights : 0;

  const canBook = Boolean(startKey && endKey && isAuthenticated);

  return (
    <section className="rounded-md border p-4 space-y-3">
      <h2 className="font-semibold">Booking</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={[
            "rounded-md border px-3 py-2 text-left",
            activeField === "start" ? "ring-2 ring-emerald-500" : "",
          ].join(" ")}
          onClick={() => onActiveFieldChange("start")}
        >
          <p className="text-xs opacity-70">Check-in</p>
          <p className="font-medium">{checkInText}</p>
        </button>

        <button
          type="button"
          className={[
            "rounded-md border px-3 py-2 text-left",
            activeField === "end" ? "ring-2 ring-sky-500" : "",
          ].join(" ")}
          onClick={() => onActiveFieldChange("end")}
        >
          <p className="text-xs opacity-70">Check-out</p>
          <p className="font-medium">{checkOutText}</p>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm opacity-80">
          Next:{" "}
          <span className="font-medium">
            {activeField === "start" ? "Choose check-in" : "Choose check-out"}
          </span>
        </p>

        <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={onClear}>
          Clear
        </button>
      </div>

      {hint && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Note</p>
          <p className="mt-1 opacity-80">{hint}</p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <label className="text-sm" htmlFor="guests">
            Guests (max {maxGuests})
          </label>
          <input
            id="guests"
            type="number"
            min={1}
            max={maxGuests}
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value))}
            className="w-32 rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {!isAuthenticated ? (
          <div className="text-sm">
            <p className="opacity-80">You must be logged in to book.</p>
            <Link className="underline" to={loginHref}>
              Log in to continue
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-60"
            disabled={!canBook || isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? "Booking…" : "Confirm booking"}
          </button>
        )}
      </div>

      {canShowSummary && (
        <div className="rounded-md border p-3 text-sm space-y-1">
          <p>
            <span className="opacity-70">Nights:</span>{" "}
            <span className="font-medium">{nights}</span>
          </p>
          <p>
            <span className="opacity-70">Estimated total:</span>{" "}
            <span className="font-medium">{total}</span>
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Booking failed</p>
          <p className="mt-1 opacity-80">{errorMessage}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Booking created!</p>
          <p className="mt-1 opacity-80">The calendar will update automatically.</p>
        </div>
      )}
    </section>
  );
}

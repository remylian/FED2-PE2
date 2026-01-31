import { useMemo, useState } from "react";
import type { Booking } from "../api/venues";
import { addDaysKey, compareKeys } from "../utils/bookingDates";

export type ActiveField = "start" | "end";

type UseBookingSelectionArgs = {
  bookings: Booking[];
};

/**
 * Hybrid booking selection state machine.
 *
 * - The “click calendar + two fields” behaviour is business logic
 * - Pages should compose behaviour, not implement it
 * - Keeps selection rules testable and easy to evolve without touching UI
 */
export function useBookingSelection({ bookings }: UseBookingSelectionArgs) {
  const [startKey, setStartKey] = useState<string | null>(null);
  const [endKey, setEndKey] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<ActiveField>("start");
  const [hint, setHint] = useState<string | null>(null);

  const bookedDayKeys = useMemo(() => {
    /**
     * Why we materialize a set:
     * Range validation becomes O(n) in number of selected days,
     * rather than searching bookings repeatedly.
     *
     * Rule: bookings are treated as [dateFrom, dateTo) (checkout day not booked)
     */
    const set = new Set<string>();

    for (const b of bookings) {
      const from = new Date(b.dateFrom);
      const to = new Date(b.dateTo);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) continue;
      if (to <= from) continue;

      const fromKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(
        from.getDate(),
      ).padStart(2, "0")}`;

      const toKey = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, "0")}-${String(
        to.getDate(),
      ).padStart(2, "0")}`;

      let cur = fromKey;
      while (compareKeys(cur, toKey) < 0) {
        set.add(cur);
        cur = addDaysKey(cur, 1);
      }
    }

    return set;
  }, [bookings]);

  function rangeIsValid(s: string, e: string) {
    // Validates [s, e) against booked days.
    if (compareKeys(e, s) <= 0) return false;

    let cur = s;
    while (compareKeys(cur, e) < 0) {
      if (bookedDayKeys.has(cur)) return false;
      cur = addDaysKey(cur, 1);
    }
    return true;
  }

  function clearDates() {
    setStartKey(null);
    setEndKey(null);
    setActiveField("start");
    setHint(null);
  }

  function handleSelectDay(dayKey: string) {
    setHint(null);

    // Defensive guard: booked days should not be selectable.
    if (bookedDayKeys.has(dayKey)) return;

    // Selecting check-in
    if (activeField === "start") {
      setStartKey(dayKey);

      // If an existing checkout is now invalid, drop it to prevent “hidden invalid state”.
      if (endKey && compareKeys(endKey, dayKey) <= 0) {
        setEndKey(null);
      }

      setActiveField("end");
      return;
    }

    // Selecting check-out
    const s = startKey;

    // If users jump straight to checkout, we still accept the click
    // but guide them into a valid flow.
    if (!s) {
      setStartKey(dayKey);
      setHint("Now select a check-out date.");
      return;
    }

    if (compareKeys(dayKey, s) <= 0) {
      setHint("Check-out must be after check-in.");
      return;
    }

    if (!rangeIsValid(s, dayKey)) {
      setHint("That date range includes booked dates. Please choose different dates.");
      return;
    }

    setEndKey(dayKey);
  }

  return {
    startKey,
    endKey,
    activeField,
    hint,
    bookedDayKeys,

    setActiveField,
    clearDates,
    handleSelectDay,
  };
}

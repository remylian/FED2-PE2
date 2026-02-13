import { useMemo, useState } from "react";
import type { Booking } from "../api/venues";
import { addDaysKey, compareKeys } from "../utils/bookingDates";

export type ActiveField = "start" | "end";

type UseBookingSelectionArgs = {
  bookings: Booking[];
};

export function useBookingSelection({ bookings }: UseBookingSelectionArgs) {
  const [startKey, setStartKey] = useState<string | null>(null);
  const [endKey, setEndKey] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<ActiveField>("start");
  const [hint, setHint] = useState<string | null>(null);

  const bookedDayKeys = useMemo(() => {
    // Inclusive booking rule: booked days are [dateFrom, dateTo]
    const set = new Set<string>();

    for (const b of bookings) {
      const from = new Date(b.dateFrom);
      const to = new Date(b.dateTo);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) continue;
      if (to < from) continue;

      const fromKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-${String(
        from.getDate(),
      ).padStart(2, "0")}`;

      const toKey = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, "0")}-${String(
        to.getDate(),
      ).padStart(2, "0")}`;

      let cur = fromKey;
      while (compareKeys(cur, toKey) <= 0) {
        set.add(cur);
        cur = addDaysKey(cur, 1);
      }
    }

    return set;
  }, [bookings]);

  function rangeIsValidInclusive(s: string, e: string) {
    // Validates [s, e] against booked days.
    if (compareKeys(e, s) < 0) return false;

    let cur = s;
    while (compareKeys(cur, e) <= 0) {
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

    // Booked days are not selectable
    if (bookedDayKeys.has(dayKey)) return;

    if (activeField === "start") {
      setStartKey(dayKey);

      if (endKey && compareKeys(endKey, dayKey) < 0) {
        // if checkout is before check-in, clear it
        setEndKey(null);
      }

      setActiveField("end");
      return;
    }

    const s = startKey;

    if (!s) {
      setStartKey(dayKey);
      setHint("Now select a check-out date.");
      return;
    }

    if (compareKeys(dayKey, s) < 0) {
      setHint("Check-out must be the same day or after check-in.");
      return;
    }

    if (!rangeIsValidInclusive(s, dayKey)) {
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

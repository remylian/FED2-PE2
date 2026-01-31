import { useMemo, useState } from "react";
import type { Booking } from "../../api/venues";

export type ActiveField = "start" | "end";

type Props = {
  bookings: Booking[];
  startKey: string | null; // yyyy-mm-dd
  endKey: string | null; // yyyy-mm-dd (checkout)
  activeField: ActiveField;
  onSelectDay: (dayKey: string) => void;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function toDayKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateOnly(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function compareKeys(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export default function VenueAvailabilityCalendar({
  bookings,
  startKey,
  endKey,
  activeField,
  onSelectDay,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => startOfMonth(today));

  const bookedDayKeys = useMemo(() => {
    // Treat bookings as [dateFrom, dateTo) (checkout day not booked)
    const set = new Set<string>();

    for (const b of bookings) {
      const from = dateOnly(b.dateFrom);
      const to = dateOnly(b.dateTo);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) continue;
      if (to <= from) continue;

      const cur = new Date(from);
      while (cur < to) {
        set.add(toDayKey(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }

    return set;
  }, [bookings]);

  const first = startOfMonth(cursor);
  const last = endOfMonth(cursor);
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const startWeekday = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = last.getDate();

  const cells: Array<{ date: Date | null; key: string | null; booked: boolean }> = [];

  for (let i = 0; i < startWeekday; i++) cells.push({ date: null, key: null, booked: false });

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    const key = toDayKey(d);
    const booked = bookedDayKeys.has(key);
    cells.push({ date: d, key, booked });
  }

  while (cells.length % 7 !== 0) cells.push({ date: null, key: null, booked: false });

  function isInSelectedRange(key: string) {
    const s = startKey;
    const e = endKey;
    if (!s || !e) return false;
    return compareKeys(key, s) >= 0 && compareKeys(key, e) < 0;
  }

  return (
    <section className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Availability</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setCursor((d) => addMonths(d, -1))}
          >
            ←
          </button>

          <p className="text-sm font-medium min-w-[12ch] text-center">{monthLabel}</p>

          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => setCursor((d) => addMonths(d, 1))}
          >
            →
          </button>
        </div>
      </div>

      {/* Mode hint */}
      <p className="text-sm opacity-80">
        Selecting:{" "}
        <span className="font-medium">{activeField === "start" ? "Check-in" : "Check-out"}</span>
      </p>

      <div className="grid grid-cols-7 gap-1 text-xs opacity-80">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w} className="py-1 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, idx) => {
          if (!c.date || !c.key) return <div key={idx} className="h-10" />;

          const dayKey = c.key;

          const isToday =
            c.date.getFullYear() === today.getFullYear() &&
            c.date.getMonth() === today.getMonth() &&
            c.date.getDate() === today.getDate();

          const selectedStart = startKey === dayKey;
          const selectedEnd = endKey === dayKey;
          const inRange = isInSelectedRange(dayKey);

          const base =
            "h-10 rounded-md border flex items-center justify-center text-sm select-none";

          const bookedClass =
            "bg-slate-900/55 text-slate-300 line-through opacity-80 cursor-not-allowed";

          const availableClass =
            "bg-emerald-900/20 text-emerald-100 hover:bg-emerald-900/30 cursor-pointer";

          // Very obvious selection (can tone down later)
          const rangeClass = inRange ? "bg-yellow-400/40" : "";
          const todayClass = isToday ? "ring-2 ring-amber-400" : "";

          const selectedClass = selectedStart
            ? "ring-4 ring-emerald-500 font-bold bg-emerald-900/40"
            : selectedEnd
              ? "ring-4 ring-sky-500 font-bold bg-sky-900/40"
              : "";

          return (
            <div
              key={dayKey}
              className={[
                base,
                c.booked ? bookedClass : availableClass,
                rangeClass,
                todayClass,
                selectedClass,
              ].join(" ")}
              title={c.booked ? "Booked" : "Available"}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (!c.booked) onSelectDay(dayKey);
              }}
              onKeyDown={(e) => {
                if (c.booked) return;
                if (e.key === "Enter" || e.key === " ") onSelectDay(dayKey);
              }}
            >
              {c.date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border bg-emerald-900/20" />
          <span className="opacity-80">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border bg-slate-900/55" />
          <span className="opacity-80">Booked</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border ring-4 ring-emerald-500" />
          <span className="opacity-80">Check-in</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border ring-4 ring-sky-500" />
          <span className="opacity-80">Check-out</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border bg-yellow-400/40" />
          <span className="opacity-80">Selected range</span>
        </div>
      </div>
    </section>
  );
}

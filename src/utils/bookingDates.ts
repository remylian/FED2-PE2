/**
 * Booking date helpers.
 *
 * - Keeps date rules (keys, formatting, UTC conversion) consistent across the app
 * - Prevents pages/components from re-implementing subtle date logic differently
 */

export function formatDDMMYYYYFromKey(key: string) {
  const [y, m, d] = key.split("-");
  return `${d}-${m}-${y}`;
}

export function compareKeys(a: string, b: string) {
  // yyyy-mm-dd compares lexicographically, which is safer than constructing Date() repeatedly.
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function addDaysKey(key: string, delta: number) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + delta);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function dayKeyToIsoUtc(dayKey: string) {
  /**
   * Why UTC:
   * The app operates on “date-only” selections.
   * Converting via UTC avoids timezone offsets shifting the date when serialized.
   */
  const [y, m, d] = dayKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, 0, 0, 0));
  return dt.toISOString();
}

export function nightsBetweenUtc(startKey: string, endKey: string) {
  const start = new Date(dayKeyToIsoUtc(startKey)).getTime();
  const end = new Date(dayKeyToIsoUtc(endKey)).getTime();
  const diff = end - start;
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

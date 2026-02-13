export function formatDDMMYYYYFromKey(key: string): string {
  const [yyyy, mm, dd] = key.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

function toUtcMsFromKey(dayKey: string): number {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Inclusive day count between start and end keys.
 * Example: 2026-02-10 → 2026-02-12 = 3
 */
export function nightsBetweenUtc(startKey: string, endKey: string): number {
  const start = toUtcMsFromKey(startKey);
  const end = toUtcMsFromKey(endKey);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;

  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / oneDay) + 1;
}

export function dayKeyToIsoUtc(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

/**
 * Why this exists:
 * We compare yyyy-mm-dd as strings to avoid timezone surprises,
 * and because lexicographic order matches chronological order.
 */
export function compareKeys(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function addDaysKey(dayKey: string, days: number) {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

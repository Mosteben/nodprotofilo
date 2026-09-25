/**
 * Date helpers that give identical output on the server and in the browser.
 *
 * Rendering with the process/browser timezone (toLocaleDateString without timeZone,
 * getTimezoneOffset) produces different HTML on a UTC server than in a visitor's browser,
 * which causes hydration mismatches. Everything here uses one fixed site timezone.
 */
export const SITE_TIME_ZONE = "Africa/Cairo";

export function formatDate(value: string | Date, style: "long" | "short" = "long"): string {
  return new Date(value).toLocaleDateString("ar-EG", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: style === "long" ? "long" : "numeric",
    day: "numeric",
  });
}

/** Date and time, e.g. for message timestamps. */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString("ar-EG", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Compact list timestamp: time for today, otherwise the date. */
export function formatListDate(value: string | Date, now: Date = new Date()): string {
  const sameDay = formatDate(value, "short") === formatDate(now, "short");
  return sameDay
    ? new Date(value).toLocaleTimeString("ar-EG", { timeZone: SITE_TIME_ZONE, hour: "numeric", minute: "2-digit" })
    : formatDate(value, "short");
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function wallClock(timestamp: number) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(new Date(timestamp)).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** Site-timezone offset from UTC (ms) at a given instant. */
function offsetAt(timestamp: number): number {
  const w = wallClock(timestamp);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute) - Math.floor(timestamp / 60_000) * 60_000;
}

/** ISO timestamp → value for <input type="datetime-local">, in the site timezone. */
export function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  const w = wallClock(new Date(iso).getTime());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${w.year}-${pad(w.month)}-${pad(w.day)}T${pad(w.hour)}:${pad(w.minute)}`;
}

/** <input type="datetime-local"> value (site timezone) → ISO string, or "" when empty. */
export function fromDateTimeLocal(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return value ? new Date(value).toISOString() : "";
  const [, y, mo, d, h, mi] = match.map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Correct by the zone offset, re-checking once around DST changes.
  let timestamp = asUtc - offsetAt(asUtc);
  const corrected = asUtc - offsetAt(timestamp);
  if (corrected !== timestamp) timestamp = corrected;
  return new Date(timestamp).toISOString();
}

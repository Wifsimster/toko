import { toLocalISODate } from "../../lib/local-date";

/**
 * Timezone arithmetic and the shared result shape for the email jobs.
 *
 * All five jobs answer the same question — "is it the right local moment
 * for this parent?" — so the calendar helpers belong together, apart from
 * any one job's rules.
 */

export type JobResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

export function emptyResult(): JobResult {
  return { processed: 0, sent: 0, skipped: 0, errors: 0 };
}

// Returns the local hour in the given IANA timezone at the current instant.
// Uses Intl.DateTimeFormat so no external dep is needed.
export function localHourIn(timezone: string, now: Date = new Date()): number {
  try {
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    }).format(now);
    return Number.parseInt(hourStr, 10);
  } catch {
    // Unknown tz → fall back to UTC
    return now.getUTCHours();
  }
}

// Returns the local time as "HH:mm" in the given IANA timezone.
// Falls back to UTC on invalid timezone.
export function localTimeIn(timezone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
}

export function localWeekdayIn(timezone: string, now: Date = new Date()): number {
  // Returns 0..6 with 0 = Sunday
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
    }).format(now);
    return (
      { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[fmt] ?? 0
    );
  } catch {
    return now.getUTCDay();
  }
}

export function hoursSince(date: Date | null, now: Date = new Date()): number {
  if (!date) return Number.POSITIVE_INFINITY;
  return (now.getTime() - date.getTime()) / (60 * 60 * 1000);
}

// Re-exported under the historical name so the jobs read cleanly. The
// implementation lives in `lib/local-date.ts` because route handlers need
// it too.
export const todayInTimezone = toLocalISODate;

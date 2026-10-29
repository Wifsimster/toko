import { toLocalISODate } from "../../lib/local-date";

export type JobResult = {
  processed: number;
  sent: number;
  skipped: number;
  errors: number;
};

export function emptyResult(): JobResult {
  return { processed: 0, sent: 0, skipped: 0, errors: 0 };
}

export function localHourIn(timezone: string, now: Date = new Date()): number {
  try {
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    }).format(now);
    return Number.parseInt(hourStr, 10);
  } catch {
    return now.getUTCHours();
  }
}

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

export const todayInTimezone = toLocalISODate;

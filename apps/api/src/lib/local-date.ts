import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";

// Toko's userbase is French; the user_preferences default and the scheduler
// env default both pin this. Routes that compute calendar dates fall back
// here when a per-user timezone is unavailable.
export const DEFAULT_TIMEZONE = "Europe/Paris";

/**
 * Formats `date` as `YYYY-MM-DD` in the given IANA timezone. The frontend
 * writes symptom/journal/mood `date` columns using the user's local
 * calendar day; the backend must read them back the same way or queries
 * around midnight (UTC+1/+2 in France) silently miss or duplicate rows.
 *
 * Falls back to UTC on an invalid timezone — matches the email-jobs
 * helper this replaces.
 */
export function toLocalISODate(
  timezone: string,
  date: Date = new Date(),
): string {
  try {
    // en-CA renders as `YYYY-MM-DD`.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().split("T")[0]!;
  }
}

/**
 * Returns the calendar date `days` before today in `timezone`, formatted
 * as `YYYY-MM-DD`. Subtraction happens in calendar-day space (UTC math on
 * a midnight-UTC anchor) so DST transitions don't shift the result by an
 * hour. With `days = 0` this is equivalent to `toLocalISODate`.
 */
export function localISODateDaysAgo(
  timezone: string,
  days: number,
  from: Date = new Date(),
): string {
  const today = toLocalISODate(timezone, from);
  const anchor = new Date(`${today}T00:00:00Z`);
  anchor.setUTCDate(anchor.getUTCDate() - days);
  return anchor.toISOString().slice(0, 10);
}

/**
 * Loads the user's preferred timezone, falling back to {@link DEFAULT_TIMEZONE}
 * when no preferences row exists. Called once per request that needs to do
 * date math; the extra round-trip is negligible relative to the queries
 * that follow.
 */
export async function getUserTimezone(userId: string): Promise<string> {
  const [row] = await db
    .select({ timezone: userPreferences.timezone })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row?.timezone ?? DEFAULT_TIMEZONE;
}

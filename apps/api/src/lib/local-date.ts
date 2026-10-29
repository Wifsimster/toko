import { eq } from "drizzle-orm";
import { db, userPreferences } from "@focusflow/db";

export const DEFAULT_TIMEZONE = "Europe/Paris";

export function toLocalISODate(
  timezone: string,
  date: Date = new Date(),
): string {
  try {
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

export async function getUserTimezone(userId: string): Promise<string> {
  const [row] = await db
    .select({ timezone: userPreferences.timezone })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row?.timezone ?? DEFAULT_TIMEZONE;
}

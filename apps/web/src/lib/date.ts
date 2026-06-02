/**
 * Format a Date as a `YYYY-MM-DD` string using the user's **local** calendar
 * day. We deliberately avoid `toISOString()` here: it converts to UTC first,
 * so for parents east of UTC (France is UTC+1/+2) an entry logged late in the
 * evening would be stored under the previous day, breaking streaks, the daily
 * checklist and date-range reports.
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's local calendar date as `YYYY-MM-DD`. */
export function todayISO(): string {
  return toISODate(new Date());
}

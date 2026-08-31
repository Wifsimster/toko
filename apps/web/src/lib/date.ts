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

/**
 * Parse a `YYYY-MM-DD` string as a date in the user's **local** calendar.
 * `new Date("2026-08-31")` is parsed as UTC midnight, which renders as the
 * previous day for parents west of UTC. Dates are stored as plain calendar
 * days, so they must be read back the same way they are written.
 */
export function parseISODate(value: string): Date {
  const [year = 1970, month = 1, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

/**
 * Format a `YYYY-MM-DD` string as a long, human date ("lundi 31 août 2026"),
 * as it should read inside a sentence ("l'entrée du lundi 31 août").
 */
export function formatLongDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = LONG_DATE_OPTIONS
): string {
  return parseISODate(value).toLocaleDateString(locale, options);
}

/**
 * Same date, used as a heading ("Lundi 31 août 2026"). French keeps weekdays
 * and months in lower case, so only the very first letter is capitalised —
 * the CSS `capitalize` utility would wrongly write "Lundi 31 Août 2026".
 */
export function formatLongDateTitle(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = LONG_DATE_OPTIONS
): string {
  const formatted = formatLongDate(value, locale, options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

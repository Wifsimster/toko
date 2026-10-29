export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(value: string): Date {
  const [year = 1970, month = 1, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateValue(value: string | Date): Date {
  if (value instanceof Date) return value;
  return DATE_ONLY_RE.test(value) ? parseISODate(value) : new Date(value);
}

const LONG_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

export function formatLongDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = LONG_DATE_OPTIONS
): string {
  return parseISODate(value).toLocaleDateString(locale, options);
}

export function formatLongDateTitle(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = LONG_DATE_OPTIONS
): string {
  const formatted = formatLongDate(value, locale, options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

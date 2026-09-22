/**
 * Adds calendar months in UTC, clamping to the last day of the target month
 * instead of letting `setUTCMonth` overflow (Jan 31 + 1 month would
 * otherwise land on Mar 3, not Feb 28/29). Time of day is preserved.
 */
export function addMonthsClamped(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

/**
 * Reporting periods, defined once.
 *
 * `stats.ts` and `report.ts` each carried their own `PERIOD_DAYS` map with
 * different fallbacks (7 vs 90). Sharing the definition keeps "quarter"
 * meaning the same number of days on every screen that offers the choice.
 */
export const REPORT_PERIODS = ["week", "month", "quarter"] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const PERIOD_DAYS: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

/** Days covered by a period name, falling back when the input is unknown. */
export function daysForPeriod(
  period: string | undefined,
  fallback: ReportPeriod,
): number {
  return PERIOD_DAYS[period as ReportPeriod] ?? PERIOD_DAYS[fallback];
}

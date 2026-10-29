export const REPORT_PERIODS = ["week", "month", "quarter"] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const PERIOD_DAYS: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

export function daysForPeriod(
  period: string | undefined,
  fallback: ReportPeriod,
): number {
  return PERIOD_DAYS[period as ReportPeriod] ?? PERIOD_DAYS[fallback];
}

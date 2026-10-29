import { daysForPeriod, type ReportPeriod } from "../periods";
import { localISODateDaysAgo, toLocalISODate } from "../local-date";

export type ReportRange = { sinceDate: string; untilDate: string };

export type ResolvedRange = ReportRange | { error: string };

export interface RangeInput {
  period?: ReportPeriod;
  from?: string;
  to?: string;
}

export function resolveDateRange(
  input: RangeInput,
  timezone: string,
): ResolvedRange {
  const today = toLocalISODate(timezone);
  if (input.from) {
    const sinceDate = input.from;
    const untilDate = input.to ?? today;
    if (sinceDate > untilDate) {
      return { error: "La date de début doit précéder la date de fin." };
    }
    return { sinceDate, untilDate };
  }
  return {
    sinceDate: localISODateDaysAgo(timezone, daysForPeriod(input.period, "quarter")),
    untilDate: today,
  };
}

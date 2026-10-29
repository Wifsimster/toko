import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type EventDailyRow = {
  date: string;
  eventName: string;
  count: number;
};

export type EventTotalRow = {
  eventName: string;
  count: number;
};

export type DerivedKpis = {
  helpfulYes: number;
  helpfulTotal: number;
  helpfulRate: number | null;
  paywallViews: number;
  trialsStarted: number;
  paywallToTrialRate: number | null;
  activeParents: number;
  northStar: number | null;
};

export type TimeToAha = {
  medianSeconds: number | null;
  p75Seconds: number | null;
  usersReached: number;
  cohortSignups: number;
  reachedD7: number;
  reachRateD7: number | null;
};

export type Paid30d = {
  activeSubs: number;
  subsStarted30d: number;
  subsCanceled30d: number;
  monthlyChurnRate: number | null;
  ltvMonths: number | null;
};

export type FormationFunnel = {
  purchases7d: number;
  buyers: number;
  converted: number;
  conversionRate: number | null;
};

export type BetaMetrics = {
  families: number;
  notifOptIn: number;
  notifOptInRate: number | null;
  routineCompletions7d: number;
  timerSessions7d: number;
  retentionEligible: number;
  retentionActive: number;
  retentionW8Rate: number | null;
};

export type AnalyticsAlert = {
  level: "warn" | "critical";
  message: string;
};

export type ChurnSignals = {
  disengaged: number;
  eligibleCohort: number;
  disengagedRate: number | null;
  disengagedWowDelta: number | null;
  silentSos: number;
  sosUserTotal: number;
  silentSosRate: number | null;
  paywallStall: number;
  paywallStallTotal: number;
  paywallStallRate: number | null;
  trackerSilent: number;
  trackerCohort: number;
  trackerSilentRate: number | null;
  w4Cohort: number;
  w4Retained: number;
  w4RetentionRate: number | null;
};

export type AnalyticsEventsResponse = {
  days: number;
  byDay: EventDailyRow[];
  totals7d: EventTotalRow[];
  totalsRange: EventTotalRow[];
  derived7d: DerivedKpis;
  timeToAha: TimeToAha;
  paid30d: Paid30d;
  formation: FormationFunnel;
  beta: BetaMetrics;
  churnSignals: ChurnSignals;
  alerts: AnalyticsAlert[];
};

const adminAnalyticsKeys = {
  events: (days: number) => ["admin-analytics", "events", days] as const,
};

export function useAdminAnalyticsEvents(days: number = 30) {
  return useQuery({
    queryKey: adminAnalyticsKeys.events(days),
    queryFn: () =>
      api.get<AnalyticsEventsResponse>(`/admin/analytics/events?days=${days}`),
    retry: false,
  });
}

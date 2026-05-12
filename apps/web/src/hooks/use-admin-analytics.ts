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

export type AnalyticsEventsResponse = {
  days: number;
  byDay: EventDailyRow[];
  totals7d: EventTotalRow[];
  totalsRange: EventTotalRow[];
  derived7d: DerivedKpis;
  timeToAha: TimeToAha;
};

export const adminAnalyticsKeys = {
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

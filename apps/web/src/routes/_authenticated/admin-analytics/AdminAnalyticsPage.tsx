import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { useAdminAnalyticsEvents } from "@/hooks/use-admin-analytics";
import { ApiError } from "@/lib/api-client";
import {
  AlertsSection,
  KpiSection,
  TimeToAhaSection,
  ChurnSection,
  PaidSection,
  EventVolumesSection,
  DailyChartSection,
} from "./analytics-sections";
import { pivotByDay, totalsToMap } from "./analytics-format";

export function AdminAnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalyticsEvents(30);

  if (isLoading) return <PageLoader />;

  if (error) {
    const forbidden = error instanceof ApiError && error.status === 403;
    return (
      <div className="space-y-4">
        <PageHeader title="Analyses internes" description="" />
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            {forbidden
              ? "Cette page est réservée aux administrateurs."
              : "Impossible de charger les analyses pour le moment."}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const totals7d = totalsToMap(data.totals7d);
  const totalsRange = totalsToMap(data.totalsRange);
  const series = pivotByDay(data.byDay);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyses internes"
        description={`Événements collectés sur les ${data.days} derniers jours.`}
      />
      <AlertsSection alerts={data.alerts} />
      <KpiSection kpis={data.derived7d} />
      <TimeToAhaSection aha={data.timeToAha} />
      <ChurnSection churn={data.churnSignals} />
      <PaidSection paid={data.paid30d} />
      <EventVolumesSection
        totals7d={totals7d}
        totalsRange={totalsRange}
        days={data.days}
      />
      <DailyChartSection series={series} />
    </div>
  );
}

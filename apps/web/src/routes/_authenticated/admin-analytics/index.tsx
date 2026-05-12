import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  useAdminAnalyticsEvents,
  type EventDailyRow,
  type EventTotalRow,
} from "@/hooks/use-admin-analytics";
import { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/_authenticated/admin-analytics/")({
  component: AdminAnalyticsPage,
});

const EVENT_LABELS: Record<string, string> = {
  signup_completed: "Inscriptions",
  paywall_viewed: "Paywall vu",
  sos_completed: "S.O.S. terminé",
  sos_helpful_rating: "S.O.S. noté",
  trial_started: "Essai démarré",
};

const EVENT_COLORS: Record<string, string> = {
  signup_completed: "#16a34a",
  paywall_viewed: "#f59e0b",
  sos_completed: "#3b82f6",
  sos_helpful_rating: "#8b5cf6",
  trial_started: "#ef4444",
};

function formatPercent(rate: number | null): string {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)} %`;
}

function formatNumber(value: number | null, fractionDigits: number): string {
  if (value === null) return "—";
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function pivotByDay(rows: EventDailyRow[]) {
  const map = new Map<string, Record<string, number | string>>();
  for (const row of rows) {
    let entry = map.get(row.date);
    if (!entry) {
      entry = { date: row.date };
      map.set(row.date, entry);
    }
    entry[row.eventName] = row.count;
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

function totalsToMap(rows: EventTotalRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) out[row.eventName] = row.count;
  return out;
}

function AdminAnalyticsPage() {
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
  const kpis = data.derived7d;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyses internes"
        description={`Événements collectés sur les ${data.days} derniers jours.`}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          KPI · 7 derniers jours
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                North Star — crises désamorcées / parent actif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatNumber(kpis.northStar, 2)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {kpis.helpfulYes} S.O.S. notés utiles · {kpis.activeParents}{" "}
                parents actifs
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                S.O.S. → noté utile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatPercent(kpis.helpfulRate)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {kpis.helpfulYes} / {kpis.helpfulTotal} retours
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Paywall → Essai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {formatPercent(kpis.paywallToTrialRate)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {kpis.trialsStarted} essais sur {kpis.paywallViews} affichages
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Volumes par événement
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(EVENT_LABELS).map(([key, label]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {totals7d[key] ?? 0}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  7 derniers jours · {totalsRange[key] ?? 0} sur {data.days}{" "}
                  jours
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Évolution quotidienne</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {series.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Aucun événement sur la période.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {Object.entries(EVENT_LABELS).map(([key, label]) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={label}
                    fill={EVENT_COLORS[key]}
                    stackId="a"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

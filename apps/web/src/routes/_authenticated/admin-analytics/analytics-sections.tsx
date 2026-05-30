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
import type {
  DerivedKpis,
  TimeToAha,
  Paid30d,
  ChurnSignals,
  AnalyticsAlert,
  EventTotalRow,
  EventDailyRow,
} from "@/hooks/use-admin-analytics";

export const EVENT_LABELS: Record<string, string> = {
  signup_completed: "Inscriptions",
  session_started: "Sessions",
  paywall_viewed: "Paywall vu",
  sos_completed: "S.O.S. terminé",
  sos_helpful_rating: "S.O.S. noté",
  trial_started: "Essai démarré",
  subscription_started: "Abonnement démarré",
  subscription_canceled: "Abonnement annulé",
};

export const EVENT_COLORS: Record<string, string> = {
  signup_completed: "#16a34a",
  session_started: "#10b981",
  paywall_viewed: "#f59e0b",
  sos_completed: "#3b82f6",
  sos_helpful_rating: "#8b5cf6",
  trial_started: "#ef4444",
  subscription_started: "#0ea5e9",
  subscription_canceled: "#64748b",
};

export function formatPercent(rate: number | null): string {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)} %`;
}

export function formatNumber(value: number | null, fractionDigits: number): string {
  if (value === null) return "—";
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

// Humanises a seconds count into "X min", "X h", "X j", admins read
// the dashboard quickly and a raw seconds figure is meaningless past
// a few minutes.
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "—";
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(seconds / 3600);
  if (hours < 48) return `${hours} h`;
  const days = Math.round(seconds / 86400);
  return `${days} j`;
}

export function pivotByDay(rows: EventDailyRow[]) {
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

export function totalsToMap(rows: EventTotalRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) out[row.eventName] = row.count;
  return out;
}

export function AlertsSection({ alerts }: { alerts: AnalyticsAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <section className="space-y-2">
      {alerts.map((alert) => (
        <Card
          key={alert.message}
          className={
            alert.level === "critical"
              ? "border-destructive/50 bg-destructive/5"
              : "border-amber-500/40 bg-amber-50 dark:bg-amber-950/30"
          }
        >
          <CardContent className="py-3 text-sm">
            <span className="font-semibold">
              {alert.level === "critical" ? "Critique · " : "Alerte · "}
            </span>
            {alert.message}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function KpiSection({ kpis }: { kpis: DerivedKpis }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        KPI · 7 derniers jours
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              North Star, crises désamorcées / parent actif
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
  );
}

export function TimeToAhaSection({ aha }: { aha: TimeToAha }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Time-to-aha, signup → 1ʳᵉ crise désamorcée
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Médiane (P50)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatDuration(aha.medianSeconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {aha.usersReached} utilisateurs ayant atteint l'aha-moment
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">P75</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatDuration(aha.p75Seconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              75 % des aha-reachers ont mis ce délai ou moins
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d'aha à J+7
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(aha.reachRateD7)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {aha.reachedD7} sur {aha.cohortSignups} signups · cible 50 %
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function ChurnSection({ churn }: { churn: ChurnSignals }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Signaux de churn invisible
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inscrits silencieux · 14 j
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(churn.disengagedRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {churn.disengaged} / {churn.eligibleCohort} dans la cohorte
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              S.O.S. jamais notés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(churn.silentSosRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {churn.silentSos} / {churn.sosUserTotal} utilisateurs
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Paywall sans suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(churn.paywallStallRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {churn.paywallStall} / {churn.paywallStallTotal} vus &gt; 7 j
              sans essai
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tracker silencieux · 14 j
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(churn.trackerSilentRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {churn.trackerSilent} / {churn.trackerCohort} parents · aucun
              symptôme noté
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Retention W4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(churn.w4RetentionRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {churn.w4Retained} / {churn.w4Cohort} actifs en semaine 4 ·
              cible 25-30 %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Évolution churn invisible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {churn.disengagedWowDelta === null
                ? "—"
                : `${churn.disengagedWowDelta > 0 ? "+" : ""}${(
                    churn.disengagedWowDelta * 100
                  ).toFixed(1)} pts`}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              vs. semaine précédente (cible &lt; +10 pts)
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function PaidSection({ paid }: { paid: Paid30d }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Revenu & rétention payante · 30 derniers jours
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Abonnements actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{paid.activeSubs}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Inclut les essais en cours
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Nouveaux abonnements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {paid.subsStarted30d}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Démarrés sur les 30 derniers jours
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Churn mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatPercent(paid.monthlyChurnRate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {paid.subsCanceled30d} annulés · cible &lt; 6 %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              LTV (mois moyens)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatNumber(paid.ltvMonths, 1)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Approximation 1 / churn
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function EventVolumesSection({
  totals7d,
  totalsRange,
  days,
}: {
  totals7d: Record<string, number>;
  totalsRange: Record<string, number>;
  days: number;
}) {
  return (
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
                7 derniers jours · {totalsRange[key] ?? 0} sur {days}{" "}
                jours
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function DailyChartSection({
  series,
}: {
  series: ReturnType<typeof pivotByDay>;
}) {
  return (
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
  );
}

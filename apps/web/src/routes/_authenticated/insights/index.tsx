import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { TrendingUp, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoader } from "@/components/ui/page-loader";
import { PremiumGate } from "@/components/shared/premium-gate";
import { PAYWALL_VARIANT } from "@/lib/paywall-variant";
import { useUiStore } from "@/stores/ui-store";
import { useChildren } from "@/hooks/use-children";
import { useBillingStatus } from "@/hooks/use-billing";
import {
  useStats,
  useCorrelations,
  useCalmMinutes,
} from "@/hooks/use-stats";

const WeeklyChart = lazy(() =>
  import("@/components/dashboard/weekly-chart").then((m) => ({
    default: m.WeeklyChart,
  })),
);

export const Route = createFileRoute("/_authenticated/insights/")({
  component: InsightsPage,
  staticData: { crumb: "nav.insights" },
});

function InsightsPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: children, isLoading } = useChildren();
  const billing = useBillingStatus();
  const showValueProp = !billing.isLoading && !billing.data?.active;

  if (isLoading) return <PageLoader />;

  if (!activeChildId || !children?.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("insights.title")}
          description={t("insights.subtitle")}
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("insights.noChild")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("insights.title")}
        description={t("insights.subtitle")}
      />

      {showValueProp && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 space-y-2">
            <p className="font-medium text-sm">
              {t(`premiumGate.variants.${PAYWALL_VARIANT}.title`)}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(`premiumGate.variants.${PAYWALL_VARIANT}.subtitle`)}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {t(`premiumGate.variants.${PAYWALL_VARIANT}.body`)}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-info-border bg-info-surface/40">
        <CardContent className="py-4 text-sm leading-relaxed text-foreground/90">
          {t("insights.disclaimer")}
        </CardContent>
      </Card>

      <MonthlyTrends childId={activeChildId} />
      <QuarterlyTrends childId={activeChildId} />
      <MonthlyCalmMinutes childId={activeChildId} />
      <BehaviorCorrelation childId={activeChildId} />
    </div>
  );
}

// 30-day trends: gated. The free dashboard already shows the same
// chart for "week" — month/quarter is the legitimate premium step-up.
function MonthlyTrends({ childId }: { childId: string }) {
  const { t } = useTranslation();
  return (
    <PremiumGate
      previewTitle={t("insights.monthlyTrends.previewTitle")}
      previewBody={t("insights.monthlyTrends.previewBody")}
    >
      <MonthlyTrendsContent childId={childId} />
    </PremiumGate>
  );
}

function MonthlyTrendsContent({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useStats(childId, "month");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("insights.monthlyTrends.title")}
        </CardTitle>
        <CardDescription>{t("insights.monthlyTrends.body")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <WeeklyChart
              data={data?.symptoms}
              period="month"
              onPeriodChange={() => undefined}
            />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}

function QuarterlyTrends({ childId }: { childId: string }) {
  const { t } = useTranslation();
  return (
    <PremiumGate
      previewTitle={t("insights.quarterlyTrends.previewTitle")}
      previewBody={t("insights.quarterlyTrends.previewBody")}
    >
      <QuarterlyTrendsContent childId={childId} />
    </PremiumGate>
  );
}

function QuarterlyTrendsContent({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useStats(childId, "quarter");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("insights.quarterlyTrends.title")}
        </CardTitle>
        <CardDescription>{t("insights.quarterlyTrends.body")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <WeeklyChart
              data={data?.symptoms}
              period="quarter"
              onPeriodChange={() => undefined}
            />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}

// Monthly aggregated "calm-minutes" — descriptive total + daily average
// over 30 days. The week-level version of this card already shows on
// the dashboard for free.
function MonthlyCalmMinutes({ childId }: { childId: string }) {
  const { t } = useTranslation();
  return (
    <PremiumGate
      previewTitle={t("insights.calmMinutes.previewTitle")}
      previewBody={t("insights.calmMinutes.previewBody")}
    >
      <MonthlyCalmMinutesContent childId={childId} />
    </PremiumGate>
  );
}

function MonthlyCalmMinutesContent({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useCalmMinutes(childId, "month");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("insights.calmMinutes.title")}
        </CardTitle>
        <CardDescription>{t("insights.calmMinutes.body")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : data && data.totalMinutes > 0 ? (
          <>
            <p>
              {t("insights.calmMinutes.total", {
                minutes: data.totalMinutes,
                days: data.daysWithEntry,
              })}
            </p>
            <p className="text-muted-foreground">
              {t("insights.calmMinutes.average", {
                minutes: Math.round(data.averagePerDay),
              })}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">{t("insights.calmMinutes.empty")}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Behavior↔symptom correlation: surface the strongest pattern from the
// last 28 days. The API endpoint itself is unauth-gated today; the
// surface lives on `/insights` as the premium "deep analysis" home.
function BehaviorCorrelation({ childId }: { childId: string }) {
  const { t } = useTranslation();
  return (
    <PremiumGate
      previewTitle={t("insights.correlation.previewTitle")}
      previewBody={t("insights.correlation.previewBody")}
    >
      <BehaviorCorrelationContent childId={childId} />
    </PremiumGate>
  );
}

function BehaviorCorrelationContent({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useCorrelations(childId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("insights.correlation.title")}
        </CardTitle>
        <CardDescription>{t("insights.correlation.body")}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : data?.insufficientData || !data?.insight ? (
          <p className="text-muted-foreground">
            {t("insights.correlation.insufficient")}
          </p>
        ) : (
          <p>
            {t("insights.correlation.summary", {
              behavior: data.insight.behaviorName,
              dimension: data.insight.dimensionLabel,
              onValue: data.insight.onValue.toFixed(1),
              offValue: data.insight.offValue.toFixed(1),
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

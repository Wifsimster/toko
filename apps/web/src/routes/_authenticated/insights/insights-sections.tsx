import { lazy, Suspense } from "react";
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
import { PremiumGate } from "@/components/shared/premium-gate";
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

const noop = () => undefined;

export function MonthlyTrends({ childId }: { childId: string }) {
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
          <TrendingUp className="size-4 text-brand-strong" aria-hidden="true" />
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
              onPeriodChange={noop}
            />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}

export function QuarterlyTrends({ childId }: { childId: string }) {
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
          <TrendingUp className="size-4 text-brand-strong" aria-hidden="true" />
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
              onPeriodChange={noop}
            />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyCalmMinutes({ childId }: { childId: string }) {
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
          <Sparkles className="size-4 text-brand-strong" aria-hidden="true" />
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

export function BehaviorCorrelation({ childId }: { childId: string }) {
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
          <Sparkles className="size-4 text-brand-strong" aria-hidden="true" />
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

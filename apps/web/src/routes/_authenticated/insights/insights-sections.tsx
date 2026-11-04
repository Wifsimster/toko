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
import { useStats, useCorrelations } from "@/hooks/use-stats";
import { Mo } from "@/components/mo/mo";
import { readTrend } from "@/lib/insight-reading";
import { todayISO } from "@/lib/date";

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

export function TrendReading({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data } = useStats(childId, "month");
  const reading = data ? readTrend(data.symptoms, todayISO()) : undefined;
  if (reading === undefined) return <Skeleton className="h-36 w-full rounded-[28px]" />;

  return (
    <section
      aria-labelledby="trend-reading-title"
      className="relative overflow-hidden rounded-[28px] bg-surface-lavender p-5"
    >
      <Mo state="enquete" size={112} className="absolute right-2 bottom-1 sm:right-4" />
      <p aria-hidden="true" className="font-hand text-[21px] leading-none font-semibold">
        {t("insights.reading.kicker")}
      </p>
      <h2
        id="trend-reading-title"
        className="mt-1 max-w-[calc(100%-7.5rem)] text-[21px] leading-[1.2] font-extrabold tracking-[-0.01em]"
      >
        {reading
          ? t(`insights.reading.${reading.direction}.${reading.dimension}`)
          : t("insights.reading.steady")}
      </h2>
      <p className="mt-2 max-w-[calc(100%-7.5rem)] text-sm text-muted-foreground">
        {reading ? t(`insights.reading.${reading.direction}Hint`) : t("insights.reading.steadyHint")}
      </p>
    </section>
  );
}

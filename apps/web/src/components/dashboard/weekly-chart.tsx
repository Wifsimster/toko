import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StatsPeriod, SymptomPoint } from "@/hooks/use-stats";

const WeeklyChartImpl = lazy(() => import("./weekly-chart-impl"));

export function WeeklyChart({
  data,
  period,
  onPeriodChange,
  lockedPeriods,
}: {
  data?: SymptomPoint[];
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
  /**
   * Periods that the current user can't view inline (typically because
   * they're not on a premium plan). Clicking one of these buttons
   * navigates to `/insights` rather than triggering a silent 403 from
   * the stats API. Free users get the same visual cue (lock icon)
   * regardless of which period they're trying to read.
   */
  lockedPeriods?: ReadonlyArray<StatsPeriod>;
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const lockedSet = new Set(lockedPeriods);

  const dayNames: Record<number, string> = {
    0: t("days.sunShort"),
    1: t("days.monShort"),
    2: t("days.tueShort"),
    3: t("days.wedShort"),
    4: t("days.thuShort"),
    5: t("days.friShort"),
    6: t("days.satShort"),
  };

  const PERIODS: { key: StatsPeriod; label: string }[] = [
    { key: "week", label: t("chart.week") },
    { key: "month", label: t("chart.month") },
    { key: "quarter", label: t("chart.quarter") },
  ];

  const formatLabel = (date: string, p: StatsPeriod): string => {
    const d = new Date(date);
    if (p === "week") {
      return dayNames[d.getDay()] ?? date;
    }
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  const chartData = data?.map((s) => ({
    label: formatLabel(s.date, period),
    mood: s.mood,
    focus: s.focus,
    agitation: s.agitation,
  }));

  const hasData = chartData && chartData.length > 0;

  const title =
    period === "week"
      ? t("chart.titleWeek")
      : period === "month"
        ? t("chart.titleMonth")
        : t("chart.titleQuarter");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-1">
          {PERIODS.map((p) => {
            const isLocked = lockedSet.has(p.key);
            return (
              <Button
                key={p.key}
                variant={period === p.key ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  if (isLocked) {
                    navigate({ to: "/insights" });
                  } else {
                    onPeriodChange(p.key);
                  }
                }}
                className="px-2 text-xs gap-1"
                title={isLocked ? t("chart.lockedTitle") : undefined}
                aria-label={
                  isLocked
                    ? t("chart.lockedAria", { label: p.label })
                    : undefined
                }
              >
                {isLocked && (
                  <Lock className="size-3" aria-hidden="true" />
                )}
                {p.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <Suspense fallback={<div className="h-[200px]" />}>
            <WeeklyChartImpl chartData={chartData} period={period} />
          </Suspense>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t("chart.noData")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

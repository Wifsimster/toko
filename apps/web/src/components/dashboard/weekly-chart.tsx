import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StatsPeriod, SymptomPoint } from "@/hooks/use-stats";

export function WeeklyChart({
  data,
  period,
  onPeriodChange,
}: {
  data?: SymptomPoint[];
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";

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
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? "default" : "ghost"}
              size="sm"
              onClick={() => onPeriodChange(p.key)}
              className="h-7 px-2 text-xs"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: "var(--muted-foreground)" }}
                interval={period === "quarter" ? "preserveStartEnd" : 0}
              />
              <YAxis
                domain={[0, 10]}
                className="text-xs"
                tick={{ fill: "var(--muted-foreground)" }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="mood"
                stackId="1"
                stroke="#f97316"
                fill="#f9731640"
                name={t("chart.seriesMood")}
              />
              <Area
                type="monotone"
                dataKey="focus"
                stackId="2"
                stroke="#10b981"
                fill="#10b98140"
                name={t("chart.seriesFocus")}
              />
              <Area
                type="monotone"
                dataKey="agitation"
                stackId="3"
                stroke="#f43f5e"
                fill="#f43f5e40"
                name={t("chart.seriesAgitation")}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            {t("chart.noData")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

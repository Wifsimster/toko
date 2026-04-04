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

const dayNames: Record<number, string> = {
  0: "Dim",
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Jeu",
  5: "Ven",
  6: "Sam",
};

const PERIODS: { key: StatsPeriod; label: string }[] = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "quarter", label: "Trimestre" },
];

function formatLabel(date: string, period: StatsPeriod): string {
  const d = new Date(date);
  if (period === "week") {
    return dayNames[d.getDay()] ?? date;
  }
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function WeeklyChart({
  data,
  period,
  onPeriodChange,
}: {
  data?: SymptomPoint[];
  period: StatsPeriod;
  onPeriodChange: (p: StatsPeriod) => void;
}) {
  const chartData = data?.map((s) => ({
    label: formatLabel(s.date, period),
    mood: s.mood,
    focus: s.focus,
    agitation: s.agitation,
  }));

  const hasData = chartData && chartData.length > 0;

  const title =
    period === "week"
      ? "Semaine en cours"
      : period === "month"
        ? "30 derniers jours"
        : "90 derniers jours";

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
                name="Régulation ém."
              />
              <Area
                type="monotone"
                dataKey="focus"
                stackId="2"
                stroke="#10b981"
                fill="#10b98140"
                name="Concentration"
              />
              <Area
                type="monotone"
                dataKey="agitation"
                stackId="3"
                stroke="#f43f5e"
                fill="#f43f5e40"
                name="Agitation"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Aucune donnée sur cette période. Ajoutez des relevés de symptômes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

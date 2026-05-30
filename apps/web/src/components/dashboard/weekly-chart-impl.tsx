import { useTranslation } from "react-i18next";
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- this file IS the lazy chunk loaded via React.lazy(); recharts is intentionally here
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { StatsPeriod, SymptomPoint } from "@/hooks/use-stats";

interface ChartData {
  label: string;
  mood?: number;
  focus?: number;
  agitation?: number;
}

export default function WeeklyChartImpl({
  chartData,
  period,
}: {
  chartData: ChartData[];
  period: StatsPeriod;
  data?: SymptomPoint[];
}) {
  const { t } = useTranslation();

  return (
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
        <Legend
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="mood"
          stackId="1"
          stroke="var(--chart-1)"
          fill="var(--chart-1)"
          fillOpacity={0.25}
          name={t("chart.seriesMood")}
        />
        <Area
          type="monotone"
          dataKey="focus"
          stackId="2"
          stroke="var(--chart-2)"
          fill="var(--chart-2)"
          fillOpacity={0.25}
          name={t("chart.seriesFocus")}
        />
        <Area
          type="monotone"
          dataKey="agitation"
          stackId="3"
          stroke="var(--color-status-danger)"
          fill="var(--color-status-danger)"
          fillOpacity={0.25}
          name={t("chart.seriesAgitation")}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

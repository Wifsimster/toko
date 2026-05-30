// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- this file IS the lazy chunk loaded via React.lazy(); recharts is intentionally here
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
import { EVENT_LABELS, EVENT_COLORS } from "./analytics-format";
import type { pivotByDay } from "./analytics-format";

export default function DailyChartImpl({
  series,
}: {
  series: ReturnType<typeof pivotByDay>;
}) {
  return (
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
  );
}

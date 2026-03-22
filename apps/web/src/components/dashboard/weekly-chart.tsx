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

interface SymptomPoint {
  date: string;
  mood: number;
  focus: number;
  agitation: number;
  impulse: number;
  sleep: number;
}

const dayNames: Record<number, string> = {
  0: "Dim",
  1: "Lun",
  2: "Mar",
  3: "Mer",
  4: "Jeu",
  5: "Ven",
  6: "Sam",
};

export function WeeklyChart({ data }: { data?: SymptomPoint[] }) {
  const chartData = data?.map((s) => ({
    day: dayNames[new Date(s.date).getDay()] ?? s.date,
    mood: s.mood,
    focus: s.focus,
    agitation: s.agitation,
  }));

  const hasData = chartData && chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Semaine en cours</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                className="text-xs"
                tick={{ fill: "var(--muted-foreground)" }}
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
                name="Humeur"
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
            Aucune donnée cette semaine. Ajoutez des relevés de symptômes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

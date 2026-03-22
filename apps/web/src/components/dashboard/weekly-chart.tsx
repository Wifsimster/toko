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

const placeholderData = [
  { day: "Lun", mood: 3, focus: 5, agitation: 4 },
  { day: "Mar", mood: 4, focus: 6, agitation: 3 },
  { day: "Mer", mood: 3, focus: 4, agitation: 5 },
  { day: "Jeu", mood: 2, focus: 3, agitation: 7 },
  { day: "Ven", mood: 4, focus: 7, agitation: 2 },
  { day: "Sam", mood: 5, focus: 6, agitation: 3 },
  { day: "Dim", mood: 4, focus: 5, agitation: 4 },
];

export function WeeklyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Semaine en cours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={placeholderData}>
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
      </CardContent>
    </Card>
  );
}

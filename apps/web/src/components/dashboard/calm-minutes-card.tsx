import { useTranslation } from "react-i18next";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCalmMinutes } from "@/hooks/use-stats";

// Business rule H1: north-star KPI displayed on the dashboard.
// Shows the total minutes of calm earned over the last 7 days plus the
// daily average.
export function CalmMinutesCard({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data } = useCalmMinutes(childId, "week");

  if (!data) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Leaf className="h-4 w-4 text-primary" />
          {t("calmMinutes.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-3xl font-semibold tabular-nums">
          {t("calmMinutes.total", { minutes: data.totalMinutes })}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.daysWithEntry > 0
            ? t("calmMinutes.average", {
                minutes: data.averagePerDay,
                days: data.daysWithEntry,
              })
            : t("calmMinutes.empty")}
        </p>
      </CardContent>
    </Card>
  );
}

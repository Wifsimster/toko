import { useTranslation } from "react-i18next";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCalmMinutes } from "@/hooks/use-stats";

export function CalmMinutesCard({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data } = useCalmMinutes(childId, "week");

  if (!data) return null;

  return (
    <Card className="border-brand/20 bg-brand/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Leaf className="size-4 text-brand-strong" />
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

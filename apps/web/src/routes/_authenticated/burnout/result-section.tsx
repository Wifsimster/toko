import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportResources } from "./support-resources";

type Zone = "green" | "orange" | "red";

function zoneFromScore(score: number): Zone {
  if (score <= 6) return "green";
  if (score <= 13) return "orange";
  return "red";
}

const zoneClasses: Record<Zone, string> = {
  green:
    "border-success-border bg-success-surface text-success-foreground",
  orange:
    "border-warning-border bg-warning-surface text-warning-foreground",
  red:
    "border-destructive/40 bg-destructive/10 text-destructive",
};

export function ResultSection({
  score,
  onReset,
}: {
  score: number;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const zone = zoneFromScore(score);

  return (
    <div className="space-y-4">
      <Card className={cn("border-2", zoneClasses[zone])}>
        <CardContent className="py-5 space-y-2">
          <p className="text-xs uppercase tracking-wide opacity-80">
            {t(`burnout.zone.${zone}.label`)}
          </p>
          <p className="text-base font-semibold leading-relaxed">
            {t(`burnout.zone.${zone}.title`)}
          </p>
          <p className="text-sm leading-relaxed">
            {t(`burnout.zone.${zone}.body`)}
          </p>
          <p className="text-xs opacity-80">
            {t("burnout.scoreOutOf", { score, total: 21 })}
          </p>
        </CardContent>
      </Card>

      {zone === "red" && <SupportResources />}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="size-4" />
          {t("burnout.retake")}
        </Button>
      </div>
    </div>
  );
}

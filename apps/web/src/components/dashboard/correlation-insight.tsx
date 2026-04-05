import { useTranslation, Trans } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCorrelations } from "@/hooks/use-stats";

export function CorrelationInsight({ childId }: { childId: string }) {
  const { t } = useTranslation();
  const { data } = useCorrelations(childId);

  if (!data || data.insufficientData || !data.insight) return null;

  const { insight } = data;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("correlation.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">
          <Trans
            i18nKey="correlation.body"
            values={{
              behavior: insight.behaviorName,
              dimension: insight.dimensionLabel,
              on: insight.onValue,
              off: insight.offValue,
            }}
            components={{
              1: <strong className="text-foreground" />,
              3: <strong className="text-foreground" />,
              5: <strong className="text-foreground" />,
            }}
          />
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("correlation.footer", {
            delta: insight.delta,
            days: insight.sampleOn + insight.sampleOff,
            onCount: insight.sampleOn,
            offCount: insight.sampleOff,
          })}
        </p>
      </CardContent>
    </Card>
  );
}

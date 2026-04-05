import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCorrelations } from "@/hooks/use-stats";

export function CorrelationInsight({ childId }: { childId: string }) {
  const { data } = useCorrelations(childId);

  if (!data || data.insufficientData || !data.insight) return null;

  const { insight } = data;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Ce qui fonctionne pour votre enfant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">
          Quand{" "}
          <strong className="text-foreground">
            « {insight.behaviorName} »
          </strong>{" "}
          est validé, {insight.dimensionLabel} est en moyenne à{" "}
          <strong className="text-foreground">{insight.onValue}/10</strong>.
          Sinon, à{" "}
          <strong className="text-foreground">{insight.offValue}/10</strong>.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Écart de {insight.delta} points sur {insight.sampleOn + insight.sampleOff}{" "}
          jours observés ({insight.sampleOn} oui · {insight.sampleOff} non).
        </p>
      </CardContent>
    </Card>
  );
}

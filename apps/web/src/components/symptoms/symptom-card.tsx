import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Symptom } from "@focusflow/validators";

export const dimensionLabels: Record<string, { label: string; color: string }> = {
  agitation: { label: "Agitation", color: "bg-status-danger" },
  focus: { label: "Concentration", color: "bg-status-success" },
  impulse: { label: "Impulsivité", color: "bg-status-warning" },
  mood: { label: "Régulation ém.", color: "bg-primary" },
  sleep: { label: "Sommeil", color: "bg-chart-5" },
  social: { label: "Comp. social", color: "bg-chart-4" },
  autonomy: { label: "Autonomie", color: "bg-chart-2" },
};

export function SymptomCard({ symptom }: { symptom: Symptom }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {new Date(symptom.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardTitle>
          {symptom.context && (
            <Badge variant="secondary">{symptom.context}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(dimensionLabels).map(([key, { label, color }]) => {
          const value = symptom[key as keyof typeof symptom] as number;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}/10</span>
              </div>
              <Progress value={value * 10} className={`h-2 ${color}`} />
            </div>
          );
        })}
        {symptom.notes && (
          <p className="mt-2 text-sm text-muted-foreground">{symptom.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

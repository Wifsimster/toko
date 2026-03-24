import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteSymptom } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
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

export function SymptomCard({
  symptom,
  onEdit,
}: {
  symptom: Symptom;
  onEdit: (symptom: Symptom) => void;
}) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const deleteSymptom = useDeleteSymptom();

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
          <div className="flex items-center gap-1">
            {symptom.context && (
              <Badge variant="secondary">{symptom.context}</Badge>
            )}
            <button
              onClick={() => onEdit(symptom)}
              className="rounded p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    disabled={deleteSymptom.isPending}
                    className="rounded p-1.5 text-muted-foreground/30 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce relevé ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Les données de ce relevé
                    seront définitivement supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      activeChildId &&
                      deleteSymptom.mutate({
                        id: symptom.id,
                        childId: activeChildId,
                      })
                    }
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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

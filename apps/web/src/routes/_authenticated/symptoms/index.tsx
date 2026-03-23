import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { useSymptoms } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";
import type { Symptom } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/symptoms/")({
  component: SymptomsPage,
});

function SymptomsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: symptoms, isLoading } = useSymptoms(activeChildId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Symptômes</h1>
          <p className="text-muted-foreground">
            Suivi quotidien des symptômes TDAH
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau relevé</DialogTitle>
            </DialogHeader>
            <SymptomForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour voir ses symptômes.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !symptoms?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun relevé de symptômes. Commencez par en ajouter un.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {symptoms.map((symptom) => (
            <SymptomCard key={symptom.id} symptom={symptom} />
          ))}
        </div>
      )}
    </div>
  );
}

const dimensionLabels: Record<string, { label: string; color: string }> = {
  agitation: { label: "Agitation", color: "bg-status-danger" },
  focus: { label: "Concentration", color: "bg-status-success" },
  impulse: { label: "Impulsivité", color: "bg-status-warning" },
  mood: { label: "Humeur", color: "bg-primary" },
  sleep: { label: "Sommeil", color: "bg-chart-5" },
};

function SymptomCard({ symptom }: { symptom: Symptom }) {
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

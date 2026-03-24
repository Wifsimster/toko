import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/page-loader";
import { SymptomForm } from "@/components/symptoms/symptom-form";
import { SymptomCard } from "@/components/symptoms/symptom-card";
import { useSymptoms } from "@/hooks/use-symptoms";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/symptoms/")({
  component: SymptomsPage,
});

function SymptomsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: symptoms, isLoading } = useSymptoms(activeChildId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Symptômes</h1>
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

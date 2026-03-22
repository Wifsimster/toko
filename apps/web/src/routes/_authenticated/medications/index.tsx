import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Clock, Check, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMedications, useCreateMedication } from "@/hooks/use-medications";
import { useUiStore } from "@/stores/ui-store";
import type { Medication } from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/medications/")({
  component: MedicationsPage,
});

function MedicationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: medications, isLoading } = useMedications(activeChildId ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Médicaments</h1>
          <p className="text-muted-foreground">
            Gestion des traitements et rappels
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
              <DialogTitle>Nouveau médicament</DialogTitle>
            </DialogHeader>
            <MedicationForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour voir ses médicaments.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !medications?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun médicament enregistré.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {medications.map((med) => (
            <MedicationCard key={med.id} medication={med} />
          ))}
        </div>
      )}
    </div>
  );
}

function MedicationCard({ medication }: { medication: Medication }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{medication.name}</CardTitle>
          <Badge variant={medication.active ? "default" : "secondary"}>
            {medication.active ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{medication.dose}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{medication.scheduledAt}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Check className="mr-1 h-3.5 w-3.5 text-status-success" />
            Pris
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <X className="mr-1 h-3.5 w-3.5 text-status-danger" />
            Sauté
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MedicationForm({ onSuccess }: { onSuccess: () => void }) {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const createMedication = useCreateMedication();
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [scheduledAt, setScheduledAt] = useState("08:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    createMedication.mutate(
      {
        childId: activeChildId,
        name,
        dose,
        scheduledAt,
        active: true,
      },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du médicament</Label>
        <Input
          id="name"
          placeholder="Ex: Ritaline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dose">Dosage</Label>
        <Input
          id="dose"
          placeholder="Ex: 10mg"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">Heure de prise</Label>
        <Input
          id="time"
          type="time"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || createMedication.isPending}
      >
        {createMedication.isPending ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  );
}

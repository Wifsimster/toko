import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/page-loader";
import {
  useMedications,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
} from "@/hooks/use-medications";
import { useUiStore } from "@/stores/ui-store";
import { todayISO } from "@/lib/date";
import type {
  Medication,
  MedicationSchedule,
} from "@focusflow/validators";

export const Route = createFileRoute("/_authenticated/medications/")({
  component: MedicationsPage,
});

const SCHEDULE_LABELS: Record<MedicationSchedule, string> = {
  morning: "Matin",
  noon: "Midi",
  evening: "Soir",
  bedtime: "Coucher",
  custom: "Personnalisé",
};

function MedicationsPage() {
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: meds, isLoading } = useMedications(activeChildId ?? "");
  const deleteMed = useDeleteMedication();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (med: Medication) => {
    setEditing(med);
    setFormOpen(true);
  };

  const handleDelete = (med: Medication) => {
    if (!activeChildId) return;
    deleteMed.mutate({ id: med.id, childId: activeChildId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Traitements
          </h1>
          <p className="text-muted-foreground">
            Suivi des médicaments et de l'observance
          </p>
        </div>
        <Button onClick={openCreate} disabled={!activeChildId}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un enfant pour gérer ses traitements.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !meds?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Pill className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Aucun traitement enregistré. Ajoutez-en un pour suivre
              l'observance au quotidien.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {meds.map((med) => (
            <Card key={med.id}>
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{med.name}</p>
                    {!med.active && (
                      <Badge variant="outline" className="text-xs">
                        Arrêté
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {med.dose ? `${med.dose} · ` : ""}
                    {SCHEDULE_LABELS[med.schedule as MedicationSchedule]}
                    {med.notes ? ` · ${med.notes}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(med)}
                    aria-label="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(med)}
                    disabled={deleteMed.isPending}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le traitement" : "Nouveau traitement"}
            </DialogTitle>
          </DialogHeader>
          {activeChildId && (
            <MedicationForm
              key={editing?.id ?? "create"}
              childId={activeChildId}
              initialData={editing}
              onSuccess={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MedicationForm({
  childId,
  initialData,
  onSuccess,
}: {
  childId: string;
  initialData: Medication | null;
  onSuccess: () => void;
}) {
  const createMed = useCreateMedication();
  const updateMed = useUpdateMedication();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [dose, setDose] = useState(initialData?.dose ?? "");
  const [schedule, setSchedule] = useState<MedicationSchedule>(
    (initialData?.schedule as MedicationSchedule) ?? "morning"
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate ?? todayISO()
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [active, setActive] = useState(initialData?.active ?? true);

  const isPending = createMed.isPending || updateMed.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      dose: dose || undefined,
      schedule,
      startDate,
      notes: notes || undefined,
      active,
    };

    if (isEdit && initialData) {
      updateMed.mutate(
        { id: initialData.id, childId, ...payload },
        { onSuccess }
      );
    } else {
      createMed.mutate({ childId, ...payload }, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="med-name">Nom du traitement</Label>
        <Input
          id="med-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Méthylphénidate"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-dose">Dose (facultatif)</Label>
        <Input
          id="med-dose"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="Ex: 10 mg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-schedule">Moment de la prise</Label>
        <Select
          value={schedule}
          onValueChange={(v) => v && setSchedule(v as MedicationSchedule)}
          items={SCHEDULE_LABELS}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(SCHEDULE_LABELS) as [MedicationSchedule, string][]
            ).map(([key, label]) => (
              <SelectItem key={key} value={key} label={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-start">Date de début</Label>
        <Input
          id="med-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-notes">Notes (facultatif)</Label>
        <Textarea
          id="med-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Effets secondaires à surveiller, consignes…"
          rows={2}
        />
      </div>
      {isEdit && (
        <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
          <Label htmlFor="med-active" className="cursor-pointer text-sm">
            Traitement en cours
          </Label>
          <input
            id="med-active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={!name || isPending}
      >
        {isPending
          ? "Enregistrement..."
          : isEdit
            ? "Enregistrer"
            : "Ajouter"}
      </Button>
    </form>
  );
}

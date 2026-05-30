import { useReducer, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PageHeader } from "@/components/layout/page-header";
import { CreatedByLabel } from "@/components/shared/created-by-label";
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
  staticData: {
    crumb: "nav.medications",
  },
});

function useScheduleLabels(): Record<MedicationSchedule, string> {
  const { t } = useTranslation();
  return {
    morning: t("medications.scheduleMorning"),
    noon: t("medications.scheduleNoon"),
    evening: t("medications.scheduleEvening"),
    bedtime: t("medications.scheduleBedtime"),
    custom: t("medications.scheduleCustom"),
  };
}

function MedicationsPage() {
  const { t } = useTranslation();
  const SCHEDULE_LABELS = useScheduleLabels();
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
      <PageHeader
        title={t("medications.title")}
        description={t("medications.subtitle")}
        actions={
          <Button onClick={openCreate} disabled={!activeChildId}>
            <Plus className="mr-2 size-4" />
            {t("medications.add")}
          </Button>
        }
      />

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("medications.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !meds?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Pill className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t("medications.emptyState")}</p>
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
                        {t("medications.stopped")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {med.dose ? `${med.dose} · ` : ""}
                    {SCHEDULE_LABELS[med.schedule as MedicationSchedule]}
                    {med.notes ? ` · ${med.notes}` : ""}
                  </p>
                  <CreatedByLabel name={med.createdByName} />
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(med)}
                    aria-label={t("medications.edit")}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(med)}
                    disabled={deleteMed.isPending}
                    aria-label={t("medications.delete")}
                  >
                    <Trash2 className="size-4" />
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
              {editing ? t("medications.editTitle") : t("medications.newTitle")}
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

type MedFormState = {
  name: string;
  dose: string;
  schedule: MedicationSchedule;
  startDate: string;
  notes: string;
  active: boolean;
};

type MedFormAction =
  | { type: "SET_NAME"; value: string }
  | { type: "SET_DOSE"; value: string }
  | { type: "SET_SCHEDULE"; value: MedicationSchedule }
  | { type: "SET_START_DATE"; value: string }
  | { type: "SET_NOTES"; value: string }
  | { type: "SET_ACTIVE"; value: boolean };

function medFormReducer(state: MedFormState, action: MedFormAction): MedFormState {
  switch (action.type) {
    case "SET_NAME": return { ...state, name: action.value };
    case "SET_DOSE": return { ...state, dose: action.value };
    case "SET_SCHEDULE": return { ...state, schedule: action.value };
    case "SET_START_DATE": return { ...state, startDate: action.value };
    case "SET_NOTES": return { ...state, notes: action.value };
    case "SET_ACTIVE": return { ...state, active: action.value };
  }
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
  const { t } = useTranslation();
  const SCHEDULE_LABELS = useScheduleLabels();
  const createMed = useCreateMedication();
  const updateMed = useUpdateMedication();
  const isEdit = !!initialData;

  const [state, dispatch] = useReducer(medFormReducer, {
    name: initialData?.name ?? "",
    dose: initialData?.dose ?? "",
    schedule: (initialData?.schedule as MedicationSchedule) ?? "morning",
    startDate: initialData?.startDate ?? todayISO(),
    notes: initialData?.notes ?? "",
    active: initialData?.active ?? true,
  });

  const { name, dose, schedule, startDate, notes, active } = state;
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
        <Label htmlFor="med-name">{t("medications.nameLabel")}</Label>
        <Input
          id="med-name"
          value={name}
          onChange={(e) => dispatch({ type: "SET_NAME", value: e.target.value })}
          placeholder={t("medications.namePlaceholder")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-dose">{t("medications.doseLabel")}</Label>
        <Input
          id="med-dose"
          value={dose}
          onChange={(e) => dispatch({ type: "SET_DOSE", value: e.target.value })}
          placeholder={t("medications.dosePlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-schedule">{t("medications.scheduleLabel")}</Label>
        <Select
          value={schedule}
          onValueChange={(v) => v && dispatch({ type: "SET_SCHEDULE", value: v as MedicationSchedule })}
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
        <Label htmlFor="med-start">{t("medications.startLabel")}</Label>
        <Input
          id="med-start"
          type="date"
          value={startDate}
          onChange={(e) => dispatch({ type: "SET_START_DATE", value: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="med-notes">{t("medications.notesLabel")}</Label>
        <Textarea
          id="med-notes"
          value={notes}
          onChange={(e) => dispatch({ type: "SET_NOTES", value: e.target.value })}
          placeholder={t("medications.notesPlaceholder")}
          rows={2}
        />
      </div>
      {isEdit && (
        <label
          htmlFor="med-active"
          className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-2.5 text-sm"
        >
          <span>{t("medications.activeLabel")}</span>
          <Checkbox
            id="med-active"
            className="size-5"
            checked={active}
            onCheckedChange={(checked) => dispatch({ type: "SET_ACTIVE", value: checked === true })}
          />
        </label>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={!name || isPending}
      >
        {isPending
          ? t("medications.saving")
          : isEdit
            ? t("medications.save")
            : t("medications.addButton")}
      </Button>
    </form>
  );
}

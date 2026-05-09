import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Plus,
  ListChecks,
  Pencil,
  Trash2,
  Sun,
  Moon,
  Coffee,
  CloudSun,
  Sparkles,
  Check,
  Timer,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { EmojiPicker, CRISIS_EMOJIS } from "@/components/emoji-picker";
import { useUiStore } from "@/stores/ui-store";
import {
  useRoutines,
  useRoutineCompletions,
  useCreateRoutine,
  useUpdateRoutine,
  useUpsertRoutineSteps,
  useDeleteRoutine,
  useCompleteStep,
  useUncompleteStep,
} from "@/hooks/use-routines";
import type { Routine, TimeOfDay } from "@focusflow/validators";

const TIME_SLOTS: { value: TimeOfDay; iconKey: string }[] = [
  { value: "morning", iconKey: "morning" },
  { value: "noon", iconKey: "noon" },
  { value: "evening", iconKey: "evening" },
  { value: "bedtime", iconKey: "bedtime" },
  { value: "anytime", iconKey: "anytime" },
];

function timeIcon(slot: TimeOfDay) {
  switch (slot) {
    case "morning":
      return Sun;
    case "noon":
      return CloudSun;
    case "evening":
      return Coffee;
    case "bedtime":
      return Moon;
    case "anytime":
    default:
      return Sparkles;
  }
}

function todayIso() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function todayDayOfWeek() {
  // JS Sunday=0 … Saturday=6 — convert to Monday=0 … Sunday=6 to match model.
  const js = new Date().getDay();
  return (js + 6) % 7;
}

export default function RoutinesPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const today = todayIso();

  const { data: routines, isLoading } = useRoutines(activeChildId ?? "");
  const { data: completions } = useRoutineCompletions(
    activeChildId ?? "",
    today,
  );

  const [routineDialogOpen, setRoutineDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [stepEditorRoutine, setStepEditorRoutine] = useState<Routine | null>(
    null,
  );

  const completedStepIds = useMemo(
    () => new Set((completions ?? []).map((c) => c.stepId)),
    [completions],
  );

  const dow = todayDayOfWeek();
  const todaysRoutines = useMemo(() => {
    return (routines ?? []).filter((r) => {
      if (!r.active) return false;
      if (r.daysOfWeek.length === 0) return true;
      return r.daysOfWeek.includes(dow);
    });
  }, [routines, dow]);

  const otherRoutines = useMemo(() => {
    return (routines ?? []).filter((r) => !todaysRoutines.includes(r));
  }, [routines, todaysRoutines]);

  const openCreate = () => {
    setEditingRoutine(null);
    setRoutineDialogOpen(true);
  };
  const openEdit = (r: Routine) => {
    setEditingRoutine(r);
    setRoutineDialogOpen(true);
  };
  const closeDialog = () => {
    setRoutineDialogOpen(false);
    setEditingRoutine(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("routines.title")}
        description={t("routines.subtitle")}
        actions={
          <Button onClick={openCreate} disabled={!activeChildId}>
            <Plus className="mr-2 h-4 w-4" />
            {t("routines.addButton")}
          </Button>
        }
      />

      <Dialog
        open={routineDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRoutine
                ? t("routines.editTitle")
                : t("routines.newTitle")}
            </DialogTitle>
          </DialogHeader>
          <RoutineForm
            key={editingRoutine?.id ?? "create"}
            initialData={editingRoutine}
            onSuccess={closeDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!stepEditorRoutine}
        onOpenChange={(open) => !open && setStepEditorRoutine(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {t("routines.stepsEditorTitle", {
                name: stepEditorRoutine?.name ?? "",
              })}
            </DialogTitle>
          </DialogHeader>
          {stepEditorRoutine && (
            <StepsEditor
              key={stepEditorRoutine.id}
              routine={stepEditorRoutine}
              onSuccess={() => setStepEditorRoutine(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("routines.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : !routines?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              {t("routines.emptyTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("routines.emptyBody")}
            </p>
            <Button onClick={openCreate} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              {t("routines.createFirst")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("routines.todaySection")}
            </h2>
            {todaysRoutines.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  {t("routines.noneToday")}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {todaysRoutines.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    today={today}
                    completedStepIds={completedStepIds}
                    onEdit={() => openEdit(r)}
                    onEditSteps={() => setStepEditorRoutine(r)}
                  />
                ))}
              </div>
            )}
          </section>

          {otherRoutines.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("routines.otherSection")}
              </h2>
              <div className="grid gap-3">
                {otherRoutines.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    today={today}
                    completedStepIds={completedStepIds}
                    onEdit={() => openEdit(r)}
                    onEditSteps={() => setStepEditorRoutine(r)}
                    muted
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function RoutineCard({
  routine,
  today,
  completedStepIds,
  onEdit,
  onEditSteps,
  muted = false,
}: {
  routine: Routine;
  today: string;
  completedStepIds: Set<string>;
  onEdit: () => void;
  onEditSteps: () => void;
  muted?: boolean;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId)!;
  const completeStep = useCompleteStep();
  const uncompleteStep = useUncompleteStep();
  const deleteRoutine = useDeleteRoutine();

  const Icon = timeIcon(routine.timeOfDay);
  const total = routine.steps.length;
  const done = routine.steps.filter((s) => completedStepIds.has(s.id)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  const toggleStep = (stepId: string) => {
    if (completedStepIds.has(stepId)) {
      uncompleteStep.mutate({
        routineId: routine.id,
        childId: activeChildId,
        stepId,
        date: today,
      });
    } else {
      completeStep.mutate({
        routineId: routine.id,
        childId: activeChildId,
        stepId,
        date: today,
      });
    }
  };

  return (
    <Card className={muted ? "opacity-70" : ""}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl">
            {routine.emoji || <Icon className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">
              {routine.name}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              {t(`routines.timeSlot.${routine.timeOfDay}`)}
              {total > 0 && (
                <span className="ml-1">
                  · {done} / {total} {t("routines.done")}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditSteps}
            aria-label={t("routines.editSteps")}
          >
            <ListChecks className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={t("routines.edit")}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("routines.delete")}
                  disabled={deleteRoutine.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("routines.deleteTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("routines.deleteBody", { name: routine.name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("routines.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteRoutine.mutate({
                      id: routine.id,
                      childId: activeChildId,
                    })
                  }
                >
                  {t("routines.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {total > 0 && <Progress value={percent} />}
        {total === 0 ? (
          <button
            type="button"
            onClick={onEditSteps}
            className="w-full rounded-md border border-dashed py-4 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            {t("routines.addStepsCta")}
          </button>
        ) : (
          <ul className="grid gap-2">
            {routine.steps.map((step) => {
              const isDone = completedStepIds.has(step.id);
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    aria-pressed={isDone}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      isDone
                        ? "bg-success-surface border-success-border text-success-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl transition-colors ${
                        isDone
                          ? "bg-success-foreground text-background"
                          : "bg-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.emoji || "·"
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {step.label}
                    </span>
                    {step.durationMinutes && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        {step.durationMinutes} {t("routines.minutes")}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {allDone && (
          <p className="flex items-center justify-center gap-2 rounded-md bg-success-surface px-3 py-2 text-sm font-medium text-success-foreground">
            <Sparkles className="h-4 w-4" />
            {t("routines.allDoneCelebration")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RoutineForm({
  initialData,
  onSuccess,
}: {
  initialData: Routine | null;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const create = useCreateRoutine();
  const update = useUpdateRoutine();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    initialData?.timeOfDay ?? "morning",
  );
  const [days, setDays] = useState<number[]>(initialData?.daysOfWeek ?? []);

  const isPending = create.isPending || update.isPending;

  const toggleDay = (d: number) => {
    setDays((curr) =>
      curr.includes(d) ? curr.filter((x) => x !== d) : [...curr, d].sort(),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;
    if (isEdit) {
      update.mutate(
        {
          id: initialData.id,
          childId: activeChildId,
          name,
          emoji: emoji || null,
          timeOfDay,
          daysOfWeek: days,
        },
        { onSuccess },
      );
    } else {
      create.mutate(
        {
          childId: activeChildId,
          name,
          emoji: emoji || undefined,
          timeOfDay,
          daysOfWeek: days,
          steps: [],
        },
        { onSuccess },
      );
    }
  };

  const dayLabels = [
    t("days.monShort"),
    t("days.tueShort"),
    t("days.wedShort"),
    t("days.thuShort"),
    t("days.friShort"),
    t("days.satShort"),
    t("days.sunShort"),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="routine-name">{t("routines.namePrompt")}</Label>
        <div className="flex gap-2">
          <EmojiPicker
            value={emoji}
            onSelect={setEmoji}
            emojis={CRISIS_EMOJIS}
            columns={5}
            placeholder="🌞"
          >
            <button
              type="button"
              aria-label={t("routines.chooseEmoji")}
              className="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{emoji || <span className="opacity-50">🌞</span>}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </EmojiPicker>
          <Input
            id="routine-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("routines.namePlaceholder")}
            required
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("routines.timeSlotLabel")}</Label>
        <Select
          value={timeOfDay}
          onValueChange={(v) => v && setTimeOfDay(v as TimeOfDay)}
          items={Object.fromEntries(
            TIME_SLOTS.map((s) => [s.value, t(`routines.timeSlot.${s.value}`)]),
          )}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((s) => {
              const label = t(`routines.timeSlot.${s.value}`);
              return (
                <SelectItem key={s.value} value={s.value} label={label}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("routines.daysLabel")}</Label>
        <p className="text-xs text-muted-foreground">
          {t("routines.daysHint")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {dayLabels.map((label, idx) => {
            const selected = days.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDay(idx)}
                className={`min-w-[3rem] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!activeChildId || !name || isPending}
      >
        {isPending
          ? t("routines.saving")
          : isEdit
            ? t("routines.save")
            : t("routines.create")}
      </Button>
    </form>
  );
}

type StepDraft = {
  id?: string;
  label: string;
  emoji: string | null;
  durationMinutes: number | null;
};

function StepsEditor({
  routine,
  onSuccess,
}: {
  routine: Routine;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId)!;
  const upsert = useUpsertRoutineSteps();

  const [steps, setSteps] = useState<StepDraft[]>(
    routine.steps.map((s) => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      durationMinutes: s.durationMinutes,
    })),
  );

  const update = (i: number, patch: Partial<StepDraft>) =>
    setSteps((curr) =>
      curr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  const remove = (i: number) =>
    setSteps((curr) => curr.filter((_, idx) => idx !== i));
  const add = () =>
    setSteps((curr) => [
      ...curr,
      { label: "", emoji: null, durationMinutes: null },
    ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = steps
      .map((s) => ({
        ...s,
        label: s.label.trim(),
      }))
      .filter((s) => s.label.length > 0);
    upsert.mutate(
      { id: routine.id, childId: activeChildId, steps: cleaned },
      { onSuccess },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {t("routines.stepsHint")}
      </p>
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li
            key={s.id ?? `new-${i}`}
            className="flex items-center gap-2 rounded-md border bg-background p-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
              {i + 1}
            </span>
            <Input
              value={s.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder={t("routines.stepPlaceholder")}
              className="flex-1"
            />
            <Input
              type="number"
              min={1}
              max={180}
              value={s.durationMinutes ?? ""}
              onChange={(e) =>
                update(i, {
                  durationMinutes: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              placeholder={t("routines.minutesShort")}
              aria-label={t("routines.stepDuration")}
              className="w-20"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              aria-label={t("routines.removeStep")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="w-full"
        disabled={steps.length >= 20}
      >
        <Plus className="mr-2 h-4 w-4" />
        {t("routines.addStep")}
      </Button>
      <Button type="submit" className="w-full" disabled={upsert.isPending}>
        {upsert.isPending ? t("routines.saving") : t("routines.saveSteps")}
      </Button>
    </form>
  );
}

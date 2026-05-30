import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
  ChevronUp,
  Heart,
  Info,
  X,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { CreatedByLabel } from "@/components/shared/created-by-label";
import { EmojiPicker, ROUTINE_STEP_EMOJIS } from "@/components/emoji-picker";
import { useUiStore } from "@/stores/ui-store";
import {
  useRoutines,
  useRoutineCompletions,
  useCreateRoutine,
  useAdoptRoutineTemplate,
  useUpdateRoutine,
  useUpsertRoutineSteps,
  useDeleteRoutine,
  useCompleteStep,
  useUncompleteStep,
} from "@/hooks/use-routines";
import {
  ROUTINE_TEMPLATES,
  type Routine,
  type RoutineTemplate,
  type TimeOfDay,
} from "@focusflow/validators";

const PATIENCE_DISMISSED_KEY = "toko.routines.patience-dismissed";
const TEMPLATES_INITIAL_VISIBLE = 5;

type DialogState = {
  routineDialogOpen: boolean;
  editingRoutine: Routine | null;
  stepEditorRoutine: Routine | null;
  templatesOpen: boolean;
};
type DialogAction =
  | { type: "openCreate" }
  | { type: "openEdit"; routine: Routine }
  | { type: "closeRoutineDialog" }
  | { type: "setStepEditor"; routine: Routine | null }
  | { type: "setTemplatesOpen"; open: boolean };

const DIALOG_INITIAL: DialogState = {
  routineDialogOpen: false,
  editingRoutine: null,
  stepEditorRoutine: null,
  templatesOpen: false,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case "openCreate":
      return { ...state, routineDialogOpen: true, editingRoutine: null };
    case "openEdit":
      return { ...state, routineDialogOpen: true, editingRoutine: action.routine };
    case "closeRoutineDialog":
      return { ...state, routineDialogOpen: false, editingRoutine: null };
    case "setStepEditor":
      return { ...state, stepEditorRoutine: action.routine };
    case "setTemplatesOpen":
      return { ...state, templatesOpen: action.open };
    default:
      return state;
  }
}

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
  const adoptTemplate = useAdoptRoutineTemplate();

  const [dialogs, dispatchDialog] = useReducer(dialogReducer, DIALOG_INITIAL);
  const { routineDialogOpen, editingRoutine, stepEditorRoutine, templatesOpen } = dialogs;
  const [patienceVisible, setPatienceVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(PATIENCE_DISMISSED_KEY);
    if (dismissed === "1") return;
    if ((routines?.length ?? 0) > 0) setPatienceVisible(true);
  }, [routines?.length]);

  const dismissPatience = () => {
    setPatienceVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PATIENCE_DISMISSED_KEY, "1");
    }
  };

  const handleAdoptTemplate = (template: RoutineTemplate) => {
    if (!activeChildId) return;
    adoptTemplate.mutate(
      { childId: activeChildId, templateKey: template.key },
      {
        onSuccess: (created) => {
          dispatchDialog({ type: "setTemplatesOpen", open: false });
          toast.success(
            t("routines.templates.adoptedToast", { name: template.title }),
            {
              action: {
                label: t("routines.templates.personalize"),
                onClick: () => dispatchDialog({ type: "setStepEditor", routine: created }),
              },
            },
          );
        },
      },
    );
  };

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

  const openCreate = () => dispatchDialog({ type: "openCreate" });
  const openEdit = (r: Routine) => dispatchDialog({ type: "openEdit", routine: r });
  const closeDialog = () => dispatchDialog({ type: "closeRoutineDialog" });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("routines.title")}
        description={t("routines.subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => dispatchDialog({ type: "setTemplatesOpen", open: true })}
              disabled={!activeChildId}
            >
              <Sparkles className="mr-2 size-4" />
              {t("routines.templates.fromTemplateButton")}
            </Button>
            <Button onClick={openCreate} disabled={!activeChildId}>
              <Plus className="mr-2 size-4" />
              {t("routines.addButton")}
            </Button>
          </div>
        }
      />

      <Dialog
        open={templatesOpen}
        onOpenChange={(open) => dispatchDialog({ type: "setTemplatesOpen", open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("routines.templates.modalTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("routines.templates.modalIntro")}
          </p>
          <TemplatesList
            onPick={handleAdoptTemplate}
            disabled={adoptTemplate.isPending || !activeChildId}
            initiallyExpanded
          />
        </DialogContent>
      </Dialog>

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
        onOpenChange={(open) => !open && dispatchDialog({ type: "setStepEditor", routine: null })}
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
              onSuccess={() => dispatchDialog({ type: "setStepEditor", routine: null })}
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
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">
              {t("routines.templates.startHereHeading")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("routines.templates.startHereIntro")}
            </p>
          </div>
          <TemplatesList
            onPick={handleAdoptTemplate}
            disabled={adoptTemplate.isPending}
          />
          <button
            type="button"
            onClick={openCreate}
            className="block w-full rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Plus className="mr-1 inline size-4" />
            {t("routines.templates.createFromScratch")}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {patienceVisible && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Heart
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">
                  {t("routines.templates.patienceTitle")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("routines.templates.patienceBody")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismissPatience}
                aria-label={t("routines.templates.patienceDismiss")}
                className="size-8 shrink-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
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
                    onEditSteps={() => dispatchDialog({ type: "setStepEditor", routine: r })}
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
                    onEditSteps={() => dispatchDialog({ type: "setStepEditor", routine: r })}
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

  // Default to expanded for today's actionable routines, collapsed otherwise
  // (other-days section, or routines already finished). Less to scroll past
  // first thing in the morning.
  const [expanded, setExpanded] = useState(!muted && !allDone);

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
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={`routine-body-${routine.id}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl">
            {routine.emoji || <Icon className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              {routine.name}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="size-3" />
              {t(`routines.timeSlot.${routine.timeOfDay}`)}
              {total > 0 && (
                <span className="ml-1">
                  · {done} / {total} {t("routines.done")}
                </span>
              )}
            </p>
            <CreatedByLabel name={routine.createdByName} />
          </div>
          <ChevronDown
            aria-hidden="true"
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditSteps}
            aria-label={t("routines.editSteps")}
          >
            <ListChecks className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={t("routines.edit")}
          >
            <Pencil className="size-4" />
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
                  <Trash2 className="size-4" />
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
      <CardContent
        id={`routine-body-${routine.id}`}
        className="space-y-3"
      >
        {total > 0 && <Progress value={percent} />}
        {expanded &&
          (total === 0 ? (
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
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xl transition-colors ${
                          isDone
                            ? "bg-success-foreground text-background"
                            : "bg-muted"
                        }`}
                        aria-hidden="true"
                      >
                        {isDone ? (
                          <Check className="size-5" />
                        ) : (
                          step.emoji || "·"
                        )}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {step.label}
                      </span>
                      {step.durationMinutes && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Timer className="size-3" />
                          {step.durationMinutes} {t("routines.minutes")}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
        {expanded && allDone && (
          <p className="flex items-center justify-center gap-2 rounded-md bg-success-surface px-3 py-2 text-sm font-medium text-success-foreground">
            <Sparkles className="size-4" />
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
            placeholder="🌞"
          >
            <button
              type="button"
              aria-label={t("routines.chooseEmoji")}
              className="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>{emoji || <span className="opacity-50">🌞</span>}</span>
              <ChevronDown className="size-3 text-muted-foreground" />
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
                key={label}
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
  // Stable for the lifetime of the editor instance — used as React + dnd-kit
  // key. Distinct from `id` (which is undefined for newly added rows) so that
  // reordering keeps focus on the right input.
  dragId: string;
  id?: string;
  label: string;
  emoji: string | null;
  durationMinutes: number | null;
};

function newDragId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

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

  const [barkleyInfoOpen, setBarkleyInfoOpen] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const [steps, setSteps] = useState<StepDraft[]>(() =>
    routine.steps.map((s) => ({
      dragId: s.id,
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      durationMinutes: s.durationMinutes,
    })),
  );

  const focusLabelRef = useRef<string | null>(null);
  const labelRefs = useRef<Map<string, HTMLInputElement> | null>(null);
  if (labelRefs.current === null) {
    labelRefs.current = new Map<string, HTMLInputElement>();
  }

  useEffect(() => {
    const target = focusLabelRef.current;
    if (!target) return;
    const el = labelRefs.current!.get(target);
    if (el) {
      el.focus();
      focusLabelRef.current = null;
    }
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const update = useCallback(
    (dragId: string, patch: Partial<StepDraft>) =>
      setSteps((curr) =>
        curr.map((s) => (s.dragId === dragId ? { ...s, ...patch } : s)),
      ),
    [],
  );

  const remove = useCallback(
    (dragId: string) => {
      setSteps((curr) => {
        const idx = curr.findIndex((s) => s.dragId === dragId);
        if (idx === -1) return curr;
        const next = curr.filter((s) => s.dragId !== dragId);
        const focusTarget = next[idx]?.dragId ?? next[idx - 1]?.dragId ?? null;
        focusLabelRef.current = focusTarget;
        return next;
      });
      setLiveAnnouncement(t("routines.stepDeletedAnnouncement"));
    },
    [t],
  );

  const add = useCallback(() => {
    const dragId = newDragId();
    focusLabelRef.current = dragId;
    setSteps((curr) => [
      ...curr,
      { dragId, label: "", emoji: null, durationMinutes: null },
    ]);
    setLiveAnnouncement(t("routines.stepAddedAnnouncement"));
  }, [t]);

  const move = useCallback(
    (dragId: string, direction: -1 | 1) => {
      setSteps((curr) => {
        const idx = curr.findIndex((s) => s.dragId === dragId);
        const moved = curr[idx];
        const target = idx + direction;
        if (!moved || target < 0 || target >= curr.length) return curr;
        const next = arrayMove(curr, idx, target);
        setLiveAnnouncement(
          t("routines.stepReorderedAnnouncement", {
            label: moved.label || t("routines.stepUnnamed"),
            position: target + 1,
            total: curr.length,
          }),
        );
        return next;
      });
    },
    [t],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setSteps((curr) => {
        const oldIndex = curr.findIndex((s) => s.dragId === active.id);
        const newIndex = curr.findIndex((s) => s.dragId === over.id);
        const moved = curr[oldIndex];
        if (!moved || newIndex === -1) return curr;
        const next = arrayMove(curr, oldIndex, newIndex);
        setLiveAnnouncement(
          t("routines.stepReorderedAnnouncement", {
            label: moved.label || t("routines.stepUnnamed"),
            position: newIndex + 1,
            total: curr.length,
          }),
        );
        return next;
      });
    },
    [t],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = steps.reduce<
      { id?: string; emoji: string | null; durationMinutes: number | null; label: string }[]
    >((acc, s) => {
      const label = s.label.trim();
      if (label.length > 0) {
        acc.push({ id: s.id, emoji: s.emoji, durationMinutes: s.durationMinutes, label });
      }
      return acc;
    }, []);
    upsert.mutate(
      { id: routine.id, childId: activeChildId, steps: cleaned },
      { onSuccess },
    );
  };

  const sortableIds = steps.map((s) => s.dragId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {t("routines.stepsHint")}
        </p>
        <button
          type="button"
          onClick={() => setBarkleyInfoOpen(true)}
          className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-7"
        >
          <Info className="size-3.5" />
          <span className="underline underline-offset-2">
            {t("routines.stepsHintInfoLabel")}
          </span>
        </button>
      </div>

      <Dialog open={barkleyInfoOpen} onOpenChange={setBarkleyInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("routines.barkleyInfo.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              {t("routines.barkleyInfo.intro")}
            </p>
            <div className="space-y-2">
              <p className="font-semibold">
                {t("routines.barkleyInfo.benefitsTitle")}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground marker:text-primary">
                <li>{t("routines.barkleyInfo.benefit1")}</li>
                <li>{t("routines.barkleyInfo.benefit2")}</li>
                <li>{t("routines.barkleyInfo.benefit3")}</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">
                {t("routines.barkleyInfo.rangeTitle")}
              </p>
              <p className="text-muted-foreground">
                {t("routines.barkleyInfo.rangeBody")}
              </p>
            </div>
            <div className="space-y-1 rounded-md bg-accent/50 p-3">
              <p className="font-semibold">
                {t("routines.barkleyInfo.exampleTitle")}
              </p>
              <p className="text-muted-foreground">
                {t("routines.barkleyInfo.exampleBody")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setBarkleyInfoOpen(false)}
            className="w-full"
          >
            {t("routines.barkleyInfo.close")}
          </Button>
        </DialogContent>
      </Dialog>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <SortableStepRow
                key={s.dragId}
                step={s}
                index={i}
                total={steps.length}
                onUpdate={(patch) => update(s.dragId, patch)}
                onRemove={() => remove(s.dragId)}
                onMoveUp={() => move(s.dragId, -1)}
                onMoveDown={() => move(s.dragId, 1)}
                registerLabelRef={(el) => {
                  if (el) labelRefs.current!.set(s.dragId, el);
                  else labelRefs.current!.delete(s.dragId);
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="w-full"
        disabled={steps.length >= 20}
      >
        <Plus className="mr-2 size-4" />
        {t("routines.addStep")}
      </Button>
      <Button type="submit" className="w-full" disabled={upsert.isPending}>
        {upsert.isPending ? t("routines.saving") : t("routines.saveSteps")}
      </Button>
    </form>
  );
}

function SortableStepRow({
  step,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  registerLabelRef,
}: {
  step: StepDraft;
  index: number;
  total: number;
  onUpdate: (patch: Partial<StepDraft>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  registerLabelRef: (el: HTMLInputElement | null) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.dragId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : undefined,
  };

  const labelForA11y =
    step.label.trim() || t("routines.stepUnnamedShort", { position: index + 1 });

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-background p-2 shadow-sm"
      aria-label={t("routines.stepRowLabel", {
        position: index + 1,
        total,
        label: labelForA11y,
      })}
    >
      {/* Top row: drag handle · position · emoji · label · delete */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t("routines.dragHandleLabel", { label: labelForA11y })}
          className="flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums"
        >
          {index + 1}
        </span>

        <EmojiPicker
          value={step.emoji ?? ""}
          onSelect={(emoji) =>
            onUpdate({ emoji: emoji === step.emoji ? null : emoji })
          }
          emojis={ROUTINE_STEP_EMOJIS}
          columns={6}
          placeholder="🙂"
        >
          <button
            type="button"
            aria-label={t("routines.stepEmojiLabel", { label: labelForA11y })}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border bg-background text-xl transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {step.emoji || <span className="opacity-40 text-base">🙂</span>}
          </button>
        </EmojiPicker>

        <Input
          id={labelId}
          ref={registerLabelRef}
          value={step.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder={t("routines.stepPlaceholder")}
          aria-label={t("routines.stepLabelInput", { position: index + 1 })}
          className="h-11 min-w-0 flex-1"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label={t("routines.removeStepLabel", { label: labelForA11y })}
          className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Bottom row: move buttons · duration */}
      <div className="mt-1.5 flex items-center gap-1.5 pl-7">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label={t("routines.moveUpLabel", { label: labelForA11y })}
          className="size-9 shrink-0"
        >
          <ChevronUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label={t("routines.moveDownLabel", { label: labelForA11y })}
          className="size-9 shrink-0"
        >
          <ChevronDown className="size-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="size-3.5" aria-hidden="true" />
          <label
            htmlFor={`${labelId}-duration`}
            className="cursor-pointer select-none"
          >
            {t("routines.stepDurationShort")}
          </label>
          <Input
            id={`${labelId}-duration`}
            type="number"
            min={1}
            max={180}
            inputMode="numeric"
            value={step.durationMinutes ?? ""}
            onChange={(e) =>
              onUpdate({
                durationMinutes: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            placeholder="—"
            aria-label={t("routines.stepDuration")}
            className="h-9 w-14 text-center"
          />
          <span aria-hidden="true">{t("routines.minutesShort")}</span>
        </div>
      </div>
    </li>
  );
}

function TemplatesList({
  onPick,
  disabled,
  initiallyExpanded = false,
}: {
  onPick: (template: RoutineTemplate) => void;
  disabled?: boolean;
  initiallyExpanded?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(() => initiallyExpanded);

  const visible = expanded
    ? ROUTINE_TEMPLATES
    : ROUTINE_TEMPLATES.slice(0, TEMPLATES_INITIAL_VISIBLE);
  const hasMore = ROUTINE_TEMPLATES.length > TEMPLATES_INITIAL_VISIBLE;

  const dayShort = [
    t("days.monShort"),
    t("days.tueShort"),
    t("days.wedShort"),
    t("days.thuShort"),
    t("days.friShort"),
    t("days.satShort"),
    t("days.sunShort"),
  ];
  const formatDays = (days: number[] | undefined) => {
    if (!days || days.length === 0 || days.length === 7) return null;
    return [...days]
      .sort((a, b) => a - b)
      .map((d) => dayShort[d])
      .join(" · ");
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {visible.map((template) => {
          const stepCount = template.steps.length;
          const totalMinutes = template.steps.reduce(
            (acc, s) => acc + (s.durationMinutes ?? 0),
            0,
          );
          const gentle = template.tone === "gentle";
          const daysLabel = formatDays(template.daysOfWeek);
          return (
            <li key={template.key}>
              <button
                type="button"
                onClick={() => onPick(template)}
                disabled={disabled}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors min-h-[64px] ${
                  gentle
                    ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-accent"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-2xl shadow-sm"
                  aria-hidden="true"
                >
                  {template.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold leading-tight">
                    {t(`routines.templates.items.${template.key}.title`, {
                      defaultValue: template.title,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalMinutes > 0
                      ? t("routines.templates.metaWithTime", {
                          steps: stepCount,
                          minutes: totalMinutes,
                        })
                      : t("routines.templates.metaSteps", {
                          steps: stepCount,
                        })}
                  </span>
                  {daysLabel && (
                    <span className="mt-1 text-xs text-muted-foreground">
                      {daysLabel}
                    </span>
                  )}
                  {gentle && (
                    <span className="mt-1 text-xs text-primary">
                      {t("routines.templates.gentleHint")}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("routines.templates.seeAll", {
            count: ROUTINE_TEMPLATES.length,
          })}
        </button>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import {
  Play,
  ListChecks,
  Pencil,
  Trash2,
  Sparkles,
  Check,
  Timer,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { CreatedByLabel } from "@/components/shared/created-by-label";
import { useUiStore } from "@/stores/ui-store";
import {
  useDeleteRoutine,
  useCompleteStep,
  useUncompleteStep,
} from "@/hooks/use-routines";
import {
  type Routine,
} from "@focusflow/validators";
import { timeIcon } from "./routine-schedule";

/** One routine on the list: its steps, progress, and row actions. */

export function RoutineCard({
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
  const navigate = useNavigate();
  const activeChildId = useUiStore((s) => s.activeChildId)!;
  const completeStep = useCompleteStep();
  const uncompleteStep = useUncompleteStep();
  const deleteRoutine = useDeleteRoutine();

  const Icon = timeIcon(routine.timeOfDay);
  const total = routine.steps.length;
  const done = routine.steps.filter((s) => completedStepIds.has(s.id)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;
  // The "Lancer le minuteur" CTA only shows up when there is at least
  // one *timed* step still to run today — otherwise tapping it would
  // either start an empty timer or replay items already checked at
  // snack-time. Mirrors the filter in `routineToSequence`.
  const runnableSteps = routine.steps.filter(
    (s) => (s.durationMinutes ?? 0) > 0 && !completedStepIds.has(s.id),
  ).length;
  const canLaunchTimer = runnableSteps > 0;

  const launchTimer = () => {
    navigate({
      to: "/timer",
      search: { routineId: routine.id },
    });
  };

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
        {expanded && canLaunchTimer && (
          <Button
            type="button"
            onClick={launchTimer}
            className="w-full"
            aria-label={t("routines.launchTimerAria", { name: routine.name })}
          >
            <Play className="mr-2 size-4" aria-hidden="true" />
            {t("routines.launchTimerCta", { count: runnableSteps })}
          </Button>
        )}
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

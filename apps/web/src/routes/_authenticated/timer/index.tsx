import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { VisualTimer } from "@/components/timer/visual-timer";
import { routineToSequence } from "@/components/timer/sequences";
import {
  useCompleteStep,
  useRoutineCompletions,
  useRoutines,
} from "@/hooks/use-routines";
import { todayISO } from "@/lib/date";
import { useUiStore } from "@/stores/ui-store";

type TimerSearch = { routineId?: string };

export const Route = createFileRoute("/_authenticated/timer/")({
  validateSearch: (search: Record<string, unknown>): TimerSearch => {
    const routineId =
      typeof search.routineId === "string" && search.routineId.trim().length > 0
        ? search.routineId.trim()
        : undefined;
    return { routineId };
  },
  component: TimerPage,
  staticData: {
    crumb: "nav.timer",
  },
});

function TimerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { routineId } = Route.useSearch();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const today = todayISO();
  const { data: routines } = useRoutines(activeChildId ?? "");
  const { data: completions } = useRoutineCompletions(
    activeChildId ?? "",
    today,
  );
  const completeStep = useCompleteStep();

  // Steps already ticked earlier today must not replay — Léa launching
  // the bedtime routine at 19h45 should not see Tom's snack-time items
  // again. Snapshot at first render so newly-completed steps during the
  // run don't reshape the sequence mid-flight.
  const completedStepIds = useMemo(
    () => new Set((completions ?? []).map((c) => c.stepId)),
    [completions],
  );

  const userSequences = useMemo(() => {
    if (!routines) return [];
    return routines.reduce<
      NonNullable<ReturnType<typeof routineToSequence>>[]
    >((acc, r) => {
      if (!r.active) return acc;
      const seq = routineToSequence(r, completedStepIds);
      if (seq !== null) acc.push(seq);
      return acc;
    }, []);
  }, [routines, completedStepIds]);

  const autoStartSequenceId = routineId ? `user-${routineId}` : undefined;
  const targetRoutine = routineId
    ? (routines ?? []).find((r) => r.id === routineId)
    : null;
  const targetSequence = autoStartSequenceId
    ? userSequences.find((s) => s.id === autoStartSequenceId) ?? null
    : null;

  // Deep-linked from /routines but every timed step is already done for
  // today — there is nothing to run. Surface that as a toast, drop the
  // search param, and stay on the timer page so the user can still pick
  // another routine. Done in an effect so the side effects don't run
  // during render (and don't fire on every render).
  const deepLinkExhausted =
    !!routineId && !!targetRoutine && targetSequence === null;
  useEffect(() => {
    if (!deepLinkExhausted) return;
    toast.info(t("timer.routineAlreadyDoneToast"));
    navigate({ to: "/timer", search: {} as TimerSearch, replace: true });
  }, [deepLinkExhausted, navigate, t]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("timer.title")}
        description={t("timer.subtitle")}
      />
      <div className="flex justify-center pt-4">
        <VisualTimer
          userSequences={userSequences}
          childId={activeChildId ?? undefined}
          autoStartSequenceId={autoStartSequenceId}
          onSequenceStepComplete={({ routineStepId }) => {
            if (!routineStepId || !targetRoutine || !activeChildId) return;
            // Idempotent on the server (uniqueIndex on routine_completions);
            // a duplicate call from a fast double-tick is harmless.
            completeStep.mutate({
              routineId: targetRoutine.id,
              childId: activeChildId,
              stepId: routineStepId,
              date: today,
            });
          }}
        />
      </div>
    </div>
  );
}

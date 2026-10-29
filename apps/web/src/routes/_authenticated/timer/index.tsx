import { useEffect, useMemo, useRef } from "react";
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
  const completionsQuery = useRoutineCompletions(activeChildId ?? "", today);
  const completions = completionsQuery.data;
  const completeStep = useCompleteStep();

  const completionsReady =
    completionsQuery.data !== undefined || completionsQuery.isError;
  const completedStepIds = useMemo(
    () => new Set((completions ?? []).map((c) => c.stepId)),
    [completions],
  );

  const userSequences = useMemo(() => {
    if (!routines || !completionsReady) return [];
    return routines.reduce<
      NonNullable<ReturnType<typeof routineToSequence>>[]
    >((acc, r) => {
      if (!r.active) return acc;
      const seq = routineToSequence(r, completedStepIds);
      if (seq !== null) acc.push(seq);
      return acc;
    }, []);
  }, [routines, completionsReady, completedStepIds]);

  const autoStartSequenceId = routineId ? `user-${routineId}` : undefined;

  const deepLinkDecidedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!routineId || !routines || !completionsReady) return;
    if (deepLinkDecidedRef.current === routineId) return;
    deepLinkDecidedRef.current = routineId;
    const targetRoutine = routines.find((r) => r.id === routineId);
    const targetSequence = userSequences.find(
      (s) => s.id === autoStartSequenceId,
    );
    if (targetRoutine && !targetSequence) {
      toast.info(t("timer.routineAlreadyDoneToast"));
      navigate({ to: "/timer", search: {} as TimerSearch, replace: true });
    }
  }, [
    routineId,
    routines,
    completionsReady,
    userSequences,
    autoStartSequenceId,
    navigate,
    t,
  ]);

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
          onSequenceStepComplete={({ routineId: stepRoutineId, routineStepId }) => {
            if (!routineStepId || !stepRoutineId || !activeChildId) return;
            completeStep.mutate({
              routineId: stepRoutineId,
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

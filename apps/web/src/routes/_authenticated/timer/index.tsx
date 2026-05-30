import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/page-header";
import { VisualTimer } from "@/components/timer/visual-timer";
import { routineToSequence } from "@/components/timer/sequences";
import { useRoutines } from "@/hooks/use-routines";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/_authenticated/timer/")({
  component: TimerPage,
  staticData: {
    crumb: "nav.timer",
  },
});

function TimerPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: routines } = useRoutines(activeChildId ?? "");

  const userSequences = useMemo(() => {
    if (!routines) return [];
    return routines.reduce<NonNullable<ReturnType<typeof routineToSequence>>[]>((acc, r) => {
      if (!r.active) return acc;
      const seq = routineToSequence(r);
      if (seq !== null) acc.push(seq);
      return acc;
    }, []);
  }, [routines]);

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
        />
      </div>
    </div>
  );
}

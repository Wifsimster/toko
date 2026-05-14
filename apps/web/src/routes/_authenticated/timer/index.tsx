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
    return routines
      .filter((r) => r.active)
      .map(routineToSequence)
      .filter((seq): seq is NonNullable<typeof seq> => seq !== null);
  }, [routines]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("timer.title")}
        description={t("timer.subtitle")}
      />
      <div className="flex justify-center pt-4">
        <VisualTimer userSequences={userSequences} />
      </div>
    </div>
  );
}

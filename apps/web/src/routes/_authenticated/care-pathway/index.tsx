import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  PHASES,
  CARE_PATHWAY_STEPS,
} from "@/lib/care-pathway-data";
import { useCarePathwayProgress } from "@/hooks/use-care-pathway";
import { useUiStore } from "@/stores/ui-store";
import type { CareStepStatus } from "@focusflow/validators";
import { PhaseSection } from "./care-pathway-components";

export const Route = createFileRoute("/_authenticated/care-pathway/")({
  component: CarePathwayPage,
  staticData: {
    crumb: "nav.carePathway",
  },
});

function CarePathwayPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: progress, isLoading } = useCarePathwayProgress(
    activeChildId ?? "",
  );

  const progressByStepId = useMemo(() => {
    const map = new Map<string, CareStepStatus>();
    progress?.forEach((p) => map.set(p.stepId, p.status as CareStepStatus));
    return map;
  }, [progress]);

  const completedCount = useMemo(
    () =>
      CARE_PATHWAY_STEPS.filter(
        (s) => progressByStepId.get(s.id) === "done",
      ).length,
    [progressByStepId],
  );

  const totalCount = CARE_PATHWAY_STEPS.length;
  const pct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("carePathway.title")}
        description={t("carePathway.subtitle")}
      />

      {!activeChildId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("carePathway.selectChild")}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-heading text-base font-semibold">
                  {t("carePathway.progressLabel", {
                    done: completedCount,
                    total: totalCount,
                  })}
                </p>
                <span className="font-heading text-2xl font-semibold tabular-nums text-primary">
                  {pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-background ring-1 ring-primary/10">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("carePathway.disclaimer")}
              </p>
            </CardContent>
          </Card>

          {PHASES.map((phase) => (
            <PhaseSection
              key={phase}
              phase={phase}
              progressByStepId={progressByStepId}
            />
          ))}
        </>
      )}
    </div>
  );
}

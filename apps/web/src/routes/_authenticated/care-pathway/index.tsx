import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Search,
  Stethoscope,
  HeartHandshake,
  Check,
  Circle,
  CircleDot,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import {
  PHASES,
  stepsByPhase,
  CARE_PATHWAY_STEPS,
  type CarePathwayPhase,
  type CarePathwayStep,
} from "@/lib/care-pathway-data";
import {
  useCarePathwayProgress,
  useUpsertCarePathwayStep,
} from "@/hooks/use-care-pathway";
import { useUiStore } from "@/stores/ui-store";
import type { CareStepStatus } from "@focusflow/validators";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/care-pathway/")({
  component: CarePathwayPage,
  staticData: {
    crumb: "nav.carePathway",
  },
});

const PHASE_ICONS: Record<
  CarePathwayPhase,
  { icon: typeof Search; toneClass: string }
> = {
  screening: {
    icon: Search,
    toneClass: "bg-info-surface text-info-foreground ring-info-border",
  },
  diagnosis: {
    icon: Stethoscope,
    toneClass: "bg-accent-100 text-accent-900 ring-accent-200 dark:bg-accent-900/40 dark:text-accent-100 dark:ring-accent-800",
  },
  support: {
    icon: HeartHandshake,
    toneClass: "bg-sage-100 text-sage-800 ring-sage-200 dark:bg-sage-900/40 dark:text-sage-100 dark:ring-sage-800",
  },
};

const STATUSES: CareStepStatus[] = ["todo", "doing", "done"];

const STATUS_ICONS: Record<CareStepStatus, typeof Circle> = {
  todo: Circle,
  doing: CircleDot,
  done: Check,
};

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

function PhaseSection({
  phase,
  progressByStepId,
}: {
  phase: CarePathwayPhase;
  progressByStepId: Map<string, CareStepStatus>;
}) {
  const { t } = useTranslation();
  const steps = stepsByPhase(phase);
  const config = PHASE_ICONS[phase];
  const PhaseIcon = config.icon;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl ring-1",
            config.toneClass,
          )}
        >
          <PhaseIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold">
            {t(`carePathway.phases.${phase}.title`)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(`carePathway.phases.${phase}.description`)}
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            status={progressByStepId.get(step.id) ?? "todo"}
          />
        ))}
      </div>
    </section>
  );
}

function StepCard({
  step,
  status,
}: {
  step: CarePathwayStep;
  status: CareStepStatus;
}) {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const upsert = useUpsertCarePathwayStep();
  const StatusIcon = STATUS_ICONS[status];

  const setStatus = (next: CareStepStatus) => {
    if (!activeChildId || next === status) return;
    upsert.mutate({
      childId: activeChildId,
      stepId: step.id,
      status: next,
    });
  };

  return (
    <Card
      className={cn(
        "transition-colors",
        status === "done" && "bg-sage-50/60 ring-1 ring-sage-200 dark:bg-card dark:ring-sage-800",
      )}
    >
      <CardContent className="flex items-start gap-4 p-5">
        <span className="text-3xl leading-none" aria-hidden="true">
          {step.emoji}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="font-heading text-base font-semibold leading-snug">
              {t(`carePathway.steps.${step.id}.title`)}
            </h3>
            {status === "doing" && (
              <Badge variant="outline" className="border-info-border text-info-foreground">
                {t("carePathway.statuses.doing")}
              </Badge>
            )}
            {status === "done" && (
              <Badge className="bg-sage-200 text-sage-800 dark:bg-sage-700 dark:text-sage-50 border-transparent">
                {t("carePathway.statuses.done")}
              </Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(`carePathway.steps.${step.id}.description`)}
          </p>
          {step.externalLink && (
            <a
              href={step.externalLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {t(step.externalLink.labelKey)}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                aria-label={t("carePathway.changeStatus")}
                disabled={!activeChildId || upsert.isPending}
              />
            }
          >
            <StatusIcon className="h-4 w-4" />
            {t(`carePathway.statuses.${status}`)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUSES.map((s) => {
              const Icon = STATUS_ICONS[s];
              return (
                <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {t(`carePathway.statuses.${s}`)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

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
import {
  stepsByPhase,
  type CarePathwayPhase,
  type CarePathwayStep,
} from "@/lib/care-pathway-data";
import { useUpsertCarePathwayStep } from "@/hooks/use-care-pathway";
import { useUiStore } from "@/stores/ui-store";
import type { CareStepStatus } from "@focusflow/validators";
import { cn } from "@/lib/utils";

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

export function PhaseSection({
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
            "flex size-9 items-center justify-center rounded-xl ring-1",
            config.toneClass,
          )}
        >
          <PhaseIcon className="size-4" aria-hidden="true" />
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
              <ExternalLink className="size-3" aria-hidden="true" />
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
            <StatusIcon className="size-4" />
            {t(`carePathway.statuses.${status}`)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUSES.map((s) => {
              const Icon = STATUS_ICONS[s];
              return (
                <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                  <Icon className="size-4 text-muted-foreground" />
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

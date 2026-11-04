import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import type { Routine } from "@focusflow/validators";
import { Mo } from "@/components/mo/mo";
import { Button } from "@/components/ui/button";
import { ItemIcon } from "@/components/shared/item-icon";
import { cn } from "@/lib/utils";
import { SLOT_SURFACE, routineMinutes } from "./routine-now";

const MAX_STEP_ICONS = 5;

export function RoutineNowCard({
  routine,
  childName,
  completedStepIds,
}: {
  routine: Routine;
  childName?: string;
  completedStepIds: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const minutes = routineMinutes(routine);
  const canLaunch = routine.steps.some((s) => (s.durationMinutes ?? 0) > 0 && !completedStepIds.has(s.id));
  const shown = routine.steps.slice(0, MAX_STEP_ICONS);

  return (
    <section
      aria-labelledby="routine-now-title"
      className={cn("relative overflow-hidden rounded-[28px] p-5", SLOT_SURFACE[routine.timeOfDay])}
    >
      <Mo state="theme-cadre" size={112} className="absolute top-3 right-2 sm:right-4" />
      <p aria-hidden="true" className="font-hand pr-28 text-[21px] leading-none font-semibold">
        {t(`routines.now.kicker.${routine.timeOfDay}`)}
      </p>
      <h2 id="routine-now-title" className="mt-1 max-w-[calc(100%-7.5rem)] text-[23px] leading-[1.15] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere]">
        {routine.name}
      </h2>
      <ul aria-label={t("routines.now.stepsLabel")} className="mt-3 flex max-w-[calc(100%-7rem)] flex-wrap gap-1.5">
        {shown.map((step) => (
          <li
            key={step.id}
            title={step.label}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card",
              completedStepIds.has(step.id) && "opacity-40",
            )}
          >
            <ItemIcon value={step.emoji ?? undefined} name={step.label} kind="step" size={30} className="size-6" />
            <span className="sr-only">{step.label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canLaunch && (
          <Button
            size="lg"
            className="min-h-11 rounded-full px-5 md:h-11"
            onClick={() => void navigate({ to: "/timer", search: { routineId: routine.id } })}
          >
            <Play className="size-4" aria-hidden="true" />
            {childName ? t("routines.now.launchWithName", { name: childName }) : t("routines.now.launch")}
          </Button>
        )}
        <span className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold">
          {minutes > 0
            ? t("routines.now.meta", { count: routine.steps.length, minutes })
            : t("routines.now.metaSteps", { count: routine.steps.length })}
        </span>
      </div>
    </section>
  );
}

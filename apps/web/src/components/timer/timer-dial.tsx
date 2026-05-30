import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { type SequenceTemplate } from "./sequences";
import {
  DIAL_SIZE,
  STROKE,
  CENTER,
  RADIUS,
  CIRCUMFERENCE,
  formatMMSS,
} from "./timer-constants";

export function TimerDial({
  remainingSec,
  durationSec,
  dashOffset,
  finished,
  transitioning,
  inFinalApproach,
  nextStep,
  activeSequence,
  isLastStep,
}: {
  remainingSec: number;
  durationSec: number;
  dashOffset: number;
  finished: boolean;
  transitioning: boolean;
  inFinalApproach: boolean;
  nextStep: SequenceTemplate["steps"][number] | null;
  activeSequence: SequenceTemplate | null;
  isLastStep: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-transform",
        finished && !transitioning && "animate-pulse"
      )}
      style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
      aria-live="polite"
    >
      <svg
        width={DIAL_SIZE}
        height={DIAL_SIZE}
        viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
        aria-hidden="true"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={STROKE}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={
            inFinalApproach
              ? "var(--color-warning-foreground)"
              : "var(--primary)"
          }
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          style={{
            transition: "stroke-dashoffset 0.95s linear, stroke 0.5s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {transitioning && nextStep ? (
          <>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("timer.nextStep")}
            </span>
            <span className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {nextStep.label}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              {t("timer.minutes", {
                count: Math.ceil(nextStep.durationSec / 60),
              })}
            </span>
          </>
        ) : (
          <>
            <span
              className="font-heading text-5xl font-semibold tabular-nums tracking-tight text-foreground sm:text-6xl"
              aria-label={t("timer.remaining", {
                time: formatMMSS(remainingSec),
              })}
            >
              {formatMMSS(remainingSec)}
            </span>
            {finished && !activeSequence && (
              <span className="mt-1 text-sm font-medium text-primary">
                {t("timer.finished")}
              </span>
            )}
            {finished && activeSequence && isLastStep && (
              <span className="mt-1 text-sm font-medium text-primary">
                {t("timer.sequenceFinished")}
              </span>
            )}
            {inFinalApproach && !finished && (
              <span className="mt-1 text-sm font-medium text-warning-foreground">
                {t("timer.almostDone")}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

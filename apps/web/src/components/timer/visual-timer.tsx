import { useEffect, useEffectEvent, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ListChecks } from "lucide-react";
import { ItemIcon } from "@/components/shared/item-icon";
import { CompanionCollection } from "./companion-collection";
import { useRecordCompanion } from "@/hooks/use-companions";
import { useVisualTimerState } from "./use-visual-timer-state";
import { useTimerAudio } from "./use-timer-audio";
import { TimerDial } from "./timer-dial";
import { TimerPresetBar } from "./timer-preset-bar";
import { TimerControls } from "./timer-controls";
import { CompanionDisplay } from "./companion-display";
import { totalSequenceDurationSec, type SequenceTemplate } from "./sequences";
import { pickCritter, type Critter } from "./critters";
import { CIRCUMFERENCE } from "./timer-constants";
import { remainingSecAt } from "./countdown";

const PRESET_MINUTES = [2, 5, 10, 20, 45] as const;
const EMPTY_SEQUENCES: SequenceTemplate[] = [];
const PRESET_SPEEDUP_SECONDS = [30, 60, 120, 180] as const;
const PREALERT_THRESHOLD_SEC = 120;
const STEP_TRANSITION_MS = 3000;

const ABANDON_REVEAL_THRESHOLD = 0.1;
const ABANDON_REVEAL_DURATION_MS = 1800;

const VIBRATION_PATTERN_MS = [
  220, 80, 220, 80, 220, 80, 220, 200, 220, 80, 220, 80, 480,
] as const;

export function VisualTimer({
  defaultMinutes = 10,
  userSequences = EMPTY_SEQUENCES,
  childId,
  autoStartSequenceId,
  onSequenceStepComplete,
  onSequenceFinished,
}: {
  defaultMinutes?: number;
  userSequences?: SequenceTemplate[];
  childId?: string;
  autoStartSequenceId?: string;
  onSequenceStepComplete?: (info: {
    routineId: string | undefined;
    routineStepId: string | undefined;
    stepIndex: number;
  }) => void;
  onSequenceFinished?: (info: { sequence: SequenceTemplate }) => void;
}) {
  const { t } = useTranslation();
  const { mutate: recordCompanion } = useRecordCompanion();

  const {
    durationSec, setDurationSec,
    remainingSec, setRemainingSec,
    running, setRunning,
    fullscreen, setFullscreen,
    speedUp, setSpeedUp,
    companionEnabled, setCompanionEnabled,
    revealedCritter, setRevealedCritter,
    abandonReveal, setAbandonReveal,
    collectionOpen, setCollectionOpen,
    activeSequence, setActiveSequence,
    currentStepIndex, setCurrentStepIndex,
    transitioning, setTransitioning,
    discoveryRecordedRef,
    intervalRef,
    audioCtxRef,
    abandonTimeoutRef,
    transitionTimeoutRef,
  } = useVisualTimerState(defaultMinutes);

  const { primeAudio, playFinishedChime } = useTimerAudio(audioCtxRef);
  const remainingRef = useRef(remainingSec);

  const maybeRecordCompanion = (critter: Critter) => {
    if (!childId) return;
    if (discoveryRecordedRef.current === critter.id) return;
    discoveryRecordedRef.current = critter.id;
    recordCompanion({ childId, animalId: critter.id });
  };

  const handleTimerComplete = useEffectEvent(() => {
    setRunning(false);
    playFinishedChime();
    if (navigator.vibrate) navigator.vibrate([...VIBRATION_PATTERN_MS]);

    if (activeSequence) {
      const finishedStep = activeSequence.steps[currentStepIndex];
      if (finishedStep && onSequenceStepComplete) {
        onSequenceStepComplete({
          routineId: activeSequence.routineId,
          routineStepId: finishedStep.routineStepId,
          stepIndex: currentStepIndex,
        });
      }
      const isLastStep = currentStepIndex >= activeSequence.steps.length - 1;
      if (!isLastStep && !transitioning) {
        setTransitioning(true);
        transitionTimeoutRef.current = setTimeout(() => {
          const nextIndex = currentStepIndex + 1;
          const nextStep = activeSequence.steps[nextIndex];
          if (!nextStep) return;
          setCurrentStepIndex(nextIndex);
          setDurationSec(nextStep.durationSec);
          setRemainingSec(nextStep.durationSec);
          setTransitioning(false);
          setRunning(true);
        }, STEP_TRANSITION_MS);
        return;
      }
      if (isLastStep && onSequenceFinished) {
        onSequenceFinished({ sequence: activeSequence });
      }
    }

    if (companionEnabled && !revealedCritter) {
      const critter = pickCritter();
      setRevealedCritter(critter);
      setAbandonReveal(false);
      maybeRecordCompanion(critter);
    }
  });

  remainingRef.current = remainingSec;

  useEffect(() => {
    if (!running) return;
    let endAt = Date.now() + remainingRef.current * 1000;
    let lastSet = remainingRef.current;
    let done = false;

    const tick = () => {
      if (done) return;
      if (remainingRef.current !== lastSet) {
        endAt = Date.now() + remainingRef.current * 1000;
        lastSet = remainingRef.current;
      }
      const next = remainingSecAt(endAt, Date.now());
      if (next === lastSet) return;
      lastSet = next;
      remainingRef.current = next;
      setRemainingSec(next);
      if (next === 0) {
        done = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        handleTimerComplete();
      }
    };

    intervalRef.current = setInterval(tick, 250);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      done = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [running]); // eslint-disable-line react-doctor/exhaustive-deps -- intervalRef/setters/remainingRef are stable

  useEffect(() => {
    return () => {
      if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []); // eslint-disable-line react-doctor/exhaustive-deps

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, setFullscreen]);

  const autoStartedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!autoStartSequenceId) return;
    if (autoStartedRef.current === autoStartSequenceId) return;
    const seq = userSequences.find((s) => s.id === autoStartSequenceId);
    if (!seq) return;
    autoStartedRef.current = autoStartSequenceId;
    primeAudio();
    setActiveSequence(seq);
    setCurrentStepIndex(0);
    const firstStep = seq.steps[0];
    if (firstStep) {
      setDurationSec(firstStep.durationSec);
      setRemainingSec(firstStep.durationSec);
    }
    setFullscreen(true);
    setRunning(true);
    // eslint-disable-next-line react-doctor/exhaustive-deps
  }, [autoStartSequenceId, userSequences]);

  const clearCompanion = () => {
    if (abandonTimeoutRef.current) {
      clearTimeout(abandonTimeoutRef.current);
      abandonTimeoutRef.current = null;
    }
    setRevealedCritter(null);
    setAbandonReveal(false);
    discoveryRecordedRef.current = null;
  };

  const clearSequence = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setActiveSequence(null);
    setCurrentStepIndex(0);
    setTransitioning(false);
  };

  const startSequence = (seq: SequenceTemplate) => {
    const firstStep = seq.steps[0];
    if (!firstStep) return;
    setActiveSequence(seq);
    setCurrentStepIndex(0);
    setDurationSec(firstStep.durationSec);
    setRemainingSec(firstStep.durationSec);
    setRunning(false);
    clearCompanion();
  };

  const setMinutes = (m: number) => {
    const sec = m * 60;
    setDurationSec(sec);
    setRemainingSec(sec);
    setRunning(false);
    clearCompanion();
    clearSequence();
  };

  const setSeconds = (s: number) => {
    setDurationSec(s);
    setRemainingSec(s);
    setRunning(false);
    clearCompanion();
    clearSequence();
  };

  const reset = () => {
    const elapsedFraction =
      durationSec > 0 ? (durationSec - remainingSec) / durationSec : 0;
    const finishedNow = remainingSec === 0 && durationSec > 0;
    if (!finishedNow && companionEnabled && elapsedFraction > ABANDON_REVEAL_THRESHOLD && !revealedCritter) {
      const critter = pickCritter();
      setRevealedCritter(critter);
      setAbandonReveal(true);
      setRunning(false);
      setFullscreen(false);
      maybeRecordCompanion(critter);
      abandonTimeoutRef.current = setTimeout(() => {
        setRemainingSec(durationSec);
        clearCompanion();
      }, ABANDON_REVEAL_DURATION_MS);
      return;
    }
    setRemainingSec(durationSec);
    setRunning(false);
    setFullscreen(false);
    clearCompanion();
    clearSequence();
  };

  const fraction = durationSec > 0 ? remainingSec / durationSec : 0;
  const elapsedFraction = 1 - fraction;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const finished = remainingSec === 0 && durationSec > 0;
  const inFinalApproach = remainingSec > 0 && remainingSec <= PREALERT_THRESHOLD_SEC && durationSec > PREALERT_THRESHOLD_SEC;
  const idle = !running && !finished && remainingSec === durationSec;
  const currentStep = activeSequence?.steps[currentStepIndex] ?? null;
  const nextStep = activeSequence?.steps[currentStepIndex + 1] ?? null;
  const isLastStep = !!activeSequence && currentStepIndex >= activeSequence.steps.length - 1;
  const companionFraction = activeSequence && !isLastStep ? 0 : elapsedFraction;

  const wrapperClass = fullscreen
    ? "fixed inset-0 z-50 print:hidden flex flex-col items-center justify-center gap-8 bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    : "flex flex-col items-center gap-6";

  return (
    <div className={wrapperClass}>
      {activeSequence && (
        <SequenceHeader
          activeSequence={activeSequence}
          currentStepIndex={currentStepIndex}
          currentStep={currentStep}
        />
      )}
      {companionEnabled && (
        <CompanionDisplay
          elapsedFraction={companionFraction}
          revealedCritter={revealedCritter}
          abandonReveal={abandonReveal}
          running={running}
          onOpenCollection={() => setCollectionOpen(true)}
        />
      )}
      <TimerDial
        remainingSec={remainingSec}
        durationSec={durationSec}
        dashOffset={dashOffset}
        finished={finished}
        transitioning={transitioning}
        inFinalApproach={inFinalApproach}
        nextStep={nextStep}
        activeSequence={activeSequence}
        isLastStep={isLastStep}
      />
      {idle && !activeSequence && (
        <TimerPresetBar
          durationSec={durationSec}
          speedUp={speedUp}
          companionEnabled={companionEnabled}
          childId={childId}
          onSetMinutes={setMinutes}
          onSetSeconds={setSeconds}
          onToggleSpeedUp={() => setSpeedUp((v) => !v)}
          onToggleCompanion={() => setCompanionEnabled((v) => !v)}
          onOpenCollection={() => setCollectionOpen(true)}
          presetMinutes={PRESET_MINUTES}
          presetSpeedupSeconds={PRESET_SPEEDUP_SECONDS}
        />
      )}
      {idle && !activeSequence && !fullscreen && userSequences.length > 0 && (
        <SequencePicker userSequences={userSequences} onStart={startSequence} />
      )}
      <TimerControls
        running={running}
        idle={idle}
        finished={finished}
        durationSec={durationSec}
        fullscreen={fullscreen}
        activeSequence={activeSequence}
        onPlayPause={() => {
          primeAudio();
          if (finished) { reset(); return; }
          if (!running) setFullscreen(true);
          setRunning((r) => !r);
        }}
        onReset={reset}
        onCancelSequence={() => {
          setRunning(false);
          setFullscreen(false);
          clearCompanion();
          clearSequence();
          const firstStep = activeSequence!.steps[0];
          if (firstStep) {
            setDurationSec(firstStep.durationSec);
            setRemainingSec(firstStep.durationSec);
          }
        }}
        onExitFullscreen={() => setFullscreen(false)}
      />
      <CompanionCollection
        childId={childId ?? ""}
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
        justDiscoveredId={revealedCritter?.id ?? null}
      />
    </div>
  );
}

function SequenceHeader({
  activeSequence,
  currentStepIndex,
  currentStep,
}: {
  activeSequence: SequenceTemplate;
  currentStepIndex: number;
  currentStep: SequenceTemplate["steps"][number] | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {t("timer.sequenceLabel", { name: activeSequence.label })}
      </span>
      {currentStep && (
        <span className="text-base font-semibold text-foreground">
          {t("timer.stepCounter", {
            current: currentStepIndex + 1,
            total: activeSequence.steps.length,
          })}{" "}
          · {currentStep.label}
        </span>
      )}
    </div>
  );
}

function SequencePicker({
  userSequences,
  onStart,
}: {
  userSequences: SequenceTemplate[];
  onStart: (seq: SequenceTemplate) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3 border-t border-border/40 pt-5">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <ListChecks className="size-3.5" />
        {t("timer.userRoutinesHeader")}
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
        {userSequences.map((seq) => (
          <SequenceCard key={seq.id} seq={seq} onStart={() => onStart(seq)} />
        ))}
      </div>
    </div>
  );
}

function SequenceCard({
  seq,
  onStart,
}: {
  seq: SequenceTemplate;
  onStart: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onStart}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 text-left transition-colors hover:bg-accent"
    >
      <ItemIcon value={seq.emoji} className="size-6 shrink-0 text-brand-strong" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {seq.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("timer.sequenceMeta", {
            count: seq.steps.length,
            minutes: Math.ceil(totalSequenceDurationSec(seq) / 60),
          })}
        </span>
      </span>
    </button>
  );
}

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Zap,
  Egg,
  EggOff,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  totalSequenceDurationSec,
  type SequenceTemplate,
} from "./sequences";

const PRESET_MINUTES = [2, 5, 10, 20, 45] as const;
const PRESET_SPEEDUP_SECONDS = [30, 60, 120, 180] as const;
const PREALERT_THRESHOLD_SEC = 120;
// Delay between two sequence steps so the child has time to register the
// transition. Short enough that the parent doesn't have to nudge things.
const STEP_TRANSITION_MS = 3000;

// A pool of friendly critters the companion can hatch into. Kept short and
// universally recognizable so a 6-year-old reads the reward instantly.
const CRITTER_POOL = [
  "🐥",
  "🦋",
  "🦊",
  "🐰",
  "🐢",
  "🐶",
  "🐱",
  "🐧",
  "🐼",
  "🦔",
] as const;

function pickCritter(): string {
  return CRITTER_POOL[Math.floor(Math.random() * CRITTER_POOL.length)]!;
}

// Minimum progress required for an abandoned run to still hatch. Below this
// we just reset silently — no critter implies no effort to celebrate yet.
const ABANDON_REVEAL_THRESHOLD = 0.1;
// Time the abandon reveal stays on screen before the timer goes back to idle.
const ABANDON_REVEAL_DURATION_MS = 1800;

const DIAL_SIZE = 280; // px
const STROKE = 22;
const CENTER = DIAL_SIZE / 2;
const RADIUS = CENTER - STROKE;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatMMSS(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext ??
    null
  );
}

// A short, bell-like melody that reads as "alarm" but stays musical.
// Notes spell a rising A-major arpeggio (A5 → C#6 → E6) and the phrase is
// repeated so it's noticeable across a room without becoming harsh.
type AlarmNote = { freq: number; durMs: number };

const ALARM_MELODY: AlarmNote[] = [
  { freq: 880, durMs: 200 }, // A5
  { freq: 1109, durMs: 200 }, // C#6
  { freq: 1319, durMs: 200 }, // E6
  { freq: 1109, durMs: 200 }, // C#6
  { freq: 0, durMs: 120 }, // rest
  { freq: 880, durMs: 200 }, // A5
  { freq: 1319, durMs: 200 }, // E6
  { freq: 1109, durMs: 220 }, // C#6
  { freq: 880, durMs: 480 }, // A5 (held resolution)
  { freq: 0, durMs: 220 }, // rest before repeat
];
const ALARM_REPEATS = 2;
const VIBRATION_PATTERN_MS = [
  220, 80, 220, 80, 220, 80, 220, 200, 220, 80, 220, 80, 480,
] as const;

export function VisualTimer({
  defaultMinutes = 10,
  userSequences = [],
}: {
  defaultMinutes?: number;
  /** User-defined routines converted to runnable sequences. */
  userSequences?: SequenceTemplate[];
}) {
  const { t } = useTranslation();
  const [durationSec, setDurationSec] = useState(defaultMinutes * 60);
  const [remainingSec, setRemainingSec] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speedUp, setSpeedUp] = useState(false);
  const [companionEnabled, setCompanionEnabled] = useState(true);
  const [revealedCritter, setRevealedCritter] = useState<string | null>(null);
  // True when the critter is shown because the user abandoned the timer
  // before it ended. Drives the encouraging "on retentera" copy.
  const [abandonReveal, setAbandonReveal] = useState(false);
  // Sequence runner state. When `activeSequence` is set, the dial chains
  // its steps and shows a transition screen between them.
  const [activeSequence, setActiveSequence] = useState<SequenceTemplate | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const abandonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemainingSec((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Free the audio context when the component unmounts.
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  // Lazily create / resume the audio context. Must be called from a user
  // gesture handler so mobile browsers allow playback later.
  const primeAudio = () => {
    if (!audioCtxRef.current) {
      const Ctx = getAudioContextCtor();
      if (!Ctx) return;
      try {
        audioCtxRef.current = new Ctx();
      } catch {
        return;
      }
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  const playFinishedChime = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    let cursor = ctx.currentTime + 0.02;
    for (let r = 0; r < ALARM_REPEATS; r++) {
      for (const { freq, durMs } of ALARM_MELODY) {
        const seconds = durMs / 1000;
        if (freq > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          // Triangle wave gives a warmer, bell-like tone than a pure sine
          // beep while still cutting through ambient noise.
          osc.type = "triangle";
          osc.frequency.value = freq;
          const peak = 0.28;
          gain.gain.setValueAtTime(0.0001, cursor);
          gain.gain.exponentialRampToValueAtTime(peak, cursor + 0.015);
          gain.gain.setValueAtTime(
            peak,
            cursor + Math.max(0.02, seconds - 0.05)
          );
          gain.gain.exponentialRampToValueAtTime(0.0001, cursor + seconds);
          osc.connect(gain).connect(ctx.destination);
          osc.start(cursor);
          osc.stop(cursor + seconds + 0.02);
        }
        cursor += seconds;
      }
    }
  };

  // Best-effort sound + vibration when the timer hits zero. Both APIs are
  // ignored on unsupported browsers and require no permission prompt.
  useEffect(() => {
    if (remainingSec === 0 && durationSec > 0) {
      playFinishedChime();
      if (navigator.vibrate) {
        navigator.vibrate([...VIBRATION_PATTERN_MS]);
      }
    }
  }, [remainingSec, durationSec]);

  // Sequence-aware "step finished" effect. A finished step in the middle
  // of a sequence triggers the transition screen and queues the next step.
  // A finished step that is the last (or the timer is standalone) reveals
  // the critter so the celebration happens once at the end.
  useEffect(() => {
    if (remainingSec !== 0 || durationSec === 0) return;

    if (activeSequence) {
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
    }

    // End of standalone timer OR end of last step in a sequence — reveal
    // the critter once.
    if (companionEnabled && !revealedCritter) {
      setRevealedCritter(pickCritter());
      setAbandonReveal(false);
    }
  }, [
    remainingSec,
    durationSec,
    activeSequence,
    currentStepIndex,
    transitioning,
    companionEnabled,
    revealedCritter,
  ]);

  // Clear any pending timeouts on unmount.
  useEffect(() => {
    return () => {
      if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current);
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Escape exits fullscreen so it never traps the user.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const clearCompanion = () => {
    if (abandonTimeoutRef.current) {
      clearTimeout(abandonTimeoutRef.current);
      abandonTimeoutRef.current = null;
    }
    setRevealedCritter(null);
    setAbandonReveal(false);
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
    // Abandoned-but-tried path: briefly hatch a critter with an encouraging
    // message so a TDAH child never feels punished for stopping early. The
    // critter is never "lost" because there is no collection to lose from.
    if (
      !finishedNow &&
      companionEnabled &&
      elapsedFraction > ABANDON_REVEAL_THRESHOLD &&
      !revealedCritter
    ) {
      setRevealedCritter(pickCritter());
      setAbandonReveal(true);
      setRunning(false);
      setFullscreen(false);
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
  // Pre-alert: the last two minutes shift the dial toward a warmer hue so
  // the child sees the transition coming. Only when the original duration
  // is long enough that 2 min counts as the "final approach".
  const inFinalApproach =
    remainingSec > 0 &&
    remainingSec <= PREALERT_THRESHOLD_SEC &&
    durationSec > PREALERT_THRESHOLD_SEC;
  // Idle = nothing has started yet on the current duration. We only show
  // configuration controls (preset chips) in this state to keep the running
  // surface focused on the dial.
  const idle = !running && !finished && remainingSec === durationSec;

  const currentStep = activeSequence?.steps[currentStepIndex] ?? null;
  const nextStep =
    activeSequence?.steps[currentStepIndex + 1] ?? null;
  const isLastStep =
    !!activeSequence &&
    currentStepIndex >= activeSequence.steps.length - 1;
  // Egg stays calm between sequence steps — the celebration only happens
  // once, at the end of the full routine.
  const companionFraction =
    activeSequence && !isLastStep ? 0 : elapsedFraction;

  const wrapperClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    : "flex flex-col items-center gap-6";

  return (
    <div className={wrapperClass}>
      {activeSequence && (
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("timer.sequenceLabel", {
              name: activeSequence.label,
            })}
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
      )}
      {companionEnabled && (
        <Companion
          elapsedFraction={companionFraction}
          revealedCritter={revealedCritter}
          abandonReveal={abandonReveal}
          running={running}
        />
      )}
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
              transition: "stroke-dashoffset 0.95s linear, stroke 1.2s ease",
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

      {idle && !activeSequence && (
        <div className="flex w-full max-w-xl flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {speedUp
              ? PRESET_SPEEDUP_SECONDS.map((s) => {
                  const active = durationSec === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeconds(s)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 bg-background hover:bg-accent"
                      )}
                    >
                      {s < 60
                        ? t("timer.seconds", { count: s })
                        : t("timer.minutes", { count: s / 60 })}
                    </button>
                  );
                })
              : PRESET_MINUTES.map((m) => {
                  const active = durationSec === m * 60;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinutes(m)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60 bg-background hover:bg-accent"
                      )}
                    >
                      {t("timer.minutes", { count: m })}
                    </button>
                  );
                })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSpeedUp((v) => !v)}
              aria-pressed={speedUp}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                speedUp
                  ? "border-warning-border bg-warning-surface text-warning-foreground"
                  : "border-border/60 bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              {speedUp ? t("timer.speedUpOn") : t("timer.speedUpOff")}
            </button>
            <button
              type="button"
              onClick={() => setCompanionEnabled((v) => !v)}
              aria-pressed={companionEnabled}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                companionEnabled
                  ? "border-info-border bg-info-surface text-info-foreground"
                  : "border-border/60 bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              {companionEnabled ? (
                <Egg className="h-3.5 w-3.5" />
              ) : (
                <EggOff className="h-3.5 w-3.5" />
              )}
              {companionEnabled
                ? t("timer.companionOn")
                : t("timer.companionOff")}
            </button>
          </div>
          {speedUp && (
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {t("timer.speedUpHint")}
            </p>
          )}
        </div>
      )}

      {idle && !activeSequence && !fullscreen && userSequences.length > 0 && (
        <div className="flex w-full max-w-xl flex-col items-center gap-3 border-t border-border/40 pt-5">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            {t("timer.userRoutinesHeader")}
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
            {userSequences.map((seq) => (
              <SequenceCard
                key={seq.id}
                seq={seq}
                onStart={() => startSequence(seq)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={() => {
            primeAudio();
            if (finished) {
              reset();
              return;
            }
            // Auto-engage fullscreen the moment the timer starts so the dial
            // becomes the only thing on screen — no nav, no FAB, no chips.
            if (!running) setFullscreen(true);
            setRunning((r) => !r);
          }}
          className="gap-2 px-6"
          disabled={durationSec === 0}
        >
          {running ? (
            <>
              <Pause className="h-4 w-4" /> {t("timer.pause")}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> {t("timer.start")}
            </>
          )}
        </Button>
        {!idle && (
          <Button
            size="lg"
            variant="outline"
            onClick={reset}
            aria-label={t("timer.reset")}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        {activeSequence && (
          <Button
            size="lg"
            variant="ghost"
            onClick={() => {
              setRunning(false);
              setFullscreen(false);
              clearCompanion();
              clearSequence();
              const firstStep = activeSequence.steps[0];
              if (firstStep) {
                setDurationSec(firstStep.durationSec);
                setRemainingSec(firstStep.durationSec);
              }
            }}
            aria-label={t("timer.cancelSequence")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {fullscreen && (
          <Button
            size="lg"
            variant="ghost"
            onClick={() => setFullscreen(false)}
            aria-label={t("timer.exitFullscreen")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
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
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-3 text-left transition-colors hover:bg-accent"
    >
      <span className="text-2xl" aria-hidden="true">
        {seq.emoji}
      </span>
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

function Companion({
  elapsedFraction,
  revealedCritter,
  abandonReveal,
  running,
}: {
  elapsedFraction: number;
  revealedCritter: string | null;
  abandonReveal: boolean;
  running: boolean;
}) {
  const { t } = useTranslation();

  if (revealedCritter) {
    return (
      <div
        className="flex flex-col items-center gap-1 animate-fade-in-up"
        aria-live="polite"
      >
        <span className="text-5xl animate-bounce-slow">{revealedCritter}</span>
        <span
          className={cn(
            "text-sm font-medium",
            abandonReveal ? "text-muted-foreground" : "text-primary"
          )}
        >
          {t(
            abandonReveal
              ? "timer.companion.tryAgain"
              : "timer.companion.hatched"
          )}
        </span>
      </div>
    );
  }

  // Cracking egg: stays calm until past the halfway mark so a TDAH child
  // never feels rushed by the visual.
  const aboutToHatch = elapsedFraction >= 0.85;
  const cracking = running && elapsedFraction >= 0.4;

  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <span
        className={cn(
          "text-4xl select-none transition-transform",
          cracking && "animate-tip-wiggle",
          aboutToHatch && "animate-bounce-slow"
        )}
      >
        {aboutToHatch ? "🐣" : "🥚"}
      </span>
    </div>
  );
}

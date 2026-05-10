import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESET_MINUTES = [2, 5, 10, 20, 45] as const;
const PRESET_SPEEDUP_SECONDS = [30, 60, 120, 180] as const;
const PREALERT_THRESHOLD_SEC = 120;

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

export function VisualTimer({ defaultMinutes = 10 }: { defaultMinutes?: number }) {
  const { t } = useTranslation();
  const [durationSec, setDurationSec] = useState(defaultMinutes * 60);
  const [remainingSec, setRemainingSec] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speedUp, setSpeedUp] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  // Escape exits fullscreen so it never traps the user.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const setMinutes = (m: number) => {
    const sec = m * 60;
    setDurationSec(sec);
    setRemainingSec(sec);
    setRunning(false);
  };

  const setSeconds = (s: number) => {
    setDurationSec(s);
    setRemainingSec(s);
    setRunning(false);
  };

  const reset = () => {
    setRemainingSec(durationSec);
    setRunning(false);
    setFullscreen(false);
  };

  const fraction = durationSec > 0 ? remainingSec / durationSec : 0;
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

  const wrapperClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    : "flex flex-col items-center gap-6";

  return (
    <div className={wrapperClass}>
      <div
        className={cn(
          "relative flex items-center justify-center transition-transform",
          finished && "animate-pulse"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-heading text-5xl font-semibold tabular-nums tracking-tight text-foreground sm:text-6xl"
            aria-label={t("timer.remaining", {
              time: formatMMSS(remainingSec),
            })}
          >
            {formatMMSS(remainingSec)}
          </span>
          {finished && (
            <span className="mt-1 text-sm font-medium text-primary">
              {t("timer.finished")}
            </span>
          )}
          {inFinalApproach && !finished && (
            <span className="mt-1 text-sm font-medium text-warning-foreground">
              {t("timer.almostDone")}
            </span>
          )}
        </div>
      </div>

      {idle && (
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
          {speedUp && (
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              {t("timer.speedUpHint")}
            </p>
          )}
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

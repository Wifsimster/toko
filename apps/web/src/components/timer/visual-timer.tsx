import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESET_MINUTES = [2, 5, 10, 20, 45] as const;
const LAST_DURATION_KEY = "toko:timer:lastDurationMinutes";
const LONG_PRESS_MS = 600;
const FINISHED_AUTO_EXIT_MS = 3000;

const DIAL_SIZE = 280; // px (compact, in-page)
const FULLSCREEN_DIAL_SIZE = 360; // px (wider so the dial dominates the screen)
const STROKE = 22;

function formatMMSS(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function readStoredMinutes(): number | null {
  try {
    const raw = window.localStorage.getItem(LAST_DURATION_KEY);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 && n <= 180 ? n : null;
  } catch {
    return null;
  }
}

function writeStoredMinutes(minutes: number): void {
  try {
    window.localStorage.setItem(LAST_DURATION_KEY, String(minutes));
  } catch {
    // localStorage disabled / quota — fail silent
  }
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

export type VisualTimerProps = {
  /** Fallback when no localStorage value and no `initialMinutes` prop. */
  defaultMinutes?: number;
  /** Pre-fill the dial (used by deep-links from Routines). */
  initialMinutes?: number;
  /** Auto-engage running + fullscreen on mount. */
  autostart?: boolean;
  /** Optional caption shown under the dial in idle mode (e.g. routine step). */
  label?: string;
};

export function VisualTimer({
  defaultMinutes = 10,
  initialMinutes,
  autostart = false,
  label,
}: VisualTimerProps) {
  const { t } = useTranslation();
  // Priority: explicit prop > stored last-used > component default.
  const [initial] = useState(
    () => initialMinutes ?? readStoredMinutes() ?? defaultMinutes
  );
  const [durationSec, setDurationSec] = useState(initial * 60);
  const [remainingSec, setRemainingSec] = useState(initial * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);

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

  // Auto-start when arriving from a routines deep-link. Done in an effect (not
  // initial state) so the audio context can be primed first.
  useEffect(() => {
    if (!autostart) return;
    primeAudio();
    setFullscreen(true);
    setRunning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Hand the screen back to the parent shortly after the chime so they
      // see the rest of the app again without having to hunt for an exit.
      const id = setTimeout(() => setFullscreen(false), FINISHED_AUTO_EXIT_MS);
      return () => clearTimeout(id);
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
    writeStoredMinutes(m);
  };

  const reset = () => {
    setRemainingSec(durationSec);
    setRunning(false);
    setFullscreen(false);
  };

  // Long-press anywhere on the dial in fullscreen exits — kid-resistant
  // alternative to a tappable X they could hit accidentally.
  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDialPointerDown = () => {
    if (!fullscreen) return;
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      setFullscreen(false);
    }, LONG_PRESS_MS);
  };

  const fraction = durationSec > 0 ? remainingSec / durationSec : 0;
  const dialSize = fullscreen ? FULLSCREEN_DIAL_SIZE : DIAL_SIZE;
  const center = dialSize / 2;
  const radius = center - STROKE;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - fraction);
  const finished = remainingSec === 0 && durationSec > 0;
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
          finished && "animate-pulse",
          fullscreen && "cursor-pointer select-none"
        )}
        style={{ width: dialSize, height: dialSize }}
        aria-live="polite"
        onPointerDown={handleDialPointerDown}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
      >
        <svg
          width={dialSize}
          height={dialSize}
          viewBox={`0 0 ${dialSize} ${dialSize}`}
          aria-hidden="true"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={STROKE}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: "stroke-dashoffset 0.95s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-heading font-semibold tabular-nums tracking-tight text-foreground",
              fullscreen ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl"
            )}
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
        </div>
      </div>

      {label && idle && (
        <p className="-mt-2 text-sm font-medium text-muted-foreground">
          {label}
        </p>
      )}

      {idle && (
        <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-2">
          {PRESET_MINUTES.map((m) => {
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

      {fullscreen && (
        <p className="text-xs text-muted-foreground">
          {t("timer.holdToExit")}
        </p>
      )}
    </div>
  );
}

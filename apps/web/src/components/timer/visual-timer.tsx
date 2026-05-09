import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESET_MINUTES = [1, 5, 10, 15, 20, 30, 45, 60] as const;

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

// Beep pattern mirrors the vibration: short-short-long with brief pauses.
const BEEP_PATTERN_MS = [200, 100, 200, 100, 400] as const;

export function VisualTimer({ defaultMinutes = 10 }: { defaultMinutes?: number }) {
  const { t } = useTranslation();
  const [durationSec, setDurationSec] = useState(defaultMinutes * 60);
  const [remainingSec, setRemainingSec] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
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
    BEEP_PATTERN_MS.forEach((ms, i) => {
      const seconds = ms / 1000;
      const isBeep = i % 2 === 0;
      if (isBeep) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, cursor);
        gain.gain.exponentialRampToValueAtTime(0.3, cursor + 0.01);
        gain.gain.setValueAtTime(0.3, cursor + Math.max(0, seconds - 0.03));
        gain.gain.exponentialRampToValueAtTime(0.0001, cursor + seconds);
        osc.connect(gain).connect(ctx.destination);
        osc.start(cursor);
        osc.stop(cursor + seconds + 0.02);
      }
      cursor += seconds;
    });
  };

  // Best-effort sound + vibration when the timer hits zero. Both APIs are
  // ignored on unsupported browsers and require no permission prompt.
  useEffect(() => {
    if (remainingSec === 0 && durationSec > 0) {
      playFinishedChime();
      if (navigator.vibrate) {
        navigator.vibrate([...BEEP_PATTERN_MS]);
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

  const reset = () => {
    setRemainingSec(durationSec);
    setRunning(false);
  };

  const fraction = durationSec > 0 ? remainingSec / durationSec : 0;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const finished = remainingSec === 0 && durationSec > 0;

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
            stroke="var(--primary)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: "stroke-dashoffset 0.95s linear" }}
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
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {PRESET_MINUTES.map((m) => {
          const active = durationSec === m * 60;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
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

      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={() => {
            primeAudio();
            if (finished) reset();
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
        <Button
          size="lg"
          variant="outline"
          onClick={reset}
          aria-label={t("timer.reset")}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => setFullscreen((f) => !f)}
          aria-label={
            fullscreen ? t("timer.exitFullscreen") : t("timer.fullscreen")
          }
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

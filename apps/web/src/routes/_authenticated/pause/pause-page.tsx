import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { PAUSE_DURATIONS_MINUTES } from "@focusflow/validators";
import { Mo } from "@/components/mo/mo";
import { buttonVariants } from "@/components/ui/button-variants";
import { useRecordPause } from "@/hooks/use-pauses";
import { formatCountdown, pausePhaseAt } from "@/lib/pause";
import { todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import { PauseEnd } from "./pause-end";

type Minutes = (typeof PAUSE_DURATIONS_MINUTES)[number];

type Session = {
  minutes: Minutes;
  remainingMs: number;
  runningSince: number | null;
};

const DEFAULT_MINUTES: Minutes = 2;

function freshSession(minutes: Minutes): Session {
  return { minutes, remainingMs: minutes * 60_000, runningSince: performance.now() };
}

export default function PausePage() {
  const { t } = useTranslation();
  const [session, setSession] = useState<Session>(() => freshSession(DEFAULT_MINUTES));
  const [now, setNow] = useState(() => performance.now());
  const [finishedMinutes, setFinishedMinutes] = useState<Minutes | null>(null);
  const recordPause = useRecordPause();
  const recordRef = useRef(recordPause.mutate);
  recordRef.current = recordPause.mutate;

  const running = session.runningSince !== null;
  const elapsedInRun = running ? now - session.runningSince! : 0;
  const remainingMs = Math.max(0, session.remainingMs - elapsedInRun);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || remainingMs > 0 || finishedMinutes !== null) return;
    setFinishedMinutes(session.minutes);
    setSession((s) => ({ ...s, remainingMs: 0, runningSince: null }));
    recordRef.current({ kind: "souffler", date: todayISO(), durationSeconds: session.minutes * 60 });
  }, [running, remainingMs, finishedMinutes, session.minutes]);

  const toggle = useCallback(() => {
    const at = performance.now();
    setNow(at);
    setSession((s) =>
      s.runningSince === null
        ? { ...s, runningSince: at }
        : { ...s, remainingMs: Math.max(0, s.remainingMs - (at - s.runningSince)), runningSince: null },
    );
  }, []);

  const choose = useCallback((minutes: Minutes) => {
    setNow(performance.now());
    setSession(freshSession(minutes));
  }, []);

  const again = useCallback(() => {
    setFinishedMinutes(null);
    setNow(performance.now());
    setSession(freshSession(1));
  }, []);

  if (finishedMinutes !== null) {
    return <PauseEnd minutes={finishedMinutes} onAgain={again} recording={recordPause.isPending} />;
  }

  const phase = running ? pausePhaseAt(elapsedInRun) : "rest";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center pb-6 text-center">
      <div className="flex w-full items-center justify-between">
        <Link
          to="/dashboard"
          aria-label={t("pause.back")}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full bg-card md:size-11")}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
      </div>

      <h1 className="mt-4 text-[30px] leading-tight font-extrabold tracking-[-0.02em]" aria-live="polite">
        {running ? t(`pause.phases.${phase}`) : t("pause.paused")}
      </h1>
      <p className="mt-1 text-[0.9375rem] text-muted-foreground">
        {running ? t(`pause.phaseHints.${phase}`) : t("pause.pausedHint")}
      </p>

      <div className="relative mt-6 flex size-64 items-center justify-center sm:size-72">
        <span aria-hidden="true" className="absolute inset-0 rounded-full border border-secondary" />
        <span
          aria-hidden="true"
          key={running ? `run-${session.runningSince}` : "still"}
          className={cn("absolute inset-5 rounded-full bg-surface-mint", running && "animate-sos-breathe")}
        />
        <Mo
          key={running ? `mo-${session.runningSince}` : "mo-still"}
          state="calme"
          size={128}
          guidedBreath={running ? { startedAt: session.runningSince! } : undefined}
          className="relative -translate-y-2"
        />
      </div>

      <p aria-hidden="true" className="font-hand mt-4 text-[23px] leading-none font-semibold text-brand-strong">
        {t("pause.note")}
      </p>
      <p
        className="mt-2 text-[46px] leading-none font-extrabold tabular-nums"
        role="timer"
        aria-label={t("pause.remaining", { time: formatCountdown(remainingMs) })}
      >
        {formatCountdown(remainingMs)}
      </p>

      <div role="radiogroup" aria-label={t("pause.durationLabel")} className="mt-5 flex w-full max-w-xs rounded-full bg-muted p-1">
        {PAUSE_DURATIONS_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={session.minutes === m}
            onClick={() => choose(m)}
            className={cn(
              "min-h-11 flex-1 rounded-full text-sm font-semibold text-muted-foreground transition-colors",
              session.minutes === m && "bg-card text-foreground shadow-xs",
            )}
          >
            {t("pause.minutes", { count: m })}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={running ? t("pause.pause") : t("pause.resume")}
        className="mt-6 flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
      >
        {running ? <Pause className="size-8" aria-hidden="true" /> : <Play className="size-8 translate-x-0.5" aria-hidden="true" />}
      </button>
    </div>
  );
}

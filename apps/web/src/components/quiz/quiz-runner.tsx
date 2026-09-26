import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { ArrowLeft, Check, Clock, Lock, Pause, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QUESTIONNAIRES, pick, type QuestionnaireId } from "@/lib/screening/questionnaires";
import type { Answers } from "@/lib/screening/scoring";
import { useSeoHead } from "@/hooks/use-seo-head";
import { umamiTrack } from "@/lib/umami";
import { QuizShell } from "./quiz-shell";
import { QuizResult } from "./quiz-result";

type Phase = "intro" | "questions" | "result";

interface Progress {
  phase: Phase;
  index: number;
  answers: (number | null)[];
}

// sessionStorage only: answers survive a reload or an interruption, and are
// wiped when the tab closes. They never leave the device.
const storageKey = (id: QuestionnaireId) => `reperes:${id}`;

function loadProgress(id: QuestionnaireId, size: number): Progress {
  const fresh: Progress = { phase: "intro", index: 0, answers: Array(size).fill(null) };
  try {
    const raw = sessionStorage.getItem(storageKey(id));
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Progress;
    if (!Array.isArray(saved.answers) || saved.answers.length !== size) return fresh;
    return { ...saved, index: Math.min(Math.max(saved.index, 0), size - 1) };
  } catch {
    return fresh;
  }
}

const ADVANCE_DELAY_MS = 220;

export function QuizRunner({ id }: { id: QuestionnaireId }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const q = QUESTIONNAIRES[id];
  const total = q.items.length;
  const [progress, setProgress] = useState<Progress>(() => loadProgress(id, total));
  const [direction, setDirection] = useState(1);
  const advanceTimer = useRef<number | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useSeoHead({
    title: `${pick(q.title, lang)} — ${t("quiz.brand")}`,
    description: `${pick(q.subtitle, lang)} ${t("quiz.privacy")}`,
    canonical: `https://toko.battistella.ovh/quiz/${id}`,
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(id), JSON.stringify(progress));
    } catch {
      // Private mode or quota: the quiz still works, just without resume.
    }
  }, [id, progress]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  // Move focus to the new question so screen readers announce it.
  useEffect(() => {
    if (progress.phase === "questions") headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [progress.phase, progress.index]);

  const start = (resume: boolean) => {
    umamiTrack("quiz-start", { quiz: id });
    setDirection(1);
    setProgress((p) =>
      resume
        ? { ...p, phase: "questions" }
        : { phase: "questions", index: 0, answers: Array(total).fill(null) },
    );
  };

  const answer = useCallback(
    (value: number) => {
      window.clearTimeout(advanceTimer.current);
      setProgress((p) => {
        const answers = [...p.answers];
        answers[p.index] = value;
        return { ...p, answers };
      });
      advanceTimer.current = window.setTimeout(() => {
        setDirection(1);
        setProgress((p) => {
          if (p.index < total - 1) return { ...p, index: p.index + 1 };
          umamiTrack("quiz-complete", { quiz: id });
          return { ...p, phase: "result" };
        });
      }, ADVANCE_DELAY_MS);
    },
    [id, total],
  );

  const previous = useCallback(() => {
    window.clearTimeout(advanceTimer.current);
    setDirection(-1);
    setProgress((p) => (p.index === 0 ? { ...p, phase: "intro" } : { ...p, index: p.index - 1 }));
  }, []);

  // Keyboard: 1..n answers, ← / Backspace goes back.
  useEffect(() => {
    if (progress.phase !== "questions") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= q.scale.length) {
        e.preventDefault();
        answer(q.scale[n - 1]!.value);
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        previous();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress.phase, q.scale, answer, previous]);

  const restart = () => {
    setDirection(-1);
    setProgress({ phase: "intro", index: 0, answers: Array(total).fill(null) });
  };

  const answeredCount = progress.answers.filter((a) => a !== null).length;
  const canResume = answeredCount > 0 && answeredCount < total;
  const item = q.items[progress.index]!;
  const selected = progress.answers[progress.index];

  return (
    <QuizShell sharePath={`/quiz/${id}`}>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user">
          {progress.phase === "intro" && (
            <m.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col"
            >
              <Badge variant="outline" className="self-start">
                {q.audience === "self" ? t("quiz.intro.forSelf") : t("quiz.intro.forChild")}
              </Badge>
              <h1 className="font-heading mt-3 text-3xl font-semibold leading-tight tracking-tight">
                {pick(q.title, lang)}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">{pick(q.subtitle, lang)}</p>

              <ul className="mt-6 grid gap-3 text-sm">
                <IntroLine icon={<Clock aria-hidden />}>
                  {t("quiz.intro.length", { count: total, minutes: q.minutes })}
                </IntroLine>
                <IntroLine icon={<Sparkles aria-hidden />}>{t("quiz.intro.instinct")}</IntroLine>
                <IntroLine icon={<Pause aria-hidden />}>{t("quiz.intro.pause")}</IntroLine>
                <IntroLine icon={<Lock aria-hidden />}>{t("quiz.privacy")}</IntroLine>
              </ul>

              <div className="mt-auto grid gap-2 pt-8 sm:mt-8 sm:flex sm:pt-0">
                {canResume ? (
                  <>
                    <Button size="lg" className="h-13 text-base sm:h-11 sm:px-6" onClick={() => start(true)}>
                      {t("quiz.intro.resume", { n: progress.index + 1 })}
                    </Button>
                    <Button size="lg" variant="ghost" className="h-12 sm:h-11" onClick={() => start(false)}>
                      {t("quiz.intro.restart")}
                    </Button>
                  </>
                ) : (
                  <Button size="lg" className="h-13 text-base sm:h-11 sm:px-8" onClick={() => start(false)}>
                    {t("quiz.intro.start")}
                  </Button>
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {t("quiz.intro.source", { name: q.source.name })}
              </p>
            </m.section>
          )}

          {progress.phase === "questions" && (
            <section className="flex flex-1 flex-col" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={previous}
                  className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  {t("quiz.question.previous")}
                </button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {t("quiz.question.progress", { n: progress.index + 1, total })}
                </span>
              </div>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={progress.index + 1}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                  style={{ width: `${((progress.index + 1) / total) * 100}%` }}
                />
              </div>

              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <m.div
                  key={item.id}
                  custom={direction}
                  initial={{ opacity: 0, x: 24 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 * direction }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="flex flex-1 flex-col"
                >
                  <p className="mt-8 text-sm font-medium text-primary">{pick(q.prompt, lang)}</p>
                  <h2
                    ref={headingRef}
                    tabIndex={-1}
                    className="mt-2 text-xl font-semibold leading-snug outline-none sm:text-2xl"
                  >
                    {pick(item.text, lang)}
                  </h2>
                  {item.example && (
                    <p className="mt-3 text-sm italic text-muted-foreground">
                      {t("quiz.question.example")} {pick(item.example, lang)}
                    </p>
                  )}

                  <div role="radiogroup" aria-label={pick(item.text, lang)} className="mt-auto grid gap-2.5 pt-8 sm:mt-10 sm:pt-0">
                    {q.scale.map((opt, i) => {
                      const isSelected = selected === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => answer(opt.value)}
                          className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 text-left text-base font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                          }`}
                        >
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground"
                            }`}
                            aria-hidden
                          >
                            {isSelected ? <Check className="size-4" /> : i + 1}
                          </span>
                          {pick(opt.label, lang)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 hidden text-center text-xs text-muted-foreground sm:block">
                    {t("quiz.question.keyboard", { max: q.scale.length })}
                  </p>
                </m.div>
              </AnimatePresence>
            </section>
          )}

          {progress.phase === "result" && (
            <QuizResult questionnaire={q} answers={progress.answers as Answers} onRestart={restart} />
          )}
        </MotionConfig>
      </LazyMotion>
    </QuizShell>
  );
}

function IntroLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
      <span className="text-primary [&_svg]:size-4.5">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

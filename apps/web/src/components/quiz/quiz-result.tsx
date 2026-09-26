import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import {
  ArrowRight,
  ExternalLink,
  Info,
  Printer,
  RotateCcw,
  Share2,
  ListChecks,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { pick, type Questionnaire } from "@/lib/screening/questionnaires";
import { isPositive, score, type Answers, type Level } from "@/lib/screening/scoring";
import { quizUrl, shareLink } from "./quiz-shell";

const LEVEL_STYLE: Record<Level, string> = {
  high: "bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-100",
  some: "bg-primary/10 text-primary",
  low: "bg-muted text-foreground",
};

interface QuizResultProps {
  questionnaire: Questionnaire;
  answers: Answers;
  onRestart: () => void;
}

export function QuizResult({ questionnaire: q, answers, onRestart }: QuizResultProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const result = score(q, answers);
  const [showAnswers, setShowAnswers] = useState(false);

  const print = () => {
    setShowAnswers(true);
    // Let the answers list render before opening the print dialog.
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };

  return (
    <m.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid gap-6"
    >
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          {t("quiz.result.label")} · {pick(q.title, lang)}
        </p>
        <p className="hidden text-xs text-muted-foreground print:block">
          {t("quiz.result.printedOn", { date: new Date().toLocaleDateString(lang) })}
        </p>
        <div className={`mt-3 rounded-2xl p-5 sm:p-6 ${LEVEL_STYLE[result.level]}`}>
          <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {t(`quiz.result.${result.level}.title`)}
          </h1>
          <p className="mt-2 text-base leading-relaxed opacity-90">{t(`quiz.result.${result.level}.text`)}</p>
        </div>
      </header>

      <section className="grid gap-4">
        {result.dimensions.map((d) => {
          const dim = q.dimensions.find((x) => x.id === d.id)!;
          return (
            <div key={d.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{pick(dim.label, lang)}</span>
                <span className="tabular-nums text-muted-foreground">
                  {t("quiz.result.signs", { count: d.count, total: d.total })}
                </span>
              </div>
              <div className="relative mt-2 h-3 rounded-full bg-muted">
                <m.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.count / d.total) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                />
                <div
                  className="absolute -top-1 -bottom-1 w-0.5 rounded bg-foreground/60"
                  style={{ left: `${(d.threshold / d.total) * 100}%` }}
                  aria-hidden
                />
              </div>
              <p
                className="mt-1 text-xs text-muted-foreground"
                style={{ paddingLeft: `max(0px, calc(${(d.threshold / d.total) * 100}% - 2.5rem))` }}
              >
                {t("quiz.result.threshold", { threshold: d.threshold })}
              </p>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">{pick(q.source.detail, lang)}</p>
      </section>

      <div className="flex gap-3 rounded-2xl border border-border p-4 text-sm leading-relaxed">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>{t("quiz.result.notDiagnosis")}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">{t("quiz.result.nextTitle")}</h2>
        <ol className="mt-3 grid gap-2.5">
          {q.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>
                {pick(step.text, lang)}
                {step.url && (
                  <>
                    {" "}
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {new URL(step.url).hostname.replace(/^www\./, "")}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-2 sm:grid-cols-2 print:hidden">
        <Button size="lg" className="h-12 gap-2 text-base sm:h-11" onClick={print}>
          <Printer aria-hidden />
          {t("quiz.result.print")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 gap-2 text-base sm:h-11"
          onClick={() =>
            shareLink(
              quizUrl(`/quiz/${q.id}`),
              pick(q.title, lang),
              t("quiz.shareText"),
              t("quiz.linkCopied"),
            )
          }
        >
          <Share2 aria-hidden />
          {t("quiz.result.shareQuiz")}
        </Button>
      </div>

      <details
        open={showAnswers}
        onToggle={(e) => setShowAnswers(e.currentTarget.open)}
        className="group rounded-2xl border border-border"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium print:hidden">
          <ListChecks className="size-4 text-muted-foreground" aria-hidden />
          {t("quiz.result.answersShow")}
        </summary>
        <ol className="grid gap-3 border-t border-border p-4 text-sm">
          {q.items.map((item, i) => {
            const value = answers[i] ?? null;
            const opt = q.scale.find((o) => o.value === value);
            const positive = isPositive(item, value);
            return (
              <li key={item.id} className="break-inside-avoid">
                <p className="text-muted-foreground">
                  {i + 1}. {pick(item.text, lang)}
                </p>
                <p className={`mt-0.5 font-medium ${positive ? "text-primary" : ""}`}>
                  {opt ? pick(opt.label, lang) : "—"}
                  {positive && " •"}
                </p>
              </li>
            );
          })}
        </ol>
      </details>

      <section className="rounded-2xl border border-accent-300/60 bg-accent-50 p-5 dark:border-accent-700/60 dark:bg-accent-900/20 print:hidden">
        <h2 className="font-heading text-lg font-semibold">{t("quiz.result.tokoTitle")}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {q.audience === "child" ? t("quiz.result.tokoChild") : t("quiz.result.tokoSelf")}
        </p>
        <Link to="/" data-umami-event="quiz-toko-click" data-umami-event-quiz={q.id}>
          <Button variant="outline" className="mt-4 gap-1.5">
            {t("quiz.result.tokoCta")}
            <ArrowRight aria-hidden />
          </Button>
        </Link>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={onRestart}>
          <RotateCcw aria-hidden />
          {t("quiz.result.restart")}
        </Button>
        <Link to="/quiz" className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">
          {t("quiz.result.other")}
        </Link>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground print:hidden">
        <Phone className="size-3.5 shrink-0" aria-hidden />
        {t("quiz.result.help")}
      </p>
    </m.article>
  );
}

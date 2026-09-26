import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { m } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  ListChecks,
  Phone,
  Printer,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  QUESTIONNAIRE_IDS,
  QUESTIONNAIRES,
  pick,
  type NextStep,
  type Questionnaire,
} from "@/lib/screening/questionnaires";
import { completeFor, overlapNotes, questionCount, type Parcours } from "@/lib/screening/parcours";
import { isPositive, score, type Answers, type Level, type ScreeningResult } from "@/lib/screening/scoring";
import { quizUrl, shareLink } from "./quiz-shell";
import { LoopVisual } from "./loop-visual";

const LEVEL_STYLE: Record<Level, string> = {
  high: "bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-100",
  some: "bg-primary/10 text-primary",
  low: "bg-muted text-foreground",
};

const RANK: Record<Level, number> = { low: 0, some: 1, high: 2 };

interface QuizResultProps {
  parcours: Parcours;
  answers: Answers;
  onRestart: () => void;
}

export function QuizResult({ parcours, answers, onRestart }: QuizResultProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [showAnswers, setShowAnswers] = useState(false);
  const multi = parcours.sections.length > 1;

  // Slice the flat answer list back into one block per questionnaire.
  let offset = 0;
  const sections = parcours.sections.map((q) => {
    const own = answers.slice(offset, offset + q.items.length);
    offset += q.items.length;
    return { q, answers: own, result: score(q, own) };
  });
  const level = sections.reduce<Level>(
    (acc, s) => (RANK[s.result.level] > RANK[acc] ? s.result.level : acc),
    "low",
  );
  const overlaps = overlapNotes(sections.map((s) => ({ topic: s.q.topic, level: s.result.level })));

  // Same step suggested by several questionnaires → shown once.
  const nextSteps: NextStep[] = [];
  for (const s of sections) {
    for (const step of s.q.nextSteps) {
      if (multi && step.aloneOnly) continue;
      if (!nextSteps.some((n) => n.text.fr === step.text.fr)) nextSteps.push(step);
    }
  }

  // Disorders overlap: point single-questionnaire results to the others.
  const others = multi
    ? []
    : QUESTIONNAIRE_IDS.map((id) => QUESTIONNAIRES[id]).filter(
        (q) => q.audience === parcours.audience && q.id !== parcours.id,
      );
  const complete = completeFor(parcours.audience);

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
          {t("quiz.result.label")} · {pick(parcours.title, lang)}
        </p>
        <p className="hidden text-xs text-muted-foreground print:block">
          {t("quiz.result.printedOn", { date: new Date().toLocaleDateString(lang) })}
        </p>
        <div className={`mt-3 rounded-2xl p-5 sm:p-6 ${LEVEL_STYLE[level]}`}>
          <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {t(`quiz.result.${level}.title`)}
          </h1>
          <p className="mt-2 text-base leading-relaxed opacity-90">{t(`quiz.result.${level}.text`)}</p>
        </div>
      </header>

      {multi ? (
        <section className="grid gap-3">
          {sections.map((s) => (
            <div key={s.q.id} className="rounded-2xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{pick(s.q.title, lang)}</h2>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${LEVEL_STYLE[s.result.level]}`}>
                  {t(`quiz.result.chip.${s.result.level}`)}
                </span>
              </div>
              <DimensionBars q={s.q} result={s.result} />
            </div>
          ))}
        </section>
      ) : (
        <section>
          <DimensionBars q={sections[0]!.q} result={sections[0]!.result} />
        </section>
      )}

      {overlaps.map((note) => (
        <section
          key={note.topics.join("-")}
          className="flex gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed"
        >
          <Layers className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="font-semibold">{pick(note.title, lang)}</h2>
            <p className="mt-1 text-muted-foreground">{pick(note.text, lang)}</p>
          </div>
        </section>
      ))}

      <div className="flex gap-3 rounded-2xl border border-border p-4 text-sm leading-relaxed">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>{t("quiz.result.notDiagnosis")}</p>
      </div>

      <section>
        <div className="flex items-center gap-3">
          <LoopVisual name="path" className="w-20 shrink-0 print:hidden" />
          <h2 className="text-lg font-semibold">{t("quiz.result.nextTitle")}</h2>
        </div>
        <ol className="mt-3 grid gap-2.5">
          {nextSteps.map((step, i) => (
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
            shareLink(quizUrl(`/quiz/${parcours.id}`), pick(parcours.title, lang), t("quiz.shareText"), t("quiz.linkCopied"))
          }
        >
          <Share2 aria-hidden />
          {t("quiz.result.shareQuiz")}
        </Button>
      </div>

      <details
        open={showAnswers}
        onToggle={(e) => setShowAnswers(e.currentTarget.open)}
        className="rounded-2xl border border-border"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium print:hidden">
          <ListChecks className="size-4 text-muted-foreground" aria-hidden />
          {t("quiz.result.answersShow")}
        </summary>
        <div className="grid gap-5 border-t border-border p-4 text-sm">
          {sections.map((s) => (
            <div key={s.q.id}>
              {multi && <h3 className="mb-2 font-semibold">{pick(s.q.title, lang)}</h3>}
              <ol className="grid gap-3">
                {s.q.items.map((item, i) => {
                  const value = s.answers[i] ?? null;
                  const opt = s.q.scale.find((o) => o.value === value);
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
            </div>
          ))}
        </div>
      </details>

      {!multi && (
        <section className="print:hidden">
          <h2 className="text-lg font-semibold">{t("quiz.result.overlapTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("quiz.result.overlapText")}</p>
          <ul className="mt-3 grid gap-2">
            <li>
              <SuggestionLink
                to={complete.id}
                title={pick(complete.title, lang)}
                meta={t("quiz.home.meta", { count: questionCount(complete), minutes: complete.minutes })}
                highlight
              />
            </li>
            {others.map((q) => (
              <li key={q.id}>
                <SuggestionLink
                  to={q.id}
                  title={pick(q.title, lang)}
                  meta={t("quiz.home.meta", { count: q.items.length, minutes: q.minutes })}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-accent-300/60 bg-accent-50 p-5 dark:border-accent-700/60 dark:bg-accent-900/20 print:hidden">
        <h2 className="font-heading text-lg font-semibold">{t("quiz.result.tokoTitle")}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {parcours.audience === "child" ? t("quiz.result.tokoChild") : t("quiz.result.tokoSelf")}
        </p>
        <Link to="/" data-umami-event="quiz-toko-click" data-umami-event-quiz={parcours.id}>
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

function DimensionBars({ q, result }: { q: Questionnaire; result: ScreeningResult }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="grid gap-4">
      {result.dimensions.map((d) => {
        const dim = q.dimensions.find((x) => x.id === d.id)!;
        const at = (d.threshold / d.total) * 100;
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
              <div className="absolute -top-1 -bottom-1 w-0.5 rounded bg-foreground/60" style={{ left: `${at}%` }} aria-hidden />
            </div>
            <p className="mt-1 text-xs text-muted-foreground" style={{ paddingLeft: `max(0px, calc(${at}% - 2.5rem))` }}>
              {t("quiz.result.threshold", { threshold: d.threshold })}
            </p>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">{pick(q.source.detail, lang)}</p>
    </div>
  );
}

function SuggestionLink({ to, title, meta, highlight }: { to: string; title: string; meta: string; highlight?: boolean }) {
  return (
    <Link
      to="/quiz/$id"
      params={{ id: to }}
      className={`group flex items-center gap-3 rounded-xl border p-3.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 ${
        highlight ? "border-primary/40 bg-primary/5 hover:bg-primary/10" : "border-border hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{meta}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

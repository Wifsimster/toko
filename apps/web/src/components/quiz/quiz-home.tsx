import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { ArrowLeft, ChevronRight, Lock, Smile, User, BookOpen } from "lucide-react";
import {
  QUESTIONNAIRE_IDS,
  QUESTIONNAIRES,
  pick,
  type Audience,
} from "@/lib/screening/questionnaires";
import { useSeoHead } from "@/hooks/use-seo-head";
import { QuizShell } from "./quiz-shell";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.18 },
};

export function QuizHome() {
  const { t, i18n } = useTranslation();
  const [audience, setAudience] = useState<Audience | null>(null);
  useSeoHead({
    title: t("quiz.seo.title"),
    description: t("quiz.seo.description"),
    canonical: "https://toko.battistella.ovh/quiz",
  });

  const choices = QUESTIONNAIRE_IDS.map((id) => QUESTIONNAIRES[id]).filter(
    (q) => q.audience === audience,
  );

  return (
    <QuizShell>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("quiz.home.title")}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("quiz.home.description")}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              {t("quiz.privacy")}
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {audience === null ? (
              <m.section key="who" {...fade} className="mt-8" aria-labelledby="quiz-who">
                <h2 id="quiz-who" className="mb-3 text-lg font-semibold">
                  {t("quiz.home.who")}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard
                    icon={<User className="size-6" aria-hidden />}
                    title={t("quiz.home.self")}
                    hint={t("quiz.home.selfHint")}
                    onClick={() => setAudience("self")}
                  />
                  <ChoiceCard
                    icon={<Smile className="size-6" aria-hidden />}
                    title={t("quiz.home.child")}
                    hint={t("quiz.home.childHint")}
                    onClick={() => setAudience("child")}
                  />
                </div>
              </m.section>
            ) : (
              <m.section key="what" {...fade} className="mt-8" aria-labelledby="quiz-what">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 id="quiz-what" className="text-lg font-semibold">
                    {t("quiz.home.what")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setAudience(null)}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    {t("quiz.home.change")}
                  </button>
                </div>
                <ul className="grid gap-3">
                  {choices.map((q) => (
                    <li key={q.id}>
                      <Link
                        to="/quiz/$id"
                        params={{ id: q.id }}
                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-xs outline-none transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-semibold">{pick(q.title, i18n.language)}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {pick(q.subtitle, i18n.language)}
                          </span>
                          <span className="mt-2 block text-xs font-medium text-primary">
                            {t("quiz.home.meta", { count: q.items.length, minutes: q.minutes })}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-3 rounded-2xl bg-muted/50 p-4 text-sm">
                  <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <p>
                    <span className="font-medium">{t("quiz.home.dysTitle")}</span>{" "}
                    <span className="text-muted-foreground">{t("quiz.home.dysText")}</span>
                  </p>
                </div>
              </m.section>
            )}
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </QuizShell>
  );
}

function ChoiceCard({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-xs outline-none transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] sm:flex-col sm:items-start sm:gap-3 sm:p-6"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <span>
        <span className="block text-lg font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

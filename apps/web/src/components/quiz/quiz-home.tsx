import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from "motion/react";
import { ArrowLeft, ChevronRight, Lock, Smile, User, BookOpen } from "lucide-react";
import { completeFor, getParcours, questionCount, type Parcours } from "@/lib/screening/parcours";
import { LoopVisual, loopForParcours } from "./loop-visual";
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
  const { pour } = useSearch({ from: "/quiz/" });
  const navigate = useNavigate({ from: "/quiz/" });
  const audience: Audience | null = pour === "moi" ? "self" : pour === "enfant" ? "child" : null;
  const setAudience = (next: Audience | null) =>
    navigate({ search: next ? { pour: next === "self" ? "moi" : "enfant" } : {} });
  // Once "for whom" is answered, the intro folds away on phones so the list
  // starts at the top of the screen.
  const folded = audience !== null;
  useSeoHead({
    title: t("quiz.seo.title"),
    description: t("quiz.seo.description"),
    canonical: "https://toko.battistella.ovh/quiz",
  });

  // The complete parcours first: disorders overlap, and it spares a choice.
  const choices: Parcours[] = audience
    ? [
        completeFor(audience),
        ...QUESTIONNAIRE_IDS.filter((id) => QUESTIONNAIRES[id].audience === audience).map(getParcours),
      ]
    : [];

  return (
    <QuizShell>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user">
          <div className="text-center">
            <LoopVisual
              name="clarity"
              eager
              className={`mx-auto -my-6 w-52 sm:-my-8 sm:block sm:w-80 ${folded ? "hidden" : ""}`}
            />
            <h1
              className={`font-heading font-semibold leading-tight tracking-tight sm:text-4xl ${
                folded ? "text-2xl" : "text-[1.75rem]"
              }`}
            >
              {t("quiz.home.title")}
            </h1>
            <p className={`mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground sm:block ${folded ? "hidden" : ""}`}>
              {t("quiz.home.description")}
            </p>
            <p className={`mt-4 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex ${folded ? "hidden" : "inline-flex"}`}>
              <Lock className="size-3.5" aria-hidden />
              {t("quiz.privacy")}
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {audience === null ? (
              <m.section key="who" {...fade} className="mt-6 sm:mt-8" aria-labelledby="quiz-who">
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
              <m.section key="what" {...fade} className="mt-4 sm:mt-8" aria-labelledby="quiz-what">
                <button
                  type="button"
                  onClick={() => setAudience(null)}
                  aria-label={t("quiz.home.change")}
                  className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  {audience === "self" ? t("quiz.home.self") : t("quiz.home.child")}
                </button>
                <h2 id="quiz-what" className="mb-3 text-base font-semibold sm:text-lg">
                  {t("quiz.home.what")}
                </h2>
                <ul className="grid gap-3">
                  {choices.map((q, i) => (
                    <li key={q.id}>
                      <Link
                        to="/quiz/$id"
                        params={{ id: q.id }}
                        className={`group flex touch-manipulation items-center gap-3 rounded-2xl border p-3 text-left shadow-xs outline-none transition-colors [-webkit-tap-highlight-color:transparent] active:scale-[0.99] hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4 sm:p-4 ${
                          i === 0 ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                        }`}
                      >
                        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/8 sm:size-24">
                          <LoopVisual name={loopForParcours(q)} className="w-24 shrink-0 sm:w-32" />
                        </span>
                        <span className="min-w-0 flex-1">
                          {i === 0 && (
                            <span className="mb-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                              {t("quiz.home.completeBadge")}
                            </span>
                          )}
                          <span className="block text-base font-semibold">{pick(q.title, i18n.language)}</span>
                          <span className="mt-1 line-clamp-2 text-sm text-muted-foreground sm:line-clamp-none">
                            {pick(q.subtitle, i18n.language)}
                          </span>
                          <span className="mt-1.5 block text-xs font-medium text-primary">
                            {t("quiz.home.meta", { count: questionCount(q), minutes: q.minutes })}
                          </span>
                        </span>
                        <ChevronRight
                          className="hidden size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block"
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
      className="flex touch-manipulation items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-xs outline-none transition-colors [-webkit-tap-highlight-color:transparent] hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] sm:flex-col sm:items-start sm:gap-3 sm:p-6"
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

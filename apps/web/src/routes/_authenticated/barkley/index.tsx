import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LazyMotion, m as motion, MotionConfig, domAnimation } from "motion/react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { buttonVariants } from "@/components/ui/button-variants";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useBillingStatus } from "@/hooks/use-billing";
import { FormationLockCard } from "@/components/barkley/formation-lock-card";
import { ProgramPath } from "@/components/barkley/program-path";
import { useUiStore } from "@/stores/ui-store";
import { getAllStepTitles } from "@/lib/barkley-content";

export const Route = createFileRoute("/_authenticated/barkley/")({
  component: BarkleyPage,
  staticData: {
    crumb: "nav.barkley",
  },
});

function BarkleyPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);
  const { data: billing } = useBillingStatus();

  // Formation is a paid offer. Grandfathered users, one-shot buyers and
  // Famille subscribers get the curriculum; everyone else sees the buy
  // screen. Gate before the child check — ownership is account-level.
  if (billing && billing.ownsFormation === false) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("barkley.title")}
          description={t("barkley.subtitle")}
        />
        <FormationLockCard />
      </div>
    );
  }

  if (!activeChildId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("barkley.title")}
          description={t("barkley.subtitle")}
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("barkley.selectChild")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("barkley.title")}
        description={t("barkley.subtitle")}
      />

      <FormationTimeline childId={activeChildId} />

      {/* Rappel du cadre : utile, mais pas au-dessus de ce que le parent vient faire. */}
      <Callout variant="info">
        <p>{t("barkley.formation.disclaimer")}</p>
      </Callout>
    </div>
  );
}

// Les trois blocs du programme, comme sur la page publique /formation.
const BLOCKS = [
  { key: "understand", from: 1, to: 3 },
  { key: "act", from: 4, to: 7 },
  { key: "anchor", from: 8, to: 10 },
] as const;

function FormationTimeline({ childId }: { childId: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const stepTitles = getAllStepTitles(i18n.resolvedLanguage === "en" ? "en" : "fr");

  const { data: steps, isLoading } = useBarkleySteps(childId);

  // Une ligne peut exister sans être validée : seule `completedAt` compte
  // (même règle que la carte du tableau de bord).
  const completedAt = useMemo(() => {
    const map = new Map<number, string>();
    steps?.forEach((s) => {
      if (s.completedAt) map.set(s.stepNumber, s.completedAt);
    });
    return map;
  }, [steps]);
  const completedSet = useMemo(() => new Set(completedAt.keys()), [completedAt]);

  if (isLoading) {
    return <PageLoader />;
  }

  const current =
    stepTitles.find((s) => !completedAt.has(s.stepNumber))?.stepNumber ?? null;
  const currentTitle = stepTitles.find((s) => s.stepNumber === current)?.title;
  const currentBlock = BLOCKS.find((b) => current && current >= b.from && current <= b.to);
  const doneCount = completedAt.size;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="space-y-8">
          {/* Où vous en êtes */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            aria-labelledby="barkley-current"
            className="relative overflow-hidden rounded-2xl border border-honey-border bg-honey-surface p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.85_0.09_75_/_0.3),transparent_70%)]" />
            <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="order-2 space-y-4 md:order-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-honey-foreground">
                  {current
                    ? t("barkley.path.stepOf", { current })
                    : t("barkley.path.doneEyebrow")}
                </p>
                <h2
                  id="barkley-current"
                  className="font-heading text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl"
                >
                  {current ? currentTitle : t("barkley.path.doneTitle")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {current && currentBlock
                    ? t("barkley.path.blockLine", {
                        block: t(`formationPage.steps.${currentBlock.key}.title`),
                        count: doneCount,
                      })
                    : t("barkley.path.doneBody")}
                </p>
                <Link
                  to="/barkley/formation/$stepNumber"
                  params={{ stepNumber: current ?? 10 }}
                  className={buttonVariants({
                    size: "lg",
                    className: "gap-2 px-6 shadow-md shadow-primary/20",
                  })}
                >
                  {current
                    ? doneCount === 0
                      ? t("barkley.path.start")
                      : t("barkley.path.resume", { number: current })
                    : t("barkley.path.review")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="order-1 md:order-2">
                <ProgramPath completed={completedSet} current={current} />
                <p className="sr-only">
                  {t("barkley.progressValue", { completed: doneCount })}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Les 10 étapes, par bloc */}
          {BLOCKS.map((block, bi) => {
            const blockSteps = stepTitles.filter(
              (s) => s.stepNumber >= block.from && s.stepNumber <= block.to,
            );
            const blockDone = blockSteps.filter((s) => completedAt.has(s.stepNumber)).length;
            return (
              <motion.section
                key={block.key}
                aria-labelledby={`block-${block.key}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 + bi * 0.12 }}
              >
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-honey-foreground">
                      {t("barkley.path.blockRange", { from: block.from, to: block.to })}
                    </p>
                    <h3 id={`block-${block.key}`} className="font-heading text-lg font-semibold">
                      {t(`formationPage.steps.${block.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`formationPage.steps.${block.key}.body`)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                    {blockDone}/{blockSteps.length}
                  </span>
                </div>
                <ol className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                  {blockSteps.map((step, i) => {
                    const date = completedAt.get(step.stepNumber);
                    const isCurrent = step.stepNumber === current;
                    return (
                      <motion.li
                        key={step.stepNumber}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 + bi * 0.12 + i * 0.05 }}
                        className="border-b border-border/60 last:border-b-0"
                      >
                        <Link
                          to="/barkley/formation/$stepNumber"
                          params={{ stepNumber: step.stepNumber }}
                          aria-current={isCurrent ? "step" : undefined}
                          className={`group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none sm:px-5 ${
                            isCurrent ? "bg-honey-surface/60" : ""
                          }`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                              date
                                ? "bg-primary text-primary-foreground"
                                : isCurrent
                                  ? "border-2 border-honey-foreground text-honey-foreground"
                                  : "border border-border text-muted-foreground"
                            }`}
                          >
                            {date ? <Check className="size-4" aria-label={t("barkley.path.done")} /> : step.stepNumber}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-sm font-medium ${
                                date ? "text-foreground/80" : "text-foreground"
                              } group-hover:text-primary`}
                            >
                              {step.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {date
                                ? t("barkley.completedOn", {
                                    date: new Date(date).toLocaleDateString(locale, {
                                      day: "numeric",
                                      month: "long",
                                    }),
                                  })
                                : isCurrent
                                  ? t("barkley.formation.readAndQuiz")
                                  : t("barkley.path.upcoming")}
                            </span>
                          </span>
                          {isCurrent && (
                            <span className="hidden shrink-0 rounded-full border border-honey-border bg-honey-surface px-2 py-0.5 text-xs font-medium text-honey-foreground sm:inline">
                              {t("barkley.path.inProgress")}
                            </span>
                          )}
                          <ChevronRight
                            className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                            aria-hidden="true"
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ol>
              </motion.section>
            );
          })}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

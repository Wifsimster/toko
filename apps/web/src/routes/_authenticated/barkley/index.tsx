import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LazyMotion, m as motion, MotionConfig, domAnimation } from "motion/react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { buttonVariants } from "@/components/ui/button-variants";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useBillingStatus } from "@/hooks/use-billing";
import { FormationLockCard } from "@/components/barkley/formation-lock-card";
import { LeafPath } from "@/components/barkley/leaf-path";
import { BarkleySectionScene } from "@/components/barkley/barkley-section-scene";
import { getStepContent } from "@/lib/barkley-content";
import { readingMinutes } from "@/lib/barkley-content/reading-time";
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
        <EmptyState title={t("barkley.selectChild")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <PageHeader
          title={t("barkley.title")}
          description={t("barkley.path.subtitle")}
        />
        <p className="mt-1 text-xs text-muted-foreground">{t("barkley.subtitle")}</p>
      </div>

      <FormationTimeline childId={activeChildId} />

      <Callout variant="info">
        <p>{t("barkley.formation.disclaimer")}</p>
      </Callout>
    </div>
  );
}

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
  const heroMinutes = readingMinutes(
    getStepContent(current ?? 10, i18n.resolvedLanguage === "en" ? "en" : "fr"),
  );

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            aria-labelledby="barkley-current"
            className="rounded-[28px] border border-honey-border bg-honey-surface p-5 sm:p-6"
          >
            <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="space-y-3">
                <p aria-hidden="true" className="font-hand text-[21px] leading-none font-semibold text-honey-foreground">
                  {current ? t("barkley.path.stepOf", { current }) : t("barkley.path.doneEyebrow")}
                </p>
                <h2
                  id="barkley-current"
                  className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-balance sm:text-3xl"
                >
                  <span className="sr-only">
                    {current ? t("barkley.path.stepOf", { current }) : t("barkley.path.doneEyebrow")}
                    {" · "}
                  </span>
                  {current ? currentTitle : t("barkley.path.doneTitle")}
                </h2>
                {!current && <p className="text-sm text-muted-foreground">{t("barkley.path.doneBody")}</p>}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    to="/barkley/formation/$stepNumber"
                    params={{ stepNumber: current ?? 10 }}
                    className={buttonVariants({
                      size: "lg",
                      className: "min-h-11 gap-2 rounded-full px-5 md:h-11",
                    })}
                  >
                    {current
                      ? doneCount === 0
                        ? t("barkley.path.start")
                        : t("barkley.path.resume", { number: current })
                      : t("barkley.path.review")}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <span className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold">
                    {t("barkley.path.readingTime", { count: heroMinutes })}
                  </span>
                </div>
              </div>
              <BarkleySectionScene stepNumber={current ?? 10} section="technique" />
            </div>
          </motion.section>

          <section aria-labelledby="barkley-leaf-path" className="rounded-[28px] border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="barkley-leaf-path" className="text-[0.9375rem] font-semibold">
                {t("barkley.path.leafTitle")}
              </h2>
              <p aria-hidden="true" className="font-hand text-[19px] leading-none font-semibold text-brand-strong">
                {t("barkley.path.leafNote", { count: doneCount })}
              </p>
            </div>
            <div className="mt-4">
              <LeafPath completed={completedSet} current={current} />
            </div>
            {current && currentBlock && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("barkley.path.blockLine", {
                  block: t(`formationPage.steps.${currentBlock.key}.title`),
                  count: doneCount,
                })}
              </p>
            )}
          </section>

          {BLOCKS.map((block, bi) => {
            const blockSteps = stepTitles.filter(
              (s) => s.stepNumber >= block.from && s.stepNumber <= block.to,
            );
            const blockDone = blockSteps.filter((s) => completedAt.has(s.stepNumber)).length;
            const finished = current !== null && blockDone === blockSteps.length;
            return (
              <motion.section
                key={block.key}
                aria-labelledby={`block-${block.key}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 + bi * 0.12 }}
              >
                <details open={!finished} className="group/block">
                <summary className="mb-3 flex cursor-pointer list-none items-end justify-between gap-3 rounded-lg [&::-webkit-details-marker]:hidden">
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
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {finished ? (
                      <>
                        <Check className="size-3.5" aria-hidden="true" />
                        {t("barkley.path.blockDone")}
                      </>
                    ) : (
                      t("barkley.path.blockCount", { count: blockDone })
                    )}
                    <ChevronRight
                      className="size-3.5 transition-transform group-open/block:rotate-90"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
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
                                ? "bg-brand text-primary-foreground"
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
                              } group-hover:text-brand-strong`}
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
                            className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-strong"
                            aria-hidden="true"
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ol>
                </details>
              </motion.section>
            );
          })}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, BookOpen } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { useBarkleySteps } from "@/hooks/use-barkley";
import { useUiStore } from "@/stores/ui-store";
import { getAllStepTitles } from "@/lib/barkley-content";

export const Route = createFileRoute("/_authenticated/barkley/")({
  component: BarkleyPage,
  staticData: { crumb: "nav.barkley" },
});

function BarkleyPage() {
  const { t } = useTranslation();
  const activeChildId = useUiStore((s) => s.activeChildId);

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

      {/* Disclaimer */}
      <Callout variant="info">
        <p>{t("barkley.formation.disclaimer")}</p>
      </Callout>

      <FormationTimeline childId={activeChildId} />
    </div>
  );
}

function FormationTimeline({ childId }: { childId: string }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const stepTitles = getAllStepTitles();

  const { data: steps, isLoading } = useBarkleySteps(childId);

  const completedSteps = useMemo(() => {
    const map = new Map<
      number,
      { id: string; completedAt: string | null }
    >();
    steps?.forEach((s) =>
      map.set(s.stepNumber, {
        id: s.id,
        completedAt: s.completedAt ?? null,
      }),
    );
    return map;
  }, [steps]);

  const completedCount = completedSteps.size;
  const progressValue = (completedCount / 10) * 100;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-4">
      {/* Progress card */}
      <Card>
        <CardContent className="py-4">
          <Progress value={progressValue}>
            <ProgressLabel>{t("barkley.progress")}</ProgressLabel>
            <ProgressValue>
              {() =>
                t("barkley.progressValue", { completed: completedCount })
              }
            </ProgressValue>
          </Progress>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative space-y-0">
        {stepTitles.map((step, i) => {
          const completed = completedSteps.get(step.stepNumber);
          const isCompleted = !!completed;
          const isLast = i === stepTitles.length - 1;

          return (
            <Link
              key={step.stepNumber}
              to="/barkley/formation/$stepNumber"
              params={{ stepNumber: step.stepNumber }}
              className="group relative flex gap-4 py-3 transition-colors hover:bg-muted/30"
            >
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-[15px] top-[44px] h-[calc(100%-20px)] w-px bg-border group-hover:bg-primary/30" />
              )}
              {/* Circle */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
                  }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    {step.stepNumber}
                  </span>
                )}
              </div>
              {/* Content */}
              <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${isCompleted
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary"
                      }`}
                  >
                    {step.title}
                  </p>
                  {isCompleted && completed.completedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("barkley.completedOn", {
                        date: new Date(
                          completed.completedAt,
                        ).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }),
                      })}
                    </p>
                  )}
                  {!isCompleted && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {t("barkley.formation.readAndQuiz")}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

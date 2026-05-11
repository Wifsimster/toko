import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  BarChart3,
  Activity,
  ListChecks,
  HandHeart,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { PricingCatalogue } from "./pricing-catalogue";

type StepKey =
  | "welcome"
  | "dashboard"
  | "tracking"
  | "routines"
  | "care"
  | "plans"
  | "ready";

const STEPS: {
  key: StepKey;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "welcome", icon: Sparkles },
  { key: "dashboard", icon: BarChart3 },
  { key: "tracking", icon: Activity },
  { key: "routines", icon: ListChecks },
  { key: "care", icon: HandHeart },
  { key: "plans", icon: Wallet },
  { key: "ready", icon: PartyPopper },
];

export function OnboardingTour() {
  const { t } = useTranslation();
  const session = useSession();
  const onboardingCompleted = useUiStore((s) => s.onboardingCompleted);
  const completeOnboarding = useUiStore((s) => s.completeOnboarding);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Open the tour automatically when an authenticated parent has not yet
  // completed it. Wait for the session so we don't flash it on logout.
  useEffect(() => {
    if (session.isPending) return;
    if (!session.data?.user) return;
    if (onboardingCompleted) return;
    setOpen(true);
  }, [session.isPending, session.data, onboardingCompleted]);

  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;
  const step = STEPS[stepIndex] ?? STEPS[0]!;
  const Icon = step.icon;

  const handleClose = () => {
    completeOnboarding();
    setOpen(false);
    setStepIndex(0);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const isPlansStep = step.key === "plans";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(isPlansStep ? "sm:max-w-xl" : "sm:max-w-md")}
      >
        <DialogHeader className="items-center text-center">
          <span
            aria-hidden="true"
            className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Icon className="h-6 w-6" />
          </span>
          <DialogTitle className="text-lg">
            {t(`onboarding.steps.${step.key}.title`)}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(`onboarding.steps.${step.key}.body`)}
          </DialogDescription>
        </DialogHeader>

        {isPlansStep && (
          <PricingCatalogue onContinueFree={handleNext} />
        )}

        <div
          role="tablist"
          aria-label={t("onboarding.progressLabel")}
          className="flex justify-center gap-1.5"
        >
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              role="tab"
              aria-selected={i === stepIndex}
              aria-label={t("onboarding.stepAria", {
                index: i + 1,
                total: STEPS.length,
              })}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIndex
                  ? "w-6 bg-primary"
                  : i < stepIndex
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          {isFirst ? (
            <Button variant="ghost" size="sm" onClick={handleClose}>
              {t("onboarding.skip")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              aria-label={t("onboarding.previous")}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {t("onboarding.previous")}
            </Button>
          )}

          <Button size="sm" onClick={handleNext}>
            {isLast ? t("onboarding.finish") : t("onboarding.next")}
            {!isLast && (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

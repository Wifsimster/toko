import { useState, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
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
  BookOpen,
  ArrowUpRight,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUiStore } from "@/stores/ui-store";
import { useSession } from "@/lib/auth-client";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PricingCatalogue } from "./pricing-catalogue";

type StepKey =
  | "welcome"
  | "dashboard"
  | "tracking"
  | "routines"
  | "care"
  | "plans"
  | "discover"
  | "ready";

type Placement = "right" | "left" | "top" | "bottom";

type Step = {
  key: StepKey;
  icon: React.ComponentType<{ className?: string }>;
  /** Selector value for [data-tour="..."]. Omit for a centered modal. */
  anchor?: string;
  placement?: Placement;
};

const STEPS: Step[] = [
  { key: "welcome", icon: Sparkles },
  { key: "dashboard", icon: BarChart3, anchor: "/dashboard", placement: "right" },
  { key: "tracking", icon: Activity, anchor: "/symptoms", placement: "right" },
  { key: "routines", icon: ListChecks, anchor: "/routines", placement: "right" },
  { key: "care", icon: HandHeart, anchor: "sos", placement: "left" },
  { key: "plans", icon: Wallet },
  { key: "discover", icon: BookOpen },
  { key: "ready", icon: PartyPopper, anchor: "user-menu", placement: "right" },
];

// Curated kit shown on the "discover" step. Three guides + one routine
// template selected with the product owner (#232). Picks should change
// only via that issue so the cohort A/B comparison stays interpretable.
type DiscoverItemKind = "guide" | "protocol";

type DiscoverItem = {
  kind: DiscoverItemKind;
  /** Stable analytics slug. Matches the article slug for guides and the
   * routine-template key for protocols. */
  slug: string;
  /** i18n key under `onboarding.kit.<key>`. */
  i18nKey: string;
  to: "/connaissances/$slug" | "/routines";
  params?: { slug: string };
};

const ONBOARDING_KIT: readonly DiscoverItem[] = [
  {
    kind: "guide",
    slug: "crise-tdah-enfant-guide-complet",
    i18nKey: "crisis",
    to: "/connaissances/$slug",
    params: { slug: "crise-tdah-enfant-guide-complet" },
  },
  {
    kind: "guide",
    slug: "co-regulation-parent-enfant-tdah",
    i18nKey: "coregulation",
    to: "/connaissances/$slug",
    params: { slug: "co-regulation-parent-enfant-tdah" },
  },
  {
    kind: "guide",
    slug: "apres-le-diagnostic-tdah-parcours-de-soins",
    i18nKey: "diagnosis",
    to: "/connaissances/$slug",
    params: { slug: "apres-le-diagnostic-tdah-parcours-de-soins" },
  },
  {
    kind: "protocol",
    slug: "bedtime",
    i18nKey: "bedtime",
    to: "/routines",
  },
];

const POPOVER_OFFSET = 12;
const POPOVER_WIDTH = 320;
const VIEWPORT_PADDING = 12;

export function OnboardingTour() {
  const { t } = useTranslation();
  const session = useSession();
  const isMobile = useIsMobile();
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

  const navigate = useNavigate();
  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;
  const step = STEPS[stepIndex] ?? STEPS[0]!;
  const Icon = step.icon;
  const isPlansStep = step.key === "plans";
  const isDiscoverStep = step.key === "discover";

  const handleResourceClick = (item: DiscoverItem) => {
    trackEvent("onboarding_resource_opened", {
      slug: item.slug,
      kind: item.kind,
    });
    completeOnboarding();
    setOpen(false);
    setStepIndex(0);
    if (item.params) {
      void navigate({ to: item.to, params: item.params });
    } else {
      void navigate({ to: item.to });
    }
  };

  // Anchored mode is only attempted on non-mobile when the step declares one.
  const wantsAnchor = open && !!step.anchor && !isMobile;
  const anchorRect = useAnchorRect(step.anchor, wantsAnchor);
  const useAnchored =
    wantsAnchor &&
    anchorRect !== null &&
    fitsInViewport(anchorRect, step.placement!);

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

  // Esc closes the anchored popover (the Dialog handles it natively).
  useEffect(() => {
    if (!useAnchored) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAnchored]);

  if (!open) return null;

  const progressDots = (
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
  );

  const navButtons = (
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
          <ChevronLeft className="size-4" aria-hidden="true" />
          {t("onboarding.previous")}
        </Button>
      )}

      <Button size="sm" onClick={handleNext}>
        {isLast ? t("onboarding.finish") : t("onboarding.next")}
        {!isLast && <ChevronRight className="size-4" aria-hidden="true" />}
      </Button>
    </div>
  );

  if (useAnchored && anchorRect) {
    const popoverStyle = computePopoverStyle(anchorRect, step.placement!);
    return (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background transition-all duration-200"
          style={{
            top: anchorRect.top,
            left: anchorRect.left,
            width: anchorRect.width,
            height: anchorRect.height,
          }}
        />
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="onboarding-tour-title"
          aria-describedby="onboarding-tour-body"
          className="fixed z-50 flex flex-col gap-4 rounded-lg border bg-background p-5 shadow-lg"
          style={{
            ...popoverStyle,
            width: POPOVER_WIDTH,
            maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("onboarding.skip")}
            className="absolute right-2 top-2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>

          <header className="flex flex-col items-center gap-2 text-center">
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Icon className="size-6" />
            </span>
            <h2 id="onboarding-tour-title" className="text-lg font-semibold">
              {t(`onboarding.steps.${step.key}.title`)}
            </h2>
            <p
              id="onboarding-tour-body"
              className="text-sm text-muted-foreground"
            >
              {t(`onboarding.steps.${step.key}.body`)}
            </p>
          </header>

          {progressDots}
          {navButtons}
        </div>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          isPlansStep || isDiscoverStep ? "sm:max-w-xl" : "sm:max-w-md"
        )}
      >
        <DialogHeader className="items-center text-center">
          <span
            aria-hidden="true"
            className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Icon className="size-6" />
          </span>
          <DialogTitle className="text-lg">
            {t(`onboarding.steps.${step.key}.title`)}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(`onboarding.steps.${step.key}.body`)}
          </DialogDescription>
        </DialogHeader>

        {isPlansStep && <PricingCatalogue onContinueFree={handleNext} />}

        {isDiscoverStep && (
          <ul className="flex flex-col gap-2">
            {ONBOARDING_KIT.map((item) => (
              <li key={`${item.kind}:${item.slug}`}>
                <Link
                  to={item.to}
                  params={item.params as never}
                  onClick={() => handleResourceClick(item)}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    {item.kind === "guide" ? (
                      <BookOpen className="size-4" />
                    ) : (
                      <ListChecks className="size-4" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {t(`onboarding.kit.${item.i18nKey}.title`)}
                      <ArrowUpRight
                        className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t(`onboarding.kit.${item.i18nKey}.subtitle`)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {progressDots}
        {navButtons}
      </DialogContent>
    </Dialog>
  );
}

function useAnchorRect(anchor: string | undefined, enabled: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!enabled || !anchor) {
      setRect(null);
      return;
    }
    let raf = 0;
    const update = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour="${CSS.escape(anchor)}"]`
      );
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
      setRect(el.getBoundingClientRect());
    };
    update();
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [anchor, enabled]);

  return rect;
}

function fitsInViewport(rect: DOMRect, placement: Placement): boolean {
  const vw = window.innerWidth;
  switch (placement) {
    case "right":
      return rect.right + POPOVER_OFFSET + POPOVER_WIDTH <= vw - VIEWPORT_PADDING;
    case "left":
      return rect.left - POPOVER_OFFSET - POPOVER_WIDTH >= VIEWPORT_PADDING;
    case "top":
    case "bottom":
      return vw - VIEWPORT_PADDING * 2 >= POPOVER_WIDTH;
  }
}

function computePopoverStyle(
  rect: DOMRect,
  placement: Placement
): React.CSSProperties {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  switch (placement) {
    case "right":
      return {
        top: clamp(
          rect.top + rect.height / 2,
          VIEWPORT_PADDING + 80,
          vh - VIEWPORT_PADDING - 80
        ),
        left: rect.right + POPOVER_OFFSET,
        transform: "translateY(-50%)",
      };
    case "left":
      return {
        top: clamp(
          rect.top + rect.height / 2,
          VIEWPORT_PADDING + 80,
          vh - VIEWPORT_PADDING - 80
        ),
        left: rect.left - POPOVER_OFFSET,
        transform: "translate(-100%, -50%)",
      };
    case "top":
      return {
        top: rect.top - POPOVER_OFFSET,
        left: clamp(
          rect.left + rect.width / 2,
          VIEWPORT_PADDING + POPOVER_WIDTH / 2,
          vw - VIEWPORT_PADDING - POPOVER_WIDTH / 2
        ),
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        top: rect.bottom + POPOVER_OFFSET,
        left: clamp(
          rect.left + rect.width / 2,
          VIEWPORT_PADDING + POPOVER_WIDTH / 2,
          vw - VIEWPORT_PADDING - POPOVER_WIDTH / 2
        ),
        transform: "translate(-50%, 0)",
      };
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

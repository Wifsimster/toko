import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillingStatus, useCheckout, persistSelectedPlan } from "@/hooks/use-billing";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  PAYWALL_VARIANT as BUILD_TIME_PAYWALL_VARIANT,
  type PaywallVariant,
} from "@/lib/paywall-variant";
import { useFeatureFlag } from "@/hooks/use-feature-flags";
import { trackEvent, trackEventOnce } from "@/lib/analytics";

// Reusable gate for premium-only sections. While billing is loading, we
// render a skeleton so the page doesn't flash the upsell on premium users.
// When the user isn't active, we show a *preview* card with the section's
// title + an honest "what you'd unlock" body, then a single CTA to start
// a trial. The preview never blurs out real data — that would be a dark
// pattern flagged by `docs/freemium-ethics-policy.md`.
//
// `previewTitle` and `previewBody` come from the caller because the
// honest framing of each gated section varies (a trend graph vs. a
// correlation insight read differently when teased).
export function PremiumGate({
  children,
  previewTitle,
  previewBody,
  className,
}: {
  children: ReactNode;
  previewTitle: string;
  previewBody: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const billing = useBillingStatus();
  const checkout = useCheckout();
  // Runtime variant lookup. While the flag query resolves we fall back
  // to the build-time env var so the first paint is never blank.
  const variant = useFeatureFlag<PaywallVariant>(
    "paywall_variant",
    BUILD_TIME_PAYWALL_VARIANT,
  );

  const isLocked = !billing.isLoading && !billing.data?.active;
  useEffect(() => {
    if (!isLocked) return;
    trackEventOnce(`paywall:${previewTitle}`, "paywall_viewed", {
      section: previewTitle,
      variant,
    });
  }, [isLocked, previewTitle, variant]);

  if (billing.isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (billing.data?.active) {
    return <div className={className}>{children}</div>;
  }

  const startTrial = () => {
    trackEvent("trial_started", {
      section: previewTitle,
      variant,
    });
    persistSelectedPlan("annual");
    checkout.mutate("annual");
  };

  return (
    <Card
      className={cn(
        "border-primary/30 bg-primary/5",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="size-4 text-primary" aria-hidden="true" />
          {previewTitle}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {previewBody}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          onClick={startTrial}
          disabled={checkout.isPending}
          className="gap-2"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {checkout.isPending
            ? t("premiumGate.ctaLoading")
            : t(`premiumGate.variants.${variant}.cta`)}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("premiumGate.trialHint")}
        </p>
      </CardContent>
    </Card>
  );
}

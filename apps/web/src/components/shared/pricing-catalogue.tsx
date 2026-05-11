import { useTranslation } from "react-i18next";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCheckout, persistSelectedPlan } from "@/hooks/use-billing";

// Compact, transparent Gratuit vs Famille catalogue used at onboarding
// and from the account page. The requirement (#184) is "lecture en moins
// de 30 secondes" — keep each column to ≤ 5 short bullet points, no
// jargon, no asterisks. The exhaustive comparison stays on the landing
// page; this is the in-app pre-checkout view.

const FREE_BULLETS = [
  "onboarding.plans.free.bullet1",
  "onboarding.plans.free.bullet2",
  "onboarding.plans.free.bullet3",
  "onboarding.plans.free.bullet4",
];

const FAMILY_BULLETS = [
  "onboarding.plans.family.bullet1",
  "onboarding.plans.family.bullet2",
  "onboarding.plans.family.bullet3",
  "onboarding.plans.family.bullet4",
];

export function PricingCatalogue({
  onContinueFree,
  className,
}: {
  /** Called when the user explicitly stays on the free plan. */
  onContinueFree?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const checkout = useCheckout();

  const startTrial = () => {
    // 14j trial uses the annual plan by default — same default the
    // existing checkout endpoint applies. Persisting the selection keeps
    // the post-signup hand-off (when relevant) consistent.
    persistSelectedPlan("annual");
    checkout.mutate("annual");
  };

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <PlanColumn
        title={t("onboarding.plans.free.title")}
        priceLabel={t("onboarding.plans.free.price")}
        bullets={FREE_BULLETS.map((k) => t(k))}
        cta={
          <Button
            variant="outline"
            className="w-full"
            onClick={onContinueFree}
            type="button"
          >
            {t("onboarding.plans.free.cta")}
          </Button>
        }
      />
      <PlanColumn
        title={t("onboarding.plans.family.title")}
        priceLabel={t("onboarding.plans.family.price")}
        badge={t("onboarding.plans.family.badge")}
        highlight
        bullets={FAMILY_BULLETS.map((k) => t(k))}
        cta={
          <Button
            className="w-full"
            type="button"
            onClick={startTrial}
            disabled={checkout.isPending}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {checkout.isPending
              ? t("onboarding.plans.family.ctaLoading")
              : t("onboarding.plans.family.cta")}
          </Button>
        }
      />
    </div>
  );
}

function PlanColumn({
  title,
  priceLabel,
  badge,
  bullets,
  cta,
  highlight,
}: {
  title: string;
  priceLabel: string;
  badge?: string;
  bullets: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-left",
        highlight
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-background"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{priceLabel}</p>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-xs text-foreground/90"
          >
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">{cta}</div>
    </div>
  );
}

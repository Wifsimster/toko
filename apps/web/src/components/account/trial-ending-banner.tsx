import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { useBillingStatus } from "@/hooks/use-billing";

// Soft, non-pushy in-app banner that surfaces during the last 2 days of
// the 14-day trial. The 3-day mark is already covered server-side by
// the `trial_will_end` Stripe webhook (email). This adds visibility
// in-app for parents who don't open their email — without ever falling
// into "DERNIÈRE CHANCE" FOMO copy. The spec (#184) explicitly forbids
// urgency cues, so the wording stays factual: "no card on file, you'll
// simply switch back to free if you do nothing".
const BANNER_THRESHOLD_DAYS = 2;

function daysRemaining(currentPeriodEnd: string): number {
  const end = Date.parse(currentPeriodEnd);
  if (!Number.isFinite(end)) return Number.POSITIVE_INFINITY;
  const diffMs = end - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function TrialEndingBanner() {
  const { t } = useTranslation();
  const billing = useBillingStatus();
  const data = billing.data;

  if (!data || data.status !== "trialing") return null;
  // If the user already scheduled a cancel, the "cancel scheduled" hint
  // in the billing card already conveys the timeline — don't double the
  // signal.
  if (data.cancelAtPeriodEnd) return null;
  if (!data.currentPeriodEnd) return null;

  const remaining = daysRemaining(data.currentPeriodEnd);
  if (remaining > BANNER_THRESHOLD_DAYS) return null;

  const key =
    remaining <= 0
      ? "account.trialBanner.today"
      : remaining === 1
        ? "account.trialBanner.oneDay"
        : "account.trialBanner.twoDays";

  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-info-border bg-info-surface px-4 py-3 text-info-foreground">
      <Clock className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">{t(key)}</p>
    </div>
  );
}

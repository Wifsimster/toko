import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { useBillingStatus } from "@/hooks/use-billing";

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
    <output className="flex items-start gap-3 rounded-xl border border-info-border bg-info-surface px-4 py-3 text-info-foreground">
      <Clock className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">{t(key)}</p>
    </output>
  );
}

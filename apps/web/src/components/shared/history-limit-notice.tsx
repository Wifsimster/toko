import { useTranslation } from "react-i18next";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBillingStatus, useCheckout } from "@/hooks/use-billing";

// Honest notice shown to free users below a journal / symptom-history list:
// the list only covers the last 30 days (FREE_HISTORY_DAYS, enforced server
// side). The Famille plan unlocks the full history. Surfacing the limit rather
// than silently truncating is required by the freemium-ethics policy.
export function HistoryLimitNotice() {
  const { t } = useTranslation();
  const billing = useBillingStatus();
  const checkout = useCheckout();

  if (billing.isLoading || billing.data?.active) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-accent/10 to-transparent p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {t("history.freeLimitNotice")}
          </p>
          <Button
            size="sm"
            className="mt-3 gap-1.5"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            {t("history.freeLimitCta")}
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

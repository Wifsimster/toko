import { useTranslation } from "react-i18next";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Formation→Famille upsell (§4.2). Shown to a one-shot buyer who has no active
// Famille yet: 50% off their first year. The discount is applied server-side
// on the annual checkout for eligible buyers — the CTA just starts the annual
// flow. Calm, one offer, one action (ADHD-simple); no countdown, no pressure.
export function FamilleUpsell({
  onSubscribe,
  pending,
}: {
  onSubscribe: () => void;
  pending: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="size-4" />
        <span className="text-sm font-semibold uppercase tracking-wide">
          {t("familleUpsell.badge")}
        </span>
      </div>
      <p className="text-sm text-foreground/90">{t("familleUpsell.body")}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-2xl font-semibold">
          {t("familleUpsell.price")}
        </span>
        <span className="text-sm text-muted-foreground line-through">
          {t("familleUpsell.priceStrike")}
        </span>
        <span className="text-sm text-muted-foreground">
          {t("familleUpsell.priceNote")}
        </span>
      </div>
      <Button onClick={onSubscribe} disabled={pending} className="w-full sm:w-auto">
        {pending && (
          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
        )}
        {t("familleUpsell.cta")}
      </Button>
    </div>
  );
}

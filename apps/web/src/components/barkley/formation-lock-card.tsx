import { useTranslation } from "react-i18next";
import { GraduationCap, Lock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormationCheckout } from "@/hooks/use-billing";

// Shown on the Barkley surface when the account does not own the formation
// (new signups after launch, no purchase, no active Famille). Grandfathered
// users, one-shot buyers and Famille subscribers never see this — they get the
// curriculum directly. Deliberately minimal: one price, one action.
export function FormationLockCard() {
  const { t } = useTranslation();
  const checkout = useFormationCheckout();

  const points = ["steps", "lifetime", "practice"] as const;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <GraduationCap className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t("formationLock.title")}
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            {t("formationLock.subtitle")}
          </p>
        </div>

        <ul className="mx-auto flex max-w-sm flex-col gap-2 text-left">
          {points.map((k) => (
            <li key={k} className="flex items-start gap-2 text-sm text-foreground/90">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {t(`formationLock.points.${k}`)}
            </li>
          ))}
        </ul>

        <div className="w-full max-w-sm space-y-3">
          <Button
            size="lg"
            className="w-full gap-2 px-8 text-base shadow-md shadow-primary/20"
            onClick={() => checkout.mutate()}
            disabled={checkout.isPending}
          >
            {checkout.isPending ? (
              t("formationLock.redirecting")
            ) : (
              <>
                <Lock className="size-4" />
                {t("formationLock.cta")}
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground/80">
            {t("formationLock.included")}
          </p>
        </div>

        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">
          {t("formationLock.disclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}

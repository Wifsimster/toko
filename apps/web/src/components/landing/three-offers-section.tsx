import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookOpen, GraduationCap, HeartHandshake, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// "Une marque, trois offres" (§4.2). One verb per card, one price, one action —
// the funnel made legible for a tired parent in five seconds:
// Comprendre (articles, gratuit) → Apprendre (Formation, achat unique) →
// Appliquer (Famille, abonnement). Deliberately NOT the full feature grid;
// that lives below in the Gratuit/Famille PricingSection.
const OFFERS = [
  {
    key: "understand",
    icon: BookOpen,
    to: "/ressources" as const,
    plan: "articles",
    highlight: false,
  },
  {
    key: "learn",
    icon: GraduationCap,
    to: "/formation" as const,
    plan: "formation",
    highlight: true,
  },
  {
    key: "apply",
    icon: HeartHandshake,
    to: "/login" as const,
    plan: "famille",
    highlight: false,
  },
] as const;

export function ThreeOffersSection() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-border/60 py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
            {t("landing.threeOffers.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("landing.threeOffers.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
          {OFFERS.map(({ key, icon: Icon, to, plan, highlight }) => (
            <Card
              key={key}
              className={
                highlight
                  ? "flex flex-col border-primary/30 shadow-lg shadow-primary/10"
                  : "flex flex-col border-border/60"
              }
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={
                      highlight
                        ? "flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
                        : "flex size-11 items-center justify-center rounded-xl bg-muted text-foreground/70"
                    }
                  >
                    <Icon className="size-5" />
                  </div>
                  {t(`landing.threeOffers.${key}.badge`, { defaultValue: "" }) ? (
                    <Badge variant={highlight ? "default" : "outline"} className="shadow-sm">
                      {t(`landing.threeOffers.${key}.badge`)}
                    </Badge>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {t(`landing.threeOffers.${key}.verb`)}
                  </p>
                  <h3 className="font-heading mt-1 text-lg font-semibold">
                    {t(`landing.threeOffers.${key}.name`)}
                  </h3>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-semibold">
                    {t(`landing.threeOffers.${key}.price`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t(`landing.threeOffers.${key}.priceNote`)}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`landing.threeOffers.${key}.description`)}
                </p>

                <div className="mt-auto pt-2">
                  <Link
                    to={to}
                    className="block w-full"
                    onClick={() =>
                      trackEvent("pricing_cta_clicked", { plan })
                    }
                  >
                    <Button
                      variant={highlight ? "default" : "outline"}
                      size="lg"
                      className="w-full gap-2"
                    >
                      {t(`landing.threeOffers.${key}.cta`)}
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {t("landing.threeOffers.footnote")}
        </p>
      </div>
    </section>
  );
}

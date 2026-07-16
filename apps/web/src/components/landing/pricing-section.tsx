import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { persistSelectedPlan } from "@/hooks/use-billing";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const comparisonRows = [
  { key: "pdfReport", free: false, family: true },
  { key: "monthQuarterTrends", free: false, family: true },
  { key: "fullHistory", free: false, family: true },
  {
    key: "profiles",
    freeValueKey: "profilesFree" as const,
    familyValueKey: "profilesFamily" as const,
  },
  { key: "journal", free: true, family: true },
  { key: "crisisList", free: true, family: true },
  { key: "symptoms", free: true, family: true },
  { key: "medications", free: true, family: true },
  { key: "rewards", free: true, family: true },
  // Barkley teaching content is a paid offer (Tokō Formation, §4.2): sold as a
  // one-shot or bundled with Famille — not free. The reward board / practice
  // layer stays free (the "rewards" row above).
  {
    key: "barkley",
    freeValueKey: "barkleyFree" as const,
    familyValueKey: "barkleyFamily" as const,
  },
  { key: "news", free: true, family: true },
  { key: "weekTrends", free: true, family: true },
  { key: "rgpdExport", free: true, family: true },
] as const;

export function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="tarifs" className="py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {/* Free plan */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold">
                {t("landing.pricing.free.name")}
              </CardTitle>
              <CardDescription>
                {t("landing.pricing.free.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-5">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold">0€</span>
                <span className="text-muted-foreground">
                  {t("landing.pricing.free.period")}
                </span>
              </div>
              <Separator className="bg-border/60" />
              <ul className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                      <Check className="size-3" />
                    </div>
                    <span className="text-sm">
                      {t(`landing.pricing.free.feature${i + 1}`)}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Fills the height the taller Famille card would otherwise leave
                  empty, with a calm, honest nudge toward the paid plan. */}
              <div className="mt-auto rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
                {t("landing.pricing.free.upgradeHint")}
              </div>
            </CardContent>
            <CardFooter>
              <Link
                to="/login"
                className="w-full"
                onClick={() =>
                  trackEvent("pricing_cta_clicked", { plan: "free" })
                }
              >
                <Button variant="outline" size="lg" className="w-full">
                  {t("landing.pricing.free.cta")}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Family plan — both intervals visible */}
          <div className="relative">
            <div className="absolute -top-3 right-4 z-10 rounded-full border border-primary/30 bg-background px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-primary shadow-sm">
              {t("landing.pricing.trialBadge")}
            </div>
            <Card className="border-primary/30 shadow-lg shadow-primary/10">
              <CardHeader>
                <Badge className="mb-3 w-fit shadow-sm">
                  {t("landing.pricing.recommended")}
                </Badge>
                <CardTitle className="font-heading text-xl font-semibold">
                  {t("landing.pricing.family.name")}
                </CardTitle>
                <CardDescription>
                  {t("landing.pricing.family.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="flex size-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                        <Check className="size-3" />
                      </div>
                      <span className="text-sm">
                        {t(`landing.pricing.family.feature${i + 1}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Separator className="bg-border/60" />

                {/* Annual interval (recommended) */}
                <div className="space-y-3 rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                      {t("landing.pricing.intervalAnnual")}
                    </span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-2xs font-semibold text-primary-foreground">
                      {t("landing.pricing.intervalSaveBadge")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-semibold">
                      39€
                    </span>
                    <span className="text-muted-foreground">
                      {t("landing.pricing.family.periodAnnual")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("landing.pricing.annualEquivalentPerMonth")}
                  </p>
                  <Link
                    to="/login"
                    className="block w-full"
                    onClick={() => {
                      persistSelectedPlan("annual");
                      trackEvent("pricing_cta_clicked", { plan: "annual" });
                    }}
                  >
                    <Button
                      size="lg"
                      className="w-full shadow-sm shadow-primary/20"
                    >
                      {t("landing.pricing.family.ctaAnnual")}
                    </Button>
                  </Link>
                </div>

                {/* Monthly interval */}
                <div className="space-y-3 rounded-xl border border-border/60 p-4">
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("landing.pricing.intervalMonthly")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-semibold">
                      4,99€
                    </span>
                    <span className="text-muted-foreground">
                      {t("landing.pricing.family.periodMonthly")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("landing.pricing.family.monthlyHint")}
                  </p>
                  <Link
                    to="/login"
                    className="block w-full"
                    onClick={() => {
                      persistSelectedPlan("monthly");
                      trackEvent("pricing_cta_clicked", { plan: "monthly" });
                    }}
                  >
                    <Button variant="outline" size="lg" className="w-full">
                      {t("landing.pricing.family.ctaMonthly")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h3 className="text-center font-heading text-lg font-semibold text-foreground">
            {t("landing.pricing.comparisonTitle")}
          </h3>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t("landing.pricing.comparisonHead.feature")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    {t("landing.pricing.comparisonHead.free")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-primary">
                    {t("landing.pricing.comparisonHead.family")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.key}
                    className={i % 2 === 0 ? "" : "bg-muted/20"}
                  >
                    <td className="px-4 py-3 text-foreground/90">
                      {t(`landing.pricing.comparisonRows.${row.key}`)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {"freeValueKey" in row ? (
                        <span className="text-muted-foreground">
                          {t(
                            `landing.pricing.comparisonRows.${row.freeValueKey}`
                          )}
                        </span>
                      ) : row.free ? (
                        <Check className="mx-auto size-4 text-sage-600" />
                      ) : (
                        <X className="mx-auto size-4 text-muted-foreground/40" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {"familyValueKey" in row ? (
                        <span className="font-medium text-foreground">
                          {t(
                            `landing.pricing.comparisonRows.${row.familyValueKey}`
                          )}
                        </span>
                      ) : row.family ? (
                        <Check className="mx-auto size-4 text-primary" />
                      ) : (
                        <X className="mx-auto size-4 text-muted-foreground/40" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("landing.pricing.comparisonFooter")}
          </p>
        </div>
      </div>
    </section>
  );
}

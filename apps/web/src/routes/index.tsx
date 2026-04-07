import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BookOpen,
  BarChart3,
  HandHeart,
  Trophy,
  ClipboardList,
  Newspaper,
  Pill,
  Check,
  X,
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Quote,
  Clock,
} from "lucide-react";
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
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { authClient } from "@/lib/auth-client";
import { articles } from "@/lib/resources-data";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage,
});

const featureKeys = [
  { icon: Activity, key: "symptoms" },
  { icon: BookOpen, key: "journal" },
  { icon: Pill, key: "medications" },
  { icon: HandHeart, key: "crisis" },
  { icon: Trophy, key: "rewards" },
  { icon: ClipboardList, key: "barkley" },
  { icon: BarChart3, key: "dashboard" },
  { icon: Newspaper, key: "news" },
] as const;

const trustKeys = [
  { icon: Stethoscope, key: "barkley" },
  { icon: ShieldCheck, key: "rgpd" },
  { icon: Sparkles, key: "parents" },
] as const;

const testimonialKeys = ["t1", "t2", "t3"] as const;

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
  { key: "barkley", free: true, family: true },
  { key: "news", free: true, family: true },
  { key: "weekTrends", free: true, family: true },
  { key: "rgpdExport", free: true, family: true },
] as const;

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <HeroSection />
      <TrustBar />
      <ResourcesTeaser />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </div>
  );
}

function Nav() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-[max(1rem,env(safe-area-inset-left))]">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" />
          </div>
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Toko
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <a
            href="#fonctionnalites"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("landing.nav.features")}
          </a>
          <Link
            to="/ressources"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("landing.nav.resources")}
          </Link>
          <a
            href="#tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("landing.nav.pricing")}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              {t("landing.nav.login")}
            </Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="gap-2 shadow-sm">
              {t("landing.nav.getStarted")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_30_/_0.15),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-sage-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-accent-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 text-center lg:py-36">
        <h1 className="font-heading mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl lg:leading-[1.1]">
          {t("landing.hero.title1")}{" "}
          <span className="text-primary">{t("landing.hero.title2")}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          {t("landing.hero.description")}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/login">
            <Button
              size="lg"
              className="gap-2 px-8 text-base shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25"
            >
              {t("landing.hero.ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#fonctionnalites">
            <Button variant="outline" size="lg" className="text-base">
              {t("landing.hero.ctaSecondary")}
            </Button>
          </a>
        </div>

        <p className="mt-5 text-sm text-muted-foreground/80">
          {t("landing.hero.noCard")}
        </p>
      </div>
    </section>
  );
}

function TrustBar() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-border/60 bg-muted/30 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:gap-8">
        {trustKeys.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">
                {t(`landing.trust.${key}.title`)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(`landing.trust.${key}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { t } = useTranslation();
  return (
    <section className="relative border-t border-border/60 bg-muted/30 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
            {t("landing.testimonials.title")}
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonialKeys.map((k) => (
            <Card
              key={k}
              className="border-border/60 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="pt-6">
                <Quote className="h-5 w-5 text-primary/40" />
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  « {t(`landing.testimonials.${k}.quote`)} »
                </p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  — {t(`landing.testimonials.${k}.author`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourcesTeaser() {
  const { t } = useTranslation();
  const featured = articles.filter((a) => a.audience !== "entourage").slice(0, 3);

  return (
    <section className="border-t border-border/60 bg-muted/30 py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t("landing.resourcesTeaser.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t("landing.resourcesTeaser.description")}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((article) => (
            <Link
              key={article.slug}
              to="/ressources/$slug"
              params={{ slug: article.slug }}
              className="group"
            >
              <Card className="h-full border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5">
                <CardHeader>
                  <Badge variant="outline" className="mb-3 w-fit text-xs">
                    {article.cluster}
                  </Badge>
                  <CardTitle className="font-heading text-lg font-semibold leading-snug group-hover:text-primary">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col justify-between gap-4">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/login">
            <Button variant="outline" size="lg" className="gap-2">
              {t("landing.resourcesTeaser.cta")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();
  return (
    <section
      id="fonctionnalites"
      className="relative border-t border-border/60 py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-muted/40" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            {t("landing.features.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("landing.features.subtitle")}
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((feature) => (
            <Card
              key={feature.key}
              className="group border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-heading text-lg font-semibold">
                  {t(`landing.features.${feature.key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {t(`landing.features.${feature.key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useTranslation();

  const plans = [
    {
      key: "free" as const,
      price: "0",
      variant: "outline" as const,
      popular: false,
      featureCount: 3,
    },
    {
      key: "family" as const,
      price: "4,99",
      variant: "default" as const,
      popular: true,
      featureCount: 4,
    },
  ];

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
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.key} className={plan.popular ? "relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 right-4 z-10 rounded-full border border-primary/30 bg-background px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary shadow-sm">
                  {t("landing.pricing.trialBadge")}
                </div>
              )}
              <Card
                className={
                  plan.popular
                    ? "border-primary/30 shadow-lg shadow-primary/10"
                    : "border-border/60"
                }
              >
                <CardHeader>
                  {plan.popular && (
                    <Badge className="mb-3 w-fit shadow-sm">
                      {t("landing.pricing.recommended")}
                    </Badge>
                  )}
                  <CardTitle className="font-heading text-xl font-semibold">
                    {t(`landing.pricing.${plan.key}.name`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`landing.pricing.${plan.key}.description`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-semibold">
                      {plan.price}€
                    </span>
                    <span className="text-muted-foreground">
                      {t(`landing.pricing.${plan.key}.period`)}
                    </span>
                  </div>
                  {plan.popular && (
                    <p className="-mt-3 text-xs text-muted-foreground">
                      {t("landing.pricing.annualEquivalent")}
                    </p>
                  )}
                  <Separator className="bg-border/60" />
                  <ul className="space-y-3">
                    {Array.from({ length: plan.featureCount }).map((_, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm">
                          {t(`landing.pricing.${plan.key}.feature${i + 1}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to="/login" className="w-full">
                    <Button
                      variant={plan.variant}
                      size="lg"
                      className={`w-full ${plan.popular ? "shadow-sm shadow-primary/20" : ""}`}
                    >
                      {t(`landing.pricing.${plan.key}.cta`)}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h3 className="text-center font-heading text-lg font-semibold text-foreground">
            {t("landing.pricing.comparisonTitle")}
          </h3>
          <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <table className="w-full text-sm">
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
                        <Check className="mx-auto h-4 w-4 text-sage-600" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
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
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
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

function Footer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const buildDate = new Date(__BUILD_DATE__).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <footer className="border-t border-border/60 bg-muted/30 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Heart className="h-3 w-3" />
          </div>
          <span className="text-sm text-muted-foreground">
            {t("landing.footer.tagline")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/60">
          {t("landing.footer.version", {
            version: __APP_VERSION__,
            date: buildDate,
          })}
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link
            to="/mentions-legales"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.legal")}
          </Link>
          <Link
            to="/confidentialite"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.privacy")}
          </Link>
          <Link
            to="/contact"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.contact")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

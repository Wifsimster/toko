import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BookOpen,
  BarChart3,
  HandHeart,
  Trophy,
  ClipboardList,
  Check,
  ArrowRight,
  Heart,
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
  { icon: HandHeart, key: "crisis" },
  { icon: Trophy, key: "rewards" },
  { icon: ClipboardList, key: "barkley" },
  { icon: BarChart3, key: "dashboard" },
] as const;

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <HeroSection />
      <FeaturesSection />
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
            <Card
              key={plan.key}
              className={
                plan.popular
                  ? "relative border-primary/30 shadow-lg shadow-primary/10"
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
          ))}
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

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  HandHeart,
  ClipboardList,
  FileText,
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Quote,
  Clock,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { articles } from "@/lib/resources-data";
import { PricingSection } from "@/components/landing/pricing-section";

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
  { icon: FileText, key: "carnet" },
  { icon: HandHeart, key: "crisis" },
  { icon: ClipboardList, key: "barkley" },
] as const;

const trustKeys = [
  { icon: Clock, key: "time" },
  { icon: ShieldCheck, key: "rgpd" },
  { icon: Sparkles, key: "parents" },
] as const;

const testimonialKeys = ["t1", "t2", "t3"] as const;

function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
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
            Tokō
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
          <Link
            to="/tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("landing.nav.pricing")}
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-muted-foreground">
              {t("landing.nav.login")}
            </Button>
          </Link>
          <Link to="/login">
            <Button className="gap-2 shadow-sm">
              {t("landing.nav.getStarted")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <MobileNavSheet />
        </div>
      </div>
    </header>
  );
}

// Mobile-only nav drawer. The desktop nav at <sm hides the
// Features/Resources/Pricing links so the primary "Commencer" CTA gets
// breathing room — without this drawer, mobile visitors had no way to
// reach those anchors short of footer-diving.
function MobileNavSheet() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={t("landing.nav.menu")}
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] max-w-xs">
        <SheetHeader>
          <SheetTitle>{t("landing.nav.menu")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2 pb-4 text-sm">
          <SheetClose
            render={
              <a
                href="#fonctionnalites"
                className="rounded-md px-3 py-2 text-foreground hover:bg-muted"
              />
            }
          >
            {t("landing.nav.features")}
          </SheetClose>
          <SheetClose
            render={
              <Link
                to="/ressources"
                className="rounded-md px-3 py-2 text-foreground hover:bg-muted"
              />
            }
          >
            {t("landing.nav.resources")}
          </SheetClose>
          <SheetClose
            render={
              <Link
                to="/tarifs"
                className="rounded-md px-3 py-2 text-foreground hover:bg-muted"
              />
            }
          >
            {t("landing.nav.pricing")}
          </SheetClose>
          <Separator className="my-2" />
          <SheetClose
            render={
              <Link
                to="/login"
                className="rounded-md px-3 py-2 font-medium text-foreground hover:bg-muted"
              />
            }
          >
            {t("landing.nav.login")}
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
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

      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24 lg:py-36">
        <h1 className="font-heading mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.1]">
          {t("landing.hero.title1")}{" "}
          <span className="text-primary">{t("landing.hero.title2")}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          {t("landing.hero.description")}
        </p>

        <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full gap-2 px-8 text-base shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25 sm:w-auto"
            >
              {t("landing.hero.ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#fonctionnalites" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-base sm:w-auto">
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
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
          {t("landing.features.andMore")}
        </p>
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
          <Link
            to="/developers"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.developers")}
          </Link>
        </div>
      </div>
    </footer>
  );
}

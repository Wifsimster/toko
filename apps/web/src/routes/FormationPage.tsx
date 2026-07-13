import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, GraduationCap, Check } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeoHead } from "@/hooks/use-seo-head";

// The three curriculum blocks. Each maps to cgu-style i18n keys under
// `formationPage.steps.<key>`.
const STEP_GROUPS = ["understand", "act", "anchor"] as const;

export function FormationPage() {
  const { t } = useTranslation();
  useSeoHead({
    title: "Programme Barkley en ligne — Tokō Formation",
    description:
      "Le programme d'entraînement aux habiletés parentales inspiré de la méthode Barkley, en 10 étapes, à votre rythme. Pour les parents d'enfants TDAH.",
    canonical: "https://toko.battistella.ovh/formation",
  });

  return (
    <div className="min-h-dvh bg-background">
      {/* Minimal top bar */}
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo className="size-8 rounded-lg" />
            <span className="font-heading text-xl font-semibold tracking-tight">
              Tokō
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("common.back")}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.09_75_/_0.15),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <Badge
            variant="outline"
            className="mb-4 border-accent-300/60 bg-accent-100/40 text-accent-700"
          >
            {t("formationPage.badge")}
          </Badge>
          <h1 className="font-heading mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t("formationPage.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("formationPage.hero.description")}
          </p>
          <div className="mt-8">
            <Link to="/login">
              <Button size="lg" className="gap-2 px-8 text-base shadow-md shadow-primary/20">
                {t("formationPage.hero.cta")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground/80">
              {t("formationPage.hero.note")}
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-heading text-center text-2xl font-semibold tracking-tight">
            {t("formationPage.curriculum.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            {t("formationPage.curriculum.subtitle")}
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEP_GROUPS.map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-border/60 bg-card/60 p-6"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent-100 font-heading text-sm font-semibold text-accent-700">
                  {t(`formationPage.steps.${key}.range`)}
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {t(`formationPage.steps.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`formationPage.steps.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The app makes the practice real — the differentiator */}
      <section className="border-b border-border/60 bg-muted/30 py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 text-center">
          <GraduationCap className="mx-auto size-8 text-accent-700" />
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t("formationPage.practice.title")}
          </h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
            {t("formationPage.practice.body")}
          </p>
          <ul className="mx-auto mt-2 flex max-w-xl flex-col gap-2 text-left">
            {["log", "rewards", "track"].map((k) => (
              <li key={k} className="flex items-start gap-2 text-sm text-foreground/90">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {t(`formationPage.practice.points.${k}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA + legal */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t("formationPage.finalCta.title")}
          </h2>
          <div className="mt-6">
            <Link to="/login">
              <Button size="lg" className="gap-2 px-8 text-base shadow-md shadow-primary/20">
                {t("formationPage.finalCta.cta")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          <p className="mx-auto mt-8 max-w-xl text-xs leading-relaxed text-muted-foreground">
            {t("formationPage.disclaimer")}
          </p>
        </div>
      </section>
    </div>
  );
}

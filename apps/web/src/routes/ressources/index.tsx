import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { articles } from "@/lib/resources-data";
import { useSeoHead } from "@/hooks/use-seo-head";

export const Route = createFileRoute("/ressources/")({
  component: ResourcesIndex,
});

function ResourcesIndex() {
  useSeoHead({
    title:
      "Ressources TDAH enfant : guides pour parents francophones | Tokō",
    description:
      "Guides clairs pour comprendre et accompagner votre enfant TDAH : crises, sommeil, devoirs, co-régulation, hypersensibilité. Rédigés par et pour des parents.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Ressources TDAH enfant",
      description:
        "Collection de guides pour parents d'enfants TDAH francophones",
      inLanguage: "fr-FR",
    },
  });

  const featured = articles.find((a) => a.featured);
  const others = articles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_30_/_0.12),transparent)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center lg:py-24">
          <Badge
            variant="outline"
            className="mb-5 border-primary/20 bg-primary/5 text-xs font-medium text-primary"
          >
            Ressources
          </Badge>
          <h1 className="font-heading mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Comprendre le TDAH de votre enfant, sans jargon
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Des guides rédigés par des parents et validés sur la littérature
            scientifique. Concrets, sans culpabilisation, directement
            applicables.
          </p>
        </div>
      </section>

      {/* Featured pillar */}
      {featured && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-primary">
            Guide de référence
          </p>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-accent/5 shadow-md shadow-primary/5">
            <CardHeader>
              <Badge className="mb-3 w-fit">{featured.cluster}</Badge>
              <CardTitle className="font-heading text-2xl font-semibold lg:text-3xl">
                {featured.title}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {featured.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{featured.readTime} de lecture</span>
              </div>
              <Link
                to="/ressources/$slug"
                params={{ slug: featured.slug }}
              >
                <Button size="lg" className="gap-2 shadow-sm">
                  Lire le guide complet
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* All articles grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="font-heading mb-8 text-2xl font-semibold tracking-tight">
          Tous les articles
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {others.map((article) => (
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
                  <p className="text-sm leading-relaxed text-muted-foreground">
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

        {/* CTA block */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-br from-accent/10 to-transparent p-8 text-center lg:p-12">
          <h2 className="font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
            Passez de la lecture à l'action
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Tokō vous aide à mettre en pratique ce que vous apprenez : journal,
            liste de crise, suivi de symptômes, programme Barkley.
          </p>
          <Link to="/login" className="mt-6 inline-block">
            <Button size="lg" className="gap-2 shadow-md shadow-primary/20">
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground/80">
            Sans carte bancaire · 1 profil enfant offert à vie
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TopNav() {
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
          <Link
            to="/ressources"
            className="font-medium text-foreground transition-colors"
          >
            Ressources
          </Link>
          <Link
            to="/"
            hash="tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tarifs
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Connexion
            </Button>
          </Link>
          <Link to="/login">
            <Button size="sm" className="gap-2 shadow-sm">
              Commencer
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Heart className="h-3 w-3" />
          </div>
          <span className="text-sm text-muted-foreground">
            Toko — Comprendre, apaiser, avancer
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:gap-6">
          <Link
            to="/mentions-legales"
            className="transition-colors hover:text-foreground"
          >
            Mentions légales
          </Link>
          <Link
            to="/confidentialite"
            className="transition-colors hover:text-foreground"
          >
            Confidentialité
          </Link>
          <Link
            to="/contact"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

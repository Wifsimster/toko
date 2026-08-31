import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LexiqueBrowser } from "@/components/lexique/lexique-browser";
import { lexiqueTerms } from "@/lib/lexique-data";
import { useSeoHead } from "@/hooks/use-seo-head";
import { ResourcesIndexTopNav } from "./resources-index-top-nav";
import { Footer } from "./footer";

const CANONICAL = "https://toko.battistella.ovh/ressources/lexique";

export function LexiquePage() {
  useSeoHead({
    title: "Lexique TDAH, école et handicap : tous les sigles expliqués | Tokō",
    description:
      "MDPH, PAP, PAI, AESH, PPS, AEEH, SESSAD, GEVASCO… Le lexique des sigles médicaux, scolaires et administratifs expliqués simplement aux parents.",
    canonical: CANONICAL,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "Lexique TDAH, école et handicap",
      description:
        "Sigles et termes des domaines médical, paramédical, scolaire et administratif, expliqués aux parents d'enfants TDAH.",
      inLanguage: "fr-FR",
      url: CANONICAL,
      hasDefinedTerm: lexiqueTerms.map((entry) => ({
        "@type": "DefinedTerm",
        name: entry.label ? `${entry.term} — ${entry.label}` : entry.term,
        description: entry.definition,
        inDefinedTermSet: CANONICAL,
      })),
    },
  });

  return (
    <div className="min-h-dvh bg-background">
      <ResourcesIndexTopNav />

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_30_/_0.12),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center lg:py-20">
          <Badge
            variant="outline"
            className="mb-5 border-primary/20 bg-primary/5 text-xs font-medium text-primary"
          >
            Lexique
          </Badge>
          <h1 className="font-heading mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Tous les sigles, expliqués en une phrase
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            MDPH, PAP, AESH, GEVASCO, SESSAD… Un repère simple pour comprendre
            les courriers de l'école, les comptes rendus et les dossiers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <LexiqueBrowser articleRoute="/ressources/$slug" />

        <p className="mt-10 text-xs text-muted-foreground">
          Liste non exhaustive, à visée informative. Elle ne remplace pas l'avis
          d'un professionnel de santé ou de l'équipe éducative.
        </p>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-6 text-center">
          <p className="font-heading text-xl font-semibold tracking-tight">
            Besoin d'aller plus loin ?
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Nos guides détaillent le parcours de diagnostic, les crises, le
            sommeil et le quotidien avec un enfant TDAH.
          </p>
          <Link to="/ressources" className="mt-5 inline-flex">
            <Button className="gap-2 shadow-sm">
              Voir les guides
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

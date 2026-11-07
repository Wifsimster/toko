import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LexiqueBrowser } from "@/components/lexique/lexique-browser";
import { lexiqueTerms } from "@focusflow/validators";
import { useSeoHead } from "@/hooks/use-seo-head";
import { ResourcesIndexTopNav } from "./resources-index-top-nav";
import { Footer } from "./footer";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

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

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <LexiqueBrowser
          articleRoute="/ressources/$slug"
          title="Tous les sigles, expliqués en une phrase"
          subtitle="MDPH, PAP, AESH, GEVASCO, SESSAD… Un repère simple pour comprendre les courriers de l'école, les comptes rendus et les dossiers."
        />

        <p className="mt-10 text-xs text-muted-foreground">
          Liste non exhaustive, à visée informative. Elle ne remplace pas l'avis
          d'un professionnel de santé ou de l'équipe éducative.
        </p>

        <div className="mt-10 rounded-[2rem] bg-surface-mint px-6 py-8 text-center">
          <p className="font-heading text-xl font-semibold tracking-tight">
            Besoin d'aller plus loin ?
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Nos guides détaillent le parcours de diagnostic, les crises, le
            sommeil et le quotidien avec un enfant TDAH.
          </p>
          <Link
            to="/ressources"
            className={cn(
              buttonVariants(),
              "mt-5 gap-2 shadow-sm",
            )}
          >
            Voir les guides
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Mo } from "@/components/mo/mo";
import { OutilsGrid } from "@/components/outils/outils-grid";
import { useSeoHead } from "@/hooks/use-seo-head";
import { ResourcesIndexTopNav } from "../ressources/resources-index-top-nav";
import { Footer } from "../ressources/footer";

const CANONICAL = "https://toko.battistella.ovh/outils";

export function OutilsPage() {
  useSeoHead({
    title: "Outils gratuits pour parents d'enfants TDAH | Tokō",
    description:
      "Questionnaires de repérage, carnet de sommeil, plan de crise, lexique des sigles : des outils gratuits, sans compte, pensés pour les parents d'enfants TDAH.",
    canonical: CANONICAL,
  });

  return (
    <div className="min-h-dvh bg-background">
      <ResourcesIndexTopNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="flex flex-col-reverse gap-4 rounded-[2rem] bg-surface-mint px-6 py-8 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:py-10">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
              Gratuit · sans compte
            </p>
            <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Des outils pour le quotidien avec un enfant TDAH
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-foreground/80">
              Faire le point, noter le sommeil, préparer une crise, comprendre
              un courrier. Tout se passe sur votre appareil.
            </p>
          </div>
          <Mo state="guide" size={112} className="sm:hidden" />
          <Mo state="guide" size={184} className="hidden sm:inline-block" />
        </header>

        <OutilsGrid depuis="outils" className="mt-10" />

        <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
          Ces outils aident à observer et à préparer un rendez-vous. Ils ne
          posent pas de diagnostic et ne remplacent pas l'avis d'un médecin.
        </p>
      </main>
      <Footer />
    </div>
  );
}

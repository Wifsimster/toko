import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeoHead } from "@/hooks/use-seo-head";
import { SITE_URL } from "@/lib/site";
import { PricingSection } from "@/components/landing/pricing-section";
import { trackEventOnce } from "@/lib/analytics";

export const Route = createFileRoute("/tarifs")({
  component: TarifsPage,
});

const faq = [
  {
    question: "Quelle est la différence entre l'offre Gratuite et Famille ?",
    answer:
      "L'offre Gratuite donne accès au journal quotidien, à la liste de crise, au suivi des symptômes, des médicaments et au tableau de récompenses pour 1 enfant. L'offre Famille ajoute le rapport PDF pour vos rendez-vous, les tendances mois et trimestre, l'historique complet et jusqu'à 3 profils enfant.",
  },
  {
    question: "Y a-t-il un essai gratuit ?",
    answer:
      "Oui. L'abonnement Famille est offert pendant 14 jours, sans carte bancaire requise. Vous pouvez l'annuler à tout moment depuis votre espace compte avant la fin de l'essai.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui. L'abonnement est sans engagement : vous pouvez le résilier en un clic depuis votre espace compte. Votre accès Famille reste actif jusqu'à la fin de la période payée, puis bascule automatiquement vers l'offre Gratuite.",
  },
  {
    question: "Pourquoi l'offre annuelle est-elle plus avantageuse ?",
    answer:
      "L'offre annuelle revient à environ 3,25 € par mois (39 € pour l'année) au lieu de 4,99 € en mensuel, soit 35 % d'économie. Elle simplifie aussi votre suivi : un seul paiement, vous n'y pensez plus de l'année.",
  },
  {
    question: "Mes données sont-elles protégées ?",
    answer:
      "Oui. Tokō est hébergé en Union européenne, conforme au RGPD. Vos données santé sont chiffrées et vous appartiennent. Vous pouvez les exporter ou les supprimer intégralement à tout moment depuis votre espace compte.",
  },
  {
    question: "Tokō convient-il si mon enfant n'a pas de diagnostic TDAH ?",
    answer:
      "Oui. Tokō est conçu pour tous les parents qui souhaitent réduire la charge mentale du quotidien : routines, humeurs, rendez-vous, récompenses. Les fonctionnalités spécifiques au TDAH (échelle Barkley, plan de crise) restent optionnelles.",
  },
];

function TarifsPage() {
  useEffect(() => {
    trackEventOnce("pricing_page_viewed", "pricing_page_viewed", {
      source: "tarifs_route",
    });
  }, []);

  useSeoHead({
    title: "Tarifs Tokō : Gratuit ou 39 €/an pour les familles TDAH",
    description:
      "Tokō est gratuit pour démarrer. L'offre Famille à 39 €/an (3,25 €/mois) débloque rapport PDF, multi-enfants, historique complet. Essai 14 jours sans CB.",
    canonical: `${SITE_URL}/tarifs`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Tokō Famille",
      description:
        "Abonnement Famille de l'application Tokō : suivi TDAH multi-enfants, rapport PDF pour les rendez-vous, historique complet, plan de crise.",
      brand: { "@type": "Brand", name: "Tokō" },
      image: `${SITE_URL}/og-image.png`,
      offers: [
        {
          "@type": "Offer",
          name: "Plan Gratuit",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/login`,
        },
        {
          "@type": "Offer",
          name: "Famille — Annuel",
          price: "39",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/login`,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "39",
            priceCurrency: "EUR",
            billingDuration: "P1Y",
          },
        },
        {
          "@type": "Offer",
          name: "Famille — Mensuel",
          price: "4.99",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/login`,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "4.99",
            priceCurrency: "EUR",
            billingDuration: "P1M",
          },
        },
      ],
    },
    faqJsonLd: faq,
  });

  return (
    <div className="min-h-dvh bg-background">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_30_/_0.12),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center lg:py-20">
          <Badge
            variant="outline"
            className="mb-5 border-primary/20 bg-primary/5 text-xs font-medium text-primary"
          >
            Tarifs
          </Badge>
          <h1 className="font-heading mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Des tarifs simples, sans surprise.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Gratuit pour démarrer. 14 jours offerts sur Famille, sans carte
            bancaire. Résiliable en un clic.
          </p>
        </div>
      </section>

      <PricingSection />

      {/* FAQ */}
      <section className="border-t border-border/60 bg-muted/20 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
            Questions fréquentes
          </h2>
          <div className="mt-8 space-y-3">
            {faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-lg border border-border/60 bg-card/60 px-4 py-3 open:bg-card/90"
              >
                <summary className="cursor-pointer list-none font-heading text-base font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-3">
                    <span>{item.question}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-primary transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
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
          <BrandLogo className="h-8 w-8 rounded-lg" />
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Tokō
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm sm:flex">
          <Link
            to="/ressources"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Ressources
          </Link>
          <Link
            to="/tarifs"
            className="font-medium text-foreground transition-colors"
          >
            Tarifs
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" className="text-muted-foreground">
              Connexion
            </Button>
          </Link>
          <Link to="/login">
            <Button className="gap-2 shadow-sm">
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
          <BrandLogo className="h-6 w-6 rounded-md" />
          <span className="text-sm text-muted-foreground">
            Tokō — Comprendre, apaiser, avancer
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

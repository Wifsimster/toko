import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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

const features = [
  {
    icon: Activity,
    title: "Suivi des symptômes",
    description:
      "Évaluez quotidiennement votre enfant sur 5 dimensions : agitation, concentration, impulsivité, humeur, sommeil.",
  },
  {
    icon: BookOpen,
    title: "Journal d'observations",
    description:
      "Notez au jour le jour les événements marquants avec des étiquettes thématiques (école, crise, victoire…).",
  },
  {
    icon: HandHeart,
    title: "Liste de crise",
    description:
      "Construisez avec votre enfant une liste d'activités apaisantes, consultable en mode plein écran pendant les crises.",
  },
  {
    icon: Trophy,
    title: "Tableau de récompenses",
    description:
      "Suivez les comportements cibles semaine après semaine et débloquez des récompenses avec les étoiles gagnées.",
  },
  {
    icon: ClipboardList,
    title: "Programme Barkley (PEHP)",
    description:
      "Avancez dans les 10 étapes du programme d'entraînement parental validé, avec un quiz à chaque étape.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord",
    description:
      "Visualisez les tendances sur semaine, mois ou trimestre, et identifiez les patterns qui comptent.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "pour toujours",
    description: "Pour un seul enfant",
    features: [
      "1 profil enfant",
      "Toutes les fonctionnalités",
      "Export RGPD de vos données",
    ],
    cta: "Commencer gratuitement",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Famille",
    price: "4,99",
    period: "/mois",
    description: "Jusqu'à 3 enfants",
    features: [
      "Jusqu'à 3 profils enfant",
      "Toutes les fonctionnalités",
      "Export RGPD de vos données",
      "Annulable à tout moment",
    ],
    cta: "Essayer 14 jours gratuits",
    variant: "default" as const,
    popular: true,
  },
];

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
            Fonctionnalités
          </a>
          <a
            href="#tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tarifs
          </a>
        </nav>
        <div className="flex items-center gap-3">
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

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_30_/_0.15),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-sage-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-accent-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 text-center lg:py-36">
        <h1 className="font-heading mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl lg:leading-[1.1]">
          Suivez le TDAH de votre enfant,{" "}
          <span className="text-primary">un jour à la fois</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          Toko aide les parents à suivre les symptômes et le quotidien de leur
          enfant TDAH. Des données claires pour des décisions éclairées avec
          les professionnels de santé.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/login">
            <Button
              size="lg"
              className="gap-2 px-8 text-base shadow-md shadow-primary/20 transition-shadow hover:shadow-lg hover:shadow-primary/25"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#fonctionnalites">
            <Button variant="outline" size="lg" className="text-base">
              Découvrir les fonctionnalités
            </Button>
          </a>
        </div>

        <p className="mt-5 text-sm text-muted-foreground/80">
          Gratuit pour commencer. Aucune carte bancaire requise.
        </p>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="fonctionnalites"
      className="relative border-t border-border/60 py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-muted/40" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            Tout pour accompagner votre enfant
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des outils conçus par des parents, pour des parents.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="font-heading text-lg font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
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
  return (
    <section id="tarifs" className="py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Commencez gratuitement, passez au plan Famille quand vous êtes prêt.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "relative border-primary/30 shadow-lg shadow-primary/10"
                  : "border-border/60"
              }
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="mb-3 w-fit shadow-sm">Recommandé</Badge>
                )}
                <CardTitle className="font-heading text-xl font-semibold">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-semibold">
                    {plan.price}€
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Separator className="bg-border/60" />
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{feature}</span>
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
                    {plan.cta}
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
  const buildDate = new Date(__BUILD_DATE__).toLocaleDateString("fr-FR", {
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
            Toko — Guider votre enfant TDAH
          </span>
        </div>
        <p className="text-xs text-muted-foreground/60">
          v{__APP_VERSION__} — Build du {buildDate}
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
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

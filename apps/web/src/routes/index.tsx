import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Activity,
  Pill,
  BookOpen,
  CalendarDays,
  BarChart3,
  Shield,
  Check,
  ArrowRight,
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
    title: "Suivi des symptomes",
    description:
      "Enregistrez quotidiennement l'agitation, la concentration, l'impulsivite et l'humeur de votre enfant.",
  },
  {
    icon: Pill,
    title: "Gestion des medicaments",
    description:
      "Suivez les prises de medicaments, les dosages et l'observance avec des rappels intelligents.",
  },
  {
    icon: BookOpen,
    title: "Journal de bord",
    description:
      "Notez les evenements marquants, les progres et les difficultes au quotidien.",
  },
  {
    icon: CalendarDays,
    title: "Rendez-vous",
    description:
      "Gerez les consultations medicales, bilans et suivis specialises en un seul endroit.",
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    description:
      "Visualisez les tendances et les correlations grace a des graphiques clairs et actionnables.",
  },
  {
    icon: Shield,
    title: "Rapports medicaux",
    description:
      "Generez des rapports detailles a partager avec les professionnels de sante.",
  },
];

const plans = [
  {
    name: "Gratuit",
    price: "0",
    period: "pour toujours",
    description: "Pour decouvrir Toko",
    features: [
      "1 profil enfant",
      "Suivi des symptomes",
      "Journal de bord",
      "Tableau de bord basique",
    ],
    cta: "Commencer gratuitement",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Famille",
    price: "4,99",
    period: "/mois",
    description: "Pour un suivi complet",
    features: [
      "Jusqu'a 3 profils enfant",
      "Toutes les fonctionnalites",
      "Rapports PDF detailles",
      "Gestion des medicaments",
      "Suivi des rendez-vous",
      "Support prioritaire",
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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <span className="text-lg font-bold text-primary">
          Toko <span className="text-xs text-muted-foreground">登光</span>
        </span>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <a
            href="#fonctionnalites"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Fonctionnalites
          </a>
          <a
            href="#tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tarifs
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link to="/login">
            <Button size="sm">
              Commencer
              <ArrowRight data-icon="inline-end" className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center lg:py-32">
      <Badge variant="secondary" className="mb-4">
        Application de suivi TDAH
      </Badge>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight lg:text-6xl">
        Suivez le TDAH de votre enfant,{" "}
        <span className="text-primary">un jour a la fois</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Toko aide les parents a suivre les symptomes, les medicaments et le
        quotidien de leur enfant TDAH. Des donnees claires pour des decisions
        eclairees avec les professionnels de sante.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link to="/login">
          <Button size="lg" className="gap-2 px-6 text-base">
            Commencer gratuitement
            <ArrowRight data-icon="inline-end" className="h-4 w-4" />
          </Button>
        </Link>
        <a href="#fonctionnalites">
          <Button variant="outline" size="lg" className="text-base">
            Decouvrir les fonctionnalites
          </Button>
        </a>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Gratuit pour commencer. Aucune carte bancaire requise.
      </p>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="fonctionnalites"
      className="border-t bg-muted/30 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Tout pour accompagner votre enfant
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des outils concus par des parents, pour des parents.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
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
    <section id="tarifs" className="py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Commencez gratuitement, passez au plan Famille quand vous etes pret.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular ? "ring-2 ring-primary" : ""
              }
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="mb-2 w-fit">Recommande</Badge>
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Separator />
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-status-success" />
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
                    className="w-full"
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
  return (
    <footer className="border-t bg-muted/30 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <span>
          Toko 登光 — Guider votre enfant TDAH
        </span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground">
            Mentions legales
          </a>
          <a href="#" className="hover:text-foreground">
            Confidentialite
          </a>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

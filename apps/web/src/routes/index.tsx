import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  BarChart3,
  HandHeart,
  Trophy,
  ClipboardList,
  Check,
  X,
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Quote,
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
    icon: HandHeart,
    title: "Liste de crise plein écran",
    description:
      "Construisez avec votre enfant ses activités apaisantes. Au cœur de la crise, un mode plein écran lui donne un repère visuel immédiat.",
  },
  {
    icon: ClipboardList,
    title: "Programme Barkley (PEHP)",
    description:
      "Les 10 étapes du programme d'entraînement parental du Dr Russell Barkley, référence mondiale en accompagnement TDAH, avec quiz à chaque étape.",
  },
  {
    icon: Activity,
    title: "Suivi sur 7 dimensions",
    description:
      "Évaluez chaque jour agitation, concentration, impulsivité, humeur, sommeil, social, autonomie. Des données à apporter en consultation.",
  },
  {
    icon: BookOpen,
    title: "Journal du quotidien",
    description:
      "Notez les événements marquants avec des étiquettes (école, crise, victoire…). Ne perdez plus rien entre deux rendez-vous médicaux.",
  },
  {
    icon: Trophy,
    title: "Tableau de récompenses",
    description:
      "Renforcez les comportements cibles semaine après semaine, avec un système d'étoiles que votre enfant comprend.",
  },
  {
    icon: BarChart3,
    title: "Tendances mois & trimestre",
    description:
      "Identifiez les patterns qui comptent : nuits difficiles, déclencheurs récurrents, progrès invisibles au quotidien.",
  },
];

const trustPoints = [
  {
    icon: Stethoscope,
    title: "Fondé sur le programme Barkley",
    description:
      "Le PEHP du Dr Russell Barkley est le protocole d'accompagnement parental le plus documenté au monde pour le TDAH.",
  },
  {
    icon: ShieldCheck,
    title: "RGPD · données hébergées en UE",
    description:
      "Vos données santé restent en Europe, chiffrées, et vous appartiennent. Export intégral RGPD disponible à tout moment.",
  },
  {
    icon: Sparkles,
    title: "Conçu avec des parents TDAH",
    description:
      "Chaque fonctionnalité est née d'un besoin concret : la crise du lundi matin, le RDV pédopsy, le devoir oublié.",
  },
];

const testimonials = [
  {
    quote:
      "Enfin un outil qui ne me culpabilise pas. Je note 2 minutes par soir, et quand on voit la pédopsy, elle a tout sous les yeux.",
    author: "Sophie, maman de Léo (8 ans)",
  },
  {
    quote:
      "La liste de crise plein écran, c'est un game-changer. Mon fils sait où regarder quand il sent que ça monte.",
    author: "Karim, papa d'Ilyes (6 ans)",
  },
  {
    quote:
      "Le programme Barkley étape par étape m'a donné une structure. J'ai arrêté de naviguer à vue.",
    author: "Elise, maman de Sacha (10 ans)",
  },
];

const comparisonRows = [
  { label: "Profils enfant", free: "1", family: "Jusqu'à 3" },
  { label: "Journal quotidien", free: true, family: true },
  { label: "Liste de crise plein écran", free: true, family: true },
  { label: "Suivi symptômes (7 dimensions)", free: true, family: true },
  { label: "Tableau de récompenses", free: true, family: true },
  { label: "Programme Barkley complet", free: true, family: true },
  { label: "Tendances semaine", free: true, family: true },
  { label: "Tendances mois & trimestre", free: false, family: true },
  { label: "Export PDF pour le médecin", free: false, family: true },
  { label: "Export RGPD de vos données", free: true, family: true },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <ResourcesTeaser />
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
          <Link
            to="/ressources"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Ressources
          </Link>
          <a
            href="#tarifs"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Tarifs
          </a>
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

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.08_30_/_0.15),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-sage-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-accent-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center lg:py-32">
        <Badge
          variant="outline"
          className="mb-6 border-primary/20 bg-primary/5 text-xs font-medium text-primary"
        >
          Pour les familles TDAH francophones
        </Badge>

        <h1 className="font-heading mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight lg:text-6xl lg:leading-[1.1]">
          Comprendre le TDAH de votre enfant —{" "}
          <span className="text-primary">
            et en parler avec les bons mots à son médecin.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
          Notez symptômes, crises et victoires en 2 minutes par jour. Repartez
          en consultation avec des données que le pédopsychiatre comprend, et
          des outils concrets pour les jours difficiles.
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
              Voir les fonctionnalités
            </Button>
          </a>
        </div>

        <p className="mt-5 text-sm text-muted-foreground/80">
          Gratuit pour 1 enfant, sans carte bancaire. 14 jours d'essai offerts
          sur le plan Famille.
        </p>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-border/60 bg-muted/30 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:gap-8">
        {trustPoints.map((point) => (
          <div key={point.title} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
              <point.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">
                {point.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="fonctionnalites"
      className="relative py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            Observer, apaiser, avancer — ensemble
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Six outils conçus pour le quotidien réel d'une famille TDAH, pas
            pour une brochure.
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

function TestimonialsSection() {
  return (
    <section className="relative border-t border-border/60 bg-muted/30 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
            Ce qu'en disent les parents
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.author}
              className="border-border/60 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="pt-6">
                <Quote className="h-5 w-5 text-primary/40" />
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  « {t.quote} »
                </p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  — {t.author}
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
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
            Des tarifs simples et transparents
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Commencez gratuitement, sans carte bancaire. Passez au plan Famille
            quand vous êtes prêt — ou jamais.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {/* Free plan */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-heading text-xl font-semibold">
                Gratuit
              </CardTitle>
              <CardDescription>Pour commencer dès aujourd'hui</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold">0€</span>
                <span className="text-muted-foreground">pour toujours</span>
              </div>
              <Separator className="bg-border/60" />
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm">1 profil enfant</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm">Journal, crise, symptômes, Barkley</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm">Tendances de la semaine</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm">Export RGPD</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/login" className="w-full">
                <Button variant="outline" size="lg" className="w-full">
                  Commencer gratuitement
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Family plan */}
          <Card className="relative border-primary/30 shadow-lg shadow-primary/10">
            <div className="absolute -top-3 right-4 rounded-full border border-primary/30 bg-background px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary shadow-sm">
              14 jours offerts · sans CB
            </div>
            <CardHeader>
              <Badge className="mb-3 w-fit shadow-sm">Recommandé</Badge>
              <CardTitle className="font-heading text-xl font-semibold">
                Famille
              </CardTitle>
              <CardDescription>Pour aller plus loin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold">
                  4,99€
                </span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="-mt-3 text-xs text-muted-foreground">
                ≈ 60 €/an — soit le prix d'une consultation pédopsy
              </p>
              <Separator className="bg-border/60" />
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm">Jusqu'à 3 profils enfant</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm font-medium">
                    Tendances mois & trimestre
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm font-medium">
                    Export PDF pour le médecin
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckDot />
                  <span className="text-sm">Annulable en 1 clic</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/login" className="w-full">
                <Button
                  size="lg"
                  className="w-full shadow-sm shadow-primary/20"
                >
                  Essayer 14 jours gratuits
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h3 className="text-center font-heading text-lg font-semibold text-foreground">
            Comparatif détaillé
          </h3>
          <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Fonctionnalité
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Gratuit
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-primary">
                    Famille
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={
                      i % 2 === 0 ? "" : "bg-muted/20"
                    }
                  >
                    <td className="px-4 py-3 text-foreground/90">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <ComparisonCell value={row.free} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ComparisonCell value={row.family} emphasized />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Annulable à tout moment · Paiement sécurisé Stripe · Facture envoyée
            par email
          </p>
        </div>
      </div>
    </section>
  );
}

function CheckDot() {
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
      <Check className="h-3 w-3" />
    </div>
  );
}

function ComparisonCell({
  value,
  emphasized,
}: {
  value: string | boolean;
  emphasized?: boolean;
}) {
  if (typeof value === "string") {
    return (
      <span
        className={
          emphasized
            ? "font-medium text-foreground"
            : "text-muted-foreground"
        }
      >
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <Check
        className={
          emphasized
            ? "mx-auto h-4 w-4 text-primary"
            : "mx-auto h-4 w-4 text-sage-600"
        }
      />
    );
  }
  return <X className="mx-auto h-4 w-4 text-muted-foreground/40" />;
}

function ResourcesTeaser() {
  return (
    <section className="border-t border-border/60 bg-muted/30 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Comprendre le TDAH de votre enfant
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Des guides clairs, rédigés avec des professionnels, pour répondre aux
          questions que se posent tous les parents TDAH.
        </p>
        <Link to="/ressources" className="mt-6 inline-block">
          <Button variant="outline" size="lg" className="gap-2">
            Explorer les ressources
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
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
            Toko — Comprendre, apaiser, avancer
          </span>
        </div>
        <p className="text-xs text-muted-foreground/60">
          v{__APP_VERSION__} — Build du {buildDate}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:gap-6">
          <Link
            to="/ressources"
            className="transition-colors hover:text-foreground"
          >
            Ressources
          </Link>
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

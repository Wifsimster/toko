import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Clock,
  Sparkles,
  MessageCircle,
  HandHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  articles,
  DEFAULT_LAST_REVIEWED,
  DEFAULT_REVIEWER,
} from "@/lib/resources-data";
import type { FeatureTarget } from "@/lib/resources-types";
import { useSeoHead } from "@/hooks/use-seo-head";
import { ShareDialog } from "@/components/shared/share-dialog";
import { getIncomingShareId } from "@/lib/share";

export const Route = createFileRoute("/ressources/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
});

const featureLabels: Record<FeatureTarget, string> = {
  "crisis-list": "la liste de crise",
  barkley: "le programme Barkley",
  rewards: "le tableau de récompenses",
  symptoms: "le suivi des symptômes",
  journal: "le journal",
  dashboard: "le tableau de bord",
};

function ArticlePage() {
  const { article } = Route.useLoaderData();

  useSeoHead({
    title: article.metaTitle,
    description: article.metaDescription,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription,
      inLanguage: "fr-FR",
      author: { "@type": "Organization", name: "Tokō" },
      publisher: {
        "@type": "Organization",
        name: "Tokō",
        logo: {
          "@type": "ImageObject",
          url:
            typeof window !== "undefined"
              ? `${window.location.origin}/icon.svg`
              : "",
        },
      },
      articleSection: article.cluster,
      wordCount: article.readTime,
    },
    faqJsonLd: article.faq,
  });

  const related = article.related
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => !!a);

  const [shareOpen, setShareOpen] = useState(false);
  const incomingShareId = getIncomingShareId();

  return (
    <div className="min-h-dvh bg-background">
      <TopNav />

      {/* Incoming "shared by a close one" banner */}
      {incomingShareId && (
        <div className="border-b border-primary/20 bg-primary/5">
          <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3">
            <HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground/90">
              Un parent proche vous a partagé ce guide. Prenez le temps de le
              lire à votre rythme — il est écrit pour être compris sans
              connaissances préalables.
            </p>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        {/* Breadcrumb */}
        <Link
          to="/ressources"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Toutes les ressources
        </Link>

        {/* Header */}
        <header className="mt-8">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
            {article.cluster}
          </Badge>
          <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight lg:text-4xl lg:leading-[1.15]">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime} de lecture
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-xs">
              Révisé le{" "}
              {new Date(
                article.lastReviewedAt ?? DEFAULT_LAST_REVIEWED
              ).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              — {article.reviewer ?? DEFAULT_REVIEWER}
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="article-body mt-10">{article.content}</div>

        {/* FAQ (if provided) */}
        {article.faq && article.faq.length > 0 && (
          <section className="mt-14 border-t border-border/60 pt-10">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Questions fréquentes
            </h2>
            <div className="mt-6 space-y-3">
              {article.faq.map((item, i) => (
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
          </section>
        )}

        {/* Clinical caveat — every behavioural article closes with this */}
        <p className="mt-10 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Ces stratégies s'ajoutent — elles ne remplacent pas — l'évaluation
          médicale. Si les difficultés persistent malgré une bonne structure
          au quotidien, parlez-en à votre pédiatre ou pédopsychiatre.
        </p>

        {/* Inline CTA */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-br from-accent/10 to-transparent">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">
                  Passez à l'action avec Tokō
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Mettez en pratique grâce à {featureLabels[article.ctaTarget]}.
                </p>
              </div>
            </div>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 shadow-sm sm:w-auto">
                {article.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Share-with-entourage block — hidden for incoming shared visitors */}
        {!incomingShareId && (
          <section className="mt-12">
            <Card className="border-sage-200/60 bg-sage-50/40 dark:border-sage-700/30 dark:bg-sage-900/10">
              <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      Votre entourage aussi doit comprendre
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Envoyez ce guide à un proche qui a besoin de mieux
                      comprendre. En 1 minute.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShareOpen(true)}
                  className="w-full gap-2 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Envoyer à un proche
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-border/60 pt-10">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              À lire ensuite
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/ressources/$slug"
                  params={{ slug: r.slug }}
                  className="group"
                >
                  <Card className="h-full border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                    <CardContent className="py-5">
                      <p className="text-xs font-medium text-primary/80">
                        {r.cluster}
                      </p>
                      <p className="mt-2 font-heading font-semibold leading-snug group-hover:text-primary">
                        {r.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {r.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        articleSlug={article.slug}
        articleTitle={article.title}
      />

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
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Ressources
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

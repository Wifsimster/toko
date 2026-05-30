import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { trackEventOnce } from "@/lib/analytics";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  MessageCircle,
  HandHeart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { articles } from "@/lib/resources-data";
import {
  DEFAULT_LAST_REVIEWED,
  DEFAULT_REVIEWER,
  type FeatureTarget,
} from "@/lib/resources-types";
import { useSeoHead } from "@/hooks/use-seo-head";
import { ShareDialog } from "@/components/shared/share-dialog";
import { getIncomingShareId } from "@/lib/share";
import {
  ArticleHero,
  WelcomeIntro,
} from "@/components/article/article-elements";
import { getClusterTheme } from "@/components/article/article-cluster-theme";
import { cn } from "@/lib/utils";
import { TopNav } from "./top-nav";
import { Footer } from "./footer";

const route = getRouteApi("/ressources/$slug");

const featureLabels: Record<FeatureTarget, string> = {
  "crisis-list": "la liste de crise",
  barkley: "le programme Barkley",
  rewards: "le tableau de récompenses",
  symptoms: "le suivi des symptômes",
  journal: "le journal",
  dashboard: "le tableau de bord",
};

export function RessourcesArticlePage() {
  const { article } = route.useLoaderData();

  useEffect(() => {
    trackEventOnce(`article:${article.slug}`, "article_viewed", {
      slug: article.slug,
      cluster: article.cluster,
    });
  }, [article.slug, article.cluster]);

  const lastReviewedAt = article.lastReviewedAt ?? DEFAULT_LAST_REVIEWED;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useSeoHead({
    title: article.metaTitle,
    description: article.metaDescription,
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription,
      inLanguage: "fr-FR",
      datePublished: lastReviewedAt,
      dateModified: lastReviewedAt,
      image: origin ? `${origin}/og-image.png` : undefined,
      author: { "@type": "Organization", name: "Tokō" },
      publisher: {
        "@type": "Organization",
        name: "Tokō",
        logo: {
          "@type": "ImageObject",
          url: origin ? `${origin}/icon.svg` : "",
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

  const articleMeta = useMemo(
    () => (
      <>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {article.readTime} de lecture
        </span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <ShieldCheck className="size-3.5" />
          Révisé le{" "}
          {new Date(
            article.lastReviewedAt ?? DEFAULT_LAST_REVIEWED
          ).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          {article.reviewer ?? DEFAULT_REVIEWER}
        </span>
      </>
    ),
    [article.lastReviewedAt, article.readTime, article.reviewer]
  );

  return (
    <div className="min-h-dvh bg-background">
      <TopNav />

      {/* Incoming "shared by a close one" banner */}
      {incomingShareId && (
        <div className="border-b border-primary/20 bg-primary/5">
          <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3">
            <HandHeart className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground/90">
              Un parent proche vous a partagé ce guide. Prenez le temps de le
              lire à votre rythme, il est écrit pour être compris sans
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
          <ArrowLeft className="size-3.5" />
          Toutes les ressources
        </Link>

        {/* Header */}
        <div className="mt-8">
          <ArticleHero
            cluster={article.cluster}
            title={article.title}
            meta={articleMeta}
          />
        </div>

        <WelcomeIntro audience={article.audience} />

        {/* Body */}
        <div className="article-body mt-6">{article.content}</div>

        {/* FAQ (if provided) */}
        {article.faq && article.faq.length > 0 && (
          <section className="mt-14 border-t border-border/60 pt-10">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Questions fréquentes
            </h2>
            <div className="mt-6 space-y-3">
              {article.faq.map((item) => (
                <details
                  key={item.question}
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

        {/* Clinical caveat, every behavioural article closes with this */}
        <p className="mt-10 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Ces stratégies s'ajoutent, elles ne remplacent pas, l'évaluation
          médicale. Si les difficultés persistent malgré une bonne structure
          au quotidien, parlez-en à votre pédiatre ou pédopsychiatre.
        </p>

        {/* Inline CTA */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-br from-accent/10 to-transparent">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
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
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Share-with-entourage block, hidden for incoming shared visitors */}
        {!incomingShareId && (
          <section className="mt-12">
            <Card className="border-sage-200/60 bg-sage-50/40 dark:border-sage-700/30 dark:bg-card">
              <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300">
                    <MessageCircle className="size-5" />
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
                  <MessageCircle className="size-4" />
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
              {related.map((r) => {
                const rTheme = getClusterTheme(r.cluster);
                const RIcon = rTheme.icon;
                return (
                  <Link
                    key={r.slug}
                    to="/ressources/$slug"
                    params={{ slug: r.slug }}
                    className="group"
                  >
                    <Card className="h-full border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                      <CardContent className="flex gap-3 py-5">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            rTheme.iconBg,
                            rTheme.iconColor,
                          )}
                        >
                          <RIcon className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-primary/80">
                            {r.cluster}
                          </p>
                          <p className="mt-1 font-heading font-semibold leading-snug group-hover:text-primary">
                            {r.title}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                            {r.excerpt}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
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

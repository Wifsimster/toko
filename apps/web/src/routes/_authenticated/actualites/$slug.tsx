import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNewsArticle } from "@/hooks/use-news";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/actualites/$slug")({
  component: NewsArticlePage,
});

function formatDate(dateStr: string | null, locale: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

function renderMarkdown(content: string) {
  // Simple markdown-to-JSX: paragraphs, bold, italic, headings, links
  const paragraphs = content.split(/\n{2,}/);

  return paragraphs.map((para, i) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Headings
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-8 mb-3 text-lg font-semibold">
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 mb-4 text-xl font-semibold">
          {trimmed.slice(3)}
        </h2>
      );
    }

    // List items
    if (trimmed.match(/^[-*] /m)) {
      const items = trimmed.split(/\n/).filter((l) => l.match(/^[-*] /));
      return (
        <ul key={i} className="my-4 list-disc space-y-1 pl-6">
          {items.map((item, j) => (
            <li key={j}>{item.replace(/^[-*] /, "")}</li>
          ))}
        </ul>
      );
    }

    // Regular paragraphs with inline formatting
    return (
      <p key={i} className="mb-4 leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  });
}

function formatInline(text: string) {
  // Replace **bold** and *italic* with spans
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function NewsArticlePage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "en" ? "en-US" : "fr-FR";
  const { data: article, isLoading, error } = useNewsArticle(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">
          {t("news.notFound")}
        </p>
        <Link
          to="/actualites"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("news.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/actualites"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("news.backToList")}
      </Link>

      <header className="mb-8">
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{estimateReadTime(article.content)}</span>
          </div>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatDate(article.publishedAt, locale)}</span>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground">
        {renderMarkdown(article.content)}
      </div>
    </article>
  );
}

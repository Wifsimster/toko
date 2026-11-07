import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mo } from "@/components/mo/mo";
import {
  LEXIQUE_CATEGORIES,
  filterLexique,
  groupLexiqueByCategory,
  type LexiqueCategoryId,
} from "@focusflow/validators";
import { cn } from "@/lib/utils";
import { frenchSpacing } from "@/lib/french-spacing";

const TILE: Record<LexiqueCategoryId, string> = {
  neurodeveloppement: "bg-surface-sky",
  diagnostic: "bg-surface-lavender",
  ecole: "bg-surface-honey",
  handicap: "bg-surface-rose",
  bilans: "bg-surface-mint",
  professionnels: "bg-surface-peach",
  structures: "bg-surface-sky",
  sante: "bg-surface-mint",
};

interface LexiqueBrowserProps {
  articleRoute: "/ressources/$slug" | "/connaissances/$slug";
  title: string;
  subtitle: string;
}

export function LexiqueBrowser({ articleRoute, title, subtitle }: LexiqueBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LexiqueCategoryId | "all">("all");

  const results = useMemo(() => filterLexique(query, category), [query, category]);

  const sections = groupLexiqueByCategory(results);

  return (
    <div>
      <header className="overflow-hidden rounded-[2rem] bg-surface-lavender px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-foreground/80">
              {frenchSpacing(subtitle)}
            </p>
            <div className="mt-6 flex h-14 max-w-xl items-center gap-3 rounded-full bg-card px-5 ring-1 ring-foreground/10 transition-shadow focus-within:ring-3 focus-within:ring-ring">
              <Search aria-hidden className="size-5 shrink-0 text-brand-strong" />
              <input
                type="text"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher : MDPH, PAP…"
                aria-label="Chercher un sigle ou un mot"
                className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                  className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
          <Mo state="enquete" size={112} className="sm:hidden" />
          <Mo state="enquete" size={188} className="hidden sm:inline-block" />
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill
          active={category === "all"}
          onClick={() => setCategory("all")}
          label="Tout"
        />
        {LEXIQUE_CATEGORIES.map((cat) => (
          <FilterPill
            key={cat.id}
            active={category === cat.id}
            onClick={() => setCategory(cat.id)}
            label={cat.shortLabel}
          />
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold text-muted-foreground" aria-live="polite">
        {results.length === 0
          ? "Aucun terme ne correspond"
          : `${results.length} terme${results.length > 1 ? "s" : ""}`}
      </p>

      {results.length === 0 ? (
        <EmptyState
          compact
          mo="calme"
          className="mt-4"
          title="Ce mot n'est pas encore dans le lexique."
          description="Essayez avec le sigle complet, ou écrivez-nous pour qu'on l'ajoute."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Voir tout le lexique
            </Button>
          }
        />
      ) : (
        <div className="mt-8 space-y-12">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="mb-5 flex items-start gap-3 font-heading text-2xl font-extrabold tracking-tight">
                <span aria-hidden className={cn("mt-2.5 size-3 shrink-0 rounded-full ring-1 ring-foreground/15", TILE[section.id])} />
                <span className="min-w-0">
                  {section.label}{" "}
                  <span className="text-base font-semibold text-muted-foreground">
                    {section.entries.length}
                  </span>
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.entries.map((entry) => (
                  <article
                    key={entry.term}
                    className="flex flex-col rounded-[1.5rem] bg-card p-5 ring-1 ring-foreground/10"
                  >
                    <span
                      className={cn(
                        "self-start rounded-xl px-3 py-1 font-heading text-lg font-extrabold tracking-tight text-foreground",
                        TILE[section.id],
                      )}
                    >
                      {entry.term}
                    </span>
                    {entry.label && (
                      <p className="mt-3 font-heading text-base font-bold leading-snug text-foreground">
                        {frenchSpacing(entry.label)}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {frenchSpacing(entry.definition)}
                    </p>
                    {entry.relatedSlug && (
                      <Link
                        to={articleRoute}
                        params={{ slug: entry.relatedSlug }}
                        className="mt-auto inline-flex items-center gap-1 self-start pt-4 text-sm font-semibold text-brand-strong hover:underline"
                      >
                        En savoir plus
                        <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors md:min-h-9",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

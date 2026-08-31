import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { lexiqueTerms } from "@/lib/lexique-data";
import { LEXIQUE_CATEGORIES } from "@/lib/lexique-types";
import type { LexiqueCategoryId } from "@/lib/lexique-types";
import { cn } from "@/lib/utils";

/** Recherche tolérante : insensible à la casse, aux accents et aux tirets. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface LexiqueBrowserProps {
  /** Route des articles selon le contexte : public ou connecté. */
  articleRoute: "/ressources/$slug" | "/connaissances/$slug";
}

export function LexiqueBrowser({ articleRoute }: LexiqueBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LexiqueCategoryId | "all">("all");

  const normalizedQuery = normalize(query);

  const results = useMemo(() => {
    return lexiqueTerms.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (!normalizedQuery) return true;
      const haystack = normalize(
        [entry.term, entry.label ?? "", entry.definition, ...(entry.aliases ?? [])].join(" ")
      );
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, category]);

  const sections = LEXIQUE_CATEGORIES.map((cat) => ({
    ...cat,
    entries: results.filter((entry) => entry.category === cat.id),
  })).filter((section) => section.entries.length > 0);

  return (
    <div>
      {/* Recherche — action principale de la page */}
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher : MDPH, PAP…"
          aria-label="Chercher un sigle ou un mot"
          className="h-12 pl-9 pr-10 text-base"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filtres par thème */}
      <div className="mt-4 flex flex-wrap gap-2">
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

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {results.length === 0
          ? "Aucun terme ne correspond"
          : `${results.length} terme${results.length > 1 ? "s" : ""}`}
      </p>

      {results.length === 0 ? (
        <Card className="mt-4 border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Ce mot n'est pas encore dans le lexique. Essayez avec le sigle
              complet, ou écrivez-nous pour qu'on l'ajoute.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Voir tout le lexique
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 space-y-8">
          {sections.map((section) => (
            <section key={section.id}>
              <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight">
                {section.label}
              </h2>
              <div className="space-y-3">
                {section.entries.map((entry) => (
                  <Card key={entry.term} className="overflow-hidden">
                    <CardContent className="py-4">
                      {/* Pastille toujours seule sur sa ligne : un libellé
                          long passait à la ligne sous la pastille et les
                          cartes ne s'alignaient plus entre elles. */}
                      <Badge
                        variant="secondary"
                        className="font-heading text-sm font-semibold"
                      >
                        {entry.term}
                      </Badge>
                      {entry.label && (
                        <p className="mt-2 text-sm font-medium leading-snug text-foreground">
                          {entry.label}
                        </p>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {entry.definition}
                      </p>
                      {entry.relatedSlug && (
                        <Link
                          to={articleRoute}
                          params={{ slug: entry.relatedSlug }}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          En savoir plus
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
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
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

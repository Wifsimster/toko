import { useEffect, useState, type RefObject } from "react";
import { Clock, ListTree } from "lucide-react";

type TocEntry = { id: string; label: string };

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sommaire d'article, replié par défaut.
 *
 * Les articles font 5 à 10 minutes de lecture et un parent arrive souvent
 * avec une question précise (« ce soir » plutôt que « les trois premières
 * semaines »). Le sommaire lui donne le choix d'y aller directement au lieu
 * de scroller à l'aveugle, sans imposer une liste de plus à tout le monde :
 * il reste replié tant qu'on ne l'ouvre pas.
 *
 * Les titres sont lus dans le DOM rendu plutôt que déclarés à la main dans
 * chaque article : rien à maintenir en double, et les identifiants d'ancre
 * sont posés au passage.
 */
export function ArticleToc({
  bodyRef,
  readTime,
  articleKey,
}: {
  bodyRef: RefObject<HTMLElement | null>;
  readTime: string;
  /** Change à chaque article pour relancer l'extraction des titres. */
  articleKey: string;
}) {
  const [entries, setEntries] = useState<TocEntry[]>([]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const used = new Set<string>();
    const found = Array.from(body.querySelectorAll("h2")).map(
      (heading, index) => {
        const label = (heading.textContent ?? "").trim();
        let id = heading.id || slugify(label) || `section-${index + 1}`;
        while (used.has(id)) id = `${id}-${index + 1}`;
        used.add(id);
        heading.id = id;
        return { id, label };
      },
    );

    // Sous trois parties, le sommaire coûte plus d'attention qu'il n'en fait
    // gagner : l'article se parcourt aussi vite au pouce.
    setEntries(found.length >= 3 ? found : []);
  }, [bodyRef, articleKey]);

  if (entries.length === 0) return null;

  return (
    <details className="group mt-6 rounded-xl border border-border/60 bg-card/50">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3.5 text-left marker:hidden [&::-webkit-details-marker]:hidden">
        <ListTree className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-base font-semibold text-foreground">
            Aller directement à une partie
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground/75">
            <Clock className="size-3.5" aria-hidden />
            {readTime} de lecture · {entries.length} parties
          </span>
        </span>
        <span
          aria-hidden
          className="shrink-0 text-lg leading-none text-primary transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <nav aria-label="Sommaire de l'article" className="px-4 pb-4">
        <ol className="space-y-1 border-t border-border/60 pt-3">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="flex items-baseline gap-2.5 rounded-lg px-2 py-2 text-base leading-snug text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="shrink-0 font-heading text-sm font-semibold text-primary">
                  {index + 1}.
                </span>
                <span>{entry.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}

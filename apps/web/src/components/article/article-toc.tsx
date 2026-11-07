import { useEffect, useState, type RefObject } from "react";
import { Clock, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

export type TocEntry = { id: string; label: string };

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useArticleToc(
  bodyRef: RefObject<HTMLElement | null>,
  articleKey: string,
): TocEntry[] {
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

    setEntries(found.length >= 3 ? found : []);
  }, [bodyRef, articleKey]);

  return entries;
}

export function ArticleToc({
  entries,
  readTime,
  className,
}: {
  entries: TocEntry[];
  readTime: string;
  className?: string;
}) {
  if (entries.length === 0) return null;

  return (
    <details className={cn("group mt-6 rounded-xl border border-border/60 bg-card/50", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3.5 text-left marker:hidden [&::-webkit-details-marker]:hidden">
        <ListTree className="size-4 shrink-0 text-brand-strong" aria-hidden />
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
          className="shrink-0 text-lg leading-none text-brand-strong transition-transform group-open:rotate-45"
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
                <span className="shrink-0 font-heading text-sm font-semibold text-brand-strong">
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

function useActiveEntry(entries: TocEntry[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (entries.length === 0 || typeof IntersectionObserver === "undefined") return;
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<number>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const index = headings.indexOf(record.target as HTMLElement);
          if (record.isIntersecting) visible.add(index);
          else visible.delete(index);
        }
        if (visible.size > 0) {
          setActive(Math.min(...visible));
          return;
        }
        const above = headings.filter((h) => h.getBoundingClientRect().top < 0).length;
        setActive(Math.max(0, above - 1));
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [entries]);

  return active;
}

export function ArticleTocRail({
  entries,
  className,
}: {
  entries: TocEntry[];
  className?: string;
}) {
  const active = useActiveEntry(entries);
  if (entries.length === 0) return null;

  return (
    <nav aria-label="Sommaire de l'article" className={className}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">
        Dans cet article
      </p>
      <ol className="mt-4 border-l-2 border-border">
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={index === active ? "location" : undefined}
              className={cn(
                "-ml-0.5 block border-l-2 py-2 pl-4 text-sm leading-snug transition-colors",
                index === active
                  ? "border-brand font-bold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">
        Partie {active + 1} sur {entries.length}
      </p>
    </nav>
  );
}

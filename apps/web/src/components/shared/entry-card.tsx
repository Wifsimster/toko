import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Carte d'une entrée datée (relevé, note, ligne d'historique). Ordre de
 * lecture fixe : le titre (la date) en 700, puis les métadonnées (auteur,
 * contexte) sur toute la largeur, puis le contenu. Les actions (44 px)
 * restent en haut à droite et ne rétrécissent jamais ; le texte long passe
 * à la ligne au lieu de pousser les actions hors de la carte.
 */
export function EntryCard({
  title,
  meta,
  actions,
  children,
  className,
  headingLevel = 2,
}: {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      data-slot="entry-card"
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10",
        className,
      )}
    >
      {/* Le titre garde au moins 10rem : avec un texte agrandi (zoom à
          200 %), les actions passent sous le titre au lieu de l'écraser. */}
      <div className="flex flex-wrap items-start gap-x-2">
        <Heading className="min-w-0 grow basis-40 pt-2.5 text-base leading-tight font-bold tracking-[-0.01em] text-foreground hyphens-auto first-letter:uppercase [overflow-wrap:break-word]">
          {title}
        </Heading>
        {actions && (
          <div className="-mr-2 ml-auto flex shrink-0 items-center">{actions}</div>
        )}
      </div>
      {/* Les métadonnées prennent toute la largeur, sous le titre : un nom
          ou un contexte long ne se tasse pas à côté des actions. */}
      {meta && (
        <div className="-mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {meta}
        </div>
      )}
      {children}
    </article>
  );
}

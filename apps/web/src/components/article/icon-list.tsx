import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type IconListItem = {
  /** Ancre visuelle du point : doit illustrer l'idée, pas décorer. */
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

/**
 * Liste de points clés où chaque entrée porte une icône explicite.
 *
 * Une puce ronde ne dit rien du contenu : l'œil doit lire pour trier. Une
 * icône dédiée par point donne un repère reconnaissable au premier coup
 * d'œil, ce qui compte quand le lecteur balaie l'article au lieu de le lire
 * en entier. Le titre reste en gras juste après l'icône pour que la liste
 * fonctionne aussi sans les images (lecteur d'écran, icônes non chargées).
 */
export function IconList({ items }: { items: IconListItem[] }) {
  return (
    <ul data-icon-list className="my-6 grid gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.title}
            className="flex items-start gap-3.5 rounded-xl border border-border/50 bg-card/50 px-4 py-4"
          >
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1 text-base leading-relaxed">
              <strong className="font-heading">{item.title}</strong>{" "}
              <span className="text-foreground/85">{item.description}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

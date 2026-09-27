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
 *
 * L'icône et le titre forment l'en-tête ; la description passe dessous, sur
 * toute la largeur de la carte. Une colonne d'icône à gauche gaspillait près
 * d'un quart de la largeur sur mobile et fondait le titre dans le texte.
 */
export function IconList({ items }: { items: IconListItem[] }) {
  return (
    <ul data-icon-list className="my-6 grid gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        // Le deux-points final sert en ligne ; en en-tête il devient du bruit.
        const title = item.title.replace(/\s*:\s*$/, "");
        // Les descriptions sont écrites comme la suite du titre (minuscule
        // initiale) ; passées à la ligne, elles commencent une phrase.
        const description =
          typeof item.description === "string"
            ? item.description.charAt(0).toUpperCase() +
              item.description.slice(1)
            : item.description;
        return (
          <li
            key={item.title}
            className="rounded-xl border border-border/50 bg-card/50 px-4 py-4"
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              >
                <Icon className="size-4" />
              </span>
              <strong className="font-heading text-base leading-snug">
                {title}
              </strong>
            </span>
            <span className="mt-2 block text-base leading-relaxed text-foreground/85">
              {description}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

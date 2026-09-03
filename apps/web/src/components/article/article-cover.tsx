import type { ArticleCoverImage } from "@/lib/resources-types";

/**
 * Illustration de couverture affichée en tête d'article.
 *
 * L'image est décorative au sens éditorial mais porte du sens (elle montre la
 * scène dont parle l'article), d'où un `alt` descriptif. Les dimensions
 * intrinsèques sont déclarées pour que le navigateur réserve la place avant le
 * chargement : pas de saut de mise en page pendant la lecture — un
 * déplacement du texte en cours de lecture coûte cher à un parent fatigué.
 *
 * Largeur bornée (`max-w-sm`) parce que l'illustration est au format portrait :
 * en pleine largeur de colonne, elle repousserait le début du texte d'un écran
 * entier sur téléphone.
 */
export function ArticleCover({ cover }: { cover: ArticleCoverImage }) {
  return (
    <figure className="mb-8">
      <img
        src={cover.src}
        alt={cover.alt}
        width={cover.width}
        height={cover.height}
        loading="eager"
        decoding="async"
        className="mx-auto w-full max-w-sm rounded-2xl border border-border/50 shadow-sm"
      />
    </figure>
  );
}

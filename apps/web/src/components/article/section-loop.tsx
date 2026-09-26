/**
 * Petite boucle animée sans texte, posée sous un titre de section d'article.
 *
 * Purement décorative (`alt=""`, `aria-hidden`) : elle attire l'œil vers la
 * section sans rien dire que le texte ne dise déjà. Les fichiers sont générés
 * par `visuals/remotion` dans `public/visuals/<slug>/<nom>-{light,dark}.{webp,png}`.
 *
 * - Un fichier par thème, basculé par la classe `.dark` (fond transparent).
 * - Sous `prefers-reduced-motion`, le navigateur prend l'image fixe (PNG).
 * - Dimensions déclarées : la place est réservée, rien ne saute pendant la
 *   lecture. `loading="lazy"` : rien n'est téléchargé avant d'approcher la section.
 */
export function SectionLoop({
  slug,
  name,
  className = "my-6",
  width = "max-w-[360px]",
  eager = false,
}: {
  slug: string;
  name: string;
  /** Marges de la figure (défaut : celles d'un article). */
  className?: string;
  /** Largeur maximale de l'image (classe Tailwind). */
  width?: string;
  /** Au-dessus de la ligne de flottaison (hero) : pas de lazy-loading. */
  eager?: boolean;
}) {
  const base = `/visuals/${slug}/${name}`;
  return (
    <figure className={`${className} flex justify-center`} aria-hidden="true">
      {(["light", "dark"] as const).map((theme) => (
        <picture
          key={theme}
          className={`w-full ${width} ${theme === "light" ? "block dark:hidden" : "hidden dark:block"}`}
        >
          <source media="(prefers-reduced-motion: reduce)" srcSet={`${base}-${theme}.png`} />
          <img
            src={`${base}-${theme}.webp`}
            alt=""
            width={480}
            height={240}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-auto w-full"
          />
        </picture>
      ))}
    </figure>
  );
}

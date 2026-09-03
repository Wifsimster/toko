import { cn } from "@/lib/utils";

// Le signe Tokō : un « ō » — un rond au contre ovale, coiffé d'un macron —
// dessiné dans un espace 100×100. Identique à favicon.svg, icon.svg et aux
// images de partage. Source de vérité : /brand.
const MARK_PATH =
  "M28.75 10.75h42.5a4.75 4.75 0 0 1 0 9.5h-42.5a4.75 4.75 0 0 1 0-9.5ZM20 59.25a30 30 0 1 0 60 0a30 30 0 1 0-60 0ZM31.5 59.25a18.5 22 0 1 1 37 0a18.5 22 0 1 1-37 0Z";

/**
 * Logo de marque Tokō : le ō crème sur une tuile sarcelle.
 * Couleurs fixées (indépendantes du thème) pour rester identiques au favicon,
 * à l'icône PWA et à l'image OG, y compris en mode sombre.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-[#358891]",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        {/* Le signe occupe 72 % de la tuile : même taille optique que l'icône. */}
        <path
          transform="translate(14 14) scale(0.72)"
          d={MARK_PATH}
          fill="#fdf9f4"
        />
      </svg>
    </span>
  );
}

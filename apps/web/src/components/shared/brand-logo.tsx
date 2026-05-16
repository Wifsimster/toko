import { cn } from "@/lib/utils";

// Cœur plein identique à favicon.svg / icon.svg / og-image.
const HEART_PATH =
  "M32 48c-1 0-2 0-3-1L17 34c-4-4-4-11 0-15 4-4 9-4 13-1l2 2 2-2c4-3 9-3 13 1 4 4 4 11 0 15L35 47c-1 1-2 1-3 1z";

/**
 * Logo de marque Tokō : cœur crème sur fond sarcelle.
 * Couleurs fixées (indépendantes du thème) pour rester identiques au favicon,
 * à l'icône PWA et à l'image OG, y compris en mode sombre.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-[#358891]",
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-1/2 w-1/2 fill-[#fdf9f4]"
        aria-hidden="true"
      >
        <path d={HEART_PATH} />
      </svg>
    </span>
  );
}

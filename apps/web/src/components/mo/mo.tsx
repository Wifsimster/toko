import { useTranslation } from "react-i18next";
import { pickMoSize, type MoArt, type MoPath, type MoState } from "@focusflow/mo";
import { cn } from "@/lib/utils";
import { useMoArt } from "./use-mo-art";

/** Les tracés d'un dessin de Mō, à poser dans un `<svg>` ou un `<g>`. */
export function MoPaths({
  art,
  shadow = true,
  overrides,
}: {
  art: MoArt;
  shadow?: boolean;
  /** Tracés remplacés par index (variante de pose d'une scène). */
  overrides?: ReadonlyArray<{ index: number; path: MoPath }>;
}) {
  return (
    <>
      {art.paths.map((original, i) => {
        const p = overrides?.find((o) => o.index === i)?.path ?? original;
        return !shadow && p.part === "shadow" ? null : (
          <path
            // Liste figée, générée : l'index est une clé stable.
            key={i}
            d={p.d}
            fill={p.fill}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            opacity={p.opacity}
          />
        );
      })}
    </>
  );
}

type MoProps = {
  state: MoState;
  /** Côté en pixels. Sous 96 px, la version petite (trait plus épais) est choisie seule. */
  size: number;
  /**
   * Par défaut Mō est décoratif (`aria-hidden`). Avec `label`, Mō devient une
   * image (`role="img"`) : passer `true` pour le libellé français par défaut
   * de l'état, ou un texte.
   */
  label?: string | true;
  /** Respiration douce (4 s), coupée par `prefers-reduced-motion`. */
  breathe?: boolean;
  /** Ombre portée au sol. */
  shadow?: boolean;
  className?: string;
};

/**
 * Mō, la mascotte de Tokō. Règles d'usage : DESIGN.md, section « Mō ».
 * La version sombre (liseré crème) est choisie seule quand <html> porte `.dark`.
 * Jamais en mode crise, sur le rapport PDF ni à côté d'un paywall.
 */
export function Mo({ state, size, label, breathe = false, shadow = true, className }: MoProps) {
  const { t } = useTranslation();
  const art = useMoArt(state, pickMoSize(size));
  const accessibleName = label === true ? t(`mo.label.${state}`) : label;

  return (
    <span
      className={cn("inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      data-mo={state}
      {...(accessibleName
        ? { role: "img", "aria-label": accessibleName }
        : { "aria-hidden": true })}
    >
      {art && (
        <svg
          viewBox={art.viewBox}
          width={size}
          height={size}
          aria-hidden="true"
          focusable="false"
          className="block overflow-visible"
        >
          <g className={breathe ? "mo-breathe" : undefined}>
            <MoPaths art={art} shadow={shadow} />
          </g>
        </svg>
      )}
    </span>
  );
}

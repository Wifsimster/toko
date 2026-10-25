import Svg, { Path } from "react-native-svg";
import type { MoArt } from "@focusflow/mo/child";

/** Les tracés d'un dessin de la direction « Mō », à poser dans un `<Svg>`. */
export function ArtPaths({ art, shadow = true }: { art: MoArt; shadow?: boolean }) {
  return (
    <>
      {art.paths.map((p, i) =>
        !shadow && p.part === "shadow" ? null : (
          <Path
            // Liste figée, générée : l'index est une clé stable.
            key={i}
            d={p.d}
            fill={p.fill}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            opacity={p.opacity}
          />
        ),
      )}
    </>
  );
}

/**
 * Un dessin carré de `size` px, décoratif : caché aux lecteurs d'écran. Le
 * sens est porté par le parent (libellé du composant appelant).
 */
export function ArtSvg({ art, size, shadow }: { art: MoArt; size: number; shadow?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox={art.viewBox} pointerEvents="none">
      <ArtPaths art={art} shadow={shadow} />
    </Svg>
  );
}

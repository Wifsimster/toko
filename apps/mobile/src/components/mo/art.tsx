import type { ReactNode } from "react";
import Svg, { G, Path } from "react-native-svg";
import type { MoArt } from "@focusflow/mo/child";

/** Angles du salut en cours, en degrés (voir `MO_WAVE_*` dans @focusflow/mo). */
export type WavePose = { hand: number; body: number };

/** Les tracés d'un dessin de la direction « Mō », à poser dans un `<Svg>`. */
export function ArtPaths({ art, shadow = true, wave }: { art: MoArt; shadow?: boolean; wave?: WavePose }) {
  const paths = art.paths.map((p, i) =>
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
  );
  // Au repos, aucun groupe : exactement la pose statique.
  if (!wave || !art.wave) return <>{paths}</>;

  // L'ombre reste au sol ; la main garde sa place dans l'ordre de peinture
  // (derrière le corps) et tourne autour du poignet.
  const parts = art.paths.map((p) => p.part);
  const firstHand = parts.indexOf("wave");
  const rotate = (angle: number, [x, y]: readonly [number, number], children: ReactNode) => (
    <G rotation={angle} originX={x} originY={y}>
      {children}
    </G>
  );
  return (
    <>
      {paths.filter((_, i) => parts[i] === "shadow")}
      {rotate(
        wave.body,
        art.wave.ground,
        <>
          {paths.filter((_, i) => i < firstHand && parts[i] !== "shadow")}
          {rotate(wave.hand, art.wave.pivot, paths.filter((_, i) => parts[i] === "wave"))}
          {paths.filter((_, i) => i > firstHand && parts[i] !== "wave" && parts[i] !== "shadow")}
        </>,
      )}
    </>
  );
}

/**
 * Un dessin carré de `size` px, décoratif : caché aux lecteurs d'écran. Le
 * sens est porté par le parent (libellé du composant appelant).
 */
export function ArtSvg({ art, size, shadow, wave }: { art: MoArt; size: number; shadow?: boolean; wave?: WavePose }) {
  return (
    <Svg width={size} height={size} viewBox={art.viewBox} pointerEvents="none">
      <ArtPaths art={art} shadow={shadow} wave={wave} />
    </Svg>
  );
}

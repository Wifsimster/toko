import type { ReactNode } from "react";
import Svg, { G, Path } from "react-native-svg";
import type { MoArt, MoGesturePose } from "@focusflow/mo/child";

/** Angles du salut en cours, en degrés (voir `MO_WAVE_*` dans @focusflow/mo). */
export type WavePose = { hand: number; body: number };

type ArtProps = {
  art: MoArt;
  shadow?: boolean;
  wave?: WavePose;
  /** Image en cours d'un geste (`MO_GESTURES`), sur un dessin qui a un macron isolé. */
  gesture?: MoGesturePose;
};

/** Les tracés d'un dessin de la direction « Mō », à poser dans un `<Svg>`. */
export function ArtPaths({ art, shadow = true, wave, gesture }: ArtProps) {
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
  if (gesture && art.ground) return <GesturePaths art={art} ground={art.ground} paths={paths} pose={gesture} />;
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
 * Un geste (`MO_GESTURES`) : l'ombre reste au sol et rétrécit quand Mō monte ;
 * le corps monte et s'étire depuis le sol ; le macron, à sa place dans
 * l'ordre de peinture, monte en plus du corps. Matrices `[a b c d e f]` de SVG.
 */
function GesturePaths({
  art,
  ground: [gx, gy],
  paths,
  pose,
}: {
  art: MoArt;
  ground: readonly [number, number];
  paths: ReactNode[];
  pose: MoGesturePose;
}) {
  const parts = art.paths.map((p) => p.part);
  const firstMacron = parts.indexOf("macron");
  const sy = 1 + pose.stretch;
  // La largeur compense de moitié : Mō se tasse en s'élargissant un peu.
  const sx = 1 - pose.stretch / 2;
  const body = (i: number) => parts[i] !== "shadow" && parts[i] !== "macron";
  return (
    <>
      <G transform={[pose.shadow, 0, 0, 1, gx * (1 - pose.shadow), 0]}>
        {paths.filter((_, i) => parts[i] === "shadow")}
      </G>
      <G transform={[sx, 0, 0, sy, gx * (1 - sx), gy * (1 - sy) + pose.lift]}>
        {paths.filter((_, i) => body(i) && (firstMacron < 0 || i < firstMacron))}
        <G transform={[1, 0, 0, 1, 0, pose.macron]}>{paths.filter((_, i) => parts[i] === "macron")}</G>
        {firstMacron < 0 ? null : paths.filter((_, i) => body(i) && i > firstMacron)}
      </G>
    </>
  );
}

/**
 * Un dessin carré de `size` px, décoratif : caché aux lecteurs d'écran. Le
 * sens est porté par le parent (libellé du composant appelant).
 */
export function ArtSvg({ art, size, shadow, wave, gesture }: ArtProps & { size: number }) {
  return (
    <Svg width={size} height={size} viewBox={art.viewBox} pointerEvents="none">
      <ArtPaths art={art} shadow={shadow} wave={wave} gesture={gesture} />
    </Svg>
  );
}

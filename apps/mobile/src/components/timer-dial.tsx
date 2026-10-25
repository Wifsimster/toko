import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { dialBackgroundArt } from "@focusflow/mo/child";

import { ArtPaths } from "./mo/art";

// Repère du dessin `cadran-fond` (viewBox 0 0 120 120) : piste sable de
// rayon 46 et d'épaisseur 10 (≈ 8,3 % du diamètre), centrée en 60,60.
const CENTER = 60;
const R = 46;
const TRACK = 10;
const OUTLINE = 2.2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const INK = "#1E2A2E";

/**
 * Cadran du minuteur : le fond au trait de feutre de la direction « Mō »
 * (disque crème, piste sable, contour encre, 12 repères) et, par-dessus,
 * l'arc du temps qui reste, calculé à chaque seconde (bouts arrondis, cerné
 * d'encre comme sur la maquette). Décoratif : le temps est dit par le texte.
 */
export function TimerDial({
  size,
  progress,
  color,
  children,
}: {
  size: number;
  /** Fraction restante, 1 (plein) → 0 (vide). */
  progress: number;
  /** Couleur de l'arc (sarcelle, puis rouge doux à la fin, vert une fois fini). */
  color: string;
  /** Contenu posé au centre (œuf, picto de l'étape). */
  children?: ReactNode;
}) {
  const p = Math.min(1, Math.max(0, progress));
  const arc = {
    cx: CENTER,
    cy: CENTER,
    r: R,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeDasharray: `${CIRCUMFERENCE} ${CIRCUMFERENCE}`,
    strokeDashoffset: CIRCUMFERENCE * (1 - p),
    transform: `rotate(-90 ${CENTER} ${CENTER})`,
  };
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={StyleSheet.absoluteFill}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={size} height={size} viewBox={dialBackgroundArt.viewBox}>
          <ArtPaths art={dialBackgroundArt} />
          {p > 0 ? (
            <>
              <Circle {...arc} stroke={INK} strokeWidth={TRACK + OUTLINE} />
              <Circle {...arc} stroke={color} strokeWidth={TRACK - OUTLINE} />
            </>
          ) : null}
        </Svg>
      </View>
      <View style={styles.center} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});

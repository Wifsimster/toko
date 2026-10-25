import type { MoSize } from "./types";

/** Sous cette taille d'affichage (en px), on dessine la version petite. */
export const MO_SMALL_BELOW_PX = 96;

/** Taille optique à utiliser pour un rendu de `px` pixels de côté. */
export function pickMoSize(px: number): MoSize {
  return px < MO_SMALL_BELOW_PX ? "small" : "large";
}

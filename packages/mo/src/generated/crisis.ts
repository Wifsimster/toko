// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, MoState } from "../types";
import { art as a0 } from "./art/accompagne-large";
import { art as a1 } from "./art/accompagne-small";

/** Le seul Mō de la liste de crise : immobile, décoratif, jamais pendant le mode crise plein écran. */
export const CRISIS_MO_STATES = [
  "accompagne"
] as const satisfies readonly MoState[];
export type CrisisMoState = (typeof CRISIS_MO_STATES)[number];

export const crisisMoArt: Record<CrisisMoState, Record<MoSize, MoArt>> = {
  "accompagne": {
    large: a0,
    small: a1,
  },
};

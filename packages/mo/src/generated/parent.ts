// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, MoState } from "../types";
import { art as a0 } from "./art/accueil-large";
import { art as a1 } from "./art/accueil-small";
import { art as a2 } from "./art/bravo-large";
import { art as a3 } from "./art/bravo-small";
import { art as a4 } from "./art/calme-large";
import { art as a5 } from "./art/calme-small";
import { art as a6 } from "./art/concentration-large";
import { art as a7 } from "./art/concentration-small";
import { art as a8 } from "./art/fierte-large";
import { art as a9 } from "./art/fierte-small";
import { art as a10 } from "./art/guide-large";
import { art as a11 } from "./art/guide-small";
import { art as a12 } from "./art/marche-large";
import { art as a13 } from "./art/marche-small";

/** Les états de Mō côté parent dans l'app : jamais un état de reflet (fatigue, trop-plein, inquiétude). */
export const PARENT_MO_STATES = [
  "accueil",
  "bravo",
  "calme",
  "concentration",
  "fierte",
  "guide",
  "marche"
] as const satisfies readonly MoState[];
export type ParentMoState = (typeof PARENT_MO_STATES)[number];

export const parentMoArt: Record<ParentMoState, Record<MoSize, MoArt>> = {
  "accueil": {
    large: a0,
    small: a1,
  },
  "bravo": {
    large: a2,
    small: a3,
  },
  "calme": {
    large: a4,
    small: a5,
  },
  "concentration": {
    large: a6,
    small: a7,
  },
  "fierte": {
    large: a8,
    small: a9,
  },
  "guide": {
    large: a10,
    small: a11,
  },
  "marche": {
    large: a12,
    small: a13,
  },
};

// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoState } from "../types";
import { art as a0 } from "./art/fatigue-small";
import { art as a1 } from "./art/trop-plein-small";
import { art as a2 } from "./art/inquietude-small";
import { art as a3 } from "./art/calme-small";
import { art as a4 } from "./art/fierte-small";

/** Les visages du sélecteur d'humeur du parent : les seuls états de reflet de l'app, choisis par le parent. */
export const MOOD_MO_STATES = [
  "fatigue",
  "trop-plein",
  "inquietude",
  "calme",
  "fierte"
] as const satisfies readonly MoState[];
export type MoodMoState = (typeof MOOD_MO_STATES)[number];

/** Version petite seulement (viewBox 6 18 188 188) : de 32 à 95 px. */
export const moodMoArt: Record<MoodMoState, MoArt> = {
  "fatigue": a0,
  "trop-plein": a1,
  "inquietude": a2,
  "calme": a3,
  "fierte": a4,
};

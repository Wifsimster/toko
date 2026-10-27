// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, MoState } from "../types";
import { art as a0 } from "./art/theme-attention-large";
import { art as a1 } from "./art/theme-attention-small";
import { art as a2 } from "./art/theme-cadre-large";
import { art as a3 } from "./art/theme-cadre-small";
import { art as a4 } from "./art/theme-comprendre-large";
import { art as a5 } from "./art/theme-comprendre-small";
import { art as a6 } from "./art/theme-consignes-large";
import { art as a7 } from "./art/theme-consignes-small";
import { art as a8 } from "./art/theme-ecole-large";
import { art as a9 } from "./art/theme-ecole-small";
import { art as a10 } from "./art/theme-emotions-large";
import { art as a11 } from "./art/theme-emotions-small";
import { art as a12 } from "./art/theme-entourage-large";
import { art as a13 } from "./art/theme-entourage-small";
import { art as a14 } from "./art/theme-recompenses-large";
import { art as a15 } from "./art/theme-recompenses-small";
import { art as a16 } from "./art/theme-soins-large";
import { art as a17 } from "./art/theme-soins-small";
import { art as a18 } from "./art/theme-sommeil-large";
import { art as a19 } from "./art/theme-sommeil-small";

/** Scènes de thème des articles et des étapes Barkley : vignette (petit) et en-tête (grand). */
export const THEME_MO_STATES = [
  "theme-attention",
  "theme-cadre",
  "theme-comprendre",
  "theme-consignes",
  "theme-ecole",
  "theme-emotions",
  "theme-entourage",
  "theme-recompenses",
  "theme-soins",
  "theme-sommeil"
] as const satisfies readonly MoState[];
export type ThemeMoState = (typeof THEME_MO_STATES)[number];

export const themeMoArt: Record<ThemeMoState, Record<MoSize, MoArt>> = {
  "theme-attention": {
    large: a0,
    small: a1,
  },
  "theme-cadre": {
    large: a2,
    small: a3,
  },
  "theme-comprendre": {
    large: a4,
    small: a5,
  },
  "theme-consignes": {
    large: a6,
    small: a7,
  },
  "theme-ecole": {
    large: a8,
    small: a9,
  },
  "theme-emotions": {
    large: a10,
    small: a11,
  },
  "theme-entourage": {
    large: a12,
    small: a13,
  },
  "theme-recompenses": {
    large: a14,
    small: a15,
  },
  "theme-soins": {
    large: a16,
    small: a17,
  },
  "theme-sommeil": {
    large: a18,
    small: a19,
  },
};

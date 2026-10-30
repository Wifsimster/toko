// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoScene } from "../types";

export const BARKLEY_SCENE_SECTIONS = [
  "understand",
  "technique",
  "scenarios",
  "practice"
] as const;
export type BarkleySceneSection = (typeof BARKLEY_SCENE_SECTIONS)[number];

/** Une scène par section d'étape Barkley, chargée à la demande. */
export const barkleySceneLoaders: Readonly<Record<number, Partial<Record<BarkleySceneSection, () => Promise<MoScene>>>>> = {
  1: {
    understand: () => import("./barkley/etape-1-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-1-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-1-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-1-exercice").then((m) => m.scene),
  },
  2: {
    understand: () => import("./barkley/etape-2-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-2-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-2-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-2-exercice").then((m) => m.scene),
  },
  3: {
    understand: () => import("./barkley/etape-3-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-3-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-3-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-3-exercice").then((m) => m.scene),
  },
};

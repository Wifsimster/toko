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
  4: {
    understand: () => import("./barkley/etape-4-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-4-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-4-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-4-exercice").then((m) => m.scene),
  },
  5: {
    understand: () => import("./barkley/etape-5-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-5-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-5-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-5-exercice").then((m) => m.scene),
  },
  6: {
    understand: () => import("./barkley/etape-6-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-6-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-6-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-6-exercice").then((m) => m.scene),
  },
  7: {
    understand: () => import("./barkley/etape-7-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-7-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-7-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-7-exercice").then((m) => m.scene),
  },
  8: {
    understand: () => import("./barkley/etape-8-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-8-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-8-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-8-exercice").then((m) => m.scene),
  },
  9: {
    understand: () => import("./barkley/etape-9-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-9-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-9-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-9-exercice").then((m) => m.scene),
  },
  10: {
    understand: () => import("./barkley/etape-10-comprendre").then((m) => m.scene),
    technique: () => import("./barkley/etape-10-technique").then((m) => m.scene),
    scenarios: () => import("./barkley/etape-10-situations").then((m) => m.scene),
    practice: () => import("./barkley/etape-10-exercice").then((m) => m.scene),
  },
};

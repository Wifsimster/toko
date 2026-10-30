// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoScene } from "../types";

export const REPERES_SCENE_NAMES = [
  "clarity",
  "attention",
  "wave",
  "sensory",
  "overlap",
  "path",
  "attention-petit",
  "wave-petit",
  "sensory-petit",
  "overlap-petit"
] as const;
export type ReperesSceneName = (typeof REPERES_SCENE_NAMES)[number];

/** Les scènes animées du questionnaire Repères (/quiz), chargées à la demande ; « -petit » : version carrée en gros plan pour les vignettes. */
export const reperesSceneLoaders: Readonly<Record<ReperesSceneName, () => Promise<MoScene>>> = {
  clarity: () => import("./reperes/clarity").then((m) => m.scene),
  attention: () => import("./reperes/attention").then((m) => m.scene),
  wave: () => import("./reperes/wave").then((m) => m.scene),
  sensory: () => import("./reperes/sensory").then((m) => m.scene),
  overlap: () => import("./reperes/overlap").then((m) => m.scene),
  path: () => import("./reperes/path").then((m) => m.scene),
  "attention-petit": () => import("./reperes/attention-petit").then((m) => m.scene),
  "wave-petit": () => import("./reperes/wave-petit").then((m) => m.scene),
  "sensory-petit": () => import("./reperes/sensory-petit").then((m) => m.scene),
  "overlap-petit": () => import("./reperes/overlap-petit").then((m) => m.scene),
};

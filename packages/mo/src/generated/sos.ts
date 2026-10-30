// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoScene } from "../types";

export const SOS_SCENE_NAMES = [
  "choix",
  "sensoriel",
  "diversion"
] as const;
export type SosSceneName = (typeof SOS_SCENE_NAMES)[number];

/** Les scènes calmes du SOS (choix, isolation sensorielle, diversion), chargées à la demande ; la respiration guidée garde son Mō. */
export const sosSceneLoaders: Readonly<Record<SosSceneName, () => Promise<MoScene>>> = {
  choix: () => import("./sos/choix").then((m) => m.scene),
  sensoriel: () => import("./sos/sensoriel").then((m) => m.scene),
  diversion: () => import("./sos/diversion").then((m) => m.scene),
};

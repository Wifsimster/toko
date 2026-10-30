import { barkleySceneLoaders, type BarkleySceneSection } from "./generated/barkley";
import type { MoScene } from "./types";

export { BARKLEY_SCENE_SECTIONS, barkleySceneLoaders, type BarkleySceneSection } from "./generated/barkley";
export type { MoPlacement, MoScene, MoState, SceneLayer } from "./types";

export const barkleySceneLoader = (
  stepNumber: number,
  section: BarkleySceneSection,
): (() => Promise<MoScene>) | undefined => barkleySceneLoaders[stepNumber]?.[section];

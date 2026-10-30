import { articleSceneLoaders } from "./generated/articles";
import type { MoScene } from "./types";

export { articleSceneLoaders } from "./generated/articles";
export type { MoPlacement, MoScene, MoState, SceneLayer, SceneMotionTrack } from "./types";

export const articleSceneCount = (slug: string): number => articleSceneLoaders[slug]?.length ?? 0;

export const articleSceneLoader = (slug: string, index: number): (() => Promise<MoScene>) | undefined =>
  articleSceneLoaders[slug]?.[index];

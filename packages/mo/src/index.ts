import { companionArtLoaders } from "./generated/companions";
import { loadDialBackgroundArt, pictoArtLoaders } from "./generated/pictos";
import { moArtLoaders } from "./generated/states";
import type { CompanionId, CompanionVariant, MoArt, MoSize, MoState, PictoName } from "./types";

export type {
  CompanionId,
  CompanionVariant,
  MoArt,
  MoIcon,
  MoPath,
  MoPlacement,
  MoScene,
  MoSize,
  MoState,
  MoWave,
  SceneLayer,
  ScenePaths,
  PictoName,
  SceneText,
} from "./types";
export { MO_STATES } from "./generated/states";
export { COMPANION_IDS, PICTO_NAMES } from "./generated/ids";
export { MO_SMALL_BELOW_PX, pickMoSize } from "./size";
export { MO_WAVE_BODY, MO_WAVE_DURATION_MS, MO_WAVE_HAND, moWaveAngle } from "./wave";
export {
  MO_GESTURES,
  MO_GESTURE_SHADOW_PER_UNIT,
  moGesturePose,
  type MoGesture,
  type MoGestureName,
  type MoGesturePose,
} from "./gestures";

export function loadMoArt(state: MoState, size: MoSize): Promise<MoArt> {
  return moArtLoaders[state][size]();
}

export function loadCompanionArt(id: CompanionId, variant: CompanionVariant): Promise<MoArt> {
  return companionArtLoaders[id][variant]();
}

export function loadPictoArt(name: PictoName, size: MoSize): Promise<MoArt> {
  return pictoArtLoaders[name][size]();
}

export { loadDialBackgroundArt };

export const MO_NEUTRAL_STATES = [
  "accueil",
  "bravo",
  "calme",
  "concentration",
  "enquete",
  "enquete-boite",
  "enquete-dessous",
  "fierte",
  "guide",
  "marche",
  "veille",
] as const satisfies readonly MoState[];

export const MO_THEME_STATES = [
  "theme-attention",
  "theme-cadre",
  "theme-comprendre",
  "theme-consignes",
  "theme-ecole",
  "theme-emotions",
  "theme-entourage",
  "theme-recompenses",
  "theme-soins",
  "theme-sommeil",
] as const satisfies readonly MoState[];

export const MO_CRISIS_STATES = ["accompagne", "present"] as const satisfies readonly MoState[];

export const MO_REFLECTION_STATES = [
  "fatigue",
  "inquietude",
  "trop-plein",
] as const satisfies readonly MoState[];

export {
  CHILD_COMPANION_VARIANTS,
  CHILD_MO_STATES,
  childMoArt,
  companionArt,
  dialBackgroundArt,
  pictoArt,
  type ChildCompanionVariant,
  type ChildMoState,
} from "./generated/child";
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
export type { CompanionId, MoArt, MoPath, MoSize, MoWave, PictoName } from "./types";

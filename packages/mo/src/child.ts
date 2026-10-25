/**
 * Entrée de l'app Expo (côté enfant) : dessins synchrones, sans `import()`.
 *
 * Metro met dans le bundle natif tout ce qu'un `import()` peut atteindre.
 * L'entrée principale (`@focusflow/mo`) charge chaque dessin à la demande,
 * ce qui convient au web (un fichier par dessin) mais embarquerait tout dans
 * l'app. Celle-ci n'importe que ce que l'enfant voit : Mō dans ses états
 * positifs ou neutres, les compagnons (grand, petit, verrouillé) et les pictos. Ne pas importer `@focusflow/mo` (l'index) depuis l'app : seulement
 * ses types.
 */
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
export type { CompanionId, MoArt, MoPath, MoSize, MoWave, PictoName } from "./types";

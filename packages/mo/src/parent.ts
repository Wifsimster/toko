/**
 * Entrée de l'app Expo (côté parent) : dessins synchrones, sans `import()`.
 *
 * Même raison que `child.ts` : Metro met dans le bundle natif tout ce qu'un
 * `import()` peut atteindre, donc l'index (chargement à la demande) et les
 * scènes restent hors de l'app. Ici, seulement les états de Mō que l'app
 * montre au parent (états vides, conseil du jour, fins d'étape) : jamais la
 * fatigue, le trop-plein ni l'inquiétude. Ne pas importer `@focusflow/mo`
 * (l'index) depuis l'app : seulement ses types.
 */
export { PARENT_MO_STATES, parentMoArt, type ParentMoState } from "./generated/parent";
export { MO_SMALL_BELOW_PX, pickMoSize } from "./size";
export type { MoArt, MoPath, MoSize } from "./types";

/**
 * Entrée de l'app Expo pour le sélecteur d'humeur du parent (accueil, point
 * du soir) : dessins synchrones, sans `import()`, version petite seulement.
 *
 * C'est la seule entrée de l'app qui porte les états de reflet (fatigue,
 * trop-plein, inquiétude) : le parent les choisit lui-même, Mō ne les montre
 * jamais de sa propre initiative (DIRECTION.md). À n'importer que depuis un
 * sélecteur d'humeur ; jamais côté enfant. `parent.ts` reste sans reflet.
 */
export { MOOD_MO_STATES, moodMoArt, type MoodMoState } from "./generated/mood";
export type { MoArt, MoPath } from "./types";

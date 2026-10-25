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

/**
 * Charge le dessin d'un état. Chaque état × taille est un module à
 * part, chargé à la demande : afficher Mō en accueil ne télécharge pas les
 * dix autres états.
 */
export function loadMoArt(state: MoState, size: MoSize): Promise<MoArt> {
  return moArtLoaders[state][size]();
}

/**
 * Charge le dessin d'un compagnon (côté enfant). L'app Expo passe par
 * `@focusflow/mo/child`, synchrone.
 */
export function loadCompanionArt(id: CompanionId, variant: CompanionVariant): Promise<MoArt> {
  return companionArtLoaders[id][variant]();
}

/** Charge un picto côté enfant (étape de routine, œuf du minuteur). */
export function loadPictoArt(name: PictoName, size: MoSize): Promise<MoArt> {
  return pictoArtLoaders[name][size]();
}

export { loadDialBackgroundArt };

/** Les états que Mō peut montrer de sa propre initiative (jamais un état négatif). */
export const MO_NEUTRAL_STATES = [
  "accueil",
  "bravo",
  "calme",
  "concentration",
  "fierte",
  "guide",
  "marche",
  "veille",
] as const satisfies readonly MoState[];

/**
 * Les états qui ne font que refléter ce que le parent a choisi (sélecteur
 * d'humeur). Jamais côté enfant, jamais à l'initiative de l'app.
 */
export const MO_REFLECTION_STATES = [
  "fatigue",
  "inquietude",
  "trop-plein",
] as const satisfies readonly MoState[];

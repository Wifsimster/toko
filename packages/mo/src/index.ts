import { moArtLoaders } from "./generated/states";
import type { MoArt, MoSize, MoState, MoTheme } from "./types";

export type {
  MoArt,
  MoIcon,
  MoPath,
  MoPlacement,
  MoScene,
  MoSize,
  MoState,
  MoTheme,
  SceneLayer,
  ScenePaths,
  SceneText,
} from "./types";
export { MO_STATES } from "./generated/states";

/** Sous cette taille d'affichage (en px), on dessine la version petite. */
export const MO_SMALL_BELOW_PX = 96;

/** Taille optique à utiliser pour un rendu de `px` pixels de côté. */
export function pickMoSize(px: number): MoSize {
  return px < MO_SMALL_BELOW_PX ? "small" : "large";
}

/**
 * Charge le dessin d'un état. Chaque état × taille × thème est un module à
 * part, chargé à la demande : afficher Mō en accueil ne télécharge pas les
 * dix autres états.
 */
export function loadMoArt(state: MoState, size: MoSize, theme: MoTheme = "light"): Promise<MoArt> {
  return moArtLoaders[state][size][theme]();
}

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

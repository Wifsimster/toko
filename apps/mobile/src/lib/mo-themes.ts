import type { ThemeMoState } from "@focusflow/mo/themes";

import type { Palette } from "./theme";

/**
 * Scènes de thème des articles et des étapes Barkley (poses du 2026-10-26,
 * correspondances validées avec la planche contact) : une scène par thème,
 * Mō et un ou deux accessoires, en vignette dans les listes.
 */

/** Une vignette : la scène, ou un état existant (étape 10 : la fierté). */
export type ThemeScene = ThemeMoState | "fierte";

/** Pastel de la tuile sous la scène (surfaces à sens fixe, DESIGN.md). */
type TileSurface = keyof Pick<
  Palette,
  "surfaceSky" | "surfaceMint" | "surfaceHoney" | "surfaceLavender" | "surfacePeach" | "surfaceRose"
>;

const TILE: Record<ThemeScene, TileSurface> = {
  "theme-comprendre": "surfaceSky",
  "theme-attention": "surfaceMint",
  "theme-consignes": "surfaceMint",
  "theme-recompenses": "surfaceHoney",
  "theme-cadre": "surfaceLavender",
  "theme-emotions": "surfacePeach",
  "theme-sommeil": "surfaceSky",
  "theme-ecole": "surfaceHoney",
  "theme-soins": "surfaceMint",
  "theme-entourage": "surfaceRose",
  fierte: "surfaceHoney",
};

/** Les 20 articles de `knowledge.ts`, par slug. */
export const ARTICLE_THEMES: Readonly<Record<string, ThemeMoState>> = {
  "crise-tdah-enfant-guide-complet": "theme-emotions",
  "dysregulation-emotionnelle-tdah": "theme-emotions",
  "co-regulation-parent-enfant-tdah": "theme-emotions",
  "deconnexion-emotionnelle-tdah": "theme-emotions",
  "hypersensibilite-sensorielle-tdah": "theme-emotions",
  "parent-tdah-gerer-mes-propres-crises": "theme-emotions",
  "fonctions-executives-tdah-enfant": "theme-comprendre",
  "tdah-ecrans-ne-causent-pas": "theme-comprendre",
  "motivation-delai-tdah-pourquoi-punition-echoue": "theme-recompenses",
  "troubles-sommeil-tdah-enfant": "theme-sommeil",
  "horloge-interne-tdah-enfant": "theme-sommeil",
  "rentree-scolaire-tdah-enfant": "theme-ecole",
  "retours-enseignant-tdah-enfant": "theme-ecole",
  "apres-le-diagnostic-tdah-parcours-de-soins": "theme-soins",
  "medication-tdah-mythes-parents": "theme-soins",
  "alimentation-tdah-enfant": "theme-soins",
  "mediation-equine-equitation-tdah-enfant": "theme-soins",
  "mini-guide-grands-parents-tdah": "theme-entourage",
  "mini-guide-co-parent-tdah": "theme-entourage",
  "mini-guide-parrains-marraines-tdah": "theme-entourage",
};

/** Les 10 étapes du programme Barkley, par numéro. */
export const BARKLEY_STEP_THEMES: Readonly<Record<number, ThemeScene>> = {
  1: "theme-comprendre",
  2: "theme-attention",
  3: "theme-consignes",
  4: "theme-consignes",
  5: "theme-recompenses",
  6: "theme-cadre",
  7: "theme-cadre",
  8: "theme-cadre",
  9: "theme-comprendre",
  // Bilan : la fierté existante (macron levé, étoile), pas de nouvelle scène.
  10: "fierte",
};

/** Un article ajouté sans thème garde une scène neutre plutôt que rien. */
const FALLBACK: ThemeMoState = "theme-comprendre";

export const articleScene = (slug: string): ThemeMoState => ARTICLE_THEMES[slug] ?? FALLBACK;

export const barkleyStepScene = (stepNumber: number): ThemeScene =>
  BARKLEY_STEP_THEMES[stepNumber] ?? FALLBACK;

/** Couleur de la tuile pastel d'une scène. */
export const sceneTile = (scene: ThemeScene, c: Palette): string => c[TILE[scene]];

/**
 * Données de dessin de Mō, neutres vis-à-vis du rendu : le web les passe à
 * `<svg>`/`<path>`, l'app Expo à `Svg`/`Path` de react-native-svg. Aucun
 * type React ici.
 */

/** Les onze états livrés par la direction (noms des fichiers `mo-<état>.svg`). */
export type MoState =
  | "accueil"
  | "bravo"
  | "calme"
  | "concentration"
  | "fatigue"
  | "fierte"
  | "guide"
  | "inquietude"
  | "marche"
  | "trop-plein"
  | "veille";

/**
 * Deux tailles optiques : `large` (viewBox -10 -10 220 220, de 96 à 320 px)
 * et `small` (viewBox 6 18 188 188, sous 96 px : trait plus épais, sans
 * reflets ni accessoires).
 */
export type MoSize = "large" | "small";

/**
 * `dark` : Mō Graphite (fond #141C1F, cartes #1E2A2E). L'encre reste, avec un
 * liseré crème #F3EDE2 autour de la silhouette ; corps menthe un peu baissé.
 */
export type MoTheme = "light" | "dark";

export type MoPath = {
  /** Données de tracé SVG (absolues, M/L/Z), allégées par le générateur. */
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** `shadow` : l'ombre portée au sol, qu'une scène peut retirer (Mō assis). */
  part?: "shadow";
};

export type MoArt = {
  viewBox: string;
  paths: readonly MoPath[];
};

/** Mō placé dans une scène : même repère que l'art `large`, puis translate + scale. */
export type MoPlacement = {
  kind: "mo";
  state: MoState;
  size: MoSize;
  x: number;
  y: number;
  scale: number;
  /** `false` quand la scène retire l'ombre au sol (Mō posé sur un objet). */
  shadow: boolean;
  /**
   * Variante de pose propre à la scène, en clair seulement : tracés de l'art
   * `light` remplacés par index (ex. macron rapproché de la tête).
   */
  lightOverrides?: ReadonlyArray<{ index: number; path: MoPath }>;
};

export type SceneText = {
  kind: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontWeight: number;
  fill: string;
  anchor: "start" | "middle" | "end";
  /** `hand` : la police manuscrite (Caveat). Décor seulement. */
  font: "hand";
};

export type ScenePaths = { kind: "paths"; paths: readonly MoPath[] };

export type SceneLayer = ScenePaths | MoPlacement | SceneText;

export type MoScene = {
  width: number;
  height: number;
  viewBox: string;
  /** Dans l'ordre de peinture : le premier calque est au fond. */
  layers: readonly SceneLayer[];
  /**
   * Hauteur (en unités de la viewBox) du fondu vers le fond de page en bas de
   * la scène. La maquette le peint avec un dégradé crème ; on le laisse au
   * rendu (masque CSS sur le web) pour qu'il suive le thème.
   */
  fadeBottom?: number;
};

export type MoIcon = MoArt;

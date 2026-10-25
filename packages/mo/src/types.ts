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

export type MoPath = {
  /** Données de tracé SVG (absolues, M/L/Z), allégées par le générateur. */
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /**
   * `shadow` : l'ombre portée au sol, qu'une scène peut retirer (Mō assis).
   * `wave` : la main levée qui salue (état « accueil »), deux tracés contigus
   * (aplat puis contour) que le rendu groupe pour les faire pivoter autour de
   * `MoArt.wave.pivot`.
   */
  part?: "shadow" | "wave";
};

/**
 * Salut de la main (état « accueil » seulement), en coordonnées de la
 * viewBox. Mesuré par le générateur (`markWave` dans scripts/generate.mjs).
 */
export type MoWave = {
  /** Le poignet : bout du haricot de la main caché derrière le corps. */
  pivot: readonly [number, number];
  /** Centre de l'ombre au sol : pivot de la légère inclinaison du corps. */
  ground: readonly [number, number];
};

export type MoArt = {
  viewBox: string;
  paths: readonly MoPath[];
  wave?: MoWave;
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
   * Variante de pose propre à la scène : tracés de l'état remplacés par
   * index (ex. macron rapproché de la tête).
   */
  poseOverrides?: ReadonlyArray<{ index: number; path: MoPath }>;
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
   * rendu (masque CSS sur le web) pour qu'il fonde vers le fond de page.
   */
  fadeBottom?: number;
};

export type MoIcon = MoArt;

/**
 * Les 20 compagnons du minuteur (côté enfant). Mêmes ids que
 * `CRITTER_CATALOG` dans apps/mobile et que la table `companions`.
 */
export type CompanionId =
  | "bear"
  | "butterfly"
  | "cat"
  | "chick"
  | "dog"
  | "fox"
  | "frog"
  | "hedgehog"
  | "koala"
  | "ladybug"
  | "lion"
  | "monkey"
  | "owl"
  | "panda"
  | "penguin"
  | "pig"
  | "rabbit"
  | "turtle"
  | "unicorn"
  | "whale";

/**
 * Cinq dessins par compagnon (fichiers `compagnons/<id>[-suffixe].svg`) :
 * - `large` : révélation après l'éclosion (120 à 220 px) ;
 * - `small` : tuile de la collection (40 à 64 px) ;
 * - `locked` : silhouette sable avec un « ? », compagnon pas encore rencontré ;
 * - `egg` / `egg-small` : œuf aux couleurs du compagnon (option, pour l'annoncer).
 */
export type CompanionVariant = "large" | "small" | "locked" | "egg" | "egg-small";

/**
 * Pictos côté enfant, en grand (viewBox 0 0 120 120) et en petit
 * (6 6 108 108) : étapes de routine et œuf du minuteur à chaque palier
 * (`oeuf-0` intact, puis fissures à ¾, ½ et ¼, et `oeuf-ouvert`).
 */
export type PictoName =
  | "cartable"
  | "chaussette"
  | "dents"
  | "douche"
  | "habits"
  | "livre"
  | "oeuf-0"
  | "oeuf-1"
  | "oeuf-2"
  | "oeuf-3"
  | "oeuf-ouvert"
  | "pyjama";

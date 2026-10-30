export type MoState =
  | "accompagne"
  | "accueil"
  | "bravo"
  | "calme"
  | "concentration"
  | "enquete"
  | "enquete-boite"
  | "enquete-dessous"
  | "fatigue"
  | "fierte"
  | "guide"
  | "inquietude"
  | "marche"
  | "present"
  | "theme-attention"
  | "theme-cadre"
  | "theme-comprendre"
  | "theme-consignes"
  | "theme-ecole"
  | "theme-emotions"
  | "theme-entourage"
  | "theme-recompenses"
  | "theme-soins"
  | "theme-sommeil"
  | "trop-plein"
  | "veille";

export type MoSize = "large" | "small";

export type MoPath = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  part?: "shadow" | "wave" | "macron";
};

export type MoWave = {
  pivot: readonly [number, number];
  ground: readonly [number, number];
};

export type MoArt = {
  viewBox: string;
  paths: readonly MoPath[];
  wave?: MoWave;
  ground?: readonly [number, number];
};

export type MoPlacement = {
  kind: "mo";
  state: MoState;
  size: MoSize;
  x: number;
  y: number;
  scale: number;
  shadow: boolean;
  poseOverrides?: ReadonlyArray<{ index: number; path: MoPath }>;
  move?: string;
};

export type SceneMotionKey = {
  at: number;
  x?: number;
  y?: number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
};

export type SceneMotionTrack = {
  move: string;
  part?: "body" | "shadow" | "macron" | "hand";
  from?: number;
  to?: number;
  origin: readonly [number, number];
  duration: number;
  delay: number;
  easing: "ease-in-out" | "linear";
  keys: readonly SceneMotionKey[];
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
  font: "hand";
};

export type ScenePaths = { kind: "paths"; paths: readonly MoPath[]; move?: string };

export type SceneLayer = ScenePaths | MoPlacement | SceneText;

export type MoScene = {
  width: number;
  height: number;
  viewBox: string;
  layers: readonly SceneLayer[];
  fadeBottom?: number;
  motion?: readonly SceneMotionTrack[];
};

export type MoIcon = MoArt;

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

export type CompanionVariant = "large" | "small" | "locked" | "egg" | "egg-small";

export type PictoName =
  | "ballon"
  | "bol"
  | "bulle"
  | "cahier"
  | "calin"
  | "cartable"
  | "chaussette"
  | "chaussures"
  | "cloche"
  | "crayon"
  | "dents"
  | "douche"
  | "ecran"
  | "gouter"
  | "habits"
  | "lampe"
  | "lavabo"
  | "livre"
  | "loupe"
  | "medicament"
  | "oeuf-0"
  | "oeuf-1"
  | "oeuf-2"
  | "oeuf-3"
  | "oeuf-ouvert"
  | "oreiller"
  | "pyjama"
  | "rangement"
  | "repas"
  | "sablier"
  | "verre";

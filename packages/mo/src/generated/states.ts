// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, MoState } from "../types";

export const MO_STATES = [
  "accueil",
  "bravo",
  "calme",
  "concentration",
  "fatigue",
  "fierte",
  "guide",
  "inquietude",
  "marche",
  "trop-plein",
  "veille"
] as const satisfies readonly MoState[];

/** Un module par état et par taille : le bundler ne charge que ce qui s'affiche. */
export const moArtLoaders: Record<MoState, Record<MoSize, () => Promise<MoArt>>> = {
  "accueil": {
    large: () => import("./art/accueil-large").then((m) => m.art),
    small: () => import("./art/accueil-small").then((m) => m.art),
  },
  "bravo": {
    large: () => import("./art/bravo-large").then((m) => m.art),
    small: () => import("./art/bravo-small").then((m) => m.art),
  },
  "calme": {
    large: () => import("./art/calme-large").then((m) => m.art),
    small: () => import("./art/calme-small").then((m) => m.art),
  },
  "concentration": {
    large: () => import("./art/concentration-large").then((m) => m.art),
    small: () => import("./art/concentration-small").then((m) => m.art),
  },
  "fatigue": {
    large: () => import("./art/fatigue-large").then((m) => m.art),
    small: () => import("./art/fatigue-small").then((m) => m.art),
  },
  "fierte": {
    large: () => import("./art/fierte-large").then((m) => m.art),
    small: () => import("./art/fierte-small").then((m) => m.art),
  },
  "guide": {
    large: () => import("./art/guide-large").then((m) => m.art),
    small: () => import("./art/guide-small").then((m) => m.art),
  },
  "inquietude": {
    large: () => import("./art/inquietude-large").then((m) => m.art),
    small: () => import("./art/inquietude-small").then((m) => m.art),
  },
  "marche": {
    large: () => import("./art/marche-large").then((m) => m.art),
    small: () => import("./art/marche-small").then((m) => m.art),
  },
  "trop-plein": {
    large: () => import("./art/trop-plein-large").then((m) => m.art),
    small: () => import("./art/trop-plein-small").then((m) => m.art),
  },
  "veille": {
    large: () => import("./art/veille-large").then((m) => m.art),
    small: () => import("./art/veille-small").then((m) => m.art),
  },
};

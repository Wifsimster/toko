// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, MoState, MoTheme } from "../types";

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

/** Un module par état, taille et thème : le bundler ne charge que ce qui s'affiche. */
export const moArtLoaders: Record<MoState, Record<MoSize, Record<MoTheme, () => Promise<MoArt>>>> = {
  "accueil": {
    large: {
      light: () => import("./art/accueil-large").then((m) => m.art),
      dark: () => import("./art/accueil-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/accueil-small").then((m) => m.art),
      dark: () => import("./art/accueil-small-dark").then((m) => m.art),
    },
  },
  "bravo": {
    large: {
      light: () => import("./art/bravo-large").then((m) => m.art),
      dark: () => import("./art/bravo-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/bravo-small").then((m) => m.art),
      dark: () => import("./art/bravo-small-dark").then((m) => m.art),
    },
  },
  "calme": {
    large: {
      light: () => import("./art/calme-large").then((m) => m.art),
      dark: () => import("./art/calme-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/calme-small").then((m) => m.art),
      dark: () => import("./art/calme-small-dark").then((m) => m.art),
    },
  },
  "concentration": {
    large: {
      light: () => import("./art/concentration-large").then((m) => m.art),
      dark: () => import("./art/concentration-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/concentration-small").then((m) => m.art),
      dark: () => import("./art/concentration-small-dark").then((m) => m.art),
    },
  },
  "fatigue": {
    large: {
      light: () => import("./art/fatigue-large").then((m) => m.art),
      dark: () => import("./art/fatigue-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/fatigue-small").then((m) => m.art),
      dark: () => import("./art/fatigue-small-dark").then((m) => m.art),
    },
  },
  "fierte": {
    large: {
      light: () => import("./art/fierte-large").then((m) => m.art),
      dark: () => import("./art/fierte-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/fierte-small").then((m) => m.art),
      dark: () => import("./art/fierte-small-dark").then((m) => m.art),
    },
  },
  "guide": {
    large: {
      light: () => import("./art/guide-large").then((m) => m.art),
      dark: () => import("./art/guide-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/guide-small").then((m) => m.art),
      dark: () => import("./art/guide-small-dark").then((m) => m.art),
    },
  },
  "inquietude": {
    large: {
      light: () => import("./art/inquietude-large").then((m) => m.art),
      dark: () => import("./art/inquietude-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/inquietude-small").then((m) => m.art),
      dark: () => import("./art/inquietude-small-dark").then((m) => m.art),
    },
  },
  "marche": {
    large: {
      light: () => import("./art/marche-large").then((m) => m.art),
      dark: () => import("./art/marche-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/marche-small").then((m) => m.art),
      dark: () => import("./art/marche-small-dark").then((m) => m.art),
    },
  },
  "trop-plein": {
    large: {
      light: () => import("./art/trop-plein-large").then((m) => m.art),
      dark: () => import("./art/trop-plein-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/trop-plein-small").then((m) => m.art),
      dark: () => import("./art/trop-plein-small-dark").then((m) => m.art),
    },
  },
  "veille": {
    large: {
      light: () => import("./art/veille-large").then((m) => m.art),
      dark: () => import("./art/veille-large-dark").then((m) => m.art),
    },
    small: {
      light: () => import("./art/veille-small").then((m) => m.art),
      dark: () => import("./art/veille-small-dark").then((m) => m.art),
    },
  },
};

// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, MoState } from "../types";

export const MO_STATES = [
  "accompagne",
  "accueil",
  "bravo",
  "calme",
  "concentration",
  "enquete",
  "enquete-boite",
  "enquete-dessous",
  "fatigue",
  "fierte",
  "guide",
  "inquietude",
  "marche",
  "present",
  "theme-attention",
  "theme-cadre",
  "theme-comprendre",
  "theme-consignes",
  "theme-ecole",
  "theme-emotions",
  "theme-entourage",
  "theme-recompenses",
  "theme-soins",
  "theme-sommeil",
  "trop-plein",
  "veille"
] as const satisfies readonly MoState[];

/** Un module par état et par taille : le bundler ne charge que ce qui s'affiche. */
export const moArtLoaders: Record<MoState, Record<MoSize, () => Promise<MoArt>>> = {
  "accompagne": {
    large: () => import("./art/accompagne-large").then((m) => m.art),
    small: () => import("./art/accompagne-small").then((m) => m.art),
  },
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
  "enquete": {
    large: () => import("./art/enquete-large").then((m) => m.art),
    small: () => import("./art/enquete-small").then((m) => m.art),
  },
  "enquete-boite": {
    large: () => import("./art/enquete-boite-large").then((m) => m.art),
    small: () => import("./art/enquete-boite-small").then((m) => m.art),
  },
  "enquete-dessous": {
    large: () => import("./art/enquete-dessous-large").then((m) => m.art),
    small: () => import("./art/enquete-dessous-small").then((m) => m.art),
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
  "present": {
    large: () => import("./art/present-large").then((m) => m.art),
    small: () => import("./art/present-small").then((m) => m.art),
  },
  "theme-attention": {
    large: () => import("./art/theme-attention-large").then((m) => m.art),
    small: () => import("./art/theme-attention-small").then((m) => m.art),
  },
  "theme-cadre": {
    large: () => import("./art/theme-cadre-large").then((m) => m.art),
    small: () => import("./art/theme-cadre-small").then((m) => m.art),
  },
  "theme-comprendre": {
    large: () => import("./art/theme-comprendre-large").then((m) => m.art),
    small: () => import("./art/theme-comprendre-small").then((m) => m.art),
  },
  "theme-consignes": {
    large: () => import("./art/theme-consignes-large").then((m) => m.art),
    small: () => import("./art/theme-consignes-small").then((m) => m.art),
  },
  "theme-ecole": {
    large: () => import("./art/theme-ecole-large").then((m) => m.art),
    small: () => import("./art/theme-ecole-small").then((m) => m.art),
  },
  "theme-emotions": {
    large: () => import("./art/theme-emotions-large").then((m) => m.art),
    small: () => import("./art/theme-emotions-small").then((m) => m.art),
  },
  "theme-entourage": {
    large: () => import("./art/theme-entourage-large").then((m) => m.art),
    small: () => import("./art/theme-entourage-small").then((m) => m.art),
  },
  "theme-recompenses": {
    large: () => import("./art/theme-recompenses-large").then((m) => m.art),
    small: () => import("./art/theme-recompenses-small").then((m) => m.art),
  },
  "theme-soins": {
    large: () => import("./art/theme-soins-large").then((m) => m.art),
    small: () => import("./art/theme-soins-small").then((m) => m.art),
  },
  "theme-sommeil": {
    large: () => import("./art/theme-sommeil-large").then((m) => m.art),
    small: () => import("./art/theme-sommeil-small").then((m) => m.art),
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

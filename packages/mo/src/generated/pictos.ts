// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, PictoName } from "../types";

export { PICTO_NAMES } from "./ids";

/** Un module par picto et par taille, chargé à la demande. */
export const pictoArtLoaders: Record<PictoName, Record<MoSize, () => Promise<MoArt>>> = {
  "cartable": {
    large: () => import("./pictos/cartable-large").then((m) => m.art),
    small: () => import("./pictos/cartable-small").then((m) => m.art),
  },
  "chaussette": {
    large: () => import("./pictos/chaussette-large").then((m) => m.art),
    small: () => import("./pictos/chaussette-small").then((m) => m.art),
  },
  "dents": {
    large: () => import("./pictos/dents-large").then((m) => m.art),
    small: () => import("./pictos/dents-small").then((m) => m.art),
  },
  "douche": {
    large: () => import("./pictos/douche-large").then((m) => m.art),
    small: () => import("./pictos/douche-small").then((m) => m.art),
  },
  "habits": {
    large: () => import("./pictos/habits-large").then((m) => m.art),
    small: () => import("./pictos/habits-small").then((m) => m.art),
  },
  "livre": {
    large: () => import("./pictos/livre-large").then((m) => m.art),
    small: () => import("./pictos/livre-small").then((m) => m.art),
  },
  "oeuf-0": {
    large: () => import("./pictos/oeuf-0-large").then((m) => m.art),
    small: () => import("./pictos/oeuf-0-small").then((m) => m.art),
  },
  "oeuf-1": {
    large: () => import("./pictos/oeuf-1-large").then((m) => m.art),
    small: () => import("./pictos/oeuf-1-small").then((m) => m.art),
  },
  "oeuf-2": {
    large: () => import("./pictos/oeuf-2-large").then((m) => m.art),
    small: () => import("./pictos/oeuf-2-small").then((m) => m.art),
  },
  "oeuf-3": {
    large: () => import("./pictos/oeuf-3-large").then((m) => m.art),
    small: () => import("./pictos/oeuf-3-small").then((m) => m.art),
  },
  "oeuf-ouvert": {
    large: () => import("./pictos/oeuf-ouvert-large").then((m) => m.art),
    small: () => import("./pictos/oeuf-ouvert-small").then((m) => m.art),
  },
  "pyjama": {
    large: () => import("./pictos/pyjama-large").then((m) => m.art),
    small: () => import("./pictos/pyjama-small").then((m) => m.art),
  },
};

/** Fond du cadran du minuteur (grand seulement) : l'arc reste dynamique par-dessus. */
export const loadDialBackgroundArt = (): Promise<MoArt> => import("./pictos/cadran-fond").then((m) => m.art);

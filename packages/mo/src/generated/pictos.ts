// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, PictoName } from "../types";

export { PICTO_NAMES } from "./ids";

/** Un module par picto et par taille, chargé à la demande. */
export const pictoArtLoaders: Record<PictoName, Record<MoSize, () => Promise<MoArt>>> = {
  "ballon": {
    large: () => import("./pictos/ballon-large").then((m) => m.art),
    small: () => import("./pictos/ballon-small").then((m) => m.art),
  },
  "bol": {
    large: () => import("./pictos/bol-large").then((m) => m.art),
    small: () => import("./pictos/bol-small").then((m) => m.art),
  },
  "bulle": {
    large: () => import("./pictos/bulle-large").then((m) => m.art),
    small: () => import("./pictos/bulle-small").then((m) => m.art),
  },
  "cahier": {
    large: () => import("./pictos/cahier-large").then((m) => m.art),
    small: () => import("./pictos/cahier-small").then((m) => m.art),
  },
  "calin": {
    large: () => import("./pictos/calin-large").then((m) => m.art),
    small: () => import("./pictos/calin-small").then((m) => m.art),
  },
  "cartable": {
    large: () => import("./pictos/cartable-large").then((m) => m.art),
    small: () => import("./pictos/cartable-small").then((m) => m.art),
  },
  "chaussette": {
    large: () => import("./pictos/chaussette-large").then((m) => m.art),
    small: () => import("./pictos/chaussette-small").then((m) => m.art),
  },
  "chaussures": {
    large: () => import("./pictos/chaussures-large").then((m) => m.art),
    small: () => import("./pictos/chaussures-small").then((m) => m.art),
  },
  "cloche": {
    large: () => import("./pictos/cloche-large").then((m) => m.art),
    small: () => import("./pictos/cloche-small").then((m) => m.art),
  },
  "crayon": {
    large: () => import("./pictos/crayon-large").then((m) => m.art),
    small: () => import("./pictos/crayon-small").then((m) => m.art),
  },
  "dents": {
    large: () => import("./pictos/dents-large").then((m) => m.art),
    small: () => import("./pictos/dents-small").then((m) => m.art),
  },
  "douche": {
    large: () => import("./pictos/douche-large").then((m) => m.art),
    small: () => import("./pictos/douche-small").then((m) => m.art),
  },
  "ecran": {
    large: () => import("./pictos/ecran-large").then((m) => m.art),
    small: () => import("./pictos/ecran-small").then((m) => m.art),
  },
  "gouter": {
    large: () => import("./pictos/gouter-large").then((m) => m.art),
    small: () => import("./pictos/gouter-small").then((m) => m.art),
  },
  "habits": {
    large: () => import("./pictos/habits-large").then((m) => m.art),
    small: () => import("./pictos/habits-small").then((m) => m.art),
  },
  "lampe": {
    large: () => import("./pictos/lampe-large").then((m) => m.art),
    small: () => import("./pictos/lampe-small").then((m) => m.art),
  },
  "lavabo": {
    large: () => import("./pictos/lavabo-large").then((m) => m.art),
    small: () => import("./pictos/lavabo-small").then((m) => m.art),
  },
  "livre": {
    large: () => import("./pictos/livre-large").then((m) => m.art),
    small: () => import("./pictos/livre-small").then((m) => m.art),
  },
  "loupe": {
    large: () => import("./pictos/loupe-large").then((m) => m.art),
    small: () => import("./pictos/loupe-small").then((m) => m.art),
  },
  "medicament": {
    large: () => import("./pictos/medicament-large").then((m) => m.art),
    small: () => import("./pictos/medicament-small").then((m) => m.art),
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
  "oreiller": {
    large: () => import("./pictos/oreiller-large").then((m) => m.art),
    small: () => import("./pictos/oreiller-small").then((m) => m.art),
  },
  "pyjama": {
    large: () => import("./pictos/pyjama-large").then((m) => m.art),
    small: () => import("./pictos/pyjama-small").then((m) => m.art),
  },
  "rangement": {
    large: () => import("./pictos/rangement-large").then((m) => m.art),
    small: () => import("./pictos/rangement-small").then((m) => m.art),
  },
  "repas": {
    large: () => import("./pictos/repas-large").then((m) => m.art),
    small: () => import("./pictos/repas-small").then((m) => m.art),
  },
  "sablier": {
    large: () => import("./pictos/sablier-large").then((m) => m.art),
    small: () => import("./pictos/sablier-small").then((m) => m.art),
  },
  "verre": {
    large: () => import("./pictos/verre-large").then((m) => m.art),
    small: () => import("./pictos/verre-small").then((m) => m.art),
  },
};

/** Fond du cadran du minuteur (grand seulement) : l'arc reste dynamique par-dessus. */
export const loadDialBackgroundArt = (): Promise<MoArt> => import("./pictos/cadran-fond").then((m) => m.art);

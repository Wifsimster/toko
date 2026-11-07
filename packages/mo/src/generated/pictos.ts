// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoArt, MoSize, PictoName } from "../types";

export { PICTO_NAMES } from "./ids";

/** Un module par picto et par taille, chargé à la demande. */
export const pictoArtLoaders: Record<PictoName, Record<MoSize, () => Promise<MoArt>>> = {
  "arbre": {
    large: () => import("./pictos/arbre-large").then((m) => m.art),
    small: () => import("./pictos/arbre-small").then((m) => m.art),
  },
  "arcenciel": {
    large: () => import("./pictos/arcenciel-large").then((m) => m.art),
    small: () => import("./pictos/arcenciel-small").then((m) => m.art),
  },
  "ballon": {
    large: () => import("./pictos/ballon-large").then((m) => m.art),
    small: () => import("./pictos/ballon-small").then((m) => m.art),
  },
  "biberon": {
    large: () => import("./pictos/biberon-large").then((m) => m.art),
    small: () => import("./pictos/biberon-small").then((m) => m.art),
  },
  "bof": {
    large: () => import("./pictos/bof-large").then((m) => m.art),
    small: () => import("./pictos/bof-small").then((m) => m.art),
  },
  "bol": {
    large: () => import("./pictos/bol-large").then((m) => m.art),
    small: () => import("./pictos/bol-small").then((m) => m.art),
  },
  "bonbon": {
    large: () => import("./pictos/bonbon-large").then((m) => m.art),
    small: () => import("./pictos/bonbon-small").then((m) => m.art),
  },
  "bouee": {
    large: () => import("./pictos/bouee-large").then((m) => m.art),
    small: () => import("./pictos/bouee-small").then((m) => m.art),
  },
  "bulle": {
    large: () => import("./pictos/bulle-large").then((m) => m.art),
    small: () => import("./pictos/bulle-small").then((m) => m.art),
  },
  "cadeau": {
    large: () => import("./pictos/cadeau-large").then((m) => m.art),
    small: () => import("./pictos/cadeau-small").then((m) => m.art),
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
  "casque": {
    large: () => import("./pictos/casque-large").then((m) => m.art),
    small: () => import("./pictos/casque-small").then((m) => m.art),
  },
  "chaussette": {
    large: () => import("./pictos/chaussette-large").then((m) => m.art),
    small: () => import("./pictos/chaussette-small").then((m) => m.art),
  },
  "chaussures": {
    large: () => import("./pictos/chaussures-large").then((m) => m.art),
    small: () => import("./pictos/chaussures-small").then((m) => m.art),
  },
  "chut": {
    large: () => import("./pictos/chut-large").then((m) => m.art),
    small: () => import("./pictos/chut-small").then((m) => m.art),
  },
  "cible": {
    large: () => import("./pictos/cible-large").then((m) => m.art),
    small: () => import("./pictos/cible-small").then((m) => m.art),
  },
  "cinema": {
    large: () => import("./pictos/cinema-large").then((m) => m.art),
    small: () => import("./pictos/cinema-small").then((m) => m.art),
  },
  "cloche": {
    large: () => import("./pictos/cloche-large").then((m) => m.art),
    small: () => import("./pictos/cloche-small").then((m) => m.art),
  },
  "coche": {
    large: () => import("./pictos/coche-large").then((m) => m.art),
    small: () => import("./pictos/coche-small").then((m) => m.art),
  },
  "couronne": {
    large: () => import("./pictos/couronne-large").then((m) => m.art),
    small: () => import("./pictos/couronne-small").then((m) => m.art),
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
  "ecole": {
    large: () => import("./pictos/ecole-large").then((m) => m.art),
    small: () => import("./pictos/ecole-small").then((m) => m.art),
  },
  "ecran": {
    large: () => import("./pictos/ecran-large").then((m) => m.art),
    small: () => import("./pictos/ecran-small").then((m) => m.art),
  },
  "famille": {
    large: () => import("./pictos/famille-large").then((m) => m.art),
    small: () => import("./pictos/famille-small").then((m) => m.art),
  },
  "fete": {
    large: () => import("./pictos/fete-large").then((m) => m.art),
    small: () => import("./pictos/fete-small").then((m) => m.art),
  },
  "feu": {
    large: () => import("./pictos/feu-large").then((m) => m.art),
    small: () => import("./pictos/feu-small").then((m) => m.art),
  },
  "fusee": {
    large: () => import("./pictos/fusee-large").then((m) => m.art),
    small: () => import("./pictos/fusee-small").then((m) => m.art),
  },
  "gateau": {
    large: () => import("./pictos/gateau-large").then((m) => m.art),
    small: () => import("./pictos/gateau-small").then((m) => m.art),
  },
  "glace": {
    large: () => import("./pictos/glace-large").then((m) => m.art),
    small: () => import("./pictos/glace-small").then((m) => m.art),
  },
  "gouter": {
    large: () => import("./pictos/gouter-large").then((m) => m.art),
    small: () => import("./pictos/gouter-small").then((m) => m.art),
  },
  "habits": {
    large: () => import("./pictos/habits-large").then((m) => m.art),
    small: () => import("./pictos/habits-small").then((m) => m.art),
  },
  "haltere": {
    large: () => import("./pictos/haltere-large").then((m) => m.art),
    small: () => import("./pictos/haltere-small").then((m) => m.art),
  },
  "lampe": {
    large: () => import("./pictos/lampe-large").then((m) => m.art),
    small: () => import("./pictos/lampe-small").then((m) => m.art),
  },
  "lavabo": {
    large: () => import("./pictos/lavabo-large").then((m) => m.art),
    small: () => import("./pictos/lavabo-small").then((m) => m.art),
  },
  "lit": {
    large: () => import("./pictos/lit-large").then((m) => m.art),
    small: () => import("./pictos/lit-small").then((m) => m.art),
  },
  "livre": {
    large: () => import("./pictos/livre-large").then((m) => m.art),
    small: () => import("./pictos/livre-small").then((m) => m.art),
  },
  "loupe": {
    large: () => import("./pictos/loupe-large").then((m) => m.art),
    small: () => import("./pictos/loupe-small").then((m) => m.art),
  },
  "main": {
    large: () => import("./pictos/main-large").then((m) => m.art),
    small: () => import("./pictos/main-small").then((m) => m.art),
  },
  "maison": {
    large: () => import("./pictos/maison-large").then((m) => m.art),
    small: () => import("./pictos/maison-small").then((m) => m.art),
  },
  "manette": {
    large: () => import("./pictos/manette-large").then((m) => m.art),
    small: () => import("./pictos/manette-small").then((m) => m.art),
  },
  "medicament": {
    large: () => import("./pictos/medicament-large").then((m) => m.art),
    small: () => import("./pictos/medicament-small").then((m) => m.art),
  },
  "micro": {
    large: () => import("./pictos/micro-large").then((m) => m.art),
    small: () => import("./pictos/micro-small").then((m) => m.art),
  },
  "musique": {
    large: () => import("./pictos/musique-large").then((m) => m.art),
    small: () => import("./pictos/musique-small").then((m) => m.art),
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
  "oreille": {
    large: () => import("./pictos/oreille-large").then((m) => m.art),
    small: () => import("./pictos/oreille-small").then((m) => m.art),
  },
  "oreiller": {
    large: () => import("./pictos/oreiller-large").then((m) => m.art),
    small: () => import("./pictos/oreiller-small").then((m) => m.art),
  },
  "palette": {
    large: () => import("./pictos/palette-large").then((m) => m.art),
    small: () => import("./pictos/palette-small").then((m) => m.art),
  },
  "patte": {
    large: () => import("./pictos/patte-large").then((m) => m.art),
    small: () => import("./pictos/patte-small").then((m) => m.art),
  },
  "photo": {
    large: () => import("./pictos/photo-large").then((m) => m.art),
    small: () => import("./pictos/photo-small").then((m) => m.art),
  },
  "pizza": {
    large: () => import("./pictos/pizza-large").then((m) => m.art),
    small: () => import("./pictos/pizza-small").then((m) => m.art),
  },
  "poisson": {
    large: () => import("./pictos/poisson-large").then((m) => m.art),
    small: () => import("./pictos/poisson-small").then((m) => m.art),
  },
  "pomme": {
    large: () => import("./pictos/pomme-large").then((m) => m.art),
    small: () => import("./pictos/pomme-small").then((m) => m.art),
  },
  "popcorn": {
    large: () => import("./pictos/popcorn-large").then((m) => m.art),
    small: () => import("./pictos/popcorn-small").then((m) => m.art),
  },
  "pouce": {
    large: () => import("./pictos/pouce-large").then((m) => m.art),
    small: () => import("./pictos/pouce-small").then((m) => m.art),
  },
  "puzzle": {
    large: () => import("./pictos/puzzle-large").then((m) => m.art),
    small: () => import("./pictos/puzzle-small").then((m) => m.art),
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
  "reveil": {
    large: () => import("./pictos/reveil-large").then((m) => m.art),
    small: () => import("./pictos/reveil-small").then((m) => m.art),
  },
  "rire": {
    large: () => import("./pictos/rire-large").then((m) => m.art),
    small: () => import("./pictos/rire-small").then((m) => m.art),
  },
  "sablier": {
    large: () => import("./pictos/sablier-large").then((m) => m.art),
    small: () => import("./pictos/sablier-small").then((m) => m.art),
  },
  "sac": {
    large: () => import("./pictos/sac-large").then((m) => m.art),
    small: () => import("./pictos/sac-small").then((m) => m.art),
  },
  "souffle": {
    large: () => import("./pictos/souffle-large").then((m) => m.art),
    small: () => import("./pictos/souffle-small").then((m) => m.art),
  },
  "sourire": {
    large: () => import("./pictos/sourire-large").then((m) => m.art),
    small: () => import("./pictos/sourire-small").then((m) => m.art),
  },
  "tente": {
    large: () => import("./pictos/tente-large").then((m) => m.art),
    small: () => import("./pictos/tente-small").then((m) => m.art),
  },
  "ticket": {
    large: () => import("./pictos/ticket-large").then((m) => m.art),
    small: () => import("./pictos/ticket-small").then((m) => m.art),
  },
  "triste": {
    large: () => import("./pictos/triste-large").then((m) => m.art),
    small: () => import("./pictos/triste-small").then((m) => m.art),
  },
  "trophee": {
    large: () => import("./pictos/trophee-large").then((m) => m.art),
    small: () => import("./pictos/trophee-small").then((m) => m.art),
  },
  "velo": {
    large: () => import("./pictos/velo-large").then((m) => m.art),
    small: () => import("./pictos/velo-small").then((m) => m.art),
  },
  "verre": {
    large: () => import("./pictos/verre-large").then((m) => m.art),
    small: () => import("./pictos/verre-small").then((m) => m.art),
  },
  "voiture": {
    large: () => import("./pictos/voiture-large").then((m) => m.art),
    small: () => import("./pictos/voiture-small").then((m) => m.art),
  },
};

/** Fond du cadran du minuteur (grand seulement) : l'arc reste dynamique par-dessus. */
export const loadDialBackgroundArt = (): Promise<MoArt> => import("./pictos/cadran-fond").then((m) => m.art);

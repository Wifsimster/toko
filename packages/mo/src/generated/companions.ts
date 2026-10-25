// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { CompanionId, CompanionVariant, MoArt } from "../types";

export { COMPANION_IDS } from "./ids";

/** Un module par compagnon et par variante, chargé à la demande. */
export const companionArtLoaders: Record<CompanionId, Record<CompanionVariant, () => Promise<MoArt>>> = {
  "bear": {
    "large": () => import("./companions/bear-large").then((m) => m.art),
    "small": () => import("./companions/bear-small").then((m) => m.art),
    "locked": () => import("./companions/bear-locked").then((m) => m.art),
    "egg": () => import("./companions/bear-egg").then((m) => m.art),
    "egg-small": () => import("./companions/bear-egg-small").then((m) => m.art),
  },
  "butterfly": {
    "large": () => import("./companions/butterfly-large").then((m) => m.art),
    "small": () => import("./companions/butterfly-small").then((m) => m.art),
    "locked": () => import("./companions/butterfly-locked").then((m) => m.art),
    "egg": () => import("./companions/butterfly-egg").then((m) => m.art),
    "egg-small": () => import("./companions/butterfly-egg-small").then((m) => m.art),
  },
  "cat": {
    "large": () => import("./companions/cat-large").then((m) => m.art),
    "small": () => import("./companions/cat-small").then((m) => m.art),
    "locked": () => import("./companions/cat-locked").then((m) => m.art),
    "egg": () => import("./companions/cat-egg").then((m) => m.art),
    "egg-small": () => import("./companions/cat-egg-small").then((m) => m.art),
  },
  "chick": {
    "large": () => import("./companions/chick-large").then((m) => m.art),
    "small": () => import("./companions/chick-small").then((m) => m.art),
    "locked": () => import("./companions/chick-locked").then((m) => m.art),
    "egg": () => import("./companions/chick-egg").then((m) => m.art),
    "egg-small": () => import("./companions/chick-egg-small").then((m) => m.art),
  },
  "dog": {
    "large": () => import("./companions/dog-large").then((m) => m.art),
    "small": () => import("./companions/dog-small").then((m) => m.art),
    "locked": () => import("./companions/dog-locked").then((m) => m.art),
    "egg": () => import("./companions/dog-egg").then((m) => m.art),
    "egg-small": () => import("./companions/dog-egg-small").then((m) => m.art),
  },
  "fox": {
    "large": () => import("./companions/fox-large").then((m) => m.art),
    "small": () => import("./companions/fox-small").then((m) => m.art),
    "locked": () => import("./companions/fox-locked").then((m) => m.art),
    "egg": () => import("./companions/fox-egg").then((m) => m.art),
    "egg-small": () => import("./companions/fox-egg-small").then((m) => m.art),
  },
  "frog": {
    "large": () => import("./companions/frog-large").then((m) => m.art),
    "small": () => import("./companions/frog-small").then((m) => m.art),
    "locked": () => import("./companions/frog-locked").then((m) => m.art),
    "egg": () => import("./companions/frog-egg").then((m) => m.art),
    "egg-small": () => import("./companions/frog-egg-small").then((m) => m.art),
  },
  "hedgehog": {
    "large": () => import("./companions/hedgehog-large").then((m) => m.art),
    "small": () => import("./companions/hedgehog-small").then((m) => m.art),
    "locked": () => import("./companions/hedgehog-locked").then((m) => m.art),
    "egg": () => import("./companions/hedgehog-egg").then((m) => m.art),
    "egg-small": () => import("./companions/hedgehog-egg-small").then((m) => m.art),
  },
  "koala": {
    "large": () => import("./companions/koala-large").then((m) => m.art),
    "small": () => import("./companions/koala-small").then((m) => m.art),
    "locked": () => import("./companions/koala-locked").then((m) => m.art),
    "egg": () => import("./companions/koala-egg").then((m) => m.art),
    "egg-small": () => import("./companions/koala-egg-small").then((m) => m.art),
  },
  "ladybug": {
    "large": () => import("./companions/ladybug-large").then((m) => m.art),
    "small": () => import("./companions/ladybug-small").then((m) => m.art),
    "locked": () => import("./companions/ladybug-locked").then((m) => m.art),
    "egg": () => import("./companions/ladybug-egg").then((m) => m.art),
    "egg-small": () => import("./companions/ladybug-egg-small").then((m) => m.art),
  },
  "lion": {
    "large": () => import("./companions/lion-large").then((m) => m.art),
    "small": () => import("./companions/lion-small").then((m) => m.art),
    "locked": () => import("./companions/lion-locked").then((m) => m.art),
    "egg": () => import("./companions/lion-egg").then((m) => m.art),
    "egg-small": () => import("./companions/lion-egg-small").then((m) => m.art),
  },
  "monkey": {
    "large": () => import("./companions/monkey-large").then((m) => m.art),
    "small": () => import("./companions/monkey-small").then((m) => m.art),
    "locked": () => import("./companions/monkey-locked").then((m) => m.art),
    "egg": () => import("./companions/monkey-egg").then((m) => m.art),
    "egg-small": () => import("./companions/monkey-egg-small").then((m) => m.art),
  },
  "owl": {
    "large": () => import("./companions/owl-large").then((m) => m.art),
    "small": () => import("./companions/owl-small").then((m) => m.art),
    "locked": () => import("./companions/owl-locked").then((m) => m.art),
    "egg": () => import("./companions/owl-egg").then((m) => m.art),
    "egg-small": () => import("./companions/owl-egg-small").then((m) => m.art),
  },
  "panda": {
    "large": () => import("./companions/panda-large").then((m) => m.art),
    "small": () => import("./companions/panda-small").then((m) => m.art),
    "locked": () => import("./companions/panda-locked").then((m) => m.art),
    "egg": () => import("./companions/panda-egg").then((m) => m.art),
    "egg-small": () => import("./companions/panda-egg-small").then((m) => m.art),
  },
  "penguin": {
    "large": () => import("./companions/penguin-large").then((m) => m.art),
    "small": () => import("./companions/penguin-small").then((m) => m.art),
    "locked": () => import("./companions/penguin-locked").then((m) => m.art),
    "egg": () => import("./companions/penguin-egg").then((m) => m.art),
    "egg-small": () => import("./companions/penguin-egg-small").then((m) => m.art),
  },
  "pig": {
    "large": () => import("./companions/pig-large").then((m) => m.art),
    "small": () => import("./companions/pig-small").then((m) => m.art),
    "locked": () => import("./companions/pig-locked").then((m) => m.art),
    "egg": () => import("./companions/pig-egg").then((m) => m.art),
    "egg-small": () => import("./companions/pig-egg-small").then((m) => m.art),
  },
  "rabbit": {
    "large": () => import("./companions/rabbit-large").then((m) => m.art),
    "small": () => import("./companions/rabbit-small").then((m) => m.art),
    "locked": () => import("./companions/rabbit-locked").then((m) => m.art),
    "egg": () => import("./companions/rabbit-egg").then((m) => m.art),
    "egg-small": () => import("./companions/rabbit-egg-small").then((m) => m.art),
  },
  "turtle": {
    "large": () => import("./companions/turtle-large").then((m) => m.art),
    "small": () => import("./companions/turtle-small").then((m) => m.art),
    "locked": () => import("./companions/turtle-locked").then((m) => m.art),
    "egg": () => import("./companions/turtle-egg").then((m) => m.art),
    "egg-small": () => import("./companions/turtle-egg-small").then((m) => m.art),
  },
  "unicorn": {
    "large": () => import("./companions/unicorn-large").then((m) => m.art),
    "small": () => import("./companions/unicorn-small").then((m) => m.art),
    "locked": () => import("./companions/unicorn-locked").then((m) => m.art),
    "egg": () => import("./companions/unicorn-egg").then((m) => m.art),
    "egg-small": () => import("./companions/unicorn-egg-small").then((m) => m.art),
  },
  "whale": {
    "large": () => import("./companions/whale-large").then((m) => m.art),
    "small": () => import("./companions/whale-small").then((m) => m.art),
    "locked": () => import("./companions/whale-locked").then((m) => m.art),
    "egg": () => import("./companions/whale-egg").then((m) => m.art),
    "egg-small": () => import("./companions/whale-egg-small").then((m) => m.art),
  },
};

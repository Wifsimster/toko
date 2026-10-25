// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { CompanionId, MoArt, MoSize, MoState, MoTheme, PictoName } from "../types";
import { art as a0 } from "./art/accueil-large";
import { art as a1 } from "./art/accueil-large-dark";
import { art as a2 } from "./art/accueil-small";
import { art as a3 } from "./art/accueil-small-dark";
import { art as a4 } from "./art/bravo-large";
import { art as a5 } from "./art/bravo-large-dark";
import { art as a6 } from "./art/bravo-small";
import { art as a7 } from "./art/bravo-small-dark";
import { art as a8 } from "./art/calme-large";
import { art as a9 } from "./art/calme-large-dark";
import { art as a10 } from "./art/calme-small";
import { art as a11 } from "./art/calme-small-dark";
import { art as a12 } from "./art/guide-large";
import { art as a13 } from "./art/guide-large-dark";
import { art as a14 } from "./art/guide-small";
import { art as a15 } from "./art/guide-small-dark";
import { art as a16 } from "./art/veille-large";
import { art as a17 } from "./art/veille-large-dark";
import { art as a18 } from "./art/veille-small";
import { art as a19 } from "./art/veille-small-dark";
import { art as a20 } from "./companions/bear-large";
import { art as a21 } from "./companions/bear-small";
import { art as a22 } from "./companions/bear-locked";
import { art as a23 } from "./companions/butterfly-large";
import { art as a24 } from "./companions/butterfly-small";
import { art as a25 } from "./companions/butterfly-locked";
import { art as a26 } from "./companions/cat-large";
import { art as a27 } from "./companions/cat-small";
import { art as a28 } from "./companions/cat-locked";
import { art as a29 } from "./companions/chick-large";
import { art as a30 } from "./companions/chick-small";
import { art as a31 } from "./companions/chick-locked";
import { art as a32 } from "./companions/dog-large";
import { art as a33 } from "./companions/dog-small";
import { art as a34 } from "./companions/dog-locked";
import { art as a35 } from "./companions/fox-large";
import { art as a36 } from "./companions/fox-small";
import { art as a37 } from "./companions/fox-locked";
import { art as a38 } from "./companions/frog-large";
import { art as a39 } from "./companions/frog-small";
import { art as a40 } from "./companions/frog-locked";
import { art as a41 } from "./companions/hedgehog-large";
import { art as a42 } from "./companions/hedgehog-small";
import { art as a43 } from "./companions/hedgehog-locked";
import { art as a44 } from "./companions/koala-large";
import { art as a45 } from "./companions/koala-small";
import { art as a46 } from "./companions/koala-locked";
import { art as a47 } from "./companions/ladybug-large";
import { art as a48 } from "./companions/ladybug-small";
import { art as a49 } from "./companions/ladybug-locked";
import { art as a50 } from "./companions/lion-large";
import { art as a51 } from "./companions/lion-small";
import { art as a52 } from "./companions/lion-locked";
import { art as a53 } from "./companions/monkey-large";
import { art as a54 } from "./companions/monkey-small";
import { art as a55 } from "./companions/monkey-locked";
import { art as a56 } from "./companions/owl-large";
import { art as a57 } from "./companions/owl-small";
import { art as a58 } from "./companions/owl-locked";
import { art as a59 } from "./companions/panda-large";
import { art as a60 } from "./companions/panda-small";
import { art as a61 } from "./companions/panda-locked";
import { art as a62 } from "./companions/penguin-large";
import { art as a63 } from "./companions/penguin-small";
import { art as a64 } from "./companions/penguin-locked";
import { art as a65 } from "./companions/pig-large";
import { art as a66 } from "./companions/pig-small";
import { art as a67 } from "./companions/pig-locked";
import { art as a68 } from "./companions/rabbit-large";
import { art as a69 } from "./companions/rabbit-small";
import { art as a70 } from "./companions/rabbit-locked";
import { art as a71 } from "./companions/turtle-large";
import { art as a72 } from "./companions/turtle-small";
import { art as a73 } from "./companions/turtle-locked";
import { art as a74 } from "./companions/unicorn-large";
import { art as a75 } from "./companions/unicorn-small";
import { art as a76 } from "./companions/unicorn-locked";
import { art as a77 } from "./companions/whale-large";
import { art as a78 } from "./companions/whale-small";
import { art as a79 } from "./companions/whale-locked";
import { art as a80 } from "./pictos/cartable-large";
import { art as a81 } from "./pictos/cartable-small";
import { art as a82 } from "./pictos/chaussette-large";
import { art as a83 } from "./pictos/chaussette-small";
import { art as a84 } from "./pictos/dents-large";
import { art as a85 } from "./pictos/dents-small";
import { art as a86 } from "./pictos/douche-large";
import { art as a87 } from "./pictos/douche-small";
import { art as a88 } from "./pictos/habits-large";
import { art as a89 } from "./pictos/habits-small";
import { art as a90 } from "./pictos/livre-large";
import { art as a91 } from "./pictos/livre-small";
import { art as a92 } from "./pictos/oeuf-0-large";
import { art as a93 } from "./pictos/oeuf-0-small";
import { art as a94 } from "./pictos/oeuf-1-large";
import { art as a95 } from "./pictos/oeuf-1-small";
import { art as a96 } from "./pictos/oeuf-2-large";
import { art as a97 } from "./pictos/oeuf-2-small";
import { art as a98 } from "./pictos/oeuf-3-large";
import { art as a99 } from "./pictos/oeuf-3-small";
import { art as a100 } from "./pictos/oeuf-ouvert-large";
import { art as a101 } from "./pictos/oeuf-ouvert-small";
import { art as a102 } from "./pictos/pyjama-large";
import { art as a103 } from "./pictos/pyjama-small";
import { art as a104 } from "./pictos/cadran-fond";

/** Les seuls états de Mō montrés à l'enfant : positifs ou neutres. */
export const CHILD_MO_STATES = [
  "accueil",
  "bravo",
  "calme",
  "guide",
  "veille"
] as const satisfies readonly MoState[];
export type ChildMoState = (typeof CHILD_MO_STATES)[number];

export const CHILD_COMPANION_VARIANTS = [
  "large",
  "small",
  "locked"
] as const;
export type ChildCompanionVariant = (typeof CHILD_COMPANION_VARIANTS)[number];

export const childMoArt: Record<ChildMoState, Record<MoSize, Record<MoTheme, MoArt>>> = {
  "accueil": {
    large: { light: a0, dark: a1 },
    small: { light: a2, dark: a3 },
  },
  "bravo": {
    large: { light: a4, dark: a5 },
    small: { light: a6, dark: a7 },
  },
  "calme": {
    large: { light: a8, dark: a9 },
    small: { light: a10, dark: a11 },
  },
  "guide": {
    large: { light: a12, dark: a13 },
    small: { light: a14, dark: a15 },
  },
  "veille": {
    large: { light: a16, dark: a17 },
    small: { light: a18, dark: a19 },
  },
};

export const companionArt: Record<CompanionId, Record<ChildCompanionVariant, MoArt>> = {
  "bear": { "large": a20, "small": a21, "locked": a22 },
  "butterfly": { "large": a23, "small": a24, "locked": a25 },
  "cat": { "large": a26, "small": a27, "locked": a28 },
  "chick": { "large": a29, "small": a30, "locked": a31 },
  "dog": { "large": a32, "small": a33, "locked": a34 },
  "fox": { "large": a35, "small": a36, "locked": a37 },
  "frog": { "large": a38, "small": a39, "locked": a40 },
  "hedgehog": { "large": a41, "small": a42, "locked": a43 },
  "koala": { "large": a44, "small": a45, "locked": a46 },
  "ladybug": { "large": a47, "small": a48, "locked": a49 },
  "lion": { "large": a50, "small": a51, "locked": a52 },
  "monkey": { "large": a53, "small": a54, "locked": a55 },
  "owl": { "large": a56, "small": a57, "locked": a58 },
  "panda": { "large": a59, "small": a60, "locked": a61 },
  "penguin": { "large": a62, "small": a63, "locked": a64 },
  "pig": { "large": a65, "small": a66, "locked": a67 },
  "rabbit": { "large": a68, "small": a69, "locked": a70 },
  "turtle": { "large": a71, "small": a72, "locked": a73 },
  "unicorn": { "large": a74, "small": a75, "locked": a76 },
  "whale": { "large": a77, "small": a78, "locked": a79 },
};

export const pictoArt: Record<PictoName, Record<MoSize, MoArt>> = {
  "cartable": { large: a80, small: a81 },
  "chaussette": { large: a82, small: a83 },
  "dents": { large: a84, small: a85 },
  "douche": { large: a86, small: a87 },
  "habits": { large: a88, small: a89 },
  "livre": { large: a90, small: a91 },
  "oeuf-0": { large: a92, small: a93 },
  "oeuf-1": { large: a94, small: a95 },
  "oeuf-2": { large: a96, small: a97 },
  "oeuf-3": { large: a98, small: a99 },
  "oeuf-ouvert": { large: a100, small: a101 },
  "pyjama": { large: a102, small: a103 },
};

export const dialBackgroundArt: MoArt = a104;

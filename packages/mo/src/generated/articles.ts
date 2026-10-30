// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoScene } from "../types";

/** Une scène par section H2 d'article, dans l'ordre des H2, chargée à la demande. */
export const articleSceneLoaders: Readonly<Record<string, readonly (() => Promise<MoScene>)[]>> = {
  "alimentation-tdah-enfant": [
    () => import("./articles/alimentation-tdah-enfant/01").then((m) => m.scene),
    () => import("./articles/alimentation-tdah-enfant/02").then((m) => m.scene),
    () => import("./articles/alimentation-tdah-enfant/03").then((m) => m.scene),
    () => import("./articles/alimentation-tdah-enfant/04").then((m) => m.scene),
    () => import("./articles/alimentation-tdah-enfant/05").then((m) => m.scene),
    () => import("./articles/alimentation-tdah-enfant/06").then((m) => m.scene),
    () => import("./articles/alimentation-tdah-enfant/07").then((m) => m.scene),
  ],
  "apres-le-diagnostic-tdah-parcours-de-soins": [
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/01").then((m) => m.scene),
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/02").then((m) => m.scene),
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/03").then((m) => m.scene),
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/04").then((m) => m.scene),
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/05").then((m) => m.scene),
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/06").then((m) => m.scene),
    () => import("./articles/apres-le-diagnostic-tdah-parcours-de-soins/07").then((m) => m.scene),
  ],
  "co-regulation-parent-enfant-tdah": [
    () => import("./articles/co-regulation-parent-enfant-tdah/01").then((m) => m.scene),
    () => import("./articles/co-regulation-parent-enfant-tdah/02").then((m) => m.scene),
    () => import("./articles/co-regulation-parent-enfant-tdah/03").then((m) => m.scene),
    () => import("./articles/co-regulation-parent-enfant-tdah/04").then((m) => m.scene),
  ],
  "dysregulation-emotionnelle-tdah": [
    () => import("./articles/dysregulation-emotionnelle-tdah/01").then((m) => m.scene),
    () => import("./articles/dysregulation-emotionnelle-tdah/02").then((m) => m.scene),
    () => import("./articles/dysregulation-emotionnelle-tdah/03").then((m) => m.scene),
    () => import("./articles/dysregulation-emotionnelle-tdah/04").then((m) => m.scene),
    () => import("./articles/dysregulation-emotionnelle-tdah/05").then((m) => m.scene),
  ],
  "fonctions-executives-tdah-enfant": [
    () => import("./articles/fonctions-executives-tdah-enfant/01").then((m) => m.scene),
    () => import("./articles/fonctions-executives-tdah-enfant/02").then((m) => m.scene),
    () => import("./articles/fonctions-executives-tdah-enfant/03").then((m) => m.scene),
    () => import("./articles/fonctions-executives-tdah-enfant/04").then((m) => m.scene),
  ],
  "mini-guide-grands-parents-tdah": [
    () => import("./articles/mini-guide-grands-parents-tdah/01").then((m) => m.scene),
    () => import("./articles/mini-guide-grands-parents-tdah/02").then((m) => m.scene),
    () => import("./articles/mini-guide-grands-parents-tdah/03").then((m) => m.scene),
    () => import("./articles/mini-guide-grands-parents-tdah/04").then((m) => m.scene),
    () => import("./articles/mini-guide-grands-parents-tdah/05").then((m) => m.scene),
    () => import("./articles/mini-guide-grands-parents-tdah/06").then((m) => m.scene),
  ],
  "mini-guide-parrains-marraines-tdah": [
    () => import("./articles/mini-guide-parrains-marraines-tdah/01").then((m) => m.scene),
    () => import("./articles/mini-guide-parrains-marraines-tdah/02").then((m) => m.scene),
    () => import("./articles/mini-guide-parrains-marraines-tdah/03").then((m) => m.scene),
    () => import("./articles/mini-guide-parrains-marraines-tdah/04").then((m) => m.scene),
    () => import("./articles/mini-guide-parrains-marraines-tdah/05").then((m) => m.scene),
    () => import("./articles/mini-guide-parrains-marraines-tdah/06").then((m) => m.scene),
  ],
  "motivation-delai-tdah-pourquoi-punition-echoue": [
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/01").then((m) => m.scene),
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/02").then((m) => m.scene),
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/03").then((m) => m.scene),
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/04").then((m) => m.scene),
  ],
  "retours-enseignant-tdah-enfant": [
    () => import("./articles/retours-enseignant-tdah-enfant/01").then((m) => m.scene),
    () => import("./articles/retours-enseignant-tdah-enfant/02").then((m) => m.scene),
    () => import("./articles/retours-enseignant-tdah-enfant/03").then((m) => m.scene),
    () => import("./articles/retours-enseignant-tdah-enfant/04").then((m) => m.scene),
    () => import("./articles/retours-enseignant-tdah-enfant/05").then((m) => m.scene),
    () => import("./articles/retours-enseignant-tdah-enfant/06").then((m) => m.scene),
  ],
  "tdah-ecrans-ne-causent-pas": [
    () => import("./articles/tdah-ecrans-ne-causent-pas/01").then((m) => m.scene),
    () => import("./articles/tdah-ecrans-ne-causent-pas/02").then((m) => m.scene),
    () => import("./articles/tdah-ecrans-ne-causent-pas/03").then((m) => m.scene),
    () => import("./articles/tdah-ecrans-ne-causent-pas/04").then((m) => m.scene),
  ],
};

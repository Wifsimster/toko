// Fichier généré par packages/mo/scripts/generate.mjs à partir de packages/mo/svg/.
// Ne pas modifier à la main : relancer `pnpm --filter @focusflow/mo generate`.
import type { MoScene } from "../types";

/** Une scène par section H2 d'article, dans l'ordre des H2, chargée à la demande. */
export const articleSceneLoaders: Readonly<Record<string, readonly (() => Promise<MoScene>)[]>> = {
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
  "motivation-delai-tdah-pourquoi-punition-echoue": [
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/01").then((m) => m.scene),
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/02").then((m) => m.scene),
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/03").then((m) => m.scene),
    () => import("./articles/motivation-delai-tdah-pourquoi-punition-echoue/04").then((m) => m.scene),
  ],
  "tdah-ecrans-ne-causent-pas": [
    () => import("./articles/tdah-ecrans-ne-causent-pas/01").then((m) => m.scene),
    () => import("./articles/tdah-ecrans-ne-causent-pas/02").then((m) => m.scene),
    () => import("./articles/tdah-ecrans-ne-causent-pas/03").then((m) => m.scene),
    () => import("./articles/tdah-ecrans-ne-causent-pas/04").then((m) => m.scene),
  ],
};

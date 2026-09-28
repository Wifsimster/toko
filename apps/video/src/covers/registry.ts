// Couvertures animées des articles : une composition par article, id `cover-<slug>`.
// Chaque fichier de ce dossier exporte par défaut le composant de sa couverture.
import C0 from "./crise-tdah-enfant-guide-complet";
import C1 from "./dysregulation-emotionnelle-tdah";
import C2 from "./co-regulation-parent-enfant-tdah";
import C3 from "./deconnexion-emotionnelle-tdah";
import C4 from "./fonctions-executives-tdah-enfant";
import C5 from "./hypersensibilite-sensorielle-tdah";
import C6 from "./troubles-sommeil-tdah-enfant";
import C7 from "./mini-guide-grands-parents-tdah";
import C8 from "./mini-guide-co-parent-tdah";
import C9 from "./mini-guide-parrains-marraines-tdah";
import C10 from "./apres-le-diagnostic-tdah-parcours-de-soins";
import C11 from "./medication-tdah-mythes-parents";
import C12 from "./tdah-ecrans-ne-causent-pas";
import C13 from "./motivation-delai-tdah-pourquoi-punition-echoue";
import C14 from "./parent-tdah-gerer-mes-propres-crises";
import C15 from "./rentree-scolaire-tdah-enfant";
import C16 from "./mediation-equine-equitation-tdah-enfant";
import C17 from "./alimentation-tdah-enfant";
import C18 from "./horloge-interne-tdah-enfant";

export const COVERS: { slug: string; component: React.FC }[] = [
  { slug: "crise-tdah-enfant-guide-complet", component: C0 },
  { slug: "dysregulation-emotionnelle-tdah", component: C1 },
  { slug: "co-regulation-parent-enfant-tdah", component: C2 },
  { slug: "deconnexion-emotionnelle-tdah", component: C3 },
  { slug: "fonctions-executives-tdah-enfant", component: C4 },
  { slug: "hypersensibilite-sensorielle-tdah", component: C5 },
  { slug: "troubles-sommeil-tdah-enfant", component: C6 },
  { slug: "mini-guide-grands-parents-tdah", component: C7 },
  { slug: "mini-guide-co-parent-tdah", component: C8 },
  { slug: "mini-guide-parrains-marraines-tdah", component: C9 },
  { slug: "apres-le-diagnostic-tdah-parcours-de-soins", component: C10 },
  { slug: "medication-tdah-mythes-parents", component: C11 },
  { slug: "tdah-ecrans-ne-causent-pas", component: C12 },
  { slug: "motivation-delai-tdah-pourquoi-punition-echoue", component: C13 },
  { slug: "parent-tdah-gerer-mes-propres-crises", component: C14 },
  { slug: "rentree-scolaire-tdah-enfant", component: C15 },
  { slug: "mediation-equine-equitation-tdah-enfant", component: C16 },
  { slug: "alimentation-tdah-enfant", component: C17 },
  { slug: "horloge-interne-tdah-enfant", component: C18 },
];

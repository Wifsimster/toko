/**
 * Discreet contextual tips shown across the app to help parents use features.
 * Each tip can be permanently dismissed (persisted in ui-store).
 * Based on Barkley PEHP principles and ADHD research.
 */

export type TipFeature =
  | "dashboard"
  | "symptoms"
  | "journal"
  | "crisis-list"
  | "rewards"
  | "barkley";

export interface Tip {
  id: string;
  feature: TipFeature;
  content: string;
}

export const TIPS: Tip[] = [
  // ─── Dashboard ──────────────────────────────────────
  {
    id: "dashboard-same-time-ritual",
    feature: "dashboard",
    content:
      "Consultez Tokō à heure fixe chaque soir pour ancrer le suivi comme un rituel familial.",
  },
  {
    id: "dashboard-celebrate-streak",
    feature: "dashboard",
    content:
      "Montrez la série à votre enfant : voir ses progrès renforce son estime de soi.",
  },
  {
    id: "dashboard-mood-conversation",
    feature: "dashboard",
    content:
      "Si l'humeur baisse 2 jours de suite, ouvrez une discussion calme sans chercher à résoudre.",
  },

  // ─── Symptoms ───────────────────────────────────────
  {
    id: "symptoms-observe-not-judge",
    feature: "symptoms",
    content:
      "Notez ce que vous observez aujourd'hui, sans comparer à la veille ni culpabiliser.",
  },
  {
    id: "symptoms-context-matters",
    feature: "symptoms",
    content:
      "Précisez toujours le contexte : sommeil, école ou écran changent tout dans l'analyse.",
  },
  {
    id: "symptoms-with-child-from-8",
    feature: "symptoms",
    content:
      "Dès 8 ans, remplissez avec votre enfant pour développer sa conscience de lui-même.",
  },

  // ─── Journal ────────────────────────────────────────
  {
    id: "journal-one-positive-daily",
    feature: "journal",
    content:
      "Notez au moins une chose positive chaque jour, même minuscule, pour rééquilibrer le regard.",
  },
  {
    id: "journal-describe-triggers",
    feature: "journal",
    content:
      "Décrivez ce qui précède une crise : vous identifierez vos déclencheurs en quelques semaines.",
  },
  {
    id: "journal-short-is-enough",
    feature: "journal",
    content:
      "Deux phrases suffisent : la régularité compte plus que la longueur des notes.",
  },

  // ─── Crisis list ────────────────────────────────────
  {
    id: "crisis-build-when-calm",
    feature: "crisis-list",
    content:
      "Construisez la liste avec votre enfant quand il est calme, jamais pendant une crise.",
  },
  {
    id: "crisis-test-before-crisis",
    feature: "crisis-list",
    content:
      "Testez chaque activité hors crise pour vérifier qu'elle l'apaise vraiment.",
  },
  {
    id: "crisis-mix-sensory-types",
    feature: "crisis-list",
    content:
      "Variez les sens : une activité corporelle, une sensorielle, une câline, une créative.",
  },

  {
    id: "crisis-offer-not-impose",
    feature: "crisis-list",
    content:
      "Proposez sans imposer : laissez votre enfant choisir son activité, même s'il refuse d'abord.",
  },
  {
    id: "crisis-stay-close",
    feature: "crisis-list",
    content:
      "Restez à côté en silence : votre présence régule plus que vos mots pendant la tempête.",
  },

  // ─── Rewards / Barkley behaviors ────────────────────
  {
    id: "rewards-immediate-star",
    feature: "rewards",
    content:
      "Donnez l'étoile dans les 30 secondes suivant le geste : l'immédiateté est essentielle au TDAH.",
  },
  {
    id: "rewards-never-remove",
    feature: "rewards",
    content:
      "Ne retirez jamais une étoile déjà gagnée : utilisez les retraits de privilèges à part.",
  },
  {
    id: "rewards-start-small",
    feature: "rewards",
    content:
      "Commencez avec 2 à 3 comportements maximum pour ne pas décourager votre enfant.",
  },

  // ─── Barkley program ────────────────────────────────
  {
    id: "barkley-one-step-per-week",
    feature: "barkley",
    content:
      "Consacrez au moins une semaine à chaque étape avant de passer à la suivante.",
  },
  {
    id: "barkley-special-time-first",
    feature: "barkley",
    content:
      "Installez les moments spéciaux de l'étape 2 avant toute règle : le lien précède la discipline.",
  },
];

export function getTipsByFeature(feature: TipFeature): Tip[] {
  return TIPS.filter((t) => t.feature === feature);
}

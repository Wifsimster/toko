// Conseils que Mō livre côté parent (`MoTip`), rangés par écran. Courts,
// calmes, sans culpabilité (règle B7), au vouvoiement. Repris de l'accueil
// et des conseils du web (apps/web/src/lib/tips-registry.ts, fr.json → tips.*).
// Pas de contexte « liste de crise » : Mō n'apparaît jamais sur le SOS ni la
// liste de crise, même pour un conseil.

export type MoTipContext = "home" | "journal" | "symptoms" | "routines" | "barkley" | "rewards";

export const MO_TIPS: Record<MoTipContext, readonly string[]> = {
  // Rotation quotidienne de l'accueil (« Conseil du jour »).
  home: [
    "Une consigne à la fois, regard dans les yeux. Les longues phrases se perdent dans un cerveau TDAH.",
    "Avant d'exiger, prévenez : « Dans 5 minutes, on range. » La transition est le moment difficile.",
    "Un comportement difficile est souvent une compétence qui manque, pas une provocation.",
    "Votre calme est contagieux. Respirez avant de parler — son système nerveux suit le vôtre.",
    "Nommez la réussite à voix haute : « Tu as rangé tout seul. » Le cerveau TDAH a soif de feedback positif.",
    "Les routines visibles fatiguent moins la mémoire. Une image vaut dix rappels.",
    "Après une crise, réparez à froid le lendemain — pas d'explication à chaud.",
  ],
  // tips.journal-*
  journal: [
    "Notez au moins une chose positive chaque jour, même minuscule, pour rééquilibrer le regard.",
    "Décrivez ce qui précède une crise : vous identifierez vos déclencheurs en quelques semaines.",
    "Deux phrases suffisent : la régularité compte plus que la longueur des notes.",
  ],
  // tips.symptoms-*
  symptoms: [
    "Notez ce que vous observez aujourd'hui, sans comparer à la veille ni culpabiliser.",
    "Précisez toujours le contexte : sommeil, école ou écran changent tout dans l'analyse.",
    "Dès 8 ans, remplissez avec votre enfant pour développer sa conscience de lui-même.",
  ],
  // Pas encore de conseils côté web : à écrire avant d'afficher un MoTip sur les routines.
  routines: [],
  // tips.barkley-*
  barkley: [
    "Consacrez au moins une semaine à chaque étape avant de passer à la suivante.",
    "Installez les moments spéciaux de l'étape 2 avant toute règle : le lien précède la discipline.",
  ],
  // tips.rewards-*
  rewards: [
    "Donnez l'étoile dans les 30 secondes suivant le geste : l'immédiateté est essentielle au TDAH.",
    "Ne retirez jamais une étoile déjà gagnée : utilisez les retraits de privilèges à part.",
    "Commencez avec 2 à 3 comportements maximum pour ne pas décourager votre enfant.",
  ],
};

/** Jour de l'année (1 à 366), heure locale : la rotation change à minuit. */
function dayOfYear(now: Date): number {
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

/**
 * Le conseil du jour pour un contexte : rotation déterministe, le même toute
 * la journée. `undefined` si le contexte n'a pas encore de conseil.
 */
export function moTipOfTheDay(context: MoTipContext, now: Date = new Date()): string | undefined {
  const tips = MO_TIPS[context];
  if (tips.length === 0) return undefined;
  return tips[dayOfYear(now) % tips.length];
}

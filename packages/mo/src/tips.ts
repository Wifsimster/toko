// Conseils que Mō livre côté parent (`MoTip` de l'app Expo), rangés par
// écran. Courts, calmes, sans culpabilité (règle B7), au vouvoiement, sans
// genre pour l'enfant. Repris de l'accueil et des conseils du web
// (apps/web/src/lib/tips-registry.ts, fr.json → tips.*) : même id quand le
// conseil existe sur le web. Pas de contexte « liste de crise » : Mō
// n'apparaît jamais sur le SOS ni la liste de crise, même pour un conseil.
//
// Logique pure (sans React ni stockage) : testée dans packages/mo/test.

export type MoTipContext = "home" | "journal" | "symptoms" | "routines" | "barkley" | "rewards";

export type MoTipEntry = {
  /** Identifiant stable : sert à masquer le conseil pour de bon. */
  readonly id: string;
  readonly text: string;
};

export const MO_TIP_CONTEXTS: readonly MoTipContext[] = [
  "home",
  "journal",
  "symptoms",
  "routines",
  "barkley",
  "rewards",
];

export const MO_TIPS: Record<MoTipContext, readonly MoTipEntry[]> = {
  // Rotation quotidienne de l'accueil (« Conseil du jour »).
  home: [
    {
      id: "home-one-instruction",
      text: "Une consigne à la fois, regard dans les yeux. Les longues phrases se perdent dans un cerveau TDAH.",
    },
    {
      id: "home-announce-transitions",
      text: "Avant d'exiger, prévenez : « Dans 5 minutes, on range. » La transition est le moment difficile.",
    },
    {
      id: "home-missing-skill",
      text: "Un comportement difficile est souvent une compétence qui manque, pas une provocation.",
    },
    {
      id: "home-calm-is-contagious",
      text: "Votre calme est contagieux. Respirez avant de parler — son système nerveux suit le vôtre.",
    },
    {
      id: "home-name-success",
      text: "Nommez la réussite à voix haute : « Tu as rangé sans aide. » Le cerveau TDAH a soif de feedback positif.",
    },
    {
      id: "home-visible-routines",
      text: "Les routines visibles fatiguent moins la mémoire. Une image vaut dix rappels.",
    },
    {
      id: "home-repair-next-day",
      text: "Après une crise, réparez à froid le lendemain — pas d'explication à chaud.",
    },
  ],
  journal: [
    {
      id: "journal-one-positive-daily",
      text: "Notez au moins une chose positive chaque jour, même minuscule, pour rééquilibrer le regard.",
    },
    {
      id: "journal-describe-triggers",
      text: "Décrivez ce qui précède une crise : vous identifierez vos déclencheurs en quelques semaines.",
    },
    {
      id: "journal-short-is-enough",
      text: "Deux phrases suffisent : la régularité compte plus que la longueur des notes.",
    },
  ],
  symptoms: [
    {
      id: "symptoms-observe-not-judge",
      text: "Notez ce que vous observez aujourd'hui, sans comparer à la veille ni culpabiliser.",
    },
    {
      id: "symptoms-context-matters",
      text: "Précisez toujours le contexte : sommeil, école ou écran changent tout dans l'analyse.",
    },
    {
      id: "symptoms-with-child-from-8",
      text: "Dès 8 ans, remplissez avec votre enfant pour développer sa conscience de soi.",
    },
  ],
  // Propres à l'app : le web n'a pas encore de conseils sur les routines.
  routines: [
    {
      id: "routines-same-order",
      text: "Gardez les mêmes étapes, dans le même ordre, chaque jour : la répétition rend la routine automatique.",
    },
    {
      id: "routines-keep-short",
      text: "Trois à cinq étapes suffisent. Une routine courte se termine plus souvent qu'une longue.",
    },
    {
      id: "routines-one-picture-per-step",
      text: "Un emoji par étape aide votre enfant à savoir quoi faire sans vous le demander.",
    },
    {
      id: "routines-praise-each-step",
      text: "Félicitez chaque étape terminée, sans attendre la fin de la routine.",
    },
    {
      id: "routines-timer-for-long-steps",
      text: "Lancez le minuteur pour les étapes longues : le temps devient visible et se discute moins.",
    },
  ],
  barkley: [
    {
      id: "barkley-one-step-per-week",
      text: "Consacrez au moins une semaine à chaque étape avant de passer à la suivante.",
    },
    {
      id: "barkley-special-time-first",
      text: "Installez les moments spéciaux de l'étape 2 avant toute règle : le lien précède la discipline.",
    },
  ],
  rewards: [
    {
      id: "rewards-immediate-star",
      text: "Donnez l'étoile dans les 30 secondes suivant le geste : l'immédiateté est essentielle au TDAH.",
    },
    {
      id: "rewards-never-remove",
      text: "Ne retirez jamais une étoile déjà gagnée : utilisez les retraits de privilèges à part.",
    },
    {
      id: "rewards-start-small",
      text: "Commencez avec 2 à 3 comportements maximum pour ne pas décourager votre enfant.",
    },
  ],
};

/**
 * Conseils masqués par le parent, gardés sur l'appareil. Comme sur le web
 * (`ui-store.dismissedTips`), un conseil masqué ne revient plus (`ids`).
 * En plus, le contexte reste vide jusqu'au lendemain (`hiddenOn`) : sans
 * cela, le conseil suivant prendrait aussitôt la place de celui qu'on vient
 * de masquer, alors que le parent a demandé que l'encadré disparaisse.
 */
export type MoTipDismissals = {
  readonly ids: readonly string[];
  /** Jour local (`AAAA-MM-JJ`) où le parent a masqué un conseil, par contexte. */
  readonly hiddenOn: Partial<Record<MoTipContext, string>>;
};

export const NO_MO_TIP_DISMISSALS: MoTipDismissals = { ids: [], hiddenOn: {} };

/** Jour de l'année (1 à 366), heure locale : la rotation change à minuit. */
function dayOfYear(now: Date): number {
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

/** Le jour local `AAAA-MM-JJ` (pas l'UTC : la journée du parent). */
export function localDayKey(now: Date): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

/**
 * Le conseil du jour pour un contexte : rotation déterministe parmi les
 * conseils non masqués, le même toute la journée. `undefined` si le contexte
 * n'a aucun conseil, si tous ont été masqués, ou si le parent a masqué un
 * conseil de ce contexte aujourd'hui.
 */
export function moTipOfTheDay(
  context: MoTipContext,
  now: Date = new Date(),
  dismissals: MoTipDismissals = NO_MO_TIP_DISMISSALS,
): MoTipEntry | undefined {
  if (dismissals.hiddenOn[context] === localDayKey(now)) return undefined;
  const tips = MO_TIPS[context].filter((t) => !dismissals.ids.includes(t.id));
  if (tips.length === 0) return undefined;
  return tips[dayOfYear(now) % tips.length];
}

/** Masque un conseil : pour de bon, et son contexte jusqu'au lendemain. */
export function dismissMoTip(
  dismissals: MoTipDismissals,
  context: MoTipContext,
  tipId: string,
  now: Date = new Date(),
): MoTipDismissals {
  return {
    ids: dismissals.ids.includes(tipId) ? dismissals.ids : [...dismissals.ids, tipId],
    hiddenOn: { ...dismissals.hiddenOn, [context]: localDayKey(now) },
  };
}

/**
 * Relit des masquages stockés (JSON de l'appareil) : toute valeur inattendue
 * est ignorée plutôt que de casser l'écran.
 */
export function parseMoTipDismissals(raw: string | null | undefined): MoTipDismissals {
  if (!raw) return NO_MO_TIP_DISMISSALS;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return NO_MO_TIP_DISMISSALS;
    const { ids, hiddenOn } = value as { ids?: unknown; hiddenOn?: unknown };
    const cleanIds = Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
    const cleanHidden: Partial<Record<MoTipContext, string>> = {};
    if (hiddenOn && typeof hiddenOn === "object") {
      for (const context of MO_TIP_CONTEXTS) {
        const day = (hiddenOn as Record<string, unknown>)[context];
        if (typeof day === "string") cleanHidden[context] = day;
      }
    }
    return { ids: cleanIds, hiddenOn: cleanHidden };
  } catch {
    return NO_MO_TIP_DISMISSALS;
  }
}

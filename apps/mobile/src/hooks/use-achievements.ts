// Réussites parent — calcul 100 % côté client, miroir de
// apps/web/src/hooks/use-achievements.ts et apps/web/src/lib/achievements-data.ts.
// On agrège les données déjà chargées par les hooks existants et on calcule
// les badges sans aucun appel API supplémentaire.

import { useMemo } from "react";

import { useCrisisItems } from "./use-crisis-list";
import { useInsights } from "./use-insights";
import { useJournal } from "./use-journal";
import { useRoutines } from "./use-routines";
import { useStrengths } from "./use-strengths";

// ── Badge catalogue ─────────────────────────────────────────────────────────

export type AchievementId =
  | "first_child"
  | "first_journal"
  | "first_strength"
  | "five_strengths"
  | "first_crisis_list"
  | "first_routine"
  | "streak_7"
  | "streak_30"
  | "explorer";

export type Achievement = {
  id: AchievementId;
  emoji: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_child",
    emoji: "👶",
    title: "Premier pas",
    description: "Vous avez ajouté votre premier enfant. Le suivi commence ici.",
  },
  {
    id: "first_journal",
    emoji: "📖",
    title: "Première observation",
    description: "Première entrée dans le journal. Vos notes valent de l'or pour le pédopsy.",
  },
  {
    id: "first_strength",
    emoji: "🌟",
    title: "Œil bienveillant",
    description: "Vous avez noté un point fort de votre enfant. Continuez : c'est ce qui rééquilibre tout.",
  },
  {
    id: "five_strengths",
    emoji: "🌳",
    title: "Catalogue de fierté",
    description: "5 points forts enregistrés. Vous voyez votre enfant sous un autre angle.",
  },
  {
    id: "first_crisis_list",
    emoji: "💙",
    title: "Trousse anti-crise",
    description: "Première activité apaisante listée. Vous avez un plan B quand ça monte.",
  },
  {
    id: "first_routine",
    emoji: "📋",
    title: "Cap sur la routine",
    description: "Première routine créée. Le quotidien prend forme.",
  },
  {
    id: "streak_7",
    emoji: "🔥",
    title: "Une semaine pleine",
    description: "7 jours consécutifs de suivi. La régularité paye.",
  },
  {
    id: "streak_30",
    emoji: "🏔️",
    title: "Un mois debout",
    description: "30 jours consécutifs de suivi. Vous avez tenu, c'est rare.",
  },
  {
    id: "explorer",
    emoji: "🧭",
    title: "Exploratrice / Explorateur",
    description: "Vous avez utilisé 5 fonctionnalités différentes. Tokō est devenu votre boîte à outils.",
  },
];

// ── Signals ──────────────────────────────────────────────────────────────────

type Signals = {
  journalCount: number;
  strengthCount: number;
  crisisItemCount: number;
  routineCount: number;
  streakDays: number;
};

function compute(signals: Signals): Set<AchievementId> {
  const unlocked = new Set<AchievementId>();

  // first_child is always unlocked — we're on a child-scoped screen so a
  // child necessarily exists.
  unlocked.add("first_child");

  if (signals.journalCount >= 1) unlocked.add("first_journal");
  if (signals.strengthCount >= 1) unlocked.add("first_strength");
  if (signals.strengthCount >= 5) unlocked.add("five_strengths");
  if (signals.crisisItemCount >= 1) unlocked.add("first_crisis_list");
  if (signals.routineCount >= 1) unlocked.add("first_routine");
  if (signals.streakDays >= 7) unlocked.add("streak_7");
  if (signals.streakDays >= 30) unlocked.add("streak_30");

  // Explorer: 5+ distinct features touched.
  let score = 1; // child already exists
  if (signals.journalCount >= 1) score++;
  if (signals.strengthCount >= 1) score++;
  if (signals.crisisItemCount >= 1) score++;
  if (signals.routineCount >= 1) score++;
  if (score >= 5) unlocked.add("explorer");

  return unlocked;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/** Returns the set of unlocked achievement ids for the given child. */
export function useAchievements(childId: string): {
  unlocked: Set<AchievementId>;
  total: number;
  isLoading: boolean;
} {
  const journal = useJournal(childId);
  const strengths = useStrengths(childId);
  const crisis = useCrisisItems(childId);
  const routines = useRoutines(childId);
  const stats = useInsights(childId, "week");

  const isLoading =
    journal.isLoading ||
    strengths.isLoading ||
    crisis.isLoading ||
    routines.isLoading ||
    stats.isLoading;

  const unlocked = useMemo(() => {
    const signals: Signals = {
      journalCount: journal.data?.length ?? 0,
      strengthCount: strengths.data?.length ?? 0,
      crisisItemCount: crisis.data?.length ?? 0,
      routineCount: routines.data?.length ?? 0,
      streakDays: stats.data?.streak ?? 0,
    };
    return compute(signals);
  }, [
    journal.data,
    strengths.data,
    crisis.data,
    routines.data,
    stats.data,
  ]);

  return { unlocked, total: ACHIEVEMENTS.length, isLoading };
}

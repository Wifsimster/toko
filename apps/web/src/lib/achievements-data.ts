// Parent-side gamification: badges that celebrate the parent's engagement
// with Tokō. Computation is fully client-side and stateless — we look at
// data already cached by React Query and check predicates. No DB writes,
// no unlock dates persisted (the visible "unlocked" state IS the reward).
//
// Order matters: cards render in this order. Group early/easy wins first
// so the empty grid feels achievable, then ramp up.

export type AchievementId =
  | "first_child"
  | "first_journal"
  | "first_strength"
  | "five_strengths"
  | "first_crisis_list"
  | "first_routine"
  | "streak_7"
  | "streak_30"
  | "first_care_step_done"
  | "screening_phase_done"
  | "first_doc_vault"
  | "explorer";

export interface AchievementSignals {
  childCount: number;
  journalCount: number;
  strengthCount: number;
  crisisItemCount: number;
  routineCount: number;
  docCount: number;
  streakDays: number;
  carePathwayDoneCount: number;
  carePathwayScreeningDoneCount: number;
  carePathwayScreeningTotal: number;
}

export interface Achievement {
  id: AchievementId;
  emoji: string;
  /** Subtle dimming of the unlocked card vs prominent ones. */
  tone: "warmth" | "growth" | "trust";
  isUnlocked: (s: AchievementSignals) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_child",
    emoji: "👶",
    tone: "warmth",
    isUnlocked: (s) => s.childCount >= 1,
  },
  {
    id: "first_journal",
    emoji: "📖",
    tone: "warmth",
    isUnlocked: (s) => s.journalCount >= 1,
  },
  {
    id: "first_strength",
    emoji: "🌟",
    tone: "warmth",
    isUnlocked: (s) => s.strengthCount >= 1,
  },
  {
    id: "first_crisis_list",
    emoji: "💙",
    tone: "warmth",
    isUnlocked: (s) => s.crisisItemCount >= 1,
  },
  {
    id: "first_routine",
    emoji: "📋",
    tone: "warmth",
    isUnlocked: (s) => s.routineCount >= 1,
  },
  {
    id: "streak_7",
    emoji: "🔥",
    tone: "growth",
    isUnlocked: (s) => s.streakDays >= 7,
  },
  {
    id: "five_strengths",
    emoji: "🌳",
    tone: "growth",
    isUnlocked: (s) => s.strengthCount >= 5,
  },
  {
    id: "first_care_step_done",
    emoji: "🩺",
    tone: "growth",
    isUnlocked: (s) => s.carePathwayDoneCount >= 1,
  },
  {
    id: "first_doc_vault",
    emoji: "🗃️",
    tone: "growth",
    isUnlocked: (s) => s.docCount >= 1,
  },
  {
    id: "streak_30",
    emoji: "🏔️",
    tone: "trust",
    isUnlocked: (s) => s.streakDays >= 30,
  },
  {
    id: "screening_phase_done",
    emoji: "🔎",
    tone: "trust",
    isUnlocked: (s) =>
      s.carePathwayScreeningTotal > 0 &&
      s.carePathwayScreeningDoneCount >= s.carePathwayScreeningTotal,
  },
  {
    id: "explorer",
    emoji: "🧭",
    tone: "trust",
    isUnlocked: (s) => {
      // 5+ distinct features touched: child, journal, strength, crisis,
      // routine, doc-vault, care-pathway. Each contributes 1 point.
      let score = 0;
      if (s.childCount >= 1) score++;
      if (s.journalCount >= 1) score++;
      if (s.strengthCount >= 1) score++;
      if (s.crisisItemCount >= 1) score++;
      if (s.routineCount >= 1) score++;
      if (s.docCount >= 1) score++;
      if (s.carePathwayDoneCount >= 1) score++;
      return score >= 5;
    },
  },
];

export function computeAchievements(
  signals: AchievementSignals,
): { unlocked: Set<AchievementId>; total: number } {
  const unlocked = new Set<AchievementId>();
  for (const a of ACHIEVEMENTS) {
    if (a.isUnlocked(signals)) unlocked.add(a.id);
  }
  return { unlocked, total: ACHIEVEMENTS.length };
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Per-child set of timer-companion critters a child has met at least once.
// Keyed by childId so siblings sharing a device keep their own discoveries.
// We deliberately store only the bare set (emoji + first-met date) — no
// counts, no streaks, no rarity, to keep the feature a quiet album rather
// than a goal to complete.
interface CritterCollectionState {
  byChild: Record<string, string[]>;
  hasSeen: (childId: string, emoji: string) => boolean;
  record: (childId: string, emoji: string) => void;
}

export const useCritterCollectionStore = create<CritterCollectionState>()(
  persist(
    (set, get) => ({
      byChild: {},
      hasSeen: (childId, emoji) =>
        get().byChild[childId]?.includes(emoji) ?? false,
      record: (childId, emoji) => {
        set((s) => {
          const seen = s.byChild[childId] ?? [];
          if (seen.includes(emoji)) return s;
          return { byChild: { ...s.byChild, [childId]: [...seen, emoji] } };
        });
      },
    }),
    { name: "toko-critter-collection" }
  )
);

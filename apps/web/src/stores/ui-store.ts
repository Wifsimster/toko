import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  activeChildId: string | null;
  dismissedTips: string[];
  rewardsKidView: boolean;
  isLocked: boolean;
  onboardingCompleted: boolean;
  setActiveChild: (id: string | null) => void;
  dismissTip: (id: string) => void;
  toggleRewardsKidView: () => void;
  lock: () => void;
  unlock: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeChildId: null,
      dismissedTips: [],
      rewardsKidView: false,
      isLocked: false,
      onboardingCompleted: false,
      setActiveChild: (id) => set({ activeChildId: id }),
      dismissTip: (id) =>
        set((s) =>
          s.dismissedTips.includes(id)
            ? s
            : { dismissedTips: [...s.dismissedTips, id] }
        ),
      toggleRewardsKidView: () =>
        set((s) => ({ rewardsKidView: !s.rewardsKidView })),
      lock: () => set({ isLocked: true }),
      unlock: () => set({ isLocked: false }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
    }),
    {
      name: "toko-ui",
      partialize: (state) => ({
        activeChildId: state.activeChildId,
        dismissedTips: state.dismissedTips,
        rewardsKidView: state.rewardsKidView,
        onboardingCompleted: state.onboardingCompleted,
        // isLocked intentionally NOT persisted — a fresh tab should open unlocked
      }),
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  activeChildId: string | null;
  dismissedTips: string[];
  rewardsKidView: boolean;
  onboardingCompleted: boolean;
  androidPromoDismissed: boolean;
  setActiveChild: (id: string | null) => void;
  dismissTip: (id: string) => void;
  toggleRewardsKidView: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  dismissAndroidPromo: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeChildId: null,
      dismissedTips: [],
      rewardsKidView: false,
      onboardingCompleted: false,
      androidPromoDismissed: false,
      setActiveChild: (id) => set({ activeChildId: id }),
      dismissTip: (id) =>
        set((s) =>
          s.dismissedTips.includes(id)
            ? s
            : { dismissedTips: [...s.dismissedTips, id] }
        ),
      toggleRewardsKidView: () =>
        set((s) => ({ rewardsKidView: !s.rewardsKidView })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),
      dismissAndroidPromo: () => set({ androidPromoDismissed: true }),
    }),
    {
      name: "toko-ui",
      partialize: (state) => ({
        activeChildId: state.activeChildId,
        dismissedTips: state.dismissedTips,
        rewardsKidView: state.rewardsKidView,
        onboardingCompleted: state.onboardingCompleted,
        androidPromoDismissed: state.androidPromoDismissed,
      }),
    }
  )
);

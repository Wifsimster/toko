import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  activeChildId: string | null;
  dismissedTips: string[];
  rewardsKidView: boolean;
  setActiveChild: (id: string | null) => void;
  dismissTip: (id: string) => void;
  toggleRewardsKidView: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeChildId: null,
      dismissedTips: [],
      rewardsKidView: false,
      setActiveChild: (id) => set({ activeChildId: id }),
      dismissTip: (id) =>
        set((s) =>
          s.dismissedTips.includes(id)
            ? s
            : { dismissedTips: [...s.dismissedTips, id] }
        ),
      toggleRewardsKidView: () =>
        set((s) => ({ rewardsKidView: !s.rewardsKidView })),
    }),
    {
      name: "toko-ui",
      partialize: (state) => ({
        activeChildId: state.activeChildId,
        dismissedTips: state.dismissedTips,
        rewardsKidView: state.rewardsKidView,
      }),
    }
  )
);

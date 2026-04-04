import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  activeChildId: string | null;
  dismissedTips: string[];
  toggleSidebar: () => void;
  setActiveChild: (id: string) => void;
  dismissTip: (id: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeChildId: null,
      dismissedTips: [],
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setActiveChild: (id) => set({ activeChildId: id }),
      dismissTip: (id) =>
        set((s) =>
          s.dismissedTips.includes(id)
            ? s
            : { dismissedTips: [...s.dismissedTips, id] }
        ),
    }),
    {
      name: "toko-ui",
      partialize: (state) => ({
        activeChildId: state.activeChildId,
        dismissedTips: state.dismissedTips,
      }),
    }
  )
);

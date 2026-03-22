import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  activeChildId: string | null;
  toggleSidebar: () => void;
  setActiveChild: (id: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeChildId: null,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setActiveChild: (id) => set({ activeChildId: id }),
    }),
    {
      name: "toko-ui",
      partialize: (state) => ({ activeChildId: state.activeChildId }),
    }
  )
);

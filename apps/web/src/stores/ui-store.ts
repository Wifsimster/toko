import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  activeChildId: string | null;
  toggleSidebar: () => void;
  setActiveChild: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  activeChildId: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveChild: (id) => set({ activeChildId: id }),
}));

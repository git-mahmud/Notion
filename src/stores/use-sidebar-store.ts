import { create } from "zustand";

interface SidebarStore {
  isCollapsed: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isCollapsed: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  open: () => set({ isCollapsed: false }),
  close: () => set({ isCollapsed: true }),
}));

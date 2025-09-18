'use client';

import { create } from "zustand";

export type UIState = {
  selectedJobId?: string;
  setSelectedJob: (id?: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  selectedJobId: undefined,
  isSidebarOpen: false,
  setSelectedJob: (id) => set({ selectedJobId: id }),
  toggleSidebar: () =>
    set((state: UIState) => ({
      ...state,
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));

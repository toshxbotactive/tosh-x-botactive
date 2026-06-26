import { create } from 'zustand';
import type { NavigationTab } from '../types';

interface AppState {
  activeTab: NavigationTab;
  showProtocolModal: boolean;
  showAdminPanel: boolean;
  isMobile: boolean;
  theme: 'dark' | 'light';

  setActiveTab: (tab: NavigationTab) => void;
  toggleProtocolModal: () => void;
  toggleAdminPanel: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  showProtocolModal: false,
  showAdminPanel: false,
  isMobile: false,
  theme: 'dark',

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleProtocolModal: () => set((state) => ({ showProtocolModal: !state.showProtocolModal })),
  toggleAdminPanel: () => set((state) => ({ showAdminPanel: !state.showAdminPanel })),
  setIsMobile: (isMobile) => set({ isMobile }),
  setTheme: (theme) => set({ theme }),
}));

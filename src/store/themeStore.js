import { create } from 'zustand';
import { saveItem, loadItem, KEYS } from '../utils/storage';

export const useThemeStore = create((set) => ({
  mode: 'dark',

  init: async () => {
    const mode = await loadItem(KEYS.THEME, 'dark');
    set({ mode });
  },

  toggle: () => set((state) => {
    const mode = state.mode === 'dark' ? 'light' : 'dark';
    saveItem(KEYS.THEME, mode);
    return { mode };
  }),
}));

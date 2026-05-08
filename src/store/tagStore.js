import { create } from 'zustand';
import { saveItem, loadItem, KEYS, generateId } from '../utils/storage';

const DEFAULT_TAGS = ['Fitness', 'Mental', 'Productivity', 'Social', 'Health'];

export const useTagStore = create((set, get) => ({
  tags: [],

  init: async () => {
    const tags = await loadItem(KEYS.TAGS, DEFAULT_TAGS);
    set({ tags });
  },

  addTag: (label) => {
    const { tags } = get();
    const trimmed = label.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const next = [...tags, trimmed];
    set({ tags: next });
    saveItem(KEYS.TAGS, next);
  },

  renameTag: (oldLabel, newLabel) => {
    const { tags } = get();
    const trimmed = newLabel.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const next = tags.map((t) => (t === oldLabel ? trimmed : t));
    set({ tags: next });
    saveItem(KEYS.TAGS, next);
  },

  deleteTag: (label) => {
    const { tags } = get();
    const next = tags.filter((t) => t !== label);
    set({ tags: next });
    saveItem(KEYS.TAGS, next);
  },
}));

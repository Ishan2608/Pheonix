import { create } from 'zustand';
import { saveItem, loadItem, KEYS, generateId } from '../utils/storage';
import { useHabitStore } from './habitStore';

const DEFAULT_TAGS = ['Default'];

export const useTagStore = create((set, get) => ({
  tags: [],

  init: async () => {
    const tags = await loadItem(KEYS.TAGS, DEFAULT_TAGS);
    set({ tags: tags || DEFAULT_TAGS });
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
    const nextTags = tags.filter((t) => t !== label);
    set({ tags: nextTags });
    saveItem(KEYS.TAGS, nextTags);

    // Remove this tag from all habits that reference it
    const { habits } = useHabitStore.getState();
    const nextHabits = habits.map((h) =>
      h.tags?.includes(label)
        ? { ...h, tags: h.tags.filter((t) => t !== label) }
        : h
    );
    useHabitStore.getState().setHabits(nextHabits);
  },
}));

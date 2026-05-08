import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  HABITS:      '@phoenix/habits',
  LOGS:        '@phoenix/logs',
  GOALS:       '@phoenix/goals',
  TASKS:       '@phoenix/tasks',
  TAGS:        '@phoenix/tags',
  HABIT_ORDER: '@phoenix/habit_order',
  TASK_GROUPS: '@phoenix/task_groups',
  THEME:       '@phoenix/theme',
};

export async function loadItem(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save failed:', key, e);
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

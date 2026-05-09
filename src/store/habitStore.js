import { create } from 'zustand';
import { saveItem, loadItem, KEYS, generateId } from '../utils/storage';
import { formatDate } from '../utils/dateUtils';

export const useHabitStore = create((set, get) => ({
  habits: [],
  logs: {},         // { [habitId]: { [YYYY-MM-DD]: number } }
  habitOrder: [],   // ordered list of habit IDs

  init: async () => {
    const [habits, logs, habitOrder] = await Promise.all([
      loadItem(KEYS.HABITS, []),
      loadItem(KEYS.LOGS, {}),
      loadItem(KEYS.HABIT_ORDER, []),
    ]);
    set({ habits: habits || [], logs: logs || {}, habitOrder: habitOrder || [] });
  },

  // ─── Habits ───────────────────────────────────────────────────────────────

  addHabit: (data) => {
    const { habits, habitOrder } = get();
    const newHabit = { ...data, id: generateId(), createdAt: Date.now() };
    const nextHabits = [...habits, newHabit];
    const nextOrder = [newHabit.id, ...habitOrder];
    set({ habits: nextHabits, habitOrder: nextOrder });
    saveItem(KEYS.HABITS, nextHabits);
    saveItem(KEYS.HABIT_ORDER, nextOrder);
  },

  updateHabit: (id, data) => {
    const { habits } = get();
    const next = habits.map((h) => (h.id === id ? { ...h, ...data } : h));
    set({ habits: next });
    saveItem(KEYS.HABITS, next);
  },

  deleteHabit: (id) => {
    const { habits, habitOrder, logs } = get();
    const nextHabits = habits.filter((h) => h.id !== id);
    const nextOrder = habitOrder.filter((hId) => hId !== id);
    const nextLogs = { ...logs };
    delete nextLogs[id];
    set({ habits: nextHabits, habitOrder: nextOrder, logs: nextLogs });
    saveItem(KEYS.HABITS, nextHabits);
    saveItem(KEYS.HABIT_ORDER, nextOrder);
    saveItem(KEYS.LOGS, nextLogs);
  },

  reorderHabits: (newOrder) => {
    set({ habitOrder: newOrder });
    saveItem(KEYS.HABIT_ORDER, newOrder);
  },

  // ─── Logging ──────────────────────────────────────────────────────────────

  logHabit: (habitId, value) => {
    const { logs } = get();
    const date = formatDate(new Date());
    const next = {
      ...logs,
      [habitId]: { ...(logs[habitId] || {}), [date]: value },
    };
    set({ logs: next });
    saveItem(KEYS.LOGS, next);
  },

  logHabitDate: (habitId, date, value) => {
    const { logs } = get();
    const next = {
      ...logs,
      [habitId]: { ...(logs[habitId] || {}), [date]: value },
    };
    set({ logs: next });
    saveItem(KEYS.LOGS, next);
  },

  // ─── Selectors ────────────────────────────────────────────────────────────

  getOrderedHabits: () => {
    const { habits, habitOrder } = get();
    const map = new Map(habits.map((h) => [h.id, h]));
    const ordered = [];
    habitOrder.forEach((id) => {
      if (map.has(id)) {
        ordered.push(map.get(id));
        map.delete(id);
      }
    });
    // Append any habits not yet in order list
    map.forEach((h) => ordered.push(h));
    return ordered;
  },

  getLogsForHabit: (habitId) => {
    return get().logs[habitId] || {};
  },
}));

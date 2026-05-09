import { create } from 'zustand';
import { saveItem, loadItem, KEYS, generateId } from '../utils/storage';

export const useGoalStore = create((set, get) => ({
  goals: [],

  init: async () => {
    const goals = await loadItem(KEYS.GOALS, []);
    set({ goals: goals || [] });
  },

  addGoal: (data) => {
    const { goals } = get();
    const newGoal = {
      ...data,
      id: generateId(),
      habitIds: data.habitIds || [],
      taskIds: data.taskIds || [],
      createdAt: Date.now(),
    };
    const next = [...goals, newGoal];
    set({ goals: next });
    saveItem(KEYS.GOALS, next);
  },

  updateGoal: (id, data) => {
    const { goals } = get();
    const next = goals.map((g) => (g.id === id ? { ...g, ...data } : g));
    set({ goals: next });
    saveItem(KEYS.GOALS, next);
  },

  deleteGoal: (id) => {
    const { goals } = get();
    const next = goals.filter((g) => g.id !== id);
    set({ goals: next });
    saveItem(KEYS.GOALS, next);
  },

  toggleHabitInGoal: (goalId, habitId) => {
    const { goals } = get();
    const next = goals.map((g) => {
      if (g.id !== goalId) return g;
      const linked = g.habitIds.includes(habitId);
      return {
        ...g,
        habitIds: linked
          ? g.habitIds.filter((id) => id !== habitId)
          : [...g.habitIds, habitId],
      };
    });
    set({ goals: next });
    saveItem(KEYS.GOALS, next);
  },

  toggleTaskInGoal: (goalId, taskId) => {
    const { goals } = get();
    const next = goals.map((g) => {
      if (g.id !== goalId) return g;
      const linked = g.taskIds.includes(taskId);
      return {
        ...g,
        taskIds: linked
          ? g.taskIds.filter((id) => id !== taskId)
          : [...g.taskIds, taskId],
      };
    });
    set({ goals: next });
    saveItem(KEYS.GOALS, next);
  },
}));

import { create } from 'zustand';
import { saveItem, loadItem, KEYS, generateId } from '../utils/storage';

const DEFAULT_GOAL_CATEGORIES = ['Fitness', 'Career'];

export const useGoalStore = create((set, get) => ({
  goals: [],
  goalCategories: [],

  init: async () => {
    const [goals, goalCategories] = await Promise.all([
      loadItem(KEYS.GOALS, []),
      loadItem(KEYS.GOAL_CATEGORIES, DEFAULT_GOAL_CATEGORIES),
    ]);
    set({ goals: goals || [], goalCategories: goalCategories || DEFAULT_GOAL_CATEGORIES });
  },

  // ─── Categories ───────────────────────────────────────────────────────────

  addGoalCategory: (name) => {
    const { goalCategories } = get();
    const trimmed = name.trim();
    if (!trimmed || goalCategories.includes(trimmed)) return;
    const next = [...goalCategories, trimmed];
    set({ goalCategories: next });
    saveItem(KEYS.GOAL_CATEGORIES, next);
  },

  deleteGoalCategory: (name) => {
    const { goalCategories, goals } = get();
    const nextCategories = goalCategories.filter((c) => c !== name);
    const nextGoals = goals.map((g) =>
      g.category === name ? { ...g, category: undefined } : g
    );
    set({ goalCategories: nextCategories, goals: nextGoals });
    saveItem(KEYS.GOAL_CATEGORIES, nextCategories);
    saveItem(KEYS.GOALS, nextGoals);
  },

  renameGoalCategory: (oldName, newName) => {
    const { goalCategories, goals } = get();
    const trimmed = newName.trim();
    if (!trimmed || goalCategories.includes(trimmed)) return;
    const nextCategories = goalCategories.map((c) => (c === oldName ? trimmed : c));
    const nextGoals = goals.map((g) =>
      g.category === oldName ? { ...g, category: trimmed } : g
    );
    set({ goalCategories: nextCategories, goals: nextGoals });
    saveItem(KEYS.GOAL_CATEGORIES, nextCategories);
    saveItem(KEYS.GOALS, nextGoals);
  },

  // ─── Goals ────────────────────────────────────────────────────────────────

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

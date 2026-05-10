import { create } from 'zustand';
import { saveItem, loadItem, KEYS, generateId } from '../utils/storage';

const DEFAULT_GROUPS = ['Personal'];

export const useTaskStore = create((set, get) => ({
  tasks: [],
  taskGroups: [],

  init: async () => {
    const [tasks, taskGroups] = await Promise.all([
      loadItem(KEYS.TASKS, []),
      loadItem(KEYS.TASK_GROUPS, DEFAULT_GROUPS),
    ]);
    set({ tasks: tasks || [], taskGroups: taskGroups || DEFAULT_GROUPS });
  },

  // ─── Tasks ────────────────────────────────────────────────────────────────

  addTask: (data) => {
    const { tasks } = get();
    const newTask = {
      ...data,
      id: data.id || generateId(),
      completed: false,
      createdAt: Date.now(),
    };
    const next = [...tasks, newTask];
    set({ tasks: next });
    saveItem(KEYS.TASKS, next);
  },

  updateTask: (id, data) => {
    const { tasks } = get();
    const next = tasks.map((t) => (t.id === id ? { ...t, ...data } : t));
    set({ tasks: next });
    saveItem(KEYS.TASKS, next);
  },

  toggleTask: (id) => {
    const { tasks } = get();
    const next = tasks.map((t) => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      return { ...t, completed, completedAt: completed ? Date.now() : undefined };
    });
    set({ tasks: next });
    saveItem(KEYS.TASKS, next);
  },

  deleteTask: (id) => {
    const { tasks } = get();
    const next = tasks.filter((t) => t.id !== id);
    set({ tasks: next });
    saveItem(KEYS.TASKS, next);
  },

  // ─── Groups ───────────────────────────────────────────────────────────────

  addGroup: (name) => {
    const { taskGroups } = get();
    const trimmed = name.trim();
    if (!trimmed || taskGroups.includes(trimmed)) return;
    const next = [...taskGroups, trimmed];
    set({ taskGroups: next });
    saveItem(KEYS.TASK_GROUPS, next);
  },

  renameGroup: (oldName, newName) => {
    const { taskGroups, tasks } = get();
    const trimmed = newName.trim();
    if (!trimmed || taskGroups.includes(trimmed)) return;
    const nextGroups = taskGroups.map((g) => (g === oldName ? trimmed : g));
    const nextTasks = tasks.map((t) =>
      t.groupId === oldName ? { ...t, groupId: trimmed } : t
    );
    set({ taskGroups: nextGroups, tasks: nextTasks });
    saveItem(KEYS.TASK_GROUPS, nextGroups);
    saveItem(KEYS.TASKS, nextTasks);
  },

  deleteGroup: (name) => {
    const { taskGroups, tasks } = get();
    const nextGroups = taskGroups.filter((g) => g !== name);
    const nextTasks = tasks.filter((t) => t.groupId !== name);
    set({ taskGroups: nextGroups, tasks: nextTasks });
    saveItem(KEYS.TASK_GROUPS, nextGroups);
    saveItem(KEYS.TASKS, nextTasks);
  },
}));

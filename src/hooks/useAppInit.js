import { useEffect, useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useTagStore } from '../store/tagStore';
import { useHabitStore } from '../store/habitStore';
import { useGoalStore } from '../store/goalStore';
import { useTaskStore } from '../store/taskStore';

export function useAppInit() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      useThemeStore.getState().init(),
      useTagStore.getState().init(),
      useHabitStore.getState().init(),
      useGoalStore.getState().init(),
      useTaskStore.getState().init(),
    ]).then(() => setReady(true));
  }, []);

  return ready;
}

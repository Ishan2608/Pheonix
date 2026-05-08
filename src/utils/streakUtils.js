import { formatDate } from './dateUtils';

/**
 * Calculate current streak for a habit.
 * Checks backwards from today; skips today if not yet logged.
 */
export function calculateStreak(habit, logs) {
  let streak = 0;
  const todayStr = formatDate(new Date());
  const checkDate = new Date();

  while (true) {
    const dateStr = formatDate(checkDate);
    const value = logs[dateStr] || 0;
    const isGoalMet = habit.type === 'action'
      ? value >= 1
      : value >= (habit.goal || 1);

    if (isGoalMet) {
      streak++;
    } else {
      // Allow today to be incomplete without breaking streak
      if (dateStr === todayStr) {
        // continue to yesterday
      } else {
        break;
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);

    // Stop before habit start date
    if (checkDate < new Date(habit.startDate)) break;
  }

  return streak;
}

/**
 * Calculate best (longest ever) streak for a habit.
 */
export function calculateBestStreak(habit, logs) {
  const start = new Date(habit.startDate);
  const today = new Date();
  let best = 0;
  let current = 0;

  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = formatDate(cursor);
    const value = logs[dateStr] || 0;
    const isGoalMet = habit.type === 'action'
      ? value >= 1
      : value >= (habit.goal || 1);

    if (isGoalMet) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return best;
}

/**
 * Completion rate over last 30 days (0–100).
 */
export function getCompletionRate(habit, logs) {
  const today = new Date();
  let completed = 0;
  let scheduled = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    if (d < new Date(habit.startDate)) continue;
    scheduled++;
    const dateStr = formatDate(d);
    const value = logs[dateStr] || 0;
    const isGoalMet = habit.type === 'action'
      ? value >= 1
      : value >= (habit.goal || 1);
    if (isGoalMet) completed++;
  }

  return scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
}

/**
 * Heatmap intensity 0–4 for a given log value.
 */
export function getHeatmapIntensity(value, habit) {
  if (!value || value === 0) return 0;
  if (habit.type === 'action') return value >= 1 ? 4 : 0;
  const ratio = value / (habit.goal || 1);
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 1) return 3;
  return 4;
}

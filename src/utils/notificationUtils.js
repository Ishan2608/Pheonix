import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions. Call once on app startup.
 * Returns true if granted.
 */
export async function requestNotificationPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule daily repeating notifications for a habit's reminders.
 * Returns array of notification IDs (one per reminder time).
 */
export async function scheduleHabitReminders(habit) {
  if (!habit.reminders || habit.reminders.length === 0) return [];

  const ids = [];
  for (const timeStr of habit.reminders) {
    // timeStr format: "HH:MM"
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);
    if (isNaN(hour) || isNaN(minute)) continue;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔥 ${habit.title}`,
          body: habit.description || 'Time to work on your habit.',
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      ids.push(id);
    } catch (e) {
      console.warn('Failed to schedule notification:', e);
    }
  }
  return ids;
}

/**
 * Cancel all scheduled notifications for a habit by their stored IDs.
 */
export async function cancelHabitReminders(notificationIds = []) {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      console.warn('Failed to cancel notification:', e);
    }
  }
}

/**
 * Cancel old reminders and schedule new ones.
 * Returns new notification IDs to store on the habit.
 */
export async function rescheduleHabitReminders(habit) {
  await cancelHabitReminders(habit.notificationIds || []);
  return scheduleHabitReminders(habit);
}

/**
 * Format a Date to YYYY-MM-DD in local time
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today() {
  return formatDate(new Date());
}

/**
 * Returns array of YYYY-MM-DD strings for last N days (oldest first)
 */
export function getLastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

/**
 * Returns YYYY-MM-DD strings for every day in the current month
 */
export function getCurrentMonthDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    dates.push(formatDate(date));
  }
  return dates;
}

/**
 * e.g. "Monday, May 8"
 */
export function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Returns DAY_KEY string ('mon','tue',...) for a given Date object
 */
export function getDayKey(date) {
  return DAY_KEYS[date.getDay()];
}

/**
 * Returns array of Date objects for N days starting from offset days ago
 */
export function getDateRange(daysBefore = 3, daysAfter = 10) {
  const dates = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(new Date(d.setHours(0, 0, 0, 0)));
  }
  return dates;
}

/**
 * Short weekday label e.g. "Mon"
 */
export function shortDayLabel(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

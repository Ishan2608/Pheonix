export function formatDate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today() {
  return formatDate(new Date());
}

export function getLastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

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

export function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function getDayKey(date) {
  if (!date) return '';
  return DAY_KEYS[date.getDay()];
}

export function getDateRange(daysBefore = 7, daysAfter = 14) {
  const dates = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(new Date(d.setHours(0, 0, 0, 0)));
  }
  return dates;
}

export function shortDayLabel(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

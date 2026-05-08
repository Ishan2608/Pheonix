import { darkColors, lightColors } from './colors';
import { typography, spacing, radius } from './typography';

export const getTheme = (mode) => ({
  colors: mode === 'dark' ? darkColors : lightColors,
  typography,
  spacing,
  radius,
  isDark: mode === 'dark',
});

export { darkColors, lightColors, typography, spacing, radius };

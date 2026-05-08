import { useThemeStore } from '../store/themeStore';
import { getTheme } from '../theme';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  return getTheme(mode);
}

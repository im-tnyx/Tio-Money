import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { palettes, radius, space, typeScale, type ColorScheme, type ThemeColors } from './tokens';

export interface AppTheme {
  scheme: ColorScheme;
  colors: ThemeColors;
  space: typeof space;
  radius: typeof radius;
  typeScale: typeof typeScale;
}

const ThemeContext = createContext<AppTheme | null>(null);

/** Phase 0 follows device appearance. An explicit setting is a Phase 1 decision. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo(
    () => ({ scheme, colors: palettes[scheme], space, radius, typeScale }),
    [scheme],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within AppThemeProvider');
  return theme;
}

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  buttonTokens,
  iconRoleSizes,
  iconTokens,
  navigationTokens,
  recoveryTokens,
  shadowTokens,
} from './component-tokens';
import {
  palettes,
  radius,
  space,
  typographyTokens,
  typeScale,
  type ColorScheme,
  type ThemeColors,
} from './tokens';

export interface AppTheme {
  scheme: ColorScheme;
  colors: ThemeColors;
  space: typeof space;
  radius: typeof radius;
  typeScale: typeof typeScale;
  typography: typeof typographyTokens;
  icons: typeof iconTokens;
  iconRoles: typeof iconRoleSizes;
  navigation: typeof navigationTokens;
  buttons: typeof buttonTokens;
  shadows: typeof shadowTokens;
  recovery: typeof recoveryTokens;
}

const ThemeContext = createContext<AppTheme | null>(null);

/** System-driven light/dark only. No per-screen or manual theme selector. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo(
    () => ({
      scheme,
      colors: palettes[scheme],
      space,
      radius,
      typeScale,
      typography: typographyTokens,
      icons: iconTokens,
      iconRoles: iconRoleSizes,
      navigation: navigationTokens,
      buttons: buttonTokens,
      shadows: shadowTokens,
      recovery: recoveryTokens,
    }),
    [scheme],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within AppThemeProvider');
  return theme;
}

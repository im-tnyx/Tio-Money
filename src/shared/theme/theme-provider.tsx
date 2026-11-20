import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { t } from '@/shared/i18n/strings';

import {
  resolveAppearanceScheme,
  type AppearancePreference,
  type AppearancePreferenceStore,
} from './appearance-preference';
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

export interface AppearanceSettings {
  preference: AppearancePreference;
  error: string | null;
  selectPreference(value: AppearancePreference): void;
}

interface AppearanceState {
  preference: AppearancePreference;
  error: string | null;
}

const ThemeContext = createContext<AppTheme | null>(null);
const AppearanceContext = createContext<AppearanceSettings | null>(null);

function readInitialPreference(store: AppearancePreferenceStore): AppearanceState {
  try {
    return { preference: store.read(), error: null };
  } catch {
    return { preference: 'system', error: t('appearanceLoadError') };
  }
}

/** One global, locally persisted appearance choice; no per-screen theme state. */
export function AppThemeProvider({
  children,
  appearanceStore,
}: {
  children: ReactNode;
  appearanceStore: AppearancePreferenceStore;
}) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<AppearanceState>(() =>
    readInitialPreference(appearanceStore),
  );
  const selectPreference = useCallback(
    (value: AppearancePreference) => {
      try {
        appearanceStore.write(value);
        setSettings({ preference: value, error: null });
      } catch {
        setSettings((current) => ({ ...current, error: t('appearanceSaveError') }));
      }
    },
    [appearanceStore],
  );
  const scheme = resolveAppearanceScheme(settings.preference, systemScheme);
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
  const appearance = useMemo(
    () => ({
      preference: settings.preference,
      error: settings.error,
      selectPreference,
    }),
    [settings.preference, settings.error, selectPreference],
  );

  return (
    <AppearanceContext.Provider value={appearance}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </AppearanceContext.Provider>
  );
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within AppThemeProvider');
  return theme;
}

export function useAppearanceSettings(): AppearanceSettings {
  const settings = useContext(AppearanceContext);
  if (!settings) throw new Error('useAppearanceSettings must be used within AppThemeProvider');
  return settings;
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appearancePreferenceStore } from '@/data/preferences/appearance-preference-store';
import { currencyPreferenceStore } from '@/data/preferences/currency-preference-store';
import { CurrencyPreferencesProvider } from '@/shared/currency/currency-provider';
import { FxRateProvider } from '@/shared/currency/fx-rate-provider';
import { ReducedMotionProvider } from '@/shared/navigation/reduced-motion-provider';
import { useNavigationMotion } from '@/shared/navigation/use-navigation-motion';
import { DatabaseGate } from '@/shared/bootstrap/database-gate';
import { AppThemeProvider, useAppTheme } from '@/shared/theme/theme-provider';

/** Respect app-selected appearance even when it differs from the OS. */
function ThemedStatusBar() {
  const theme = useAppTheme();
  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />;
}

/** Register native Stack fade before the detail screen is first pushed. */
function AppNavigationStack() {
  const motion = useNavigationMotion();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="account-groups" options={motion.detail} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider appearanceStore={appearancePreferenceStore}>
        <ReducedMotionProvider>
          <CurrencyPreferencesProvider store={currencyPreferenceStore}>
            <DatabaseGate>
              <FxRateProvider>
                <ThemedStatusBar />
                <AppNavigationStack />
              </FxRateProvider>
            </DatabaseGate>
          </CurrencyPreferencesProvider>
        </ReducedMotionProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

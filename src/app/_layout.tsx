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

/** Pre-register the shared native transition for detail screens before navigation. */
function AppNavigationStack() {
  const theme = useAppTheme();
  const motion = useNavigationMotion();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-account" options={motion.detail} />
      <Stack.Screen name="account-groups" options={motion.detail} />
      <Stack.Screen name="manage-accounts" options={motion.detail} />
      <Stack.Screen name="currency/main" options={motion.detail} />
      <Stack.Screen name="currency/sub" options={motion.detail} />
      <Stack.Screen name="currency/sub-detail" options={motion.detail} />
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

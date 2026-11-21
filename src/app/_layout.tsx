import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appearancePreferenceStore } from '@/data/preferences/appearance-preference-store';
import { currencyPreferenceStore } from '@/data/preferences/currency-preference-store';
import { CurrencyPreferencesProvider } from '@/shared/currency/currency-provider';
import { FxRateProvider } from '@/shared/currency/fx-rate-provider';
import { DatabaseGate } from '@/shared/bootstrap/database-gate';
import { AppThemeProvider, useAppTheme } from '@/shared/theme/theme-provider';

/** Respect app-selected appearance even when it differs from the OS. */
function ThemedStatusBar() {
  const theme = useAppTheme();
  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider appearanceStore={appearancePreferenceStore}>
        <CurrencyPreferencesProvider store={currencyPreferenceStore}>
          <DatabaseGate>
            <FxRateProvider>
              <ThemedStatusBar />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </FxRateProvider>
          </DatabaseGate>
        </CurrencyPreferencesProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

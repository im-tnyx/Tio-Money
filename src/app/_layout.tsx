import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appearancePreferenceStore } from '@/data/preferences/appearance-preference-store';
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
        <DatabaseGate>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </DatabaseGate>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

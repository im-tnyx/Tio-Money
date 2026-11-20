import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseGate } from '@/shared/bootstrap/database-gate';
import { AppThemeProvider } from '@/shared/theme/theme-provider';

/** Phase 0 contains only the five-tab navigation shell; there is no app top bar. */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <DatabaseGate>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </DatabaseGate>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

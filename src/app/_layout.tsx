import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseGate } from '@/shared/bootstrap/database-gate';
import { AppThemeProvider } from '@/shared/theme/theme-provider';

/**
 * Only app bootstrap and navigation ownership belong here.
 * The database gate does not imply account or finance functionality exists.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <DatabaseGate>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transaction/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settings" />
            <Stack.Screen name="(setup)/welcome" />
          </Stack>
        </DatabaseGate>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

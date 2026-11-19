import { SplashScreen } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { initializeDatabase } from '@/data/sqlite/initialize';
import { publicErrorMessage } from '@/shared/errors/app-error';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';

// Keep the native launch splash visible while SQLite initializes. Do this at
// module scope, before the initial React layout, as recommended by Expo Router.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

type BootstrapState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

export function DatabaseGate({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    void initializeDatabase()
      .then(() => {
        if (mounted) setState({ status: 'ready' });
      })
      .catch((error: unknown) => {
        if (mounted) setState({ status: 'error', message: publicErrorMessage(error) });
      });
    return () => {
      mounted = false;
    };
  }, [attempt]);

  const revealOnLayout = useCallback(() => {
    // Only hide after a ready tab layout (or an exceptional recovery view) mounts.
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  // No loading screen, spinner or text is rendered between splash and tabs.
  if (state.status === 'loading') return null;

  if (state.status === 'ready') {
    return (
      <View
        onLayout={revealOnLayout}
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      >
        {children}
      </View>
    );
  }

  // Display error recovery only if the local database actually fails to start.
  // No database is erased and the normal launch remains splash -> five blank tabs.
  return (
    <View
      onLayout={revealOnLayout}
      style={{
        flex: 1,
        backgroundColor: theme.colors.canvas,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.space.xl,
        gap: theme.space.md,
      }}
      accessibilityLiveRegion="polite"
    >
      <Text
        accessibilityRole="header"
        style={{
          color: theme.colors.primaryText,
          fontSize: theme.typeScale.title,
          textAlign: 'center',
        }}
      >
        Local data unavailable
      </Text>
      <Text style={{ color: theme.colors.secondaryText, textAlign: 'center', lineHeight: 24 }}>
        {state.message}
      </Text>
      <ActionButton
        label="Retry initialization"
        onPress={() => {
          setState({ status: 'loading' });
          setAttempt((n) => n + 1);
        }}
      />
    </View>
  );
}

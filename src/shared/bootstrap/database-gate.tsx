import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { initializeDatabase } from '@/data/sqlite/initialize';
import { publicErrorMessage } from '@/shared/errors/app-error';
import { ActionButton } from '@/shared/ui/action-button';
import { useAppTheme } from '@/shared/theme/theme-provider';

type BootstrapState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

export function DatabaseGate({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<BootstrapState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    setState({ status: 'loading' });
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

  if (state.status === 'ready') return <>{children}</>;

  return (
    <View
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
      {state.status === 'loading' ? (
        <>
          <ActivityIndicator color={theme.colors.brand} size="large" />
          <Text style={{ color: theme.colors.primaryText, fontSize: theme.typeScale.body }}>
            Preparing your local workspace…
          </Text>
        </>
      ) : (
        <>
          <Text
            accessibilityRole="header"
            style={{ color: theme.colors.primaryText, fontSize: theme.typeScale.title, textAlign: 'center' }}
          >
            Local data unavailable
          </Text>
          <Text style={{ color: theme.colors.secondaryText, textAlign: 'center', lineHeight: 24 }}>
            {state.message}
          </Text>
          <ActionButton label="Retry initialization" onPress={() => setAttempt((n) => n + 1)} />
          <Text style={{ color: theme.colors.secondaryText, textAlign: 'center' }}>
            Your database was not deleted or reset.
          </Text>
        </>
      )}
    </View>
  );
}

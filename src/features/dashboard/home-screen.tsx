import { View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { ScreenContainer } from '@/shared/ui/screen-container';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { SectionCard } from '@/shared/ui/section-card';
import { StatePanel } from '@/shared/ui/state-panel';

export function HomeScreen() {
  const theme = useAppTheme();
  return (
    <ScreenContainer>
      <ScreenHeader title="Tio Money" subtitle="Every rupee. One clear picture." />
      <View style={{ gap: theme.space.xs }}>
        <AppText variant="caption" style={{ fontWeight: '700', color: theme.colors.brand }}>
          YOUR MONEY, IN FOCUS
        </AppText>
        <AppText variant="display">Track clearly. Live freely.</AppText>
        <AppText muted>
          Your personal money workspace is taking shape — offline-first, with no bank login.
        </AppText>
      </View>
      <SectionCard>
        <AppText variant="caption" muted>
          ACCOUNT OVERVIEW
        </AppText>
        <AppText variant="section">No balances to show yet</AppText>
        <AppText muted>
          Phase 0 prepares the app and local database. Account setup, real balances and financial
          entries arrive in later implementation phases.
        </AppText>
      </SectionCard>
      <StatePanel
        title="One place for every movement"
        description="Use the central + to explore the unified Income / Expense / Transfer editor.
          Saving is intentionally unavailable until the financial ledger is implemented."
      />
      <AppText variant="caption" muted>
        Foundation preview · No finance transactions have been created.
      </AppText>
    </ScreenContainer>
  );
}

import { useRouter } from 'expo-router';

import { ActionButton } from '@/shared/ui/action-button';
import { AppText } from '@/shared/ui/app-text';
import { ScreenContainer } from '@/shared/ui/screen-container';
import { StatePanel } from '@/shared/ui/state-panel';

export function WelcomeScreen() {
  const router = useRouter();
  return (
    <ScreenContainer includeBottomInset>
      <AppText variant="title">Welcome to Tio Money</AppText>
      <AppText muted>
        Track your own bank, cash, wallet and card activity with clarity — without needing a bank login.
      </AppText>
      <StatePanel
        title="Account setup is next"
        description="Language choice and opening balances are scheduled for Phase 1 and Phase 2. This page is only a route placeholder."
      />
      <ActionButton label="Explore the foundation" onPress={() => router.replace('/')} />
    </ScreenContainer>
  );
}

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
        Track your own bank, cash, wallet and card activity with clarity — without needing a bank
        login.
      </AppText>
      <StatePanel
        title="Account setup is next"
        description="Account setup and opening balances are planned for later phases. The initial app uses English only; this page is a route placeholder."
      />
      <ActionButton label="Explore the foundation" onPress={() => router.replace('/')} />
    </ScreenContainer>
  );
}

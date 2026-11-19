import { useRouter } from 'expo-router';

import { ActionButton } from '@/shared/ui/action-button';
import { ScreenContainer } from '@/shared/ui/screen-container';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StatePanel } from '@/shared/ui/state-panel';

export default function MoreRoute() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenHeader title="More" subtitle="App preferences and privacy." showSettings={false} />
      <ActionButton
        label="Open settings"
        accessibilityLabel="Open settings"
        variant="secondary"
        onPress={() => router.push('/settings')}
      />
      <StatePanel
        title="More options are planned"
        description="Only Settings is available here in Phase 0. Export, security and account preferences will appear after their features are implemented."
      />
    </ScreenContainer>
  );
}

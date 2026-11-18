import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppText } from '@/shared/ui/app-text';
import { ScreenContainer } from '@/shared/ui/screen-container';
import { SectionCard } from '@/shared/ui/section-card';
import { StatePanel } from '@/shared/ui/state-panel';

export function SettingsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  return (
    <ScreenContainer includeBottomInset>
      <View style={{ alignItems: 'flex-start' }}>
        <ActionButton label="← Back" variant="ghost" onPress={() => router.back()} />
      </View>
      <AppText variant="title">Settings & privacy</AppText>
      <SectionCard>
        <AppText variant="section">Appearance</AppText>
        <AppText muted>
          This foundation follows your device light/dark setting. A manual override will be reviewed in Phase 1.
        </AppText>
      </SectionCard>
      <SectionCard>
        <AppText variant="section">Your data</AppText>
        <AppText muted>
          The local SQLite database has started, but financial accounts and transactions are not implemented.
          There is no cloud sync, encrypted backup or automatic SMS reading.
        </AppText>
      </SectionCard>
      <StatePanel
        title="Privacy and export"
        description="Language selection, CSV export, data deletion, app lock and backup controls will only appear once genuinely implemented."
      />
      <AppText variant="caption" style={{ color: theme.colors.secondaryText }}>
        Phase 0 • This is a development foundation, not a public release.
      </AppText>
    </ScreenContainer>
  );
}

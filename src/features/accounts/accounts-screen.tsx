import { ScrollView, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import { AccountPage } from './account-page';

export function AccountsScreen({ onAdd }: { readonly onAdd: () => void }) {
  const theme = useAppTheme();
  return (
    <AccountPage
      tab
      title={t('accounts')}
      actions={[{ key: 'add', icon: 'add', accessibilityLabel: t('addAccount'), onPress: onAdd }]}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{ padding: theme.space.lg }}
      >
        <AppText muted>{t('accountsDataUnavailable')}</AppText>
      </ScrollView>
    </AccountPage>
  );
}

export function ManageAccountsScreen({ onBack }: { readonly onBack: () => void }) {
  const theme = useAppTheme();
  return (
    <AccountPage title={t('manageAccounts')} backLabel={t('accountGroupsBack')} onBack={onBack}>
      <View style={{ flex: 1, backgroundColor: theme.colors.canvas, padding: theme.space.lg }}>
        <AppText muted>{t('manageAccountsUnavailable')}</AppText>
      </View>
    </AccountPage>
  );
}

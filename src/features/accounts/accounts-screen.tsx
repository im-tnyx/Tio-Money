import { Pressable, ScrollView, View } from 'react-native';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { PreviewGroup } from './account-form-contract';
import { AccountGroupIcon } from './account-group-icon';
import { AccountPage } from './account-page';

export interface AccountGroupChoice {
  readonly id: PreviewGroup | 'insurance';
  readonly label: TranslationKey;
  readonly detail: TranslationKey;
  readonly status?: TranslationKey;
  readonly onSelect?: () => void;
}

export function AccountsScreen({
  choices,
  pickerVisible,
  animatePicker,
  onAdd,
  onClosePicker,
  onPickerDismissed,
}: {
  readonly choices: readonly AccountGroupChoice[];
  readonly pickerVisible: boolean;
  readonly animatePicker: boolean;
  readonly onAdd: () => void;
  readonly onClosePicker: () => void;
  readonly onPickerDismissed: () => void;
}) {
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
      <AppBottomSheet
        visible={pickerVisible}
        title={t('chooseAccountGroup')}
        dismissAccessibilityLabel={t('closeAccountGroupPicker')}
        onDismiss={onClosePicker}
        onDismissed={onPickerDismissed}
        animate={animatePicker}
      >
        {choices.map(({ id, label, detail, status, onSelect }) => (
          <Pressable
            key={id}
            accessible
            accessibilityRole="button"
            accessibilityLabel={[t(label), t(detail), status ? t(status) : null]
              .filter(Boolean)
              .join('. ')}
            accessibilityState={{ disabled: !onSelect }}
            disabled={!onSelect}
            onPress={onSelect}
            style={{
              minHeight: theme.buttons.minimumHeight,
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.sm,
              gap: theme.space.md,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomColor: theme.colors.border,
              borderBottomWidth: theme.navigation.borderWidth,
            }}
          >
            <AccountGroupIcon group={id} />
            <View style={{ flex: 1, gap: theme.space.xxs }}>
              <AppText muted={!onSelect}>{t(label)}</AppText>
              <AppText variant="caption" muted>
                {t(detail)}
              </AppText>
              {status ? <AppText variant="caption">{t(status)}</AppText> : null}
            </View>
          </Pressable>
        ))}
      </AppBottomSheet>
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

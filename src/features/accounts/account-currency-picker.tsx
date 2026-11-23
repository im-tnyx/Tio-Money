import { View } from 'react-native';

import type { CurrencyCode } from '@/shared/currency/currency-preference';
import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { AccountCurrencyPickerViewModel } from './account-form-contract';
import { AccountChoices } from './account-form-controls';

export function AccountCurrencyPicker({
  picker,
  value,
  animate,
}: {
  readonly picker: AccountCurrencyPickerViewModel;
  readonly value: CurrencyCode;
  readonly animate: boolean;
}) {
  const theme = useAppTheme();
  return (
    <AppBottomSheet
      visible={picker.visible}
      animate={animate}
      title={t('currency')}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={picker.onClose}
      onDismissed={picker.onDismissed}
    >
      <View style={{ padding: theme.space.lg, gap: theme.space.md }}>
        <AccountChoices
          label="currencyMain"
          options={picker.options.slice(0, 1)}
          value={value}
          onChange={picker.onSelect}
          list
        />
        <AccountChoices
          label="currencySubCount"
          options={picker.options.slice(1)}
          value={value}
          onChange={picker.onSelect}
          list
        />
        <AppText variant="caption" muted>
          {t('accountCurrencyChangeHint')}
        </AppText>
        <ActionButton
          label={t('accountAddCurrency')}
          variant="secondary"
          disabled={!picker.onAddCurrency}
          onPress={picker.onAddCurrency ?? undefined}
        />
        {!picker.onAddCurrency ? (
          <AppText variant="caption" muted>
            {t('currencySubLimitReached')}
          </AppText>
        ) : null}
      </View>
    </AppBottomSheet>
  );
}

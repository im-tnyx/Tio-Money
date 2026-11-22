import { Pressable, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

const decimalChoices = [
  { value: 0, label: 'currencyDecimalNone' },
  { value: 1, label: 'currencyDecimalOne' },
  { value: 2, label: 'currencyDecimalTwo' },
  { value: 3, label: 'currencyDecimalThree' },
] as const;

const formatChoices = [
  { value: 'international', label: 'currencyMillionsExample' },
  { value: 'indian', label: 'currencyLakhsExample' },
  { value: 'none', label: 'currencyNoFormatExample' },
] as const;

function RadioChoice({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={{
        minHeight: theme.buttons.minimumHeight,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.md,
        borderBottomWidth: theme.navigation.borderWidth,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
      }}
    >
      <AppText style={{ flex: 1 }}>{label}</AppText>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: theme.iconRoles.bottomSheet,
          height: theme.iconRoles.bottomSheet,
          borderRadius: theme.radius.pill,
          borderWidth: theme.buttons.outlineWidth,
          borderColor: checked ? theme.colors.brand : theme.colors.secondaryText,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? (
          <View
            style={{
              width: theme.space.sm,
              height: theme.space.sm,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.brand,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

/** Main-style radio selection: one dismissible sheet for the selected setting. */
export function SubCurrencyDetailOptionSheet({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const detail = state.detail;
  const kind = state.detailSheetKind;
  return (
    <AppBottomSheet
      visible={detail !== null && kind !== null}
      title={t(kind === 'decimal' ? 'currencyDecimals' : 'currencyFormat')}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'detail.options.dismiss' })}
    >
      <View accessibilityRole="radiogroup">
        {detail && kind === 'decimal'
          ? decimalChoices.map((item) => (
              <RadioChoice
                key={item.value}
                label={t(item.label)}
                checked={detail.decimalDigits === item.value}
                onPress={() => onAction({ type: 'detail.decimal.select', value: item.value })}
              />
            ))
          : null}
        {detail && kind === 'format'
          ? formatChoices.map((item) => (
              <RadioChoice
                key={item.value}
                label={t(item.label)}
                checked={detail.formatGrouping === item.value}
                onPress={() => onAction({ type: 'detail.format.select', value: item.value })}
              />
            ))
          : null}
      </View>
    </AppBottomSheet>
  );
}

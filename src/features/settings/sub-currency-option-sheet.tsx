import { Pressable, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

/** One-tap add; already selected currencies and Main are excluded by the ViewModel. */
export function SubCurrencyOptionSheet({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const atLimit = state.selected.length >= state.limit;
  return (
    <AppBottomSheet
      visible={state.sheetVisible}
      title={t('currencyAddSub')}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'add.dismiss' })}
    >
      {atLimit ? (
        <View style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md }}>
          <AppText>{t('currencySubLimitReached')}</AppText>
        </View>
      ) : (
        <View>
          {state.choices.map((option) => (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              onPress={() => onAction({ type: 'select', code: option.code })}
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
              <AppText style={{ flex: 1 }}>{option.label}</AppText>
            </Pressable>
          ))}
        </View>
      )}
      {state.error ? (
        <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
          <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}

import { Pressable, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

export function SubCurrencyOptionSheet({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  return (
    <AppBottomSheet
      visible={state.sheetVisible}
      title={t(state.selectedLabel ? 'currencyReplaceSub' : 'currencyAddSub')}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'add.dismiss' })}
    >
      {state.selectedLabel ? (
        <View style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm }}>
          <AppText variant="caption" muted>
            {t('currencySubReplaceHint')}
          </AppText>
        </View>
      ) : null}
      <View accessibilityRole="radiogroup">
        {state.choices.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: option.selected }}
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
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                height: theme.iconRoles.bottomSheet,
                width: theme.iconRoles.bottomSheet,
                borderRadius: theme.radius.pill,
                borderWidth: theme.buttons.outlineWidth,
                borderColor: option.selected ? theme.colors.brand : theme.colors.secondaryText,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {option.selected ? (
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
        ))}
      </View>
      {state.error ? (
        <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
          <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}

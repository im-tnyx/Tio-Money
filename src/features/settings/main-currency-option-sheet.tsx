import { Pressable, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { MainCurrencyAction, MainCurrencyUiState } from './main-currency-contract';

export function MainCurrencyOptionSheet({
  state,
  onAction,
}: {
  state: MainCurrencyUiState;
  onAction: (action: MainCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  return (
    <AppBottomSheet
      visible={state.sheetKind !== null}
      title={state.sheetTitle}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'dismiss' })}
    >
      <View accessibilityRole="radiogroup">
        {state.choices.map((row) => (
          <Pressable
            key={row.key}
            accessibilityRole="radio"
            accessibilityLabel={row.label}
            accessibilityState={{ checked: row.selected }}
            onPress={() => onAction({ type: 'select', choice: row.choice })}
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
            <AppText style={{ flex: 1 }}>{row.label}</AppText>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                height: theme.iconRoles.bottomSheet,
                width: theme.iconRoles.bottomSheet,
                borderRadius: theme.radius.pill,
                borderWidth: theme.buttons.outlineWidth,
                borderColor: row.selected ? theme.colors.brand : theme.colors.secondaryText,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {row.selected ? (
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
    </AppBottomSheet>
  );
}

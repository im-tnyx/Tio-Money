import { Pressable, ScrollView, View } from 'react-native';

import { CURRENCY_OPTIONS, type CurrencyCode } from '@/shared/currency/currency-preference';
import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import type { MoreAction, MoreUiState } from './more-contract';

function SummaryRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      accessibilityHint={t('currencyChoose')}
      onPress={onPress}
      style={{
        minHeight: theme.buttons.minimumHeight,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.md,
        borderBottomColor: theme.colors.border,
        borderBottomWidth: theme.navigation.borderWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.space.md,
      }}
    >
      <AppText>{label}</AppText>
      <AppText muted>{value}</AppText>
    </Pressable>
  );
}

function CurrencyChoice({
  code,
  label,
  selected,
  onAction,
}: {
  code: CurrencyCode | null;
  label: string;
  selected: boolean;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={() => onAction({ type: 'currency.select', code })}
      style={{
        minHeight: theme.buttons.minimumHeight,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.md,
        borderBottomColor: theme.colors.border,
        borderBottomWidth: theme.navigation.borderWidth,
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
          borderColor: selected ? theme.colors.brand : theme.colors.secondaryText,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
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

/** Props-only content. Controller owns selection, persistence and sheet state. */
export function CurrencySheet({
  state,
  onAction,
}: {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();
  const selecting = state.currencyStep !== 'overview';
  const selectedCode =
    state.currencyStep === 'main' ? state.currency.mainCode : state.currency.subCode;
  const options =
    state.currencyStep === 'sub'
      ? CURRENCY_OPTIONS.filter((option) => option.code !== state.currency.mainCode)
      : CURRENCY_OPTIONS;
  return (
    <AppBottomSheet
      visible={state.currencySheetVisible}
      title={
        state.currencyStep === 'main'
          ? t('currencyMain')
          : state.currencyStep === 'sub'
            ? t('currencySub')
            : t('currency')
      }
      dismissAccessibilityLabel={t('closeCurrency')}
      onDismiss={() => onAction({ type: 'currency.dismiss' })}
    >
      {selecting ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currencyBack')}
            onPress={() => onAction({ type: 'currency.back' })}
            style={{
              minHeight: theme.buttons.minimumHeight,
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.md,
            }}
          >
            <AppText>{t('currencyBack')}</AppText>
          </Pressable>
          <ScrollView style={{ maxHeight: '70%' }}>
            <View accessibilityRole="radiogroup">
              {state.currencyStep === 'sub' ? (
                <CurrencyChoice
                  code={null}
                  label={t('currencyNone')}
                  selected={selectedCode === null}
                  onAction={onAction}
                />
              ) : null}
              {options.map((option) => (
                <CurrencyChoice
                  key={option.code}
                  code={option.code}
                  label={option.name + ' (' + option.code + ')'}
                  selected={selectedCode === option.code}
                  onAction={onAction}
                />
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <>
          <SummaryRow
            label={t('currencyMain')}
            value={state.currency.mainCode}
            onPress={() => onAction({ type: 'currency.pick-main' })}
          />
          <SummaryRow
            label={t('currencySub')}
            value={state.currency.subCode ?? t('currencyNone')}
            onPress={() => onAction({ type: 'currency.pick-sub' })}
          />
          <View style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.md }}>
            <AppText variant="caption" muted>
              {t('currencyNoRates')}
            </AppText>
          </View>
        </>
      )}
      {state.currencyError ? (
        <View
          accessibilityLiveRegion="polite"
          style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm }}
        >
          <AppText style={{ color: theme.colors.expense }}>{state.currencyError}</AppText>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}

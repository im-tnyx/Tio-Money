import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import { CurrencyUnitPositionControl } from './currency-unit-position-control';
import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

const decimals = [
  { value: 0, label: t('currencyDecimalNone') },
  { value: 1, label: t('currencyDecimalOne') },
  { value: 2, label: t('currencyDecimalTwo') },
  { value: 3, label: t('currencyDecimalThree') },
] as const;

/** A second, content-sized sheet; Add Currency stays a separate currency-only picker. */
export function SubCurrencyDetailSheet({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const detail = state.detail;
  const decimalMode = state.detailMode === 'decimal';
  const sheetTitle = detail
    ? decimalMode
      ? t('currencyDecimals')
      : detail.code + ' ' + t('currencySubDetails')
    : t('currencySubDetails');
  return (
    <AppBottomSheet
      visible={detail !== null}
      title={sheetTitle}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'detail.dismiss' })}
    >
      {detail && decimalMode ? (
        <View accessibilityRole="radiogroup">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currencyBackToDetails')}
            onPress={() => onAction({ type: 'detail.decimal.back' })}
            style={{
              minHeight: theme.buttons.minimumHeight,
              paddingHorizontal: theme.space.lg,
              justifyContent: 'center',
            }}
          >
            <AppText muted>{t('currencyBackToDetails')}</AppText>
          </Pressable>
          {decimals.map((option, index) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: detail.decimalDigits === option.value }}
              onPress={() => onAction({ type: 'detail.decimal.select', value: option.value })}
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingVertical: theme.space.md,
                paddingHorizontal: theme.space.lg,
                justifyContent: 'center',
                borderBottomWidth:
                  index === decimals.length - 1
                    ? theme.navigation.origin
                    : theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText>{option.label}</AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      {detail && !decimalMode ? (
        <>
          <View
            style={{
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.xl,
              gap: theme.space.xs,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
              }}
            >
              <View style={{ flex: 0.9, minWidth: theme.navigation.origin }}>
                <AppText
                  variant="caption"
                  muted
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {detail.label}
                </AppText>
              </View>
              <View style={{ width: theme.space.xxl }} />
              <View style={{ flex: 1.25, minWidth: theme.navigation.origin }}>
                <AppText variant="caption" muted style={{ textAlign: 'center' }}>
                  {state.mainCode}
                </AppText>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
              }}
            >
              <View style={{ flex: 0.9, minWidth: theme.navigation.origin }}>
                <AppText
                  variant="title"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  {detail.subPreview}
                </AppText>
              </View>
              <View style={{ width: theme.space.xxl, alignItems: 'center' }}>
                <AppText variant="title">=</AppText>
              </View>
              <View style={{ flex: 1.25, minWidth: theme.navigation.origin }}>
                <AppText
                  variant="title"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                  style={{ textAlign: 'center' }}
                >
                  {detail.mainPreview}
                </AppText>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderTopWidth: theme.navigation.borderWidth,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
                borderBottomWidth: theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText muted style={{ width: '34%' }}>{t('currencyFxExchangeRate')}</AppText>
              <AppText style={{ flex: 1 }}>{detail.rateValue}</AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('currencyFxRefresh')}
                accessibilityState={{ disabled: detail.refreshing }}
                disabled={detail.refreshing}
                onPress={() => onAction({ type: 'detail.refresh' })}
                style={{
                  minHeight: theme.buttons.minimumHeight,
                  minWidth: theme.buttons.minimumHeight,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: detail.refreshing
                    ? theme.buttons.disabledOpacity
                    : theme.buttons.enabledOpacity,
                }}
              >
                <Svg
                  width={theme.iconRoles.button}
                  height={theme.iconRoles.button}
                  viewBox="0 0 24 24"
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Path
                    d="M20 11a8 8 0 0 0-14-5L4 8m0-5v5h5M4 13a8 8 0 0 0 14 5l2-2m0 5v-5h-5"
                    fill="none"
                    stroke={theme.colors.primaryText}
                    strokeWidth={theme.icons.stroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            </View>
            <View
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
                borderBottomWidth: theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText muted style={{ width: '34%' }}>{t('currencyPosition')}</AppText>
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <CurrencyUnitPositionControl
                  value={detail.unitPosition}
                  onChange={(value) => onAction({ type: 'detail.position.select', value })}
                />
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('currencyDecimals')}
              accessibilityValue={{ text: detail.decimalLabel }}
              onPress={() => onAction({ type: 'detail.decimal.open' })}
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
              }}
            >
              <AppText muted style={{ width: '34%' }}>{t('currencyDecimals')}</AppText>
              <AppText style={{ flex: 1 }}>{detail.decimalLabel}</AppText>
              <Svg
                width={theme.iconRoles.card}
                height={theme.iconRoles.card}
                viewBox="0 0 24 24"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Path
                  d="m9 18 6-6-6-6"
                  fill="none"
                  stroke={theme.colors.secondaryText}
                  strokeWidth={theme.icons.stroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </View>
        </>
      ) : null}
      {detail?.refreshError || state.error ? (
        <View
          accessibilityLiveRegion="polite"
          style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.sm }}
        >
          <AppText style={{ color: theme.colors.expense }}>
            {detail?.refreshError ?? state.error}
          </AppText>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}

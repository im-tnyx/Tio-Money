import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import { CurrencyUnitPositionControl } from './currency-unit-position-control';
import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

/** 48dp accessible step controls; only the Sub detail sheet uses these. */
function DecimalStepButton({
  label,
  sign,
  disabled,
  onPress,
}: {
  label: string;
  sign: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: theme.buttons.minimumHeight,
        minWidth: theme.buttons.minimumHeight,
        borderRadius: theme.segmentedControl.radius,
        backgroundColor: theme.colors.segmentedSelected,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? theme.buttons.disabledOpacity : theme.buttons.enabledOpacity,
      }}
    >
      <AppText variant="section" style={{ color: theme.colors.segmentedSelectedText }}>
        {sign}
      </AppText>
    </Pressable>
  );
}

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
  const sheetTitle = detail ? detail.code + ' ' + t('currencySubDetails') : t('currencySubDetails');
  return (
    <AppBottomSheet
      visible={detail !== null}
      title={sheetTitle}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'detail.dismiss' })}
    >
      {detail ? (
        <>
          <View
            style={{
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.lg,
              backgroundColor: theme.colors.card,
              gap: theme.space.sm,
            }}
          >
            <AppText
              variant="caption"
              muted
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('currencyMain')}: {state.mainLabel}
            </AppText>
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
                <AppText
                  variant="caption"
                  muted
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  style={{ textAlign: 'right' }}
                >
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
                  style={{ textAlign: 'right' }}
                >
                  {detail.mainPreview}
                </AppText>
              </View>
            </View>
            {detail.rateDate ? (
              <AppText variant="caption" muted>
                {t('currencyFxSource')} · {detail.rateDate}
              </AppText>
            ) : null}
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
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
                borderBottomWidth: theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText muted style={{ width: '34%' }}>
                {t('currencyFxExchangeRate')}
              </AppText>
              <AppText
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={{ flex: 1, textAlign: 'right' }}
              >
                {detail.rateValue}
              </AppText>
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
                paddingVertical: theme.space.xs,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
                borderBottomWidth: theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText muted style={{ width: '34%' }}>
                {t('currencyPosition')}
              </AppText>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <CurrencyUnitPositionControl
                  value={detail.unitPosition}
                  onChange={(value) => onAction({ type: 'detail.position.select', value })}
                />
              </View>
            </View>
            <View
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
              }}
            >
              <AppText muted style={{ width: '34%' }}>
                {t('currencyDecimals')}
              </AppText>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.segmentedTrack,
                    borderRadius: theme.segmentedControl.radius,
                    padding: theme.segmentedControl.inset,
                  }}
                >
                  <DecimalStepButton
                    label={t('currencyDecimalDecrease')}
                    sign="−"
                    disabled={detail.decimalDigits === 0}
                    onPress={() => onAction({ type: 'detail.decimal.step', delta: -1 })}
                  />
                  <AppText style={{ width: theme.space.xxxl, textAlign: 'center', flexShrink: 0 }}>
                    {detail.decimalLabel}
                  </AppText>
                  <DecimalStepButton
                    label={t('currencyDecimalIncrease')}
                    sign="+"
                    disabled={detail.decimalDigits === 3}
                    onPress={() => onAction({ type: 'detail.decimal.step', delta: 1 })}
                  />
                </View>
              </View>
            </View>
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

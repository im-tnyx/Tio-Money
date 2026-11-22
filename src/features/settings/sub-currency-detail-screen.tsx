import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import { CurrencyUnitPositionControl } from './currency-unit-position-control';
import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';
import { SubCurrencyDetailOptionSheet } from './sub-currency-detail-option-sheet';

function DetailOptionRow({
  label,
  value,
  expanded,
  onPress,
  last,
}: {
  label: string;
  value: string;
  expanded: boolean;
  onPress: () => void;
  last: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={{
        minHeight: theme.buttons.minimumHeight,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.sm,
        borderBottomWidth: last ? theme.navigation.origin : theme.navigation.borderWidth,
        borderBottomColor: theme.colors.border,
      }}
    >
      <AppText muted style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{ flex: 1, textAlign: 'right' }}
      >
        {value}
      </AppText>
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
  );
}

/** Saved Sub details are a native stack screen; only Decimals/Format open sheets. */
export function SubCurrencyDetailScreen({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const detail = state.detail;
  const sideWidth = theme.buttons.minimumHeight * 2;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.card }}
    >
      <View
        style={{
          flexDirection: 'row',
          height: theme.navigation.topBarHeight,
          alignItems: 'center',
          borderBottomWidth: theme.navigation.borderWidth,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.card,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currencyPageBack')}
          onPress={() => onAction({ type: 'detail.dismiss' })}
          style={{
            width: sideWidth,
            minHeight: theme.buttons.minimumHeight,
            paddingLeft: theme.space.sm,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Svg
            width={theme.iconRoles.topBar}
            height={theme.iconRoles.topBar}
            viewBox="0 0 24 24"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Path
              d="m15 18-6-6 6-6"
              stroke={theme.colors.primaryText}
              strokeWidth={theme.icons.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
        <AppText
          variant="section"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{ flex: 1, textAlign: 'center' }}
        >
          {detail ? detail.code + ' ' + t('currencySubDetails') : t('currencySubDetails')}
        </AppText>
        <View style={{ width: sideWidth }} />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{ paddingBottom: theme.space.xxxl, gap: theme.space.lg }}
      >
        {detail ? (
          <>
            <View style={{ padding: theme.space.lg, gap: theme.space.sm }}>
              <AppText muted variant="caption" numberOfLines={1}>
                {t('currencyMain')}: {state.mainLabel}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
                <View style={{ flex: 1, minWidth: theme.navigation.origin }}>
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
                <View style={{ flex: 1, minWidth: theme.navigation.origin }}>
                  <AppText variant="caption" muted numberOfLines={1} style={{ textAlign: 'right' }}>
                    {state.mainCode}
                  </AppText>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
                <View style={{ flex: 1, minWidth: theme.navigation.origin }}>
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
                <View style={{ flex: 1, minWidth: theme.navigation.origin }}>
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
                <AppText
                  variant="caption"
                  muted
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {detail.rateStatus === 'cached' ? t('currencyFxCached') + ' · ' : ''}
                  {t('currencyFxSource')} · {detail.rateDate}
                </AppText>
              ) : null}
            </View>
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderTopWidth: theme.navigation.borderWidth,
                borderBottomWidth: theme.navigation.borderWidth,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  minHeight: theme.buttons.minimumHeight,
                  paddingHorizontal: theme.space.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space.xs,
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
                  accessibilityLabel={t(
                    detail.refreshing ? 'currencyFxChecking' : 'currencyFxRefresh',
                  )}
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
                  {detail.refreshing ? (
                    <ActivityIndicator size="small" color={theme.colors.primaryText} />
                  ) : (
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
                        strokeWidth={theme.icons.fineStroke}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </Pressable>
              </View>
              {detail.refreshStatus ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={{
                    paddingHorizontal: theme.space.lg,
                    paddingVertical: theme.space.xs,
                    borderBottomWidth: theme.navigation.borderWidth,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: detail.refreshError
                        ? theme.colors.expense
                        : theme.colors.secondaryText,
                    }}
                  >
                    {detail.refreshStatus}
                  </AppText>
                </View>
              ) : null}
              <View
                style={{
                  minHeight: theme.buttons.minimumHeight,
                  paddingHorizontal: theme.space.lg,
                  paddingVertical: theme.space.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.space.md,
                  borderBottomWidth: theme.navigation.borderWidth,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <AppText muted style={{ flex: 1 }}>
                  {t('currencyPosition')}
                </AppText>
                <CurrencyUnitPositionControl
                  value={detail.unitPosition}
                  onChange={(value) => onAction({ type: 'detail.position.select', value })}
                />
              </View>
              <DetailOptionRow
                label={t('currencyDecimals')}
                value={detail.decimalLabel}
                expanded={state.detailSheetKind === 'decimal'}
                onPress={() => onAction({ type: 'detail.options.open', sheet: 'decimal' })}
                last={false}
              />
              <DetailOptionRow
                label={t('currencyFormat')}
                value={detail.formatLabel}
                expanded={state.detailSheetKind === 'format'}
                onPress={() => onAction({ type: 'detail.options.open', sheet: 'format' })}
                last
              />
            </View>
          </>
        ) : (
          <View style={{ padding: theme.space.lg }}>
            <AppText>{t('currencyNoSubAdded')}</AppText>
          </View>
        )}
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
      </ScrollView>
      <SubCurrencyDetailOptionSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

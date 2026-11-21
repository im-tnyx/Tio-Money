import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { MainCurrencyAction, MainCurrencyUiState } from './main-currency-contract';
import { MainCurrencyOptionSheet } from './main-currency-option-sheet';
import { CurrencyUnitPositionControl } from './currency-unit-position-control';

function CurrencyFormatRow({
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
      onPress={onPress}
      style={{
        minHeight: theme.buttons.minimumHeight,
        paddingVertical: theme.space.md,
        paddingHorizontal: theme.space.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: theme.navigation.borderWidth,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        gap: theme.space.md,
      }}
    >
      <AppText muted style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText style={{ flex: 2 }}>{value}</AppText>
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

/** Strictly presentational: no navigation, storage, FX, amount math or workflow hooks. */
export function MainCurrencyScreen({
  state,
  onAction,
}: {
  state: MainCurrencyUiState;
  onAction: (action: MainCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const sideWidth = theme.buttons.minimumHeight * 2;
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
    >
      <View
        style={{
          flexDirection: 'row',
          minHeight: theme.buttons.minimumHeight,
          alignItems: 'center',
          paddingHorizontal: theme.space.sm,
          borderBottomWidth: theme.navigation.borderWidth,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.card,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currencyPageBack')}
          onPress={() => onAction({ type: 'back' })}
          style={{
            width: sideWidth,
            minHeight: theme.buttons.minimumHeight,
            paddingHorizontal: theme.space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.xs,
          }}
        >
          <Svg
            width={theme.iconRoles.card}
            height={theme.iconRoles.card}
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
          <AppText>{t('currencyPageBack')}</AppText>
        </Pressable>
        <AppText variant="section" style={{ flex: 1, textAlign: 'center' }}>
          {t('currencyMain')}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currencyChange')}
          onPress={() => onAction({ type: 'open', sheet: 'currency' })}
          style={{
            width: sideWidth,
            minHeight: theme.buttons.minimumHeight,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingHorizontal: theme.space.sm,
          }}
        >
          <AppText style={{ color: theme.colors.brand }}>{t('currencyChange')}</AppText>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: theme.space.xxxl,
          gap: theme.space.lg,
        }}
      >
        <View
          style={{
            paddingVertical: theme.space.xxl,
            paddingHorizontal: theme.space.lg,
            backgroundColor: theme.colors.card,
            alignItems: 'center',
            gap: theme.space.md,
          }}
        >
          <AppText muted>{state.label}</AppText>
          <AppText variant="display">{state.preview}</AppText>
        </View>
        <View style={{ gap: theme.space.sm }}>
          <View style={{ paddingHorizontal: theme.space.lg }}>
            <AppText variant="section">{t('currencyDisplayFormat')}</AppText>
          </View>
          <View
            style={{
              paddingVertical: theme.space.md,
              paddingHorizontal: theme.space.lg,
              backgroundColor: theme.colors.card,
              borderBottomWidth: theme.navigation.borderWidth,
              borderBottomColor: theme.colors.border,
              gap: theme.space.md,
            }}
          >
            <AppText>{t('currencyPosition')}</AppText>
            <CurrencyUnitPositionControl
              value={state.unitPosition}
              onChange={(value) => onAction({ type: 'position.select', value })}
            />
          </View>
          {state.rows.map((row) => (
            <CurrencyFormatRow
              key={row.key}
              label={row.label}
              value={row.value}
              onPress={() => onAction({ type: 'open', sheet: row.key })}
            />
          ))}
        </View>
        <View style={{ paddingHorizontal: theme.space.lg, gap: theme.space.xs }}>
          <AppText variant="caption" muted>
            {t('currencyLargePreview')}
          </AppText>
          <AppText variant="section">{state.largePreview}</AppText>
          <AppText variant="caption" muted>
            {t('currencyDisplayOnly')}
          </AppText>
        </View>
        {state.error ? (
          <View
            accessibilityLiveRegion="polite"
            style={{ paddingHorizontal: theme.space.lg }}
          >
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
      </ScrollView>
      <MainCurrencyOptionSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppText } from '@/shared/ui/app-text';

import { CurrencyUnitPositionControl } from './currency-unit-position-control';
import type { MainCurrencyAction, MainCurrencyUiState } from './main-currency-contract';
import { MainCurrencyOptionSheet } from './main-currency-option-sheet';

function CurrencyFormatRow({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value: string;
  onPress: () => void;
  last: boolean;
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
        borderBottomWidth: last ? theme.navigation.origin : theme.navigation.borderWidth,
        borderBottomColor: theme.colors.border,
        gap: theme.space.md,
      }}
    >
      <AppText muted style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText style={{ flex: 1, textAlign: 'right' }}>{value}</AppText>
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

function CurrencySettingsCard({
  state,
  onAction,
}: {
  state: MainCurrencyUiState;
  onAction: (action: MainCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  return (
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
          paddingVertical: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: theme.navigation.borderWidth,
          borderBottomColor: theme.colors.border,
          gap: theme.space.md,
        }}
      >
        <AppText muted style={{ flex: 1 }}>
          {t('currencyPosition')}
        </AppText>
        <CurrencyUnitPositionControl
          value={state.unitPosition}
          onChange={(value) => onAction({ type: 'position.select', value })}
        />
      </View>
      {state.rows.map((row, index) => (
        <CurrencyFormatRow
          key={row.key}
          label={row.label}
          value={row.value}
          last={index === state.rows.length - 1}
          onPress={() => onAction({ type: 'open', sheet: row.key })}
        />
      ))}
    </View>
  );
}

/** Presentation only: no routing, data persistence or accounting math. */
export function MainCurrencyScreen({
  state,
  onAction,
}: {
  state: MainCurrencyUiState;
  onAction: (action: MainCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  // Equal side slots keep the title centered while Change uses the shared compact button.
  const sideWidth = theme.buttons.minimumHeight + theme.space.xxxl;
  // Paint the status-bar inset as part of the top bar; keep actions below the OS icons.
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
          onPress={() => onAction({ type: 'back' })}
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
        <AppText variant="section" style={{ flex: 1, textAlign: 'center' }}>
          {t('currencyMain')}
        </AppText>
        <View
          style={{
            width: sideWidth,
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingRight: theme.space.xxs,
          }}
        >
          <ActionButton
            label={t('currencyChange')}
            accessibilityLabel={t('currencyChange')}
            variant="ghost"
            compact
            onPress={() => onAction({ type: 'open', sheet: 'currency' })}
          />
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{
          paddingBottom: theme.space.xxxl,
          gap: theme.space.lg,
        }}
      >
        <View
          style={{
            paddingVertical: theme.space.xxl,
            paddingHorizontal: theme.space.lg,
            alignItems: 'center',
            gap: theme.space.md,
          }}
        >
          <AppText muted>{state.label}</AppText>
          <AppText variant="display">{state.preview}</AppText>
        </View>
        <CurrencySettingsCard state={state} onAction={onAction} />
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
      </ScrollView>
      <MainCurrencyOptionSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

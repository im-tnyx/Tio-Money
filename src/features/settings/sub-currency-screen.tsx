import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';
import { SubCurrencyOptionSheet } from './sub-currency-option-sheet';

function HeaderAction({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: 'plus' | 'pencil';
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        width: theme.buttons.minimumHeight,
        minHeight: theme.buttons.minimumHeight,
        justifyContent: 'center',
        alignItems: 'center',
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
          d={icon === 'plus' ? 'M12 5v14M5 12h14' : 'M12 20h9M16 4l4 4L9 19H5v-4L16 4Z'}
          stroke={active ? theme.colors.brand : theme.colors.primaryText}
          strokeWidth={theme.icons.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Pressable>
  );
}

/** Saved Sub Currency screen, with a separately controlled add-picker sheet. */
export function SubCurrencyScreen({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const sideWidth = theme.buttons.minimumHeight * 2;

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.card }}
    >
      <View
        style={{
          flexDirection: 'row',
          minHeight: theme.navigation.topBarHeight,
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
          {t('currencySub')}
        </AppText>
        <View style={{ width: sideWidth, flexDirection: 'row', justifyContent: 'flex-end' }}>
          {state.selectedLabel ? (
            <HeaderAction
              icon="pencil"
              label={t('currencyEditSub')}
              active={state.editing}
              onPress={() => onAction({ type: 'edit.toggle' })}
            />
          ) : null}
          <HeaderAction
            icon="plus"
            label={t('currencyAddSub')}
            onPress={() => onAction({ type: 'add.open' })}
          />
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{ paddingBottom: theme.space.xxxl, gap: theme.space.md }}
      >
        <View style={{ paddingHorizontal: theme.space.lg, paddingTop: theme.space.lg }}>
          <AppText muted>
            {t('currencyMain')}: {state.mainCode}
          </AppText>
        </View>
        {state.selectedLabel ? (
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
                paddingVertical: theme.space.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
              }}
            >
              <AppText style={{ flex: 1 }}>{state.selectedLabel}</AppText>
              {state.editing ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('currencyRemoveSub')}
                  onPress={() => onAction({ type: 'remove' })}
                  style={{
                    minHeight: theme.buttons.minimumHeight,
                    minWidth: theme.buttons.minimumHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <AppText style={{ color: theme.colors.expense }}>
                    {t('currencyRemoveSub')}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', padding: theme.space.xxl, gap: theme.space.sm }}>
            <AppText>{t('currencyNoSubAdded')}</AppText>
            <AppText muted>{t('currencyTapAddSub')}</AppText>
          </View>
        )}
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <AppText variant="caption" muted>
            {t('currencyNoRates')}
          </AppText>
        </View>
      </ScrollView>
      <SubCurrencyOptionSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

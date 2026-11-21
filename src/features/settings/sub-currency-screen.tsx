import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

/** Full screen presentation: no modal, storage or routing side effects. */
export function SubCurrencyScreen({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const sideWidth = theme.buttons.minimumHeight + theme.space.xxxl;

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
        <View style={{ width: sideWidth }} />
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
        <View
          accessibilityRole="radiogroup"
          style={{
            backgroundColor: theme.colors.card,
            borderTopWidth: theme.navigation.borderWidth,
            borderBottomWidth: theme.navigation.borderWidth,
            borderColor: theme.colors.border,
          }}
        >
          {state.options.map((option, index) => (
            <Pressable
              key={option.key}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: option.selected }}
              onPress={() => onAction({ type: 'select', code: option.code })}
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingVertical: theme.space.md,
                paddingHorizontal: theme.space.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
                borderBottomWidth:
                  index === state.options.length - 1
                    ? theme.navigation.origin
                    : theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText style={{ flex: 1 }}>{option.label}</AppText>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  height: theme.iconRoles.card,
                  width: theme.iconRoles.card,
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
                      height: theme.space.sm,
                      width: theme.space.sm,
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
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <AppText variant="caption" muted>
            {t('currencyNoRates')}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

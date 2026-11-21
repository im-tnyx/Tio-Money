import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import { AppearanceSheet } from './appearance-sheet';
import type { MoreAction, MoreUiState } from './more-contract';

/** Dumb presentation: bottom-sheet visibility and actions belong to the ViewModel. */
export function MoreScreen({
  state,
  onAction,
}: {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.xxxl,
          gap: theme.space.lg,
        }}
      >
        <View style={{ paddingHorizontal: theme.space.lg }}>
          <AppText variant="title">{t('more')}</AppText>
        </View>
        <View style={{ width: '100%', gap: theme.space.sm }}>
          <View style={{ paddingHorizontal: theme.space.lg }}>
            <AppText variant="section">{t('settings')}</AppText>
          </View>
          <Pressable
            onPress={() => onAction({ type: 'appearance.open' })}
            accessibilityRole="button"
            accessibilityLabel={t('appearance')}
            accessibilityHint={t('appearanceHint')}
            accessibilityState={{ expanded: state.appearanceSheetVisible }}
            style={{
              width: '100%',
              minHeight: theme.buttons.minimumHeight,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderTopWidth: theme.navigation.borderWidth,
              borderBottomWidth: theme.navigation.borderWidth,
              borderRadius: theme.navigation.origin,
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.space.sm,
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
                d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2v16a8 8 0 0 1 0-16Z"
                fill={theme.colors.secondaryText}
                fillRule="evenodd"
              />
            </Svg>
            <View style={{ flex: 1 }}>
              <AppText>{t('appearance')}</AppText>
            </View>
            <Svg
              width={theme.iconRoles.card}
              height={theme.iconRoles.card}
              viewBox="0 0 24 24"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Path
                d="m9 18 6-6-6-6"
                stroke={theme.colors.secondaryText}
                strokeWidth={theme.icons.stroke}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </View>
        <View style={{ gap: theme.space.sm }}>
          <View style={{ paddingHorizontal: theme.space.lg }}>
            <AppText variant="section">{t('currency')}</AppText>
          </View>
          <View
            style={{
              width: '100%',
              backgroundColor: theme.colors.card,
              borderTopWidth: theme.navigation.borderWidth,
              borderBottomWidth: theme.navigation.borderWidth,
              borderColor: theme.colors.border,
            }}
          >
            <Pressable
              onPress={() => onAction({ type: 'currency.main.open' })}
              accessibilityRole="button"
              accessibilityLabel={t('currencyMain')}
              accessibilityHint={t('currencyOpenMainHint')}
              style={{
                width: '100%',
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                flexDirection: 'row',
                gap: theme.space.sm,
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText>{t('currencyMain')}</AppText>
                <AppText variant="caption" muted>
                  {state.currency.mainCode}
                </AppText>
              </View>
              <Svg
                width={theme.iconRoles.card}
                height={theme.iconRoles.card}
                viewBox="0 0 24 24"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Path
                  d="m9 18 6-6-6-6"
                  stroke={theme.colors.secondaryText}
                  strokeWidth={theme.icons.stroke}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
            <View
              accessible={false}
              style={{
                marginLeft: theme.space.lg,
                borderBottomWidth: theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            />
            <Pressable
              onPress={() => onAction({ type: 'currency.sub.open' })}
              accessibilityRole="button"
              accessibilityLabel={t('currencySub')}
              accessibilityHint={t('currencyOpenSubHint')}
              style={{
                width: '100%',
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.md,
                flexDirection: 'row',
                gap: theme.space.sm,
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText>{t('currencySub')}</AppText>
                <AppText variant="caption" muted>
                  {state.currency.subCodes.length === 0
                    ? t('currencyNone')
                    : state.currency.subCodes[0] +
                      (state.currency.subCodes.length > 1
                        ? ' +' + (state.currency.subCodes.length - 1)
                        : '')}
                </AppText>
              </View>
              <Svg
                width={theme.iconRoles.card}
                height={theme.iconRoles.card}
                viewBox="0 0 24 24"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Path
                  d="m9 18 6-6-6-6"
                  stroke={theme.colors.secondaryText}
                  strokeWidth={theme.icons.stroke}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </View>
          {state.error && !state.appearanceSheetVisible ? (
            <View accessibilityLiveRegion="polite">
              <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <AppearanceSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

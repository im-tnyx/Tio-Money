import { Fragment } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTopBar } from '@/shared/ui/app-top-bar';

import { AccountGroupsSettingIcon } from './account-groups-setting-icon';
import { AppearanceSheet } from './appearance-sheet';
import type { MoreAction, MoreUiState } from './more-contract';

const accountSettingsRows = [
  { action: 'account.groups.open', label: 'accountGroups', hint: 'accountGroupsHint' },
  { action: 'account.manage.open', label: 'manageAccounts', hint: 'manageAccountsHint' },
] as const;

/** Dumb presentation: bottom-sheet visibility and actions belong to the ViewModel. */
export function MoreScreen({
  state,
  onAction,
}: {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();
  const settingsCardStyle = {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderTopWidth: theme.navigation.borderWidth,
    borderBottomWidth: theme.navigation.borderWidth,
    borderColor: theme.colors.border,
  } as const;
  const settingsDividerStyle = {
    marginLeft: theme.space.lg,
    borderBottomWidth: theme.navigation.borderWidth,
    borderBottomColor: theme.colors.border,
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.card }}
    >
      <AppTopBar title={t('settings')} />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.xxxl,
          gap: theme.space.lg,
        }}
      >
        <View style={{ width: '100%', gap: theme.space.sm }}>
          <View style={{ paddingHorizontal: theme.space.lg }}>
            <AppText variant="section">{t('accountSettings')}</AppText>
          </View>
          <View style={settingsCardStyle}>
            {accountSettingsRows.map(({ action, label, hint }, index) => (
              <Fragment key={action}>
                {index > 0 ? <View accessible={false} style={settingsDividerStyle} /> : null}
                <Pressable
                  onPress={() => onAction({ type: action })}
                  accessibilityRole="button"
                  accessibilityLabel={t(label)}
                  accessibilityHint={t(hint)}
                  style={{
                    width: '100%',
                    minHeight: theme.buttons.minimumHeight,
                    paddingHorizontal: theme.space.lg,
                    paddingVertical: theme.space.md,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: theme.space.sm,
                  }}
                >
                  {action === 'account.groups.open' ? (
                    <AccountGroupsSettingIcon color={theme.colors.secondaryText} />
                  ) : (
                    <Svg
                      width={theme.iconRoles.card}
                      height={theme.iconRoles.card}
                      viewBox="0 0 24 24"
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                    >
                      <Path
                        d="M4 5h16v14H4z M4 10h16 M7 15h5"
                        fill="none"
                        stroke={theme.colors.secondaryText}
                        strokeWidth={theme.icons.stroke}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </Svg>
                  )}
                  <View style={{ flex: 1 }}>
                    <AppText>{t(label)}</AppText>
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
              </Fragment>
            ))}
          </View>
        </View>
        <View style={{ width: '100%', gap: theme.space.sm }}>
          <View style={{ paddingHorizontal: theme.space.lg }}>
            <AppText variant="section">{t('appearance')}</AppText>
          </View>
          <Pressable
            onPress={() => onAction({ type: 'appearance.open' })}
            accessibilityRole="button"
            accessibilityLabel={t('theme')}
            accessibilityHint={t('themeHint')}
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
              <AppText>{t('theme')}</AppText>
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
          <View style={settingsCardStyle}>
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
            <View accessible={false} style={settingsDividerStyle} />
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

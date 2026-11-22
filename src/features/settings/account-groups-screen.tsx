import { ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';
import { AppTopBar } from '@/shared/ui/app-top-bar';

import { BUILT_IN_ACCOUNT_GROUPS } from './account-group-templates';
import type { AccountGroupsAction, AccountGroupsUiState } from './account-groups-contract';

/** Strictly presentational account group catalogue, no routing or preference writes. */
export function AccountGroupsScreen({
  state,
  onAction,
}: {
  readonly state: AccountGroupsUiState;
  readonly onAction: (action: AccountGroupsAction) => void;
}) {
  const theme = useAppTheme();
  const actions = [
    {
      key: 'details',
      icon: state.showDescriptions ? 'eye-off' : 'eye',
      accessibilityLabel: t(state.showDescriptions ? 'accountGroupsHideDescriptions' : 'accountGroupsShowDescriptions'),
      selected: state.showDescriptions,
      disabled: state.storageBlocked,
      onPress: () => onAction({ type: 'descriptions.toggle' }),
    },
    {
      key: 'add',
      icon: 'add',
      accessibilityLabel: t('accountGroupsAdd'),
      disabled: !state.canAdd,
      onPress: () => onAction({ type: 'custom.open' }),
    },
  ] as const;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.card }}
    >
      <AppTopBar
        title={t('accountGroups')}
        onBack={() => onAction({ type: 'back' })}
        backAccessibilityLabel={t('accountGroupsBack')}
        actions={actions}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{
          paddingTop: theme.space.lg,
          paddingBottom: theme.space.xxxl,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderTopWidth: theme.navigation.borderWidth,
            borderBottomWidth: theme.navigation.borderWidth,
            borderColor: theme.colors.border,
          }}
        >
          {BUILT_IN_ACCOUNT_GROUPS.map((group, index) => (
            <View
              key={group.id}
              accessible
              accessibilityLabel={
                t(group.label) + (state.showDescriptions ? '. ' + t(group.detail) : '')
              }
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.sm,
                gap: state.showDescriptions ? theme.space.xxs : theme.navigation.origin,
                borderBottomWidth:
                  index === BUILT_IN_ACCOUNT_GROUPS.length - 1 && state.customGroups.length === 0
                    ? theme.navigation.origin
                    : theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText>{t(group.label)}</AppText>
              {state.showDescriptions ? (
                <AppText variant="caption" muted>
                  {t(group.detail)}
                </AppText>
              ) : null}
            </View>
          ))}
          {state.customGroups.map((group, index) => (
            <View
              key={group.id}
              accessible
              accessibilityLabel={group.name}
              style={{
                minHeight: theme.buttons.minimumHeight,
                paddingHorizontal: theme.space.lg,
                paddingVertical: theme.space.sm,
                borderBottomWidth:
                  index === state.customGroups.length - 1
                    ? theme.navigation.origin
                    : theme.navigation.borderWidth,
                borderBottomColor: theme.colors.border,
              }}
            >
              <AppText>{group.name}</AppText>
            </View>
          ))}
        </View>
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ padding: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
      </ScrollView>
      <AppBottomSheet
        visible={state.addSheetVisible}
        title={t('accountGroupsAdd')}
        dismissAccessibilityLabel={t('accountGroupsCancel')}
        onDismiss={() => onAction({ type: 'custom.dismiss' })}
      >
        <View style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <TextInput
            accessibilityLabel={t('accountGroupsName')}
            value={state.draftName}
            onChangeText={(value) => onAction({ type: 'custom.name', name: value })}
            placeholder={t('accountGroupsNamePlaceholder')}
            placeholderTextColor={theme.colors.secondaryText}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={40}
            style={{
              minHeight: theme.buttons.minimumHeight,
              borderWidth: theme.navigation.borderWidth,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
              color: theme.colors.primaryText,
              backgroundColor: theme.colors.canvas,
              fontSize: theme.typeScale.body,
              paddingHorizontal: theme.space.md,
            }}
          />
          <AppText variant="caption" muted>
            {t('accountGroupsCustomScope')}
          </AppText>
          {state.draftError ? (
            <View accessibilityLiveRegion="polite">
              <AppText style={{ color: theme.colors.expense }}>{state.draftError}</AppText>
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
            <View style={{ flex: 1 }}>
              <ActionButton
                variant="secondary"
                label={t('accountGroupsCancel')}
                onPress={() => onAction({ type: 'custom.dismiss' })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                label={t('accountGroupsSave')}
                onPress={() => onAction({ type: 'custom.save' })}
              />
            </View>
          </View>
        </View>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';
import { AppTextField } from '@/shared/ui/app-text-field';
import { AppTopBar } from '@/shared/ui/app-top-bar';

import { MAX_CUSTOM_GROUP_NAME_LENGTH } from './account-group-preferences';
import { BUILT_IN_ACCOUNT_GROUPS } from './account-group-templates';
import type { AccountGroupsAction, AccountGroupsUiState } from './account-groups-contract';
import type { AccountGroupSwipeController } from './use-account-group-swipe-controller';

/** Presentation-only custom-row gesture wiring; controller owns state and deletion. */
function SwipeableCustomGroupRow({
  id,
  name,
  last,
  swipe,
  disabled,
  onDelete,
  children,
}: {
  id: string;
  name: string;
  last: boolean;
  swipe: AccountGroupSwipeController;
  disabled: boolean;
  onDelete: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const revealWidth = theme.buttons.minimumHeight + theme.space.xxxl;
  const displayedOffset = swipe.offset(id, revealWidth);

  return (
    <View
      onTouchStart={(event) =>
        swipe.begin(id, event.nativeEvent.pageX, event.nativeEvent.pageY, revealWidth)
      }
      onTouchEnd={swipe.end}
      onTouchCancel={swipe.cancel}
      onMoveShouldSetResponderCapture={(event) =>
        swipe.shouldCapture(id, event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      onMoveShouldSetResponder={(event) =>
        swipe.shouldCapture(id, event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      onResponderMove={(event) => swipe.move(id, event.nativeEvent.pageX)}
      onResponderRelease={(event) =>
        swipe.release(id, event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      onResponderTerminate={swipe.cancel}
      style={{
        overflow: 'hidden',
        backgroundColor: theme.colors.card,
        borderBottomWidth: last ? theme.navigation.origin : theme.navigation.borderWidth,
        borderBottomColor: theme.colors.border,
      }}
    >
      {displayedOffset > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('accountGroupsRemove') + ': ' + name}
          disabled={disabled}
          onPress={onDelete}
          style={{
            position: 'absolute',
            top: theme.navigation.origin,
            bottom: theme.navigation.origin,
            right: theme.navigation.origin,
            width: revealWidth,
            minHeight: theme.buttons.minimumHeight,
            backgroundColor: theme.colors.deleteActionBackground,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ color: theme.colors.deleteActionText }}>
            {t('accountGroupsDelete')}
          </AppText>
        </Pressable>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.card,
          transform: [{ translateX: -displayedOffset }],
        }}
      >
        {children}
      </View>
    </View>
  );
}

/** Strictly presentational account group catalogue, no routing or preference writes. */
export function AccountGroupsScreen({
  state,
  onAction,
  swipe,
}: {
  readonly state: AccountGroupsUiState;
  readonly onAction: (action: AccountGroupsAction) => void;
  readonly swipe: AccountGroupSwipeController;
}) {
  const theme = useAppTheme();
  const actions = [
    {
      key: 'details',
      icon: state.showDescriptions ? 'eye' : 'eye-off',
      accessibilityLabel: t(
        state.showDescriptions ? 'accountGroupsHideDescriptions' : 'accountGroupsShowDescriptions',
      ),
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
        onBack={() => {
          if (swipe.openId !== null) swipe.close();
          else onAction({ type: 'back' });
        }}
        backAccessibilityLabel={t('accountGroupsBack')}
        actions={actions}
      />
      <ScrollView
        onScrollBeginDrag={swipe.close}
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: theme.space.xxxl,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderBottomWidth: theme.navigation.borderWidth,
            borderColor: theme.colors.border,
          }}
        >
          {BUILT_IN_ACCOUNT_GROUPS.map((group, index) => (
            <View
              key={group.id}
              onTouchStart={() => {
                if (swipe.openId !== null) swipe.close();
              }}
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
            <SwipeableCustomGroupRow
              key={group.id}
              id={group.id}
              name={group.name}
              last={index === state.customGroups.length - 1}
              swipe={swipe}
              disabled={state.storageBlocked}
              onDelete={() => {
                swipe.close();
                onAction({ type: 'custom.remove', id: group.id });
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={group.name}
                accessibilityHint={t('accountGroupsRename')}
                accessibilityState={{ disabled: state.storageBlocked }}
                disabled={state.storageBlocked}
                accessibilityActions={[
                  { name: 'delete', label: t('accountGroupsRemove') + ': ' + group.name },
                ]}
                onAccessibilityAction={(event) => {
                  if (event.nativeEvent.actionName === 'delete') {
                    swipe.close();
                    onAction({ type: 'custom.remove', id: group.id });
                  }
                }}
                onPress={() => {
                  if (swipe.openId !== null) swipe.close();
                  else onAction({ type: 'custom.edit', id: group.id });
                }}
                style={{
                  minHeight: theme.buttons.minimumHeight,
                  paddingHorizontal: theme.space.lg,
                  paddingVertical: theme.space.sm,
                  justifyContent: 'center',
                }}
              >
                <AppText numberOfLines={1}>{group.name}</AppText>
              </Pressable>
            </SwipeableCustomGroupRow>
          ))}
        </View>
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ padding: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
        {swipe.openId !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('accountGroupsHideDelete')}
            onPress={swipe.close}
            style={{ flexGrow: 1 }}
          />
        ) : null}
      </ScrollView>
      <AppBottomSheet
        visible={state.addSheetVisible}
        avoidKeyboard
        title={t(state.renamingGroupId === null ? 'accountGroupsAdd' : 'accountGroupsRename')}
        dismissAccessibilityLabel={t('accountGroupsCancel')}
        onDismiss={() => onAction({ type: 'custom.dismiss' })}
      >
        <View style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <AppTextField
            accessibilityLabel={t('accountGroupsName')}
            value={state.draftName}
            onChangeText={(value) => onAction({ type: 'custom.name', name: value })}
            placeholder={t('accountGroupsNamePlaceholder')}
            autoCapitalize="words"
            autoCorrect={false}
            multiline={false}
            returnKeyType="done"
            maxLength={MAX_CUSTOM_GROUP_NAME_LENGTH}
            invalid={state.draftError !== null}
          />
          <AppText variant="caption" muted>
            {t('accountGroupsCustomScope')}
          </AppText>
          {state.draftError ? (
            <View accessibilityLiveRegion="polite">
              <AppText style={{ color: theme.colors.expense }}>{state.draftError}</AppText>
            </View>
          ) : null}
          <ActionButton
            label={t('accountGroupsSave')}
            onPress={() => onAction({ type: 'custom.save' })}
          />
        </View>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

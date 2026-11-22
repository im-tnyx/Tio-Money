import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';
import type { CurrencyCode } from '@/shared/currency/currency-preference';
import type { SubCurrencySwipeController } from './use-sub-currency-swipe-controller';
import { SubCurrencyOptionSheet } from './sub-currency-option-sheet';

function HeaderAction({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
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
        opacity: disabled ? theme.buttons.disabledOpacity : theme.buttons.enabledOpacity,
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
          d="M12 5v14M5 12h14"
          stroke={theme.colors.primaryText}
          strokeWidth={theme.icons.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Pressable>
  );
}

/** Horizontal-only swipe; vertical scrolling remains owned by ScrollView. */
/** Presentation-only gesture wiring; the route controller owns swipe state. */
function SwipeableCurrencyRow({
  code,
  last,
  swipe,
  onDelete,
  children,
}: {
  code: CurrencyCode;
  last: boolean;
  swipe: SubCurrencySwipeController;
  onDelete: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const revealWidth = theme.buttons.minimumHeight + theme.space.xxxl;
  const displayedOffset = swipe.offset(code, revealWidth);

  return (
    <View
      onTouchStart={(event) =>
        swipe.begin(code, event.nativeEvent.pageX, event.nativeEvent.pageY, revealWidth)
      }
      onTouchEnd={swipe.end}
      onTouchCancel={swipe.cancel}
      onMoveShouldSetResponderCapture={(event) =>
        swipe.shouldCapture(code, event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      onMoveShouldSetResponder={(event) =>
        swipe.shouldCapture(code, event.nativeEvent.pageX, event.nativeEvent.pageY)
      }
      onResponderMove={(event) => swipe.move(code, event.nativeEvent.pageX)}
      onResponderRelease={(event) =>
        swipe.release(code, event.nativeEvent.pageX, event.nativeEvent.pageY)
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
          accessibilityLabel={t('currencyRemoveSub') + ': ' + code}
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
          <AppText style={{ color: theme.colors.deleteActionText }}>{t('currencyDelete')}</AppText>
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

/** The list lives on the screen; adding a currency is a one-tap sheet action. */
export function SubCurrencyScreen({
  state,
  onAction,
  swipe,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
  swipe: SubCurrencySwipeController;
}) {
  const theme = useAppTheme();
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
          onPress={() => {
            swipe.close();
            onAction({ type: 'back' });
          }}
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
          <HeaderAction
            label={t('currencyAddSub')}
            disabled={!state.canAddSub}
            onPress={() => {
              swipe.close();
              onAction({ type: 'add.open' });
            }}
          />
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: theme.space.xxxl,
          gap: theme.space.lg,
        }}
      >
        <View>
          <View
            style={{
              backgroundColor: theme.colors.card,
              minHeight: theme.buttons.minimumHeight,
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.sm,
              borderBottomWidth: theme.navigation.borderWidth,
              borderBottomColor: theme.colors.border,
            }}
          >
            <AppText muted style={{ flex: 1 }}>
              {t('currencyMain')}
            </AppText>
            <AppText
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{ flex: 1, textAlign: 'right' }}
            >
              {state.mainLabel}
            </AppText>
          </View>
          {state.selected.length > 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderBottomWidth: theme.navigation.borderWidth,
                borderColor: theme.colors.border,
              }}
            >
              {state.selected.map((item, index) => (
                <SwipeableCurrencyRow
                  key={item.code}
                  code={item.code}
                  last={index === state.selected.length - 1}
                  swipe={swipe}
                  onDelete={() => {
                    swipe.close();
                    onAction({ type: 'remove', code: item.code });
                  }}
                >
                  <View
                    style={{
                      minHeight: theme.buttons.minimumHeight + theme.space.xxl,
                      paddingHorizontal: theme.space.lg,
                      paddingVertical: theme.space.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: theme.space.xs,
                    }}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.code + ' ' + t('currencySubDetails')}
                      accessibilityHint={item.label}
                      accessibilityActions={[
                        { name: 'delete', label: t('currencyRemoveSub') + ': ' + item.code },
                      ]}
                      onAccessibilityAction={(event) => {
                        if (event.nativeEvent.actionName === 'delete') {
                          swipe.close();
                          onAction({ type: 'remove', code: item.code });
                        }
                      }}
                      onPress={() => {
                        if (swipe.openCode !== null) swipe.close();
                        else onAction({ type: 'detail.open', code: item.code });
                      }}
                      style={{ flex: 1, gap: theme.space.xxs }}
                    >
                      <AppText numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                        {item.label}
                      </AppText>
                      <AppText
                        variant="caption"
                        muted
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {item.rateLabel}
                      </AppText>
                    </Pressable>
                  </View>
                </SwipeableCurrencyRow>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: theme.space.xxl, gap: theme.space.sm }}>
              <AppText>{t('currencyNoSubAdded')}</AppText>
              <AppText muted>{t('currencyTapAddSub')}</AppText>
            </View>
          )}
          {state.refreshSummary ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
                paddingHorizontal: theme.space.lg,
              }}
            >
              <AppText
                variant="caption"
                muted
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={{ flex: 1 }}
              >
                {state.refreshSummary.lastCheckedLabel}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('currencyFxRefreshPending')}
                accessibilityState={{ disabled: state.refreshSummary.refreshing }}
                disabled={state.refreshSummary.refreshing}
                onPress={() => {
                  if (swipe.openCode !== null) swipe.close();
                  else onAction({ type: 'list.refresh' });
                }}
                style={{
                  minHeight: theme.buttons.minimumHeight,
                  minWidth: theme.buttons.minimumHeight,
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  opacity: state.refreshSummary.refreshing
                    ? theme.buttons.disabledOpacity
                    : theme.buttons.enabledOpacity,
                }}
              >
                <AppText
                  variant="caption"
                  numberOfLines={1}
                  style={{ color: theme.colors.brand, textAlign: 'right' }}
                >
                  {t(
                    state.refreshSummary.refreshing
                      ? 'currencyFxCheckingShort'
                      : 'currencyFxRefreshNow',
                  )}
                </AppText>
              </Pressable>
            </View>
          ) : null}
        </View>
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
        {swipe.openCode !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currencyHideDelete')}
            onPress={() => swipe.close()}
            style={{ flexGrow: 1 }}
          />
        ) : null}
      </ScrollView>
      <SubCurrencyOptionSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

import { useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatReferenceRate } from '@/data/market/fx-reference-rates';
import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';
import { SubCurrencyDetailSheet } from './sub-currency-detail-sheet';
import { SubCurrencyOptionSheet } from './sub-currency-option-sheet';
import { getSwipeOffset, isHorizontalSwipe, snapSwipeOffset } from './sub-currency-swipe';

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

/** Horizontal-only swipe; vertical scrolling remains owned by ScrollView. */
function SwipeableCurrencyRow({
  code,
  editing,
  last,
  isOpen,
  onReveal,
  onClose,
  onDelete,
  children,
}: {
  code: string;
  editing: boolean;
  last: boolean;
  isOpen: boolean;
  onReveal: () => void;
  onClose: () => void;
  onDelete: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const revealWidth = theme.buttons.minimumHeight + theme.space.xxxl;
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const start = useRef({ x: 0, y: 0, offset: 0 });
  // Parent owns reveal state: an outside tap closes the row immediately.
  const displayedOffset = editing ? 0 : (dragOffset ?? (isOpen ? revealWidth : 0));

  return (
    <View
      onTouchStart={(event) => {
        start.current = {
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
          offset: displayedOffset,
        };
      }}
      onMoveShouldSetResponderCapture={(event) =>
        !editing &&
        isHorizontalSwipe(
          event.nativeEvent.pageX - start.current.x,
          event.nativeEvent.pageY - start.current.y,
          theme.bottomSheet.dragActivationDistance,
        )
      }
      onResponderMove={(event) => {
        const dx = event.nativeEvent.pageX - start.current.x;
        setDragOffset(getSwipeOffset(start.current.offset, dx, revealWidth));
      }}
      onResponderRelease={(event) => {
        const dx = event.nativeEvent.pageX - start.current.x;
        const current = getSwipeOffset(start.current.offset, dx, revealWidth);
        setDragOffset(null);
        if (snapSwipeOffset(current, revealWidth) > 0) onReveal();
        else onClose();
      }}
      onResponderTerminate={() => setDragOffset(null)}
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
            backgroundColor: theme.colors.expense,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ color: theme.colors.card }}>{t('currencyDelete')}</AppText>
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
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const theme = useAppTheme();
  const sideWidth = theme.buttons.minimumHeight * 2;
  const [openSwipeCode, setOpenSwipeCode] = useState<string | null>(null);

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
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
          accessibilityLabel={t(state.editing ? 'currencyCancelEdit' : 'currencyPageBack')}
          onPress={() => {
            setOpenSwipeCode(null);
            onAction({ type: state.editing ? 'edit.cancel' : 'back' });
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
              d={state.editing ? 'M18 6 6 18M6 6l12 12' : 'm15 18-6-6 6-6'}
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
          {state.selected.length > 0 ? (
            <HeaderAction
              icon="pencil"
              label={t('currencyEditSub')}
              active={state.editing}
              onPress={() => {
                setOpenSwipeCode(null);
                onAction({ type: 'edit.toggle' });
              }}
            />
          ) : null}
          <HeaderAction
            icon="plus"
            label={t('currencyAddSub')}
            onPress={() => {
              setOpenSwipeCode(null);
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
          gap: theme.space.md,
        }}
      >
        {state.selected.length > 0 ? (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderTopWidth: theme.navigation.borderWidth,
              borderBottomWidth: theme.navigation.borderWidth,
              borderColor: theme.colors.border,
            }}
          >
            {state.selected.map((item, index) => (
              <SwipeableCurrencyRow
                key={item.code}
                code={item.code}
                editing={state.editing}
                last={index === state.selected.length - 1}
                isOpen={openSwipeCode === item.code}
                onReveal={() => setOpenSwipeCode(item.code)}
                onClose={() => setOpenSwipeCode(null)}
                onDelete={() => {
                  setOpenSwipeCode(null);
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
                    gap: theme.space.md,
                  }}
                >
                  {state.editing ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('currencyRemoveSub') + ': ' + item.code}
                      onPress={() => onAction({ type: 'remove', code: item.code })}
                      style={{
                        minHeight: theme.buttons.minimumHeight,
                        minWidth: theme.buttons.minimumHeight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Svg
                        width={theme.space.xxl}
                        height={theme.space.xxl}
                        viewBox="0 0 24 24"
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                      >
                        <Circle cx="12" cy="12" r="11" fill={theme.colors.expense} />
                        <Path
                          d="M7 12h10"
                          stroke={theme.scheme === 'dark' ? theme.colors.canvas : theme.colors.card}
                          strokeWidth={theme.icons.stroke}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </Svg>
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.code + ' ' + t('currencySubDetails')}
                    accessibilityHint={item.label}
                    disabled={state.editing}
                    onPress={() => {
                      if (openSwipeCode !== null) setOpenSwipeCode(null);
                      else onAction({ type: 'detail.open', code: item.code });
                    }}
                    style={{ flex: 1, gap: theme.space.xxs }}
                  >
                    <AppText>{item.label}</AppText>
                    {item.rateStatus === 'available' && item.rate ? (
                      <AppText variant="caption" muted>
                        {formatReferenceRate(item.rate)}
                      </AppText>
                    ) : (
                      <AppText variant="caption" muted>
                        {t(
                          item.rateStatus === 'loading'
                            ? 'currencyFxLoading'
                            : 'currencyFxUnavailable',
                        )}
                      </AppText>
                    )}
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
        {state.error ? (
          <View accessibilityLiveRegion="polite" style={{ paddingHorizontal: theme.space.lg }}>
            <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
          </View>
        ) : null}
        {openSwipeCode !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('currencyHideDelete')}
            onPress={() => setOpenSwipeCode(null)}
            style={{ flexGrow: 1 }}
          />
        ) : (
          <View style={{ flexGrow: 1 }} />
        )}
      </ScrollView>
      <SubCurrencyOptionSheet state={state} onAction={onAction} />
      <SubCurrencyDetailSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}

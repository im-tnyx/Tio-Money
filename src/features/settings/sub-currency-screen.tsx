import { useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatReferenceRate } from '@/data/market/fx-reference-rates';
import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';
import { SubCurrencyDetailSheet } from './sub-currency-detail-sheet';
import { SubCurrencyOptionSheet } from './sub-currency-option-sheet';
import {
  getSwipeOffset,
  isHorizontalSwipe,
  shouldCloseRevealedSwipe,
  snapSwipeOffset,
} from './sub-currency-swipe';

function HeaderAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
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
function SwipeableCurrencyRow({
  code,
  last,
  isOpen,
  onReveal,
  onClose,
  onDelete,
  onCardTouchStart,
  onCardTouchEnd,
  children,
}: {
  code: string;
  last: boolean;
  isOpen: boolean;
  onReveal: () => void;
  onClose: () => void;
  onDelete: () => void;
  onCardTouchStart: () => void;
  onCardTouchEnd: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const revealWidth = theme.buttons.minimumHeight + theme.space.xxxl;
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const start = useRef({ x: 0, y: 0, offset: 0 });
  // Parent owns reveal state: an outside tap closes the row immediately.
  const displayedOffset = dragOffset ?? (isOpen ? revealWidth : 0);

  return (
    <View
      onTouchStart={(event) => {
        onCardTouchStart();
        start.current = {
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
          offset: displayedOffset,
        };
      }}
      onTouchEnd={onCardTouchEnd}
      onTouchCancel={onCardTouchEnd}
      onMoveShouldSetResponderCapture={(event) =>
        isHorizontalSwipe(
          event.nativeEvent.pageX - start.current.x,
          event.nativeEvent.pageY - start.current.y,
          theme.bottomSheet.dragActivationDistance,
        )
      }
      onMoveShouldSetResponder={(event) =>
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
        const dy = event.nativeEvent.pageY - start.current.y;
        const current = getSwipeOffset(start.current.offset, dx, revealWidth);
        setDragOffset(null);
        onCardTouchEnd();
        if (
          shouldCloseRevealedSwipe(
            start.current.offset,
            dx,
            dy,
            theme.bottomSheet.dragActivationDistance,
          )
        ) {
          onClose();
        } else if (snapSwipeOffset(current, revealWidth) > 0) {
          onReveal();
        } else {
          onClose();
        }
      }}
      onResponderTerminate={() => {
        setDragOffset(null);
        onCardTouchEnd();
      }}
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
  onCardTouchStart,
  onCardTouchEnd,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
  onCardTouchStart: () => void;
  onCardTouchEnd: () => void;
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
          accessibilityLabel={t('currencyPageBack')}
          onPress={() => {
            setOpenSwipeCode(null);
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
                last={index === state.selected.length - 1}
                isOpen={openSwipeCode === item.code}
                onReveal={() => setOpenSwipeCode(item.code)}
                onClose={() => setOpenSwipeCode(null)}
                onCardTouchStart={onCardTouchStart}
                onCardTouchEnd={onCardTouchEnd}
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.code + ' ' + t('currencySubDetails')}
                    accessibilityHint={item.label}
                    accessibilityActions={[
                      { name: 'delete', label: t('currencyRemoveSub') + ': ' + item.code },
                    ]}
                    onAccessibilityAction={(event) => {
                      if (event.nativeEvent.actionName === 'delete') {
                        setOpenSwipeCode(null);
                        onAction({ type: 'remove', code: item.code });
                      }
                    }}
                    onPress={() => {
                      if (openSwipeCode !== null) setOpenSwipeCode(null);
                      else onAction({ type: 'detail.open', code: item.code });
                    }}
                    style={{ flex: 1, gap: theme.space.xxs }}
                  >
                    <AppText>{item.label}</AppText>
                    {(item.rateStatus === 'available' || item.rateStatus === 'cached') &&
                    item.rate ? (
                      <AppText variant="caption" muted>
                        {item.rateStatus === 'cached' ? t('currencyFxCached') + ' · ' : ''}
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

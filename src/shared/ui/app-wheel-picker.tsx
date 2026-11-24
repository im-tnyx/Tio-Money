import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';
import { wheelPickerTokens } from '@/shared/theme/component-tokens';

import { AppText } from './app-text';
import { wheelProjectionSamples } from './wheel-projection';
import { shouldAlignWheel } from './wheel-selection';

export interface WheelOption {
  readonly value: number;
  readonly label: string;
}

function projectRow(offset: Animated.Value, index: number, rowHeight: number) {
  const samples = wheelProjectionSamples(index, rowHeight);
  const inputRange = samples.map((sample) => sample.offset);
  const interpolate = (outputRange: number[]) =>
    offset.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
  return {
    opacity: interpolate(samples.map((sample) => sample.opacity)),
    transform: [
      { translateY: interpolate(samples.map((sample) => sample.translateY)) },
      { perspective: wheelPickerTokens.perspective },
      {
        rotateX: offset.interpolate({
          inputRange,
          outputRange: samples.map((sample) => `${sample.rotateX}deg`),
          extrapolate: 'clamp',
        }),
      },
      { scale: interpolate(samples.map((sample) => sample.scale)) },
    ],
  };
}

/** Controlled wheel: one native scroll offset drives the complete drum projection. */
export function AppWheelPicker({
  label,
  options,
  value,
  onChange,
  rowHeight,
  visibleRows,
  flex = 1,
}: {
  readonly label: string;
  readonly options: readonly WheelOption[];
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly rowHeight: number;
  readonly visibleRows: number;
  readonly flex?: number;
}) {
  const reduceMotion = useReducedMotion();
  const scroll = useRef<ComponentRef<typeof Animated.ScrollView>>(null);
  const selected = Math.max(0, options.findIndex((option) => option.value === value));
  const lastIndex = useRef(selected);
  const interacting = useRef(false);
  const didLayout = useRef(false);
  const pendingEchoes = useRef(new Set<number>());
  const selection = useRef({ options, onChange });
  const [initialOffset] = useState(() => ({ x: 0, y: selected * rowHeight }));
  const [offset] = useState(() => new Animated.Value(selected * rowHeight));
  const padding = ((visibleRows - 1) / 2) * rowHeight;

  useLayoutEffect(() => {
    selection.current = { options, onChange };
  }, [options, onChange]);

  const projections = useMemo(
    () =>
      reduceMotion
        ? []
        : Array.from({ length: options.length }, (_, index) =>
            projectRow(offset, index, rowHeight),
          ),
    [offset, options.length, reduceMotion, rowHeight],
  );

  const select = useCallback((index: number) => {
    const { options, onChange } = selection.current;
    const next = Math.min(options.length - 1, Math.max(0, index));
    const option = options[next];
    if (!option || next === lastIndex.current) return;
    pendingEchoes.current.add(next);
    lastIndex.current = next;
    onChange(option.value);
  }, []);

  const selectFromScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      select(Math.round(event.nativeEvent.contentOffset.y / rowHeight));
    },
    [rowHeight, select],
  );

  // The listener only emits integer selection changes. It never updates the animation value.
  // Native scroll and native transforms use the same event on Android/iOS.
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: offset } } }], {
        useNativeDriver: Platform.OS !== 'web',
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          if (interacting.current || (Platform.OS === 'web' && didLayout.current)) {
            selectFromScroll(event);
          }
        },
      }),
    [offset, selectFromScroll],
  );

  useEffect(() => {
    const echoed = pendingEchoes.current.delete(selected);
    if (selected === lastIndex.current) {
      pendingEchoes.current.clear();
      return;
    }
    if (!shouldAlignWheel(selected, lastIndex.current, interacting.current, echoed)) return;
    pendingEchoes.current.clear();
    lastIndex.current = selected;
    offset.setValue(selected * rowHeight);
    scroll.current?.scrollTo({ y: selected * rowHeight, animated: false });
  }, [offset, selected, rowHeight]);

  function selectAndAlign(index: number) {
    interacting.current = false;
    const next = Math.min(options.length - 1, Math.max(0, index));
    select(next);
    offset.setValue(next * rowHeight);
    scroll.current?.scrollTo({ y: next * rowHeight, animated: false });
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: options[selected]?.label }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'increment') selectAndAlign(selected + 1);
        if (nativeEvent.actionName === 'decrement') selectAndAlign(selected - 1);
      }}
      style={{ flex, minWidth: '0%', height: rowHeight * visibleRows, overflow: 'hidden' }}
    >
      <Animated.ScrollView
        ref={scroll}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        showsVerticalScrollIndicator={false}
        snapToInterval={rowHeight}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        contentOffset={initialOffset}
        removeClippedSubviews={false}
        onLayout={() => {
          if (didLayout.current) return;
          didLayout.current = true;
          if (!interacting.current) {
            scroll.current?.scrollTo({ y: lastIndex.current * rowHeight, animated: false });
          }
        }}
        onScrollBeginDrag={() => {
          interacting.current = true;
        }}
        onScroll={onScroll}
        onScrollEndDrag={(event) => {
          selectFromScroll(event);
          interacting.current = false;
        }}
        onMomentumScrollBegin={() => {
          interacting.current = true;
        }}
        onMomentumScrollEnd={(event) => {
          selectFromScroll(event);
          interacting.current = false;
        }}
        contentContainerStyle={{ paddingVertical: padding }}
      >
        {options.map((option, index) => (
          <Animated.View
            key={option.value}
            style={[{ height: rowHeight }, projections[index]]}
          >
            <Pressable
              accessible={false}
              onPress={() => selectAndAlign(index)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <AppText
                variant="section"
                muted={reduceMotion && option.value !== value}
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ includeFontPadding: false }}
              >
                {option.label}
              </AppText>
            </Pressable>
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

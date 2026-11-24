import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';
import { wheelPickerTokens } from '@/shared/theme/component-tokens';

import { AppText } from './app-text';
import { wheelProjectionSamples } from './wheel-projection';

export interface WheelOption {
  readonly value: number;
  readonly label: string;
}

/** Controlled wheel. Refs track native scroll mechanics only. */
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
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const selected = Math.max(0, options.findIndex((option) => option.value === value));
  const lastIndex = useRef(selected);
  const dragging = useRef(false);
  const [initialOffset] = useState(() => ({ x: 0, y: selected * rowHeight }));
  // Animation nodes are presentation-only; the controlled value remains in the ViewModel.
  const [offset] = useState(() => new Animated.Value(selected * rowHeight));
  const projections = useMemo(() => {
    if (reduceMotion) return [];
    return Array.from({ length: options.length }, (_, index) => {
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
    });
  }, [offset, options.length, reduceMotion, rowHeight]);
  const padding = ((visibleRows - 1) / 2) * rowHeight;

  useEffect(() => {
    if (lastIndex.current !== selected) {
      dragging.current = false;
      lastIndex.current = selected;
      offset.setValue(selected * rowHeight);
      scroll.current?.scrollTo({ y: selected * rowHeight, animated: false });
    }
  }, [offset, selected, rowHeight]);

  function select(index: number) {
    const next = Math.min(options.length - 1, Math.max(0, index));
    const option = options[next];
    if (option && next !== lastIndex.current) {
      lastIndex.current = next;
      onChange(option.value);
    }
  }

  function updateFromScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    select(Math.round(event.nativeEvent.contentOffset.y / rowHeight));
  }

  function selectAndAlign(index: number) {
    dragging.current = false;
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
      <ScrollView
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
          if (!dragging.current) {
            offset.setValue(lastIndex.current * rowHeight);
            scroll.current?.scrollTo({ y: lastIndex.current * rowHeight, animated: false });
          }
        }}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onScroll={(event) => {
          offset.setValue(event.nativeEvent.contentOffset.y);
          if (dragging.current || Platform.OS === 'web') updateFromScroll(event);
        }}
        onScrollEndDrag={(event) => {
          if (dragging.current) updateFromScroll(event);
        }}
        onMomentumScrollEnd={(event) => {
          offset.setValue(event.nativeEvent.contentOffset.y);
          if (dragging.current) updateFromScroll(event);
          dragging.current = false;
        }}
        contentContainerStyle={{ paddingVertical: padding }}
      >
        {options.map((option, index) => (
          <Animated.View key={option.value} style={[{ height: rowHeight }, projections[index]]}>
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
      </ScrollView>
    </View>
  );
}

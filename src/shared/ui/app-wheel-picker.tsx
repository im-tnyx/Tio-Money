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
import { shouldAlignWheel, shouldAnimateWheelAlignment } from './wheel-selection';

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

function WheelRow({
  offset,
  index,
  rowHeight,
  reduceMotion,
  selected,
  label,
  onPress,
}: {
  readonly offset: Animated.Value;
  readonly index: number;
  readonly rowHeight: number;
  readonly reduceMotion: boolean;
  readonly selected: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const projection = useMemo(
    () => (reduceMotion ? undefined : projectRow(offset, index, rowHeight)),
    [offset, index, rowHeight, reduceMotion],
  );

  return (
    <Animated.View style={[{ height: rowHeight }, projection]}>
      <Pressable
        accessible={false}
        onPress={onPress}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <AppText
          variant="section"
          muted={reduceMotion && !selected}
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ includeFontPadding: false }}
        >
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

/** Controlled, virtualized drum. Values are absolute detent indices, not display labels. */
export function AppWheelPicker({
  label,
  count,
  labelAt,
  value,
  onChange,
  rowHeight,
  visibleRows,
  flex = 1,
}: {
  readonly label: string;
  readonly count: number;
  readonly labelAt: (index: number) => string;
  readonly value: number;
  readonly onChange: (index: number) => void;
  readonly rowHeight: number;
  readonly visibleRows: number;
  readonly flex?: number;
}) {
  const reduceMotion = useReducedMotion();
  const scroll = useRef<ComponentRef<typeof Animated.FlatList>>(null);
  const selected = Math.min(count - 1, Math.max(0, value));
  const lastIndex = useRef(selected);
  const interacting = useRef(false);
  const programmaticTarget = useRef<number | null>(null);
  const didLayout = useRef(false);
  const pendingEchoes = useRef(new Set<number>());
  const selection = useRef({ count, onChange });
  const [initialIndex] = useState(selected);
  const [offset] = useState(() => new Animated.Value(selected * rowHeight));
  const spacerRows = (visibleRows - 1) / 2;
  // Explicit spacer rows keep getItemLayout and initialScrollIndex exact. The
  // virtual list mounts only a small window, even for the entire civil-day range.
  const items = useMemo(
    () => Array.from({ length: count + spacerRows * 2 }, (_, index) => index - spacerRows),
    [count, spacerRows],
  );

  useLayoutEffect(() => {
    selection.current = { count, onChange };
  }, [count, onChange]);

  const select = useCallback((index: number) => {
    const { count, onChange } = selection.current;
    const next = Math.min(count - 1, Math.max(0, index));
    if (next === lastIndex.current) return;
    pendingEchoes.current.add(next);
    lastIndex.current = next;
    onChange(next);
  }, []);

  const selectFromScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      select(Math.round(event.nativeEvent.contentOffset.y / rowHeight));
    },
    [rowHeight, select],
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: offset } } }], {
        useNativeDriver: Platform.OS !== 'web',
      }),
    [offset],
  );

  useEffect(() => {
    const subscription = offset.addListener(({ value }) => {
      const target = programmaticTarget.current;
      if (target !== null) {
        // Web has no reliable native momentum lifecycle. Release the guard only
        // at the destination; native gestures explicitly take ownership below.
        if (Platform.OS === 'web' && Math.abs(value - target * rowHeight) < 0.5) {
          programmaticTarget.current = null;
        }
        return;
      }
      if (interacting.current || (Platform.OS === 'web' && didLayout.current)) {
        select(Math.round(value / rowHeight));
      }
    });
    return () => offset.removeListener(subscription);
  }, [offset, rowHeight, select]);

  useEffect(() => {
    const echoed = pendingEchoes.current.delete(selected);
    if (selected === lastIndex.current) {
      pendingEchoes.current.clear();
      return;
    }
    if (!shouldAlignWheel(selected, lastIndex.current, interacting.current, echoed)) return;
    pendingEchoes.current.clear();
    const animated = shouldAnimateWheelAlignment(lastIndex.current, selected, reduceMotion);
    lastIndex.current = selected;
    programmaticTarget.current = selected;
    interacting.current = false;
    // Do not pre-set the animation node for an animated native scroll. Doing
    // so would rotate the rows before the native content actually moves.
    if (!animated) offset.setValue(selected * rowHeight);
    scroll.current?.scrollToOffset({ offset: selected * rowHeight, animated });
  }, [offset, selected, rowHeight, reduceMotion]);

  function selectAndAlign(index: number) {
    interacting.current = false;
    const next = Math.min(count - 1, Math.max(0, index));
    programmaticTarget.current = next;
    select(next);
    offset.setValue(next * rowHeight);
    scroll.current?.scrollToOffset({ offset: next * rowHeight, animated: false });
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: labelAt(selected) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'increment') selectAndAlign(selected + 1);
        if (nativeEvent.actionName === 'decrement') selectAndAlign(selected - 1);
      }}
      style={{ flex, minWidth: '0%', height: rowHeight * visibleRows, overflow: 'hidden' }}
    >
      <Animated.FlatList
        ref={scroll}
        data={items}
        extraData={selected}
        keyExtractor={(item) => String(item)}
        getItemLayout={(_, index) => ({
          length: rowHeight,
          offset: index * rowHeight,
          index,
        })}
        initialScrollIndex={initialIndex}
        initialNumToRender={visibleRows * 3}
        maxToRenderPerBatch={visibleRows * 3}
        windowSize={5}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        showsVerticalScrollIndicator={false}
        snapToInterval={rowHeight}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        onLayout={() => {
          didLayout.current = true;
        }}
        onScrollBeginDrag={() => {
          programmaticTarget.current = null;
          pendingEchoes.current.clear();
          interacting.current = true;
        }}
        onScroll={onScroll}
        onScrollEndDrag={(event) => {
          if (programmaticTarget.current === null) selectFromScroll(event);
          interacting.current = false;
        }}
        onMomentumScrollBegin={() => {
          if (programmaticTarget.current === null) interacting.current = true;
        }}
        onMomentumScrollEnd={(event) => {
          if (programmaticTarget.current === null && interacting.current) selectFromScroll(event);
          interacting.current = false;
        }}
        renderItem={({ item }) => {
          if (typeof item !== 'number' || item < 0 || item >= count) {
            return <View style={{ height: rowHeight }} />;
          }
          return (
            <WheelRow
              offset={offset}
              index={item}
              rowHeight={rowHeight}
              reduceMotion={reduceMotion}
              selected={item === selected}
              label={labelAt(item)}
              onPress={() => selectAndAlign(item)}
            />
          );
        }}
      />
    </View>
  );
}

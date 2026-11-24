import { useEffect, useRef, type ComponentRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

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
  const theme = useAppTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const selected = Math.max(0, options.findIndex((option) => option.value === value));
  const lastIndex = useRef(selected);
  const dragging = useRef(false);
  const initialOffset = useRef({ x: 0, y: selected * rowHeight });
  const padding = ((visibleRows - 1) / 2) * rowHeight;

  useEffect(() => {
    if (lastIndex.current !== selected) {
      dragging.current = false;
      lastIndex.current = selected;
      scroll.current?.scrollTo({ y: selected * rowHeight, animated: false });
    }
  }, [selected, rowHeight]);

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
      style={{ flex, minWidth: '0%', height: rowHeight * visibleRows }}
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
        contentOffset={initialOffset.current}
        onLayout={() => {
          if (!dragging.current) {
            scroll.current?.scrollTo({ y: lastIndex.current * rowHeight, animated: false });
          }
        }}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onScroll={(event) => {
          if (dragging.current || Platform.OS === 'web') updateFromScroll(event);
        }}
        onScrollEndDrag={(event) => {
          if (dragging.current) updateFromScroll(event);
        }}
        onMomentumScrollEnd={(event) => {
          if (dragging.current) updateFromScroll(event);
          dragging.current = false;
        }}
        contentContainerStyle={{ paddingVertical: padding }}
      >
        {options.map((option, index) => (
          <Pressable
            key={option.value}
            accessible={false}
            onPress={() => selectAndAlign(index)}
            style={{ height: rowHeight, alignItems: 'center', justifyContent: 'center' }}
          >
            <AppText
              variant="section"
              muted={option.value !== value}
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ includeFontPadding: false }}
            >
              {option.label}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

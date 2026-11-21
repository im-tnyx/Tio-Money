import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

/**
 * Reusable, props-only segmented selector.
 * The caller owns selection and persistence; visual roles come from the shared theme.
 */
export function AppSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  compact?: boolean;
}) {
  const theme = useAppTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={{
        flexDirection: 'row',
        width: compact ? theme.segmentedControl.compactWidth : undefined,
        padding: theme.segmentedControl.inset,
        borderRadius: theme.segmentedControl.radius,
        backgroundColor: theme.colors.segmentedTrack,
      }}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            hitSlop={
              compact
                ? {
                    top: theme.segmentedControl.compactHitSlop,
                    bottom: theme.segmentedControl.compactHitSlop,
                  }
                : undefined
            }
            style={{
              flex: 1,
              minHeight: compact
                ? theme.segmentedControl.compactOptionHeight
                : theme.segmentedControl.minimumOptionHeight,
              borderRadius: theme.segmentedControl.radius,
              backgroundColor: selected ? theme.colors.brand : theme.colors.segmentedTrack,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <AppText
              style={{
                color: selected ? theme.colors.brandText : theme.colors.segmentedText,
              }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

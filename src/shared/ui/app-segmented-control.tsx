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

/**
 * Button-action sibling of AppSegmentedControl.
 * Shares the same compact pill geometry, surfaces, typography and 48dp hit targets.
 * Actions must remain buttons rather than radios: minus/plus do not select a value.
 */
export function AppSegmentedActionControl({
  actions,
}: {
  actions: readonly {
    key: string;
    label: string;
    text: string;
    disabled: boolean;
    onPress: () => void;
  }[];
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        width: theme.segmentedControl.compactWidth,
        padding: theme.segmentedControl.inset,
        borderRadius: theme.segmentedControl.radius,
        backgroundColor: theme.colors.segmentedTrack,
      }}
    >
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ disabled: action.disabled }}
          disabled={action.disabled}
          onPress={action.onPress}
          hitSlop={{
            top: theme.segmentedControl.compactHitSlop,
            bottom: theme.segmentedControl.compactHitSlop,
          }}
          style={{
            flex: 1,
            minHeight: theme.segmentedControl.compactOptionHeight,
            borderRadius: theme.segmentedControl.radius,
            backgroundColor: theme.colors.segmentedSelected,
            opacity: action.disabled ? theme.buttons.disabledOpacity : theme.buttons.enabledOpacity,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <AppText style={{ color: theme.colors.segmentedSelectedText }}>{action.text}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  compact = false,
  size = 'default',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  compact?: boolean;
  size?: 'default' | 'small';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const backgroundColor = isPrimary
    ? theme.colors.brand
    : variant === 'secondary'
      ? theme.colors.elevated
      : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        // The accessible target stays 48dp across visual sizes.
        minHeight: theme.buttons.minimumHeight,
        justifyContent: 'center',
        opacity: isDisabled
          ? theme.buttons.disabledOpacity
          : pressed
            ? theme.buttons.pressedOpacity
            : theme.buttons.enabledOpacity,
      })}
    >
      <View
        style={{
          minHeight:
            size === 'small' ? theme.buttons.smallActionHeight : theme.buttons.actionHeight,
          paddingHorizontal: compact ? theme.space.sm : theme.space.lg,
          borderRadius: theme.radius.sm,
          backgroundColor,
          borderWidth:
            variant === 'secondary' ? theme.buttons.outlineWidth : theme.buttons.noBorder,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator
            color={isPrimary ? theme.colors.brandText : theme.colors.primaryText}
          />
        ) : (
          <Text
            style={{
              color: isPrimary ? theme.colors.brandText : theme.colors.primaryText,
              fontSize: theme.typeScale.body,
              fontWeight: theme.typography.boldWeight,
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

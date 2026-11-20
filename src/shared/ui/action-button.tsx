import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
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
        minHeight: theme.buttons.minimumHeight,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        borderRadius: theme.radius.sm,
        backgroundColor,
        borderWidth: variant === 'secondary' ? theme.buttons.outlineWidth : theme.buttons.noBorder,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled
          ? theme.buttons.disabledOpacity
          : pressed
            ? theme.buttons.pressedOpacity
            : theme.buttons.enabledOpacity,
      })}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.brandText : theme.colors.primaryText} />
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
    </Pressable>
  );
}

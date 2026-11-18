import { TextInput, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  error,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.xs }}>
      <AppText variant="body">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        editable={!disabled}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondaryText}
        keyboardType={keyboardType}
        style={{
          minHeight: 48,
          paddingHorizontal: theme.space.md,
          paddingVertical: theme.space.sm,
          backgroundColor: theme.colors.elevated,
          borderRadius: theme.radius.sm,
          borderWidth: 1,
          borderColor: error ? theme.colors.expense : theme.colors.border,
          color: theme.colors.primaryText,
          fontSize: theme.typeScale.body,
        }}
      />
      {error ? (
        <AppText variant="caption" style={{ color: theme.colors.expense }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

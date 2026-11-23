import { TextInput, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

export type AppTextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  readonly appearance?: 'outlined' | 'borderless';
  readonly invalid?: boolean;
};

/** Shared theme-owned input chrome. Content/validation stays in caller's ViewModel. */
export function AppTextField({
  appearance = 'outlined',
  invalid = false,
  ...props
}: AppTextFieldProps) {
  const theme = useAppTheme();
  const borderless = appearance === 'borderless';
  const minHeight = theme.textField.minimumHeight[appearance];
  const growsWithText = borderless && props.multiline;
  const lineHeight = Math.ceil(theme.typeScale.body * theme.typography.relativeLineHeight);

  return (
    <TextInput
      {...props}
      placeholderTextColor={theme.colors.secondaryText}
      underlineColorAndroid={borderless ? 'transparent' : props.underlineColorAndroid}
      style={{
        minHeight,
        borderWidth: borderless ? 0 : theme.navigation.borderWidth,
        borderColor: invalid ? theme.colors.expense : theme.colors.border,
        borderRadius: theme.radius.sm,
        color: theme.colors.primaryText,
        backgroundColor: theme.colors.canvas,
        fontSize: theme.typeScale.body,
        lineHeight: growsWithText ? lineHeight : undefined,
        includeFontPadding: growsWithText ? false : undefined,
        // Align the initial height with single-line fields. Native wrapping adds height.
        paddingVertical: growsWithText ? (minHeight - lineHeight) / 2 : undefined,
        // Center single-line Android input; leave multiline editing top aligned.
        textAlignVertical: props.multiline ? 'top' : 'center',
        paddingHorizontal: borderless ? 0 : theme.space.md,
      }}
    />
  );
}

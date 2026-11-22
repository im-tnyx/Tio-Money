import { TextInput, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

export type AppTextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  readonly invalid?: boolean;
};

/** Shared theme-owned input chrome. Content/validation stays in caller's ViewModel. */
export function AppTextField({ invalid = false, ...props }: AppTextFieldProps) {
  const theme = useAppTheme();

  return (
    <TextInput
      {...props}
      placeholderTextColor={theme.colors.secondaryText}
      style={{
        minHeight: theme.buttons.minimumHeight,
        borderWidth: theme.navigation.borderWidth,
        borderColor: invalid ? theme.colors.expense : theme.colors.border,
        borderRadius: theme.radius.sm,
        color: theme.colors.primaryText,
        backgroundColor: theme.colors.canvas,
        fontSize: theme.typeScale.body,
        paddingHorizontal: theme.space.md,
      }}
    />
  );
}

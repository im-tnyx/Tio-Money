import { useContext, useEffect, useRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { KeyboardFormFocusContext } from './keyboard-form-focus';

export type AppTextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  readonly appearance?: 'outlined' | 'borderless';
  readonly invalid?: boolean;
  readonly textSize?: 'body' | 'section' | 'title';
};

/** Shared theme-owned input chrome. Content/validation stays in caller's ViewModel. */
export function AppTextField({
  appearance = 'outlined',
  invalid = false,
  textSize = 'body',
  ...props
}: AppTextFieldProps) {
  const theme = useAppTheme();
  const focusBridge = useContext(KeyboardFormFocusContext);
  const input = useRef<TextInput>(null);
  const borderless = appearance === 'borderless';
  const minHeight = theme.textField.minimumHeight;
  const growsWithText = borderless && props.multiline;
  const fontSize = theme.typeScale[textSize];
  const lineHeight = Math.ceil(fontSize * theme.typography.relativeLineHeight);

  useEffect(() => {
    const node = input.current;
    return () => {
      if (node) focusBridge?.blur(node);
    };
  }, [focusBridge]);

  return (
    <TextInput
      {...props}
      ref={input}
      onFocus={(event) => {
        if (input.current) focusBridge?.focus(input.current);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        if (input.current) focusBridge?.blur(input.current);
        props.onBlur?.(event);
      }}
      onContentSizeChange={(event) => {
        if (input.current && props.multiline) focusBridge?.resize(input.current);
        props.onContentSizeChange?.(event);
      }}
      placeholderTextColor={borderless ? theme.colors.inputPlaceholder : theme.colors.secondaryText}
      underlineColorAndroid={borderless ? 'transparent' : props.underlineColorAndroid}
      style={{
        minHeight,
        borderWidth: borderless ? 0 : theme.navigation.borderWidth,
        borderColor: invalid ? theme.colors.expense : theme.colors.border,
        borderRadius: theme.radius.sm,
        color: theme.colors.primaryText,
        backgroundColor: borderless ? 'transparent' : theme.colors.canvas,
        fontSize,
        fontWeight: textSize === 'title' ? theme.typography.mediumWeight : undefined,
        lineHeight: growsWithText ? lineHeight : undefined,
        includeFontPadding: borderless ? false : undefined,
        // Align the initial height with single-line fields. Native wrapping adds height.
        paddingVertical: growsWithText ? (minHeight - lineHeight) / 2 : undefined,
        // Center single-line Android input; leave multiline editing top aligned.
        textAlignVertical: props.multiline ? 'top' : 'center',
        paddingHorizontal: borderless ? 0 : theme.space.md,
      }}
    />
  );
}

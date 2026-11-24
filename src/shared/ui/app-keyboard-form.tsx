import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import type { TextInput } from 'react-native';

import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { focusedFieldScrollOffset } from './keyboard-form-geometry';
import { KeyboardFormFocusContext } from './keyboard-form-focus';

/** Shared form viewport. Native layout and focus are presentation state only. */
export function AppKeyboardForm({ children }: { readonly children: ReactNode }) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const viewport = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const focused = useRef<TextInput | null>(null);
  const offset = useRef(0);
  const frame = useRef<number | null>(null);
  const generation = useRef(0);
  const gap = theme.space.sm;

  const cancelReveal = useCallback(() => {
    generation.current += 1;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const reveal = useCallback(() => {
    cancelReveal();
    const input = focused.current;
    if (!input) return;
    const request = generation.current;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      viewport.current?.measureInWindow((_x, y, _width, height) => {
        input.measureInWindow((_inputX, inputY, _inputWidth, inputHeight) => {
          if (request !== generation.current || focused.current !== input) return;
          const next = focusedFieldScrollOffset(
            { y: inputY, height: inputHeight },
            { y, height },
            offset.current,
            gap,
          );
          if (Math.abs(next - offset.current) > 1) {
            scroll.current?.scrollTo({ y: next, animated: !reduceMotion });
          }
        });
      });
    });
  }, [cancelReveal, gap, reduceMotion]);

  const focusBridge = useMemo(
    () => ({
      focus(input: TextInput) {
        focused.current = input;
        reveal();
      },
      blur(input: TextInput) {
        if (focused.current !== input) return;
        focused.current = null;
        cancelReveal();
      },
      resize(input: TextInput) {
        if (focused.current === input) reveal();
      },
    }),
    [cancelReveal, reveal],
  );

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', reveal);
    const change = Keyboard.addListener('keyboardDidChangeFrame', reveal);
    const hide = Keyboard.addListener('keyboardDidHide', cancelReveal);
    return () => {
      show.remove();
      change.remove();
      hide.remove();
      cancelReveal();
    };
  }, [cancelReveal, reveal]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
    >
      <View ref={viewport} collapsable={false} style={{ flex: 1 }} onLayout={reveal}>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={false}
          contentContainerStyle={{ padding: theme.space.md, gap: theme.space.sm }}
          scrollEventThrottle={16}
          onScroll={({ nativeEvent }) => {
            offset.current = nativeEvent.contentOffset.y;
          }}
          onContentSizeChange={reveal}
        >
          <KeyboardFormFocusContext.Provider value={focusBridge}>
            {children}
          </KeyboardFormFocusContext.Provider>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

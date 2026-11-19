import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

type Variant = 'caption' | 'body' | 'section' | 'title' | 'display';

export function AppText({
  children,
  variant = 'body',
  muted = false,
  style,
}: {
  children: ReactNode;
  variant?: Variant;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const theme = useAppTheme();
  return (
    <Text
      style={[
        {
          fontSize: theme.typeScale[variant],
          lineHeight: Math.ceil(theme.typeScale[variant] * theme.typography.relativeLineHeight),
          fontWeight:
            variant === 'body' || variant === 'caption'
              ? theme.typography.regularWeight
              : theme.typography.boldWeight,
          color: muted ? theme.colors.secondaryText : theme.colors.primaryText,
          flexShrink: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

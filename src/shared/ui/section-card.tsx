import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

export function SectionCard({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        borderRadius: theme.radius.lg,
        borderColor: theme.colors.border,
        borderWidth: 1,
        padding: theme.space.lg,
        backgroundColor: theme.colors.card,
        gap: theme.space.sm,
      }}
    >
      {children}
    </View>
  );
}

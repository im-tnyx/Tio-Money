import { View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

/**
 * Phase 0 intentionally shows no content or top app bar.
 * The five-tab shell and floating Add action are rendered by the parent layout.
 * Keep the themed canvas non-focusable; do not imply a finance feature exists.
 */
export function BlankScreen() {
  const theme = useAppTheme();

  return (
    <View testID="empty-phase0-screen" style={{ flex: 1, backgroundColor: theme.colors.canvas }} />
  );
}

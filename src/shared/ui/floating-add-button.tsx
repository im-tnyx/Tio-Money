import { Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_ADD_SIZE, getFloatingAddPosition } from '@/shared/navigation/fab-layout';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

/**
 * Visual-only Phase 0 FAB. No onPress, route or financial action exists.
 * It stays above the rightmost More tab, inside the full-screen hit-test area.
 */
export function FloatingAddButton() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { right, bottom } = getFloatingAddPosition({
    windowWidth: width,
    leftInset: insets.left,
    rightInset: insets.right,
    bottomInset: insets.bottom,
    horizontalPadding: theme.space.xs,
    topPadding: theme.space.xs,
    floatingGap: theme.space.sm,
  });

  return (
    <Pressable
      disabled
      accessibilityLabel="Add transaction (unavailable)"
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      style={{
        position: 'absolute',
        right,
        bottom,
        zIndex: 20,
        elevation: 6,
        width: FLOATING_ADD_SIZE,
        height: FLOATING_ADD_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.brand,
        shadowColor: '#000000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
      }}
    >
      <AppText style={{ fontSize: 30, fontWeight: '400', color: theme.colors.brandText }}>
        +
      </AppText>
    </Pressable>
  );
}

import { Pressable, View } from 'react-native';

import { useFloatingAddPosition } from '@/shared/navigation/use-floating-add-position';
import { useAppTheme } from '@/shared/theme/theme-provider';

/**
 * Visual-only Phase 0 FAB. No onPress, route or financial action exists.
 * It stays above the rightmost More tab, inside the full-screen hit-test area.
 */
export function FloatingAddButton() {
  const theme = useAppTheme();
  const { right, bottom } = useFloatingAddPosition();

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
        zIndex: theme.shadows.fab.zIndex,
        elevation: theme.shadows.fab.elevation,
        width: theme.navigation.fabDiameter,
        height: theme.navigation.fabDiameter,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.brand,
        shadowColor: theme.colors.shadow,
        shadowOpacity: theme.shadows.fab.opacity,
        shadowRadius: theme.shadows.fab.radius,
        shadowOffset: { width: theme.navigation.origin, height: theme.shadows.fab.offsetY },
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ width: theme.navigation.fabMarkSize, height: theme.navigation.fabMarkSize }}
      >
        <View
          style={{
            position: 'absolute',
            left: theme.navigation.fabMarkOffset - theme.navigation.fabMarkOffset,
            top: theme.navigation.fabMarkOffset,
            width: theme.navigation.fabMarkSize,
            height: theme.navigation.fabMarkStroke,
            borderRadius: theme.navigation.borderWidth,
            backgroundColor: theme.colors.brandText,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: theme.navigation.fabMarkOffset,
            top: theme.navigation.fabMarkOffset - theme.navigation.fabMarkOffset,
            width: theme.navigation.fabMarkStroke,
            height: theme.navigation.fabMarkSize,
            borderRadius: 1,
            backgroundColor: theme.colors.brandText,
          }}
        />
      </View>
    </Pressable>
  );
}

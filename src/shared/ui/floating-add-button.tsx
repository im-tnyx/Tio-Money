import { Pressable, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useFloatingAddPosition } from '@/shared/navigation/use-floating-add-position';
import { useAppTheme } from '@/shared/theme/theme-provider';

/**
 * Official Google Material Symbols Outlined "add" at weight 200.
 * This literal matches shared/assets/google-material-icons/add.svg exactly.
 */
const ADD_SYMBOL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M460-460H240v-40h220v-220h40v220h220v40H500v220h-40v-220Z"/></svg>';

/**
 * Visual-only Phase 0 FAB. No onPress, route or financial action exists.
 * It stays above the rightmost More tab, inside the full-screen hit-test area.
 */
export function FloatingAddButton() {
  const theme = useAppTheme();
  const { right, bottom } = useFloatingAddPosition();
  const addXml = ADD_SYMBOL_SVG.replace('<svg ', `<svg fill="${theme.colors.brandText}" `);

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
        <SvgXml
          xml={addXml}
          width={theme.navigation.fabMarkSize}
          height={theme.navigation.fabMarkSize}
        />
      </View>
    </Pressable>
  );
}

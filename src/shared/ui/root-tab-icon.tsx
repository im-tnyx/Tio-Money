import { Image, View } from 'react-native';

import type { RootTabIconName } from '@/shared/navigation/root-destinations';
import { iconTokens } from '@/shared/theme/component-tokens';

/**
 * Genuine Google Material Icons Outlined, bundled locally as 1x/2x PNGs.
 * React Native Image supplies theme tint; no native icon package or font is needed.
 * The tab Pressable owns its accessible label and selection state.
 */
const MATERIAL_OUTLINED_ICONS = {
  home: require('../assets/google-material-icons/home.png'),
  transactions: require('../assets/google-material-icons/transactions.png'),
  statistics: require('../assets/google-material-icons/statistics.png'),
  accounts: require('../assets/google-material-icons/accounts.png'),
  more: require('../assets/google-material-icons/more.png'),
} as const satisfies Record<RootTabIconName, number>;

export function RootTabIcon({ name, color }: { name: RootTabIconName; color: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: iconTokens.size, height: iconTokens.size }}
    >
      <Image
        accessible={false}
        source={MATERIAL_OUTLINED_ICONS[name]}
        resizeMode="contain"
        style={{ width: iconTokens.size, height: iconTokens.size, tintColor: color }}
      />
    </View>
  );
}

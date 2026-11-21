import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import navIconSvg from '@/shared/assets/google-material-icons/root-tab-icon-svg.json';
import type { RootTabIconName } from '@/shared/navigation/root-destinations';
import { iconTokens, navigationTokens } from '@/shared/theme/component-tokens';

/** Genuine Google Material Symbols Outlined SVGs: selected 300, unselected 200. */
export function RootTabIcon({
  name,
  color,
  selected,
}: {
  name: RootTabIconName;
  color: string;
  selected: boolean;
}) {
  const weight = selected
    ? navigationTokens.selectedIconWeight
    : navigationTokens.unselectedIconWeight;
  const xml = useMemo(
    () => navIconSvg[name][weight].replace('<svg ', `<svg fill="${color}" `),
    [name, color, weight],
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: iconTokens.size, height: iconTokens.size }}
    >
      <SvgXml xml={xml} width={iconTokens.size} height={iconTokens.size} />
    </View>
  );
}

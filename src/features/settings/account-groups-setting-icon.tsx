import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import settingsAccountGroupsSvg from '@/shared/assets/google-material-icons/settings-account-groups-icon.json';
import { iconRoleSizes } from '@/shared/theme/component-tokens';

/** Authentic Material Symbols Outlined home_storage wght200; Settings row ONLY. */
export function AccountGroupsSettingIcon({ color }: { readonly color: string }) {
  const xml = useMemo(
    () => settingsAccountGroupsSvg.replace('<svg ', `<svg fill="${color}" `),
    [color],
  );
  const size = iconRoleSizes.card;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}

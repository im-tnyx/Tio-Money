import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { AppearancePreference } from '@/shared/theme/appearance-preference';
import { iconRoleSizes } from '@/shared/theme/component-tokens';

import appearanceOptionSvg from './appearance-option-svg.json';

/** Official Material Symbols Outlined 200-weight SVGs bundled as local data. */
const MATERIAL_APPEARANCE_SVG: Record<AppearancePreference, string> = appearanceOptionSvg;

interface AppearanceOptionIconProps {
  readonly name: AppearancePreference;
  readonly color: string;
}

/** Stateless SVG presentation. The parent option owns radio selection. */
export function AppearanceOptionIcon({ name, color }: AppearanceOptionIconProps) {
  const xml = useMemo(
    () => MATERIAL_APPEARANCE_SVG[name].replace('<svg ', `<svg fill="${color}" `),
    [name, color],
  );

  const size = iconRoleSizes.bottomSheet;
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

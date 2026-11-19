import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { RootTabIconName } from '@/shared/navigation/root-destinations';
import { iconTokens } from '@/shared/theme/component-tokens';

/**
 * Genuine Google Material Symbols Outlined SVG paths, all weight 200.
 * Each literal matches its official weight-200, 24px SVG in shared/assets/google-material-icons.
 * No Metro SVG transformer or platform-dependent icon font is required.
 * The containing Pressable owns the accessible label and selected state.
 */
const MATERIAL_OUTLINED_SVG = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-200h147.69v-235.38h184.62V-200H720v-360L480-741.54 240-560v360Zm-40 40v-420l280-211.54L760-580v420H532.31v-235.38H427.69V-160H200Zm280-310.77Z"/></svg>',
  transactions:
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M304.62-120q-43.39 0-74-30.62-30.62-30.61-30.62-74V-720q0-50.31 34.85-85.15Q269.69-840 320-840h440v550.77q-26.54 0-45.58 19.04t-19.04 45.57q0 26.54 19.04 45.58T760-160v40H304.62ZM240-305.46q13.23-11.62 29.38-17.69 16.16-6.08 35.24-6.08h30.76V-800H320q-32.69 0-56.35 23.65Q240-752.69 240-720v414.54Zm135.38-23.77H720V-800H375.38v470.77ZM240-305.46v-479.16 479.16ZM304.62-160h374.53q-11.38-13.23-17.57-29.27-6.2-16.04-6.2-35.35 0-18.3 6.08-34.84 6.08-16.54 17.69-29.77H304.62q-27.54 0-46.08 19.04T240-224.62q0 27.54 18.54 46.08T304.62-160Z"/></svg>',
  statistics:
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-40h720v40H120Zm40-110.77V-480h80v209.23h-80Zm186.15 0V-680h80v409.23h-80Zm186.93 0V-560h80v289.23h-80Zm186.92 0V-800h80v529.23h-80Z"/></svg>',
  accounts:
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M260-280v-320h40v320h-40Zm200 0v-320h40v320h-40ZM141.54-160v-40h676.92v40H141.54ZM660-280v-320h40v320h-40ZM141.54-680v-33.85L480-875.38l338.46 161.53V-680H141.54Zm105.69-40h465.54-465.54Zm0 0h465.54L480-830 247.23-720Z"/></svg>',
  more: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M258.46-440q-16.5 0-28.25-11.75T218.46-480q0-16.5 11.75-28.25T258.46-520q16.5 0 28.25 11.75T298.46-480q0 16.5-11.75 28.25T258.46-440ZM480-440q-16.5 0-28.25-11.75T440-480q0-16.5 11.75-28.25T480-520q16.5 0 28.25 11.75T520-480q0 16.5-11.75 28.25T480-440Zm221.54 0q-16.5 0-28.25-11.75T661.54-480q0-16.5 11.75-28.25T701.54-520q16.5 0 28.25 11.75T741.54-480q0 16.5-11.75 28.25T701.54-440Z"/></svg>',
} as const satisfies Record<RootTabIconName, string>;

export function RootTabIcon({ name, color }: { name: RootTabIconName; color: string }) {
  const xml = useMemo(
    () => MATERIAL_OUTLINED_SVG[name].replace('<svg ', `<svg fill="${color}" `),
    [name, color],
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

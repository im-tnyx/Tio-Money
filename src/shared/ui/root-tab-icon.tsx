import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { RootTabIconName } from '@/shared/navigation/root-destinations';
import { iconTokens, navigationTokens } from '@/shared/theme/component-tokens';

/**
 * Genuine Google Material Symbols Outlined SVGs, 24px optical size.
 * Selected artwork is default weight 400; unselected is weight 200.
 * The containing tab Pressable owns accessibility, navigation and selected state.
 */
type TabIconWeight =
  | typeof navigationTokens.unselectedIconWeight
  | typeof navigationTokens.selectedIconWeight;

const MATERIAL_OUTLINED_SVG = {
  home: {
    [navigationTokens.unselectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-200h147.69v-235.38h184.62V-200H720v-360L480-741.54 240-560v360Zm-40 40v-420l280-211.54L760-580v420H532.31v-235.38H427.69V-160H200Zm280-310.77Z"/></svg>',
    [navigationTokens.selectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>',
  },
  transactions: {
    [navigationTokens.unselectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M304.62-120q-43.39 0-74-30.62-30.62-30.61-30.62-74V-720q0-50.31 34.85-85.15Q269.69-840 320-840h440v550.77q-26.54 0-45.58 19.04t-19.04 45.57q0 26.54 19.04 45.58T760-160v40H304.62ZM240-305.46q13.23-11.62 29.38-17.69 16.16-6.08 35.24-6.08h30.76V-800H320q-32.69 0-56.35 23.65Q240-752.69 240-720v414.54Zm135.38-23.77H720V-800H375.38v470.77ZM240-305.46v-479.16 479.16ZM304.62-160h374.53q-11.38-13.23-17.57-29.27-6.2-16.04-6.2-35.35 0-18.3 6.08-34.84 6.08-16.54 17.69-29.77H304.62q-27.54 0-46.08 19.04T240-224.62q0 27.54 18.54 46.08T304.62-160Z"/></svg>',
    [navigationTokens.selectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M300-80q-58 0-99-41t-41-99v-520q0-58 41-99t99-41h500v600q-25 0-42.5 17.5T740-220q0 25 17.5 42.5T800-160v80H300Zm-60-267q14-7 29-10t31-3h20v-440h-20q-25 0-42.5 17.5T240-740v393Zm160-13h320v-440H400v440Zm-160 13v-453 453Zm60 187h373q-6-14-9.5-28.5T660-220q0-16 3-31t10-29H300q-26 0-43 17.5T240-220q0 26 17 43t43 17Z"/></svg>',
  },
  statistics: {
    [navigationTokens.unselectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-160v-40h720v40H120Zm40-110.77V-480h80v209.23h-80Zm186.15 0V-680h80v409.23h-80Zm186.93 0V-560h80v289.23h-80Zm186.92 0V-800h80v529.23h-80Z"/></svg>',
    [navigationTokens.selectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M80-120v-80h800v80H80Zm40-120v-280h120v280H120Zm200 0v-480h120v480H320Zm200 0v-360h120v360H520Zm200 0v-600h120v600H720Z"/></svg>',
  },
  accounts: {
    [navigationTokens.unselectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M260-280v-320h40v320h-40Zm200 0v-320h40v320h-40ZM141.54-160v-40h676.92v40H141.54ZM660-280v-320h40v320h-40ZM141.54-680v-33.85L480-875.38l338.46 161.53V-680H141.54Zm105.69-40h465.54-465.54Zm0 0h465.54L480-830 247.23-720Z"/></svg>',
    [navigationTokens.selectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-280v-280h80v280h-80Zm240 0v-280h80v280h-80ZM80-120v-80h800v80H80Zm600-160v-280h80v280h-80ZM80-640v-80l400-200 400 200v80H80Zm178-80h444-444Zm0 0h444L480-830 258-720Z"/></svg>',
  },
  more: {
    [navigationTokens.unselectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M258.46-440q-16.5 0-28.25-11.75T218.46-480q0-16.5 11.75-28.25T258.46-520q16.5 0 28.25 11.75T298.46-480q0 16.5-11.75 28.25T258.46-440ZM480-440q-16.5 0-28.25-11.75T440-480q0-16.5 11.75-28.25T480-520q16.5 0 28.25 11.75T520-480q0 16.5-11.75 28.25T480-440Zm221.54 0q-16.5 0-28.25-11.75T661.54-480q0-16.5 11.75-28.25T701.54-520q16.5 0 28.25 11.75T741.54-480q0 16.5-11.75 28.25T701.54-440Z"/></svg>',
    [navigationTokens.selectedIconWeight]:
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>',
  },
} as const satisfies Record<RootTabIconName, Record<TabIconWeight, string>>;

export function RootTabIcon({
  name,
  color,
  selected,
}: {
  name: RootTabIconName;
  color: string;
  selected: boolean;
}) {
  const weight = selected ? navigationTokens.selectedIconWeight : navigationTokens.unselectedIconWeight;
  const xml = useMemo(
    () => MATERIAL_OUTLINED_SVG[name][weight].replace('<svg ', `<svg fill="${color}" `),
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

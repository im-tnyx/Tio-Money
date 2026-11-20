import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import type { AppearancePreference } from '@/shared/theme/appearance-preference';
import { iconRoleSizes } from '@/shared/theme/component-tokens';

/** Official Google Material Symbols Outlined 24px SVGs, weight 200. */
const MATERIAL_APPEARANCE_SVG = {
  system: "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 -960 960 960\" width=\"24\"><path d=\"M409.85-409.85q-38.16-38.15-68.5-81.61-30.35-43.46-53.12-92.46-14.23 24-20.73 50.04Q261-507.85 261-480q0 91.34 63.83 155.17Q388.66-261 480-261q27.08 0 53.88-7 26.81-7 50.04-20.23-49-22.77-92.46-53.12-43.46-30.34-81.61-68.5Zm28.53-27.53q47.16 47.15 104.77 82.5 57.62 35.34 122.7 56.88-36.16 37.15-84.16 57.58Q533.69-220 481-220q-108.64 0-184.32-75.68Q221-371.36 221-480q0-52.69 20.42-100.69 20.43-48 57.58-84.16 21.54 65.08 56.88 122.7 35.35 57.61 82.5 104.77Zm283.08 56.61q-10.09-2.74-19.93-6.02-9.84-3.29-19.61-6.67 8.77-20.31 13.43-42.27 4.65-21.96 4.65-43.99 0-91.42-64.43-155.85Q571.14-700 479.72-700q-22.03 0-43.99 4.27t-42.27 13.04q-3.38-9.77-6.24-18.94-2.85-9.18-5.45-18.83Q405-730.23 430-735.12q25-4.88 51-4.88 108.64 0 184.32 75.68Q741-588.64 741-480q0 26-4.88 51-4.89 25-14.66 48.23ZM460-829.23v-95.39h40v95.39h-40Zm0 793.85v-95.39h40v95.39h-40Zm281.46-677.54-28.54-28.54L778.69-807l28.54 28.31-65.77 65.77ZM181.31-153l-28.54-28.31 65.77-65.77 28.54 28.54L181.31-153Zm647.92-307v-40h95.39v40h-95.39Zm-793.85 0v-40h95.39v40H35.38Zm743.31 307.23-65.77-65.77 28.54-28.54L807-181.31l-28.31 28.54ZM218.54-712.92 153-778.69l28.31-28.54 65.77 65.77-28.54 28.54Zm191.31 303.07Z\"/></svg>",
  light: "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 -960 960 960\" width=\"24\"><path d=\"M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 40q-66.85 0-113.42-46.58Q320-413.15 320-480t46.58-113.42Q413.15-640 480-640t113.42 46.58Q640-546.85 640-480t-46.58 113.42Q546.85-320 480-320ZM200-460H60v-40h140v40Zm700 0H760v-40h140v40ZM460-760v-140h40v140h-40Zm0 700v-140h40v140h-40ZM269.85-663.85l-86.39-83.92 27.77-29.77 84.46 85.39-25.84 28.3Zm478.92 481.39-84.69-85.62 26.07-28.07 86.39 83.92-27.77 29.77Zm-84.92-507.69 83.92-86.39 29.77 27.77-85.39 84.46-28.3-25.84ZM182.46-211.23l85.62-84.69 26.54 26.07-83.16 87.16-29-28.54ZM480-480Z\"/></svg>",
  dark: "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 -960 960 960\" width=\"24\"><path d=\"M482.31-160q-133.34 0-226.67-93.33-93.33-93.34-93.33-226.67 0-121.54 79.23-210.77t196.15-105.38q3.23 0 6.35.23 3.11.23 6.11.69-20.23 28.23-32.03 62.81-11.81 34.57-11.81 72.42 0 106.67 74.66 181.33Q555.64-404 662.31-404q38.07 0 72.54-11.81 34.46-11.81 61.92-32.04.46 3 .69 6.12.23 3.11.23 6.35-15.38 116.92-104.61 196.15T482.31-160Zm0-40q88 0 158-48.5t102-126.5q-20 5-40 8t-40 3q-123 0-209.5-86.5T366.31-660q0-20 3-40t8-40q-78 32-126.5 102t-48.5 158q0 116 82 198t198 82Zm-10-270Z\"/></svg>",
} as const satisfies Record<AppearancePreference, string>;

/** Pure presentation; the parent radio row owns selection and accessibility. */
export function AppearanceOptionIcon({
  preference,
  color,
}: {
  preference: AppearancePreference;
  color: string;
}) {
  const xml = MATERIAL_APPEARANCE_SVG[preference].replace('<svg ', `<svg fill="${color}" `);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: iconRoleSizes.bottomSheet, height: iconRoleSizes.bottomSheet }}
    >
      <SvgXml xml={xml} width={iconRoleSizes.bottomSheet} height={iconRoleSizes.bottomSheet} />
    </View>
  );
}

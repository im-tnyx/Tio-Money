import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/shared/theme/theme-provider';

import type { PreviewGroup } from './account-form-contract';

const marks = {
  cash: 'M3 6h18v12H3z M3 10c2 0 4-2 4-4 M21 14c-2 0-4 2-4 4 M13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  bank: 'M3 9h18L12 4 3 9z M5 13v4 M10 13v4 M14 13v4 M19 13v4 M3 20h18',
  'credit-card': 'M3 6h18v12H3z M3 10h18 M6 15h5',
  wallet: 'M3 5h15v3 M3 5v14h18V8H3 M21 11h-6v5h6 M17 13.5h.01',
  loan: 'M4 8h16 M16 4l4 4-4 4 M20 16H4 M8 12l-4 4 4 4',
  investment: 'M4 20h16 M7 17v-4 M12 17V9 M17 17V5',
  insurance: 'M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6z M8 12l3 3 5-6',
} as const;

export function AccountGroupIcon({ group }: { readonly group: PreviewGroup | 'insurance' }) {
  const theme = useAppTheme();
  return (
    <Svg
      width={theme.iconRoles.bottomSheet}
      height={theme.iconRoles.bottomSheet}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={marks[group]}
        fill="none"
        stroke={theme.colors.secondaryText}
        strokeWidth={theme.icons.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

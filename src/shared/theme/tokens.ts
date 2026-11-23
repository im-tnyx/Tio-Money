import { size } from './primitives';

const lightBrand = '#6049CF';
const darkBrand = '#A99BFF';

/** Owner-approved existing UI scale: names are stable reusable roles. */
export type ColorScheme = 'light' | 'dark';

export const space = {
  xxs: size.dp4,
  xs: size.dp8,
  sm: size.dp12,
  md: size.dp16,
  lg: size.dp20,
  xl: size.dp24,
  xxl: size.dp32,
  xxxl: size.dp40,
} as const;

export const radius = {
  xs: size.dp8,
  sm: size.dp12,
  md: size.dp16,
  lg: size.dp20,
  xl: size.dp24,
  pill: size.dp100,
} as const;

export const typeScale = {
  caption: size.dp13,
  body: size.dp16,
  section: size.dp18,
  title: size.dp26,
  display: size.dp34,
} as const;

export const typographyTokens = {
  navLabelSize: size.dp11,
  relativeLineHeight: 1.35,
  regularWeight: '400',
  mediumWeight: '500',
  boldWeight: '700',
} as const;

/** Semantic colors are resolved by theme mode, never copied into screens. */
const light = {
  canvas: '#F7F8FC',
  card: '#FFFFFF',
  elevated: '#F0F2F8',
  primaryText: '#172033',
  secondaryText: '#5B6578',
  inputPlaceholder: '#657184',
  border: '#E1E6EE',
  segmentedTrack: '#E6E8EF',
  segmentedSelected: '#FFFFFF',
  segmentedText: '#172033',
  segmentedSelectedText: '#172033',
  brand: lightBrand,
  brandTint: lightBrand + '29',
  brandText: '#FFFFFF',
  shadow: '#000000',
  income: '#147D66',
  expense: '#BC4055',
  deleteActionBackground: '#BC4055',
  deleteActionText: '#FFFFFF',
  transfer: '#446A9C',
  warning: '#93611E',
};

const dark = {
  canvas: '#0C1018',
  card: '#181F2B',
  elevated: '#242D3B',
  primaryText: '#F6F8FC',
  secondaryText: '#B6C0D0',
  inputPlaceholder: '#818DA0',
  border: '#374254',
  segmentedTrack: '#272A31',
  segmentedSelected: '#62666F',
  segmentedText: '#F6F8FC',
  segmentedSelectedText: '#FFFFFF',
  brand: darkBrand,
  brandTint: darkBrand + '29',
  brandText: '#0C1018',
  shadow: '#000000',
  income: '#5DE0B0',
  expense: '#FF8D9C',
  deleteActionBackground: '#A52F4A',
  deleteActionText: '#FFFFFF',
  transfer: '#9AC6FF',
  warning: '#FFC77A',
};

export type ThemeColors = typeof light;
export const palettes: Record<ColorScheme, ThemeColors> = { light, dark };

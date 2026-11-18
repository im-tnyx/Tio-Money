/** Proposed mobile tokens from Document 03; contrast and owner review remain open. */
export type ColorScheme = 'light' | 'dark';

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = { xs: 8, sm: 12, md: 16, lg: 20, pill: 100 } as const;

export const typeScale = {
  caption: 13,
  body: 16,
  section: 18,
  title: 26,
  display: 34,
} as const;

const light = {
  canvas: '#F7F8FC',
  card: '#FFFFFF',
  elevated: '#F0F2F8',
  primaryText: '#172033',
  secondaryText: '#5B6578',
  border: '#E1E6EE',
  brand: '#6049CF',
  brandText: '#FFFFFF',
  income: '#147D66',
  expense: '#BC4055',
  transfer: '#446A9C',
  warning: '#93611E',
};

const dark = {
  canvas: '#0C1018',
  card: '#181F2B',
  elevated: '#242D3B',
  primaryText: '#F6F8FC',
  secondaryText: '#B6C0D0',
  border: '#374254',
  brand: '#A99BFF',
  brandText: '#0C1018',
  income: '#5DE0B0',
  expense: '#FF8D9C',
  transfer: '#9AC6FF',
  warning: '#FFC77A',
};

export type ThemeColors = typeof light;
export const palettes: Record<ColorScheme, ThemeColors> = { light, dark };

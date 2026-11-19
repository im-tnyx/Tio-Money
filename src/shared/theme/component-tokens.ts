import { opacity, size } from './primitives';

/**
 * One canonical default icon dimension for current navigation and shared UI.
 * Future components (top bars, buttons, sheets, cards and text fields) reuse
 * the same role unless a separately approved distinct semantic role is needed.
 */
export const iconTokens = {
  size: size.dp24,
  origin: size.dp0,
  stroke: size.dp2,
  fineStroke: size.dp1_5,
  roofRotation: '45deg',
} as const;

/** Canonical glyph geometry used by the five native-drawn tab icons. */
export const tabIconShapes = {
  transactionRows: [size.dp4, size.dp10, size.dp16],
  statisticBars: [
    { left: size.dp3, height: size.dp8 },
    { left: size.dp10, height: size.dp14 },
    { left: size.dp17, height: size.dp19 },
  ],
  moreDots: [size.dp3, size.dp10, size.dp17],
} as const;

export const iconRoleSizes = {
  navigation: iconTokens.size,
  topBar: iconTokens.size,
  button: iconTokens.size,
  bottomSheet: iconTokens.size,
  card: iconTokens.size,
  textField: iconTokens.size,
} as const;

/** Safe-area padding remains dynamic; these values own fixed UI geometry. */
export const navigationTokens = {
  origin: size.dp0,
  itemHeight: size.dp56,
  borderWidth: size.dp1,
  iconLabelGap: size.dp5,
  labelFontSize: size.dp11,
  horizontalPadding: size.dp8,
  topPadding: size.dp8,
  minimumBottomPadding: size.dp8,
  fabGap: size.dp12,
  fabDiameter: size.dp56,
  fabMarkSize: iconTokens.size,
  fabMarkOffset: size.dp11,
  fabMarkStroke: iconTokens.stroke,
} as const;

export const buttonTokens = {
  minimumHeight: size.dp48,
  outlineWidth: size.dp1,
  disabledOpacity: opacity.disabled,
  pressedOpacity: opacity.pressed,
} as const;

export const shadowTokens = {
  fab: {
    elevation: size.dp6,
    zIndex: size.dp20,
    opacity: opacity.fabShadow,
    radius: size.dp10,
    offsetY: size.dp5,
  },
} as const;

export const recoveryTokens = {
  messageLineHeight: size.dp24,
} as const;

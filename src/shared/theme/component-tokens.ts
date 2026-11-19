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
  itemHeight: size.dp48,
  borderWidth: size.dp1,
  iconLabelGap: size.dp1,
  labelFontSize: size.dp11,
  horizontalPadding: size.dp8,
  topPadding: size.dp1,
  minimumBottomPadding: size.dp0,
  fabGap: size.dp12,
  fabDiameter: size.dp50,
  fabMarkSize: iconTokens.size,
} as const;

export const buttonTokens = {
  minimumHeight: size.dp48,
  noBorder: size.dp0,
  enabledOpacity: opacity.enabled,
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

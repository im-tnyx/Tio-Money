import { motion, opacity, size } from './primitives';
import { radius, space } from './tokens';

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
  topBarHeight: size.dp50,
  itemHeight: size.dp48,
  borderWidth: size.dp1,
  iconLabelGap: size.dp0,
  labelFontSize: size.dp11,
  selectedIconWeight: 300,
  unselectedIconWeight: 200,
  tabCrossfadeDurationMs: motion.tabCrossfadeDurationMs,
  horizontalPadding: size.dp8,
  topPadding: size.dp1,
  minimumBottomPadding: size.dp0,
  fabGap: size.dp16,
  fabDiameter: size.dp50,
  fabMarkSize: iconTokens.size,
} as const;

export const buttonTokens = {
  /** Painted ActionButton surface; independent of its accessible touch region. */
  actionHeight: size.dp42,
  minimumHeight: size.dp48,
  noBorder: size.dp0,
  enabledOpacity: opacity.enabled,
  outlineWidth: size.dp1,
  disabledOpacity: opacity.disabled,
  pressedOpacity: opacity.pressed,
} as const;

/** Rounded segmented selectors use the shared button touch size and existing spacing scale. */
export const segmentedControlTokens = {
  minimumOptionHeight: buttonTokens.minimumHeight,
  compactWidth: size.dp100 + size.dp20,
  compactOptionHeight: size.dp24,
  compactHitSlop: size.dp12,
  inset: space.xxs,
  radius: radius.pill,
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

/** Shared native bottom-sheet geometry. No individual feature may override the shell. */
export const bottomSheetTokens = {
  topCornerRadius: radius.xl,
  collapsedViewportFraction: 0.9,
  expandedViewportFraction: 0.96,
  topSafeGap: space.sm,
  handleTouchHeight: buttonTokens.minimumHeight,
  handleTouchWidth: size.dp100 + space.lg,
  dragActivationDistance: size.dp8,
  dragSnapDistance: size.dp32,
  contentBottomPadding: space.xl,
  backdropOpacity: opacity.bottomSheetBackdrop,
  handleWidth: space.xxxl,
  handleHeight: space.xxs,
  handleRadius: radius.pill,
  handleTopMargin: space.xs,
  handleBottomMargin: navigationTokens.origin,
  headerMinHeight: buttonTokens.minimumHeight,
  headerHorizontalPadding: space.lg,
  headerDividerWidth: navigationTokens.borderWidth,
} as const;

import { motion, opacity, size } from './primitives';
import { radius, space } from './tokens';

/**
 * One canonical default icon dimension for current navigation and shared UI.
 * Future components (top bars, buttons, sheets, cards and text fields) reuse
 * the same role unless a separately approved distinct semantic role is needed.
 */
export const iconTokens = {
  size: size.dp24,
  emptyStateSize: size.dp48,
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
  editorActionDiameter: size.dp36,
  editorActionIconSize: size.dp20,
  itemHeight: size.dp48,
  borderWidth: size.dp1,
  iconLabelGap: size.dp0,
  labelFontSize: size.dp11,
  selectedIconWeight: 300,
  unselectedIconWeight: 200,
  tabCrossfadeDurationMs: motion.tabCrossfadeDurationMs,
  detailFadeDurationMs: motion.tabCrossfadeDurationMs,
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
  smallActionHeight: size.dp32,
  smallActionIconSize: size.dp18,
  currencyChoiceSize: size.dp36,
  minimumHeight: size.dp48,
  noBorder: size.dp0,
  enabledOpacity: opacity.enabled,
  outlineWidth: size.dp1,
  disabledOpacity: opacity.disabled,
  pressedOpacity: opacity.pressed,
} as const;

export const textFieldTokens = {
  minimumHeight: size.dp46,
  captionGap: size.dp0,
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

export const optionPopupTokens = {
  chevronDurationMs: motion.tabCrossfadeDurationMs,
  width: size.dp100 + size.dp100 + space.xxxl,
  radius: radius.xl,
  elevation: size.dp6,
  shadowRadius: size.dp10,
  shadowOffsetY: size.dp5,
  shadowOpacity: opacity.fabShadow,
} as const;

/** Cylindrical projection roles for reusable scrolling wheels. */
export const wheelPickerTokens = {
  anglePerRow: 22,
  maximumAngle: 84,
  fadeDistance: 4,
  sampleStep: 0.25,
  fadePower: 1.35,
  perspective: size.dp100 * 6,
} as const;

export const datePickerTokens = {
  width: size.dp100 * 3 + space.md,
  rowHeight: size.dp32,
  paddingHorizontal: space.xs,
  paddingVertical: size.dp6,
  visibleRows: 5,
  compactRows: 3,
  minimumRows: 1,
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

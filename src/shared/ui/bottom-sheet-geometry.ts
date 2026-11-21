/**
 * Pure height math for the shared sheet. Pixel distances are derived from
 * measured modal height, safe-area insets and centrally owned theme tokens.
 */
export interface BottomSheetGeometry {
  readonly collapsedViewportFraction: number;
  readonly expandedViewportFraction: number;
  readonly topSafeGap: number;
}

export function getBottomSheetHeightLimits(
  viewportHeight: number,
  topInset: number,
  geometry: BottomSheetGeometry,
): { collapsedMax: number; expandedMax: number } {
  const available = Math.max(0, viewportHeight - Math.max(0, topInset) - geometry.topSafeGap);
  const expandedMax = Math.min(available, viewportHeight * geometry.expandedViewportFraction);
  const collapsedMax = Math.min(expandedMax, viewportHeight * geometry.collapsedViewportFraction);
  return { collapsedMax, expandedMax };
}

export function getDraggedBottomSheetHeight(
  startHeight: number,
  dy: number,
  collapsedMax: number,
  expandedMax: number,
): number {
  const minHeight = Math.min(startHeight, collapsedMax);
  return Math.max(minHeight, Math.min(expandedMax, startHeight - dy));
}

export function shouldExpandBottomSheet(
  currentlyExpanded: boolean,
  dy: number,
  snapDistance: number,
): boolean {
  if (dy <= -snapDistance) return true;
  if (dy >= snapDistance) return false;
  return currentlyExpanded;
}

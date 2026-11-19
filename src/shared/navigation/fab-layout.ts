import { ROOT_DESTINATIONS } from './root-destinations';

/** Shared geometry keeps the Add FAB centered over the final More tab. */
export const NAV_ITEM_HEIGHT = 56;
export const FLOATING_ADD_SIZE = 56;
export const NAV_BORDER_WIDTH = 1;

export type FabPositionInput = {
  windowWidth: number;
  leftInset: number;
  rightInset: number;
  bottomInset: number;
  horizontalPadding: number;
  topPadding: number;
  floatingGap: number;
};

export function getFloatingAddPosition({
  windowWidth,
  leftInset,
  rightInset,
  bottomInset,
  horizontalPadding,
  topPadding,
  floatingGap,
}: FabPositionInput): { right: number; bottom: number } {
  const leftPadding = Math.max(leftInset, horizontalPadding);
  const rightPadding = Math.max(rightInset, horizontalPadding);
  const tabWidth =
    Math.max(0, windowWidth - leftPadding - rightPadding) / ROOT_DESTINATIONS.length;

  return {
    // More is the fifth tab; align the FAB center to its center, not to a fixed margin.
    right: Math.max(horizontalPadding, rightPadding + (tabWidth - FLOATING_ADD_SIZE) / 2),
    // Keep the whole button above the bar, including bottom safe-area padding.
    bottom:
      NAV_BORDER_WIDTH +
      topPadding +
      NAV_ITEM_HEIGHT +
      Math.max(bottomInset, horizontalPadding) +
      floatingGap,
  };
}

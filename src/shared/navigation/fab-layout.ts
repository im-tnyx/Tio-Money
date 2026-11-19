import { navigationTokens } from '@/shared/theme/component-tokens';

import { ROOT_DESTINATIONS } from './root-destinations';

/** Shared geometry keeps the Add FAB centered over the final More tab. */
export const NAV_ITEM_HEIGHT = navigationTokens.itemHeight;
export const FLOATING_ADD_SIZE = navigationTokens.fabDiameter;
export const NAV_BORDER_WIDTH = navigationTokens.borderWidth;

export type FabPositionInput = {
  windowWidth: number;
  leftInset: number;
  rightInset: number;
  bottomInset: number;
  horizontalPadding: number;
  topPadding: number;
  minimumBottomPadding: number;
  floatingGap: number;
};

export function getFloatingAddPosition({
  windowWidth,
  leftInset,
  rightInset,
  bottomInset,
  horizontalPadding,
  topPadding,
  minimumBottomPadding,
  floatingGap,
}: FabPositionInput): { right: number; bottom: number } {
  const leftPadding = Math.max(leftInset, horizontalPadding);
  const rightPadding = Math.max(rightInset, horizontalPadding);
  const availableWidth = Math.max(0, windowWidth - leftPadding - rightPadding);
  const tabWidth = availableWidth / ROOT_DESTINATIONS.length;

  return {
    // More is the fifth tab; align the FAB center to its center, not to a fixed margin.
    right: Math.max(horizontalPadding, rightPadding + (tabWidth - FLOATING_ADD_SIZE) / 2),
    // Keep the whole button above the bar, including bottom safe-area padding.
    bottom:
      NAV_BORDER_WIDTH +
      topPadding +
      NAV_ITEM_HEIGHT +
      Math.max(bottomInset, minimumBottomPadding) +
      floatingGap,
  };
}

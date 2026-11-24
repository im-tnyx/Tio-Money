export type PopupPlacement = 'auto' | 'above';

export interface PopupAnchor {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function popupPosition(
  anchor: PopupAnchor,
  viewport: { readonly width: number; readonly height: number },
  insets: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  },
  {
    margin,
    gap,
    preferredWidth,
    preferredHeight,
    placement = 'auto',
  }: {
    readonly margin: number;
    readonly gap: number;
    readonly preferredWidth: number;
    readonly preferredHeight: number;
    readonly placement?: PopupPlacement;
  },
) {
  const left = insets.left + margin;
  const right = viewport.width - insets.right - margin;
  const top = insets.top + margin;
  const bottom = viewport.height - insets.bottom - margin;
  const width = Math.min(preferredWidth, Math.max(0, right - left));
  const below = Math.max(top, anchor.y + anchor.height + gap);
  const above = Math.min(bottom, anchor.y - gap);
  const belowSpace = bottom - below;
  const aboveSpace = above - top;
  const openAbove =
    placement === 'above' || (belowSpace < preferredHeight && aboveSpace > belowSpace);

  return {
    width,
    left: Math.max(left, Math.min(anchor.x + anchor.width - width, right - width)),
    maxHeight: Math.max(0, openAbove ? aboveSpace : belowSpace),
    ...(openAbove ? { bottom: viewport.height - above } : { top: below }),
  };
}

/** Pick the largest complete row count that fits the available content height. */
export function fitPopupRows(
  availableHeight: number,
  rowHeight: number,
  rowCounts: readonly number[],
): number {
  return rowCounts.find((count) => count * rowHeight <= availableHeight) ?? 0;
}

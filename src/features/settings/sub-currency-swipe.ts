/** Bounded left-swipe geometry for currency rows (no data mutation). */
export function isHorizontalSwipe(dx: number, dy: number, threshold: number): boolean {
  return Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy);
}

export function getSwipeOffset(startOffset: number, dx: number, width: number): number {
  return Math.min(width, Math.max(0, startOffset - dx));
}

export function snapSwipeOffset(offset: number, width: number): number {
  return offset >= width / 2 ? width : 0;
}

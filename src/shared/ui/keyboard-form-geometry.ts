interface VerticalFrame {
  readonly y: number;
  readonly height: number;
}

/** Minimum scroll needed to keep the focused field inside the resized viewport. */
export function focusedFieldScrollOffset(
  field: VerticalFrame,
  viewport: VerticalFrame,
  currentOffset: number,
  gap: number,
): number {
  const top = viewport.y + gap;
  const bottom = viewport.y + viewport.height - gap;
  if (field.height <= 0 || bottom <= top) return currentOffset;
  const fieldBottom = field.y + field.height;
  // Oversized multiline inputs cannot fit in one viewport. Keep the lower
  // editing edge visible instead of oscillating between their two edges.
  if (fieldBottom > bottom) return Math.max(0, currentOffset + fieldBottom - bottom);
  if (field.y < top && field.height <= bottom - top) {
    return Math.max(0, currentOffset + field.y - top);
  }
  return currentOffset;
}

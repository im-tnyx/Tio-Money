/** Ignore controlled selection echoes and never jump an active native gesture. */
export function shouldAlignWheel(
  selected: number,
  lastIndex: number,
  interacting: boolean,
  echoed: boolean,
): boolean {
  return selected !== lastIndex && !interacting && !echoed;
}

/** Animate nearby linked detents; long virtualized calendar jumps stay immediate. */
export function shouldAnimateWheelAlignment(
  from: number,
  to: number,
  reduceMotion: boolean,
): boolean {
  const distance = Math.abs(to - from);
  return !reduceMotion && distance > 0 && distance <= 12;
}

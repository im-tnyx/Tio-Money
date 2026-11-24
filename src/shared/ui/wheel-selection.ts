/** Ignore controlled selection echoes and never jump an active native gesture. */
export function shouldAlignWheel(
  selected: number,
  lastIndex: number,
  interacting: boolean,
  echoed: boolean,
): boolean {
  return selected !== lastIndex && !interacting && !echoed;
}

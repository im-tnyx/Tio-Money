/** Sub Currency detail only; Main Currency keeps its own Decimal choice sheet. */
export type SubDecimalDigits = 0 | 1 | 2 | 3;

export function stepSubCurrencyDecimalDigits(
  current: SubDecimalDigits,
  delta: -1 | 1,
): SubDecimalDigits {
  return Math.max(0, Math.min(3, current + delta)) as SubDecimalDigits;
}

export function formatSubCurrencyDecimalExample(digits: SubDecimalDigits): string {
  return digits === 0 ? '1' : '1.' + '0'.repeat(digits);
}

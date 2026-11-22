import type { ReferenceRate } from '@/data/market/fx-reference-rates';

export type SubCurrencyRefreshResult = 'updated' | 'unchanged';

/** Only compare validated direct-pair reference quotes; a successful check may change nothing. */
export function classifySubCurrencyRefresh(
  previous: ReferenceRate | null | undefined,
  next: ReferenceRate,
): SubCurrencyRefreshResult {
  return previous?.base === next.base &&
    previous?.quote === next.quote &&
    previous?.date === next.date &&
    previous?.rate === next.rate
    ? 'unchanged'
    : 'updated';
}

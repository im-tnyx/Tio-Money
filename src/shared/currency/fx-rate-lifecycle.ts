import type { CurrencyCode } from './currency-preference';

export interface ActiveFxPair {
  readonly base: CurrencyCode;
  readonly quote: CurrencyCode;
  readonly key: string;
}

export function fxPairKey(base: CurrencyCode, quote: CurrencyCode): string {
  return base + '/' + quote;
}

/** Only deliberately saved Sub Currencies are eligible for remote FX requests. */
export function activeFxPairs(
  mainCode: CurrencyCode,
  subCodes: readonly CurrencyCode[],
): readonly ActiveFxPair[] {
  const seen = new Set<string>();
  const pairs: ActiveFxPair[] = [];
  for (const base of subCodes) {
    if (base === mainCode) continue;
    const key = fxPairKey(base, mainCode);
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ base, quote: mainCode, key });
  }
  return pairs;
}

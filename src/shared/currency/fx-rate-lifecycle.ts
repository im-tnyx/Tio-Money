import type { CurrencyCode, CurrencyPreferences } from './currency-preference';

export interface ActiveFxPair {
  readonly base: CurrencyCode;
  readonly quote: CurrencyCode;
  readonly key: string;
}

export function fxPairKey(base: CurrencyCode, quote: CurrencyCode): string {
  return base + '/' + quote;
}

/** Only deliberately saved Sub Currencies are eligible for remote FX requests. */
export function activeFxPairs(preferences: CurrencyPreferences): readonly ActiveFxPair[] {
  const seen = new Set<string>();
  const pairs: ActiveFxPair[] = [];
  for (const base of preferences.subCodes) {
    if (base === preferences.mainCode) continue;
    const key = fxPairKey(base, preferences.mainCode);
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ base, quote: preferences.mainCode, key });
  }
  return pairs;
}

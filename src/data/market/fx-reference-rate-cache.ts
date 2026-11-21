import Storage from 'expo-sqlite/kv-store';

import { parseReferenceRate, type ReferenceRate } from './fx-reference-rates';
import type { CurrencyCode } from '@/shared/currency/currency-preference';

const CACHE_PREFIX = 'tio-money.fx-reference.v1.';
const SOURCE = 'frankfurter';
const FUTURE_SKEW_MS = 5 * 60 * 1000;

export interface CachedReferenceRate {
  readonly quote: ReferenceRate;
  readonly fetchedAt: number;
}

export interface FxReferenceRateCache {
  read(base: CurrencyCode, quote: CurrencyCode): CachedReferenceRate | null;
  write(value: ReferenceRate, fetchedAt: number): void;
}

export function parseCachedReferenceRate(
  base: CurrencyCode,
  quote: CurrencyCode,
  value: unknown,
  now: number = Date.now(),
): CachedReferenceRate | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (
    record.version !== 1 ||
    record.source !== SOURCE ||
    typeof record.fetchedAt !== 'number' ||
    !Number.isSafeInteger(record.fetchedAt) ||
    record.fetchedAt <= 0 ||
    record.fetchedAt > now + FUTURE_SKEW_MS
  ) {
    return null;
  }
  const parsed = parseReferenceRate(base, quote, record.quote);
  return parsed ? { quote: parsed, fetchedAt: record.fetchedAt } : null;
}

/** expo-sqlite's local KV store: no account data, no remote sync or ledger writes. */
export const fxReferenceRateCache: FxReferenceRateCache = {
  read(base, quote) {
    try {
      const raw = Storage.getItemSync(CACHE_PREFIX + base + '.' + quote);
      if (!raw) return null;
      return parseCachedReferenceRate(base, quote, JSON.parse(raw));
    } catch {
      return null;
    }
  },
  write(quote, fetchedAt) {
    Storage.setItemSync(
      CACHE_PREFIX + quote.base + '.' + quote.quote,
      JSON.stringify({ version: 1, source: SOURCE, quote, fetchedAt }),
    );
  },
};

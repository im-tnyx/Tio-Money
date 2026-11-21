import Storage from 'expo-sqlite/kv-store';

import {
  parseCachedReferenceRate,
  type FxReferenceRateCache,
} from './fx-reference-rate-cache-contract';

export type {
  CachedReferenceRate,
  FxReferenceRateCache,
} from './fx-reference-rate-cache-contract';

const CACHE_PREFIX = 'tio-money.fx-reference.v1.';
const SOURCE = 'frankfurter';

/** Versioned SQLite-backed local cache; only selected public currency pairs. */
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

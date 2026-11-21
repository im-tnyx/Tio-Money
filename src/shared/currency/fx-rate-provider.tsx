import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  fxReferenceRateCache,
  type FxReferenceRateCache,
} from '@/data/market/fx-reference-rate-cache';
import { getReferenceRate, type ReferenceRate } from '@/data/market/fx-reference-rates';

import { activeFxPairs, fxPairKey } from './fx-rate-lifecycle';
import { useCurrencySettings } from './currency-provider';
import type { CurrencyCode } from './currency-preference';

export type FxDisplayStatus = 'loading' | 'available' | 'cached' | 'unavailable';

export interface FxDisplayRate {
  readonly rate: ReferenceRate | null;
  readonly status: FxDisplayStatus;
  readonly fetchedAt: number | null;
}

export interface FxRateContextValue {
  readonly entries: Readonly<Record<string, FxDisplayRate>>;
  refreshRate(base: CurrencyCode, quote: CurrencyCode): Promise<ReferenceRate | null>;
}

const FxRateContext = createContext<FxRateContextValue | null>(null);

function fromCache(
  base: CurrencyCode,
  quote: CurrencyCode,
  cache: FxReferenceRateCache,
): FxDisplayRate {
  const saved = cache.read(base, quote);
  return saved
    ? { rate: saved.quote, status: 'cached', fetchedAt: saved.fetchedAt }
    : { rate: null, status: 'loading', fetchedAt: null };
}

/**
 * App-scoped FX controller. Only configured Sub pairs are fetched:
 * cold launch + pair selection/change + explicit manual Refresh.
 * Opening a screen, rerendering or staying in the background never polls.
 */
export function FxRateProvider({
  children,
  cache = fxReferenceRateCache,
}: {
  children: ReactNode;
  cache?: FxReferenceRateCache;
}) {
  const { preferences } = useCurrencySettings();
  const pairs = useMemo(
    () => activeFxPairs(preferences.mainCode, preferences.subCodes),
    [preferences.mainCode, preferences.subCodes],
  );
  const activeKeys = useRef<ReadonlySet<string>>(new Set());
  const [entries, setEntries] = useState<Record<string, FxDisplayRate>>(() => {
    const initial: Record<string, FxDisplayRate> = {};
    for (const pair of pairs) initial[pair.key] = fromCache(pair.base, pair.quote, cache);
    return initial;
  });
  const pending = useRef<Record<string, Promise<ReferenceRate | null>>>({});

  const refreshRate = useCallback(
    (base: CurrencyCode, quote: CurrencyCode): Promise<ReferenceRate | null> => {
      const key = fxPairKey(base, quote);
      if (!activeKeys.current.has(key)) {
        return Promise.reject(new Error('FX pair is not enabled'));
      }
      const activeRequest = pending.current[key];
      if (activeRequest) return activeRequest;

      setEntries((previous) => {
        const last = previous[key] ?? fromCache(base, quote, cache);
        return {
          ...previous,
          [key]: { ...last, status: last.rate ? last.status : 'loading' },
        };
      });

      const request = getReferenceRate(base, quote)
        .then((result) => {
          if (!activeKeys.current.has(key)) return null;
          const fetchedAt = Date.now();
          try {
            cache.write(result, fetchedAt);
          } catch {
            // A successful quote remains usable in memory; persistence is best-effort.
          }
          setEntries((previous) => ({
            ...previous,
            [key]: { rate: result, status: 'available', fetchedAt },
          }));
          return result;
        })
        .catch((error: unknown) => {
          if (activeKeys.current.has(key)) {
            setEntries((previous) => {
              const last = previous[key] ?? fromCache(base, quote, cache);
              return {
                ...previous,
                [key]: {
                  ...last,
                  status: last.rate ? 'cached' : 'unavailable',
                },
              };
            });
          }
          throw error;
        })
        .finally(() => {
          delete pending.current[key];
        });
      pending.current[key] = request;
      return request;
    },
    [cache],
  );

  useEffect(() => {
    // After each committed pair selection, only these pairs may update the shared cache.
    activeKeys.current = new Set(pairs.map((pair) => pair.key));
    for (const pair of pairs) {
      void refreshRate(pair.base, pair.quote).catch(() => undefined);
    }
  }, [pairs, refreshRate]);

  const value = useMemo(() => ({ entries, refreshRate }), [entries, refreshRate]);
  return <FxRateContext.Provider value={value}>{children}</FxRateContext.Provider>;
}

export function useFxRates(): FxRateContextValue {
  const context = useContext(FxRateContext);
  if (!context) throw new Error('useFxRates must be used within FxRateProvider');
  return context;
}

import { isCurrencyCode, type CurrencyCode } from '@/shared/currency/currency-preference';

export interface ReferenceRate {
  readonly base: CurrencyCode;
  readonly quote: CurrencyCode;
  readonly rate: number;
  readonly date: string;
}

const inflight = new Map<string, Promise<ReferenceRate>>();
const FX_FETCH_TIMEOUT_MS = 8000;
const EARLIEST_PUBLISHED_DATE = Date.UTC(1948, 0, 1);

/** Strictly parses a remote reference quote; never trusts an arbitrary rate. */
export function parseReferenceRate(
  base: CurrencyCode,
  quote: CurrencyCode,
  payload: unknown,
): ReferenceRate | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  if (
    data.base !== base ||
    data.quote !== quote ||
    typeof data.rate !== 'number' ||
    !Number.isFinite(data.rate) ||
    data.rate <= 0 ||
    typeof data.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
  ) {
    return null;
  }
  const publishedAt = Date.parse(data.date + 'T00:00:00Z');
  if (
    !Number.isFinite(publishedAt) ||
    publishedAt < EARLIEST_PUBLISHED_DATE ||
    publishedAt > Date.now() ||
    new Date(publishedAt).toISOString().slice(0, 10) !== data.date
  ) {
    return null;
  }
  return { base, quote, rate: data.rate, date: data.date };
}

export function formatReferenceRate(value: ReferenceRate): string {
  return value.base + ' 1.00 = ' + value.quote + ' ' + value.rate.toFixed(6);
}

/**
 * Public daily reference rate; no account information or amount is transmitted.
 * Deduplicate in-flight pair requests. Do not apply quotes to booked amounts.
 */
export async function getReferenceRate(
  base: CurrencyCode,
  quote: CurrencyCode,
): Promise<ReferenceRate> {
  if (!isCurrencyCode(base) || !isCurrencyCode(quote) || base === quote) {
    throw new Error('Invalid FX pair');
  }
  const key = base + '/' + quote;
  const pending = inflight.get(key);
  if (pending) return pending;
  const request = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FX_FETCH_TIMEOUT_MS);
    try {
      const response = await fetch('https://api.frankfurter.dev/v2/rate/' + base + '/' + quote, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Reference rate fetch failed');
      const payload: unknown = await response.json();
      const value = parseReferenceRate(base, quote, payload);
      if (!value) throw new Error('Invalid reference rate response');
      return value;
    } finally {
      clearTimeout(timer);
    }
  })();
  inflight.set(key, request);
  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}

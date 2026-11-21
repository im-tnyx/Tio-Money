import type { FxDisplayStatus } from '@/shared/currency/fx-rate-provider';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * A published reference date can be Friday during a weekend even when a
 * successful network verification took place today. Check fetchedAt instead.
 */
export function wasReferenceRateCheckedToday(
  fetchedAt: number | null,
  now: number = Date.now(),
): boolean {
  if (
    fetchedAt === null ||
    !Number.isSafeInteger(fetchedAt) ||
    fetchedAt <= 0 ||
    !Number.isFinite(now) ||
    fetchedAt > now
  ) {
    return false;
  }
  const last = new Date(fetchedAt);
  const today = new Date(now);
  return (
    last.getFullYear() === today.getFullYear() &&
    last.getMonth() === today.getMonth() &&
    last.getDate() === today.getDate()
  );
}

/** Show manual retry when no successful check has completed today. */
export function shouldOfferSubCurrencyRefresh(
  status: FxDisplayStatus,
  fetchedAt: number | null,
  now: number = Date.now(),
): boolean {
  if (status === 'loading') return false;
  return status !== 'available' || !wasReferenceRateCheckedToday(fetchedAt, now);
}

/** Compact local-device date. This is last *checked*, not provider publication. */
export function formatSubCurrencyLastChecked(
  fetchedAt: number | null,
  now: number = Date.now(),
): string | null {
  if (
    fetchedAt === null ||
    !Number.isSafeInteger(fetchedAt) ||
    fetchedAt <= 0 ||
    !Number.isFinite(now) ||
    fetchedAt > now
  ) {
    return null;
  }
  const last = new Date(fetchedAt);
  const current = new Date(now);
  const day = last.getDate();
  const month = MONTHS[last.getMonth()];
  return last.getFullYear() === current.getFullYear()
    ? `${day} ${month}`
    : `${day} ${month} ${last.getFullYear()}`;
}

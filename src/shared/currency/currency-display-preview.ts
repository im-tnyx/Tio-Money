import {
  CURRENCY_OPTIONS,
  resolveNumberGrouping,
  type CurrencyPreferences,
} from './currency-preference';

/**
 * Illustrative UI preview only. Never pass booked ledger money through JS number,
 * Intl formatting or display-only rounding.
 */
export function formatCurrencyExample(
  preferences: CurrencyPreferences,
  illustrativeAmount: number,
): string {
  if (!Number.isFinite(illustrativeAmount)) {
    throw new Error('Invalid example amount');
  }
  const option = CURRENCY_OPTIONS.find((item) => item.code === preferences.mainCode);
  if (!option) throw new Error('Unknown display currency');
  const digits =
    preferences.display.decimalDigits === 'currency'
      ? option.minorDigits
      : preferences.display.decimalDigits;
  const grouping = resolveNumberGrouping(preferences.mainCode, preferences.display.grouping);
  const locale = grouping === 'indian' ? 'en-IN' : 'en-US';
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: grouping !== 'none',
  }).format(Math.abs(illustrativeAmount));
  const signed = illustrativeAmount < 0 ? '-' : '';
  const formatted = number;
  return preferences.display.unitPosition === 'front'
    ? signed + option.symbol + ' ' + formatted
    : signed + formatted + ' ' + option.symbol;
}

/** Currency metadata is display-only, not an account/FX approval. */
export function getCurrencyLabel(preferences: CurrencyPreferences): string {
  const currency = CURRENCY_OPTIONS.find((item) => item.code === preferences.mainCode);
  if (!currency) throw new Error('Unknown display currency');
  return currency.code + ' – ' + currency.country + ' (' + currency.symbol + ')';
}

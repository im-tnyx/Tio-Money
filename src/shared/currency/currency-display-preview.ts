import {
  CURRENCY_OPTIONS,
  type CurrencyPreferences,
} from './currency-preference';

/**
 * Illustrative UI preview only. Never pass booked ledger money through JS number,
 * Intl formatting, this sample scaling, or compact rounding.
 */
export function formatCurrencyExample(
  preferences: CurrencyPreferences,
  illustrativeAmount: number,
  useCompact: boolean = false,
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
  const absAmount = Math.abs(illustrativeAmount);
  let scaled = absAmount;
  let suffix = '';
  const compact = useCompact ? preferences.display.largeAmounts : 'full';
  if (compact === 'indian') {
    if (absAmount >= 10000000) {
      scaled = absAmount / 10000000;
      suffix = 'Cr';
    } else if (absAmount >= 100000) {
      scaled = absAmount / 100000;
      suffix = 'L';
    } else if (absAmount >= 1000) {
      scaled = absAmount / 1000;
      suffix = 'K';
    }
  } else if (compact === 'international') {
    if (absAmount >= 1000000000) {
      scaled = absAmount / 1000000000;
      suffix = 'B';
    } else if (absAmount >= 1000000) {
      scaled = absAmount / 1000000;
      suffix = 'M';
    } else if (absAmount >= 1000) {
      scaled = absAmount / 1000;
      suffix = 'K';
    }
  }
  const locale = preferences.display.grouping === 'indian' ? 'en-IN' : 'en-US';
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(scaled);
  const signed = illustrativeAmount < 0 ? '-' : '';
  const formatted = number + suffix;
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

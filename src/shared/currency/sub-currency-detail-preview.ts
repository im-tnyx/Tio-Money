import {
  CURRENCY_OPTIONS,
  resolveNumberGrouping,
  resolveSubCurrencyDisplay,
  type CurrencyCode,
  type CurrencyPreferences,
} from './currency-preference';

/** Short detail caption; does not modify the persisted ISO currency catalog. */
export function formatSubCurrencyDetailCaption(subCode: CurrencyCode): string {
  const currency = CURRENCY_OPTIONS.find((option) => option.code === subCode);
  if (!currency) throw new Error('Unrecognized currency');
  if (subCode === 'USD') return 'USD - USA (US' + currency.symbol + ')';
  return currency.code + ' – ' + currency.country + ' (' + currency.symbol + ')';
}

/**
 * Format an illustrative Sub amount using only that saved Sub's display
 * preferences. This must never round or mutate financial ledger values.
 */
export function formatSubCurrencyNumberExample(
  preferences: CurrencyPreferences,
  subCode: CurrencyCode,
  illustrativeAmount: number,
): string {
  if (!Number.isFinite(illustrativeAmount)) throw new Error('Invalid illustrative amount');
  const sub = CURRENCY_OPTIONS.find((item) => item.code === subCode);
  if (!sub) throw new Error('Unrecognized currency');
  const display = resolveSubCurrencyDisplay(preferences, subCode);
  const digits = display.decimalDigits === 'currency' ? sub.minorDigits : display.decimalDigits;
  const grouping = resolveNumberGrouping(subCode, display.grouping ?? 'auto');
  const number = new Intl.NumberFormat(grouping === 'indian' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    useGrouping: grouping !== 'none',
  }).format(Math.abs(illustrativeAmount));
  const symbol = subCode === 'USD' ? 'US' + sub.symbol : sub.symbol;
  const signed = illustrativeAmount < 0 ? '-' : '';
  return display.unitPosition === 'front'
    ? signed + symbol + ' ' + number
    : signed + number + ' ' + symbol;
}

/** UI-only preview. Rates never alter ledger balances or booked amounts. */
export function formatSubCurrencyDetailPreview(
  preferences: CurrencyPreferences,
  subCode: CurrencyCode,
  rate: number | null,
): { subPreview: string; mainPreview: string } {
  const sub = CURRENCY_OPTIONS.find((item) => item.code === subCode);
  const main = CURRENCY_OPTIONS.find((item) => item.code === preferences.mainCode);
  if (!sub || !main) throw new Error('Unrecognized currency');
  const subPreview = formatSubCurrencyNumberExample(preferences, subCode, 1);

  if (rate === null || !Number.isFinite(rate) || rate <= 0) {
    return { subPreview, mainPreview: main.symbol + ' —' };
  }
  const mainNumber = new Intl.NumberFormat(preferences.mainCode === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(rate);
  return {
    subPreview,
    mainPreview:
      preferences.display.unitPosition === 'front'
        ? main.symbol + ' ' + mainNumber
        : mainNumber + ' ' + main.symbol,
  };
}

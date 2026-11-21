import {
  CURRENCY_OPTIONS,
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

/** UI-only preview. Rates never alter ledger balances or booked amounts. */
export function formatSubCurrencyDetailPreview(
  preferences: CurrencyPreferences,
  subCode: CurrencyCode,
  rate: number | null,
): { subPreview: string; mainPreview: string } {
  const sub = CURRENCY_OPTIONS.find((item) => item.code === subCode);
  const main = CURRENCY_OPTIONS.find((item) => item.code === preferences.mainCode);
  if (!sub || !main) throw new Error('Unrecognized currency');
  const subDisplay = resolveSubCurrencyDisplay(preferences, subCode);
  const digits =
    subDisplay.decimalDigits === 'currency' ? sub.minorDigits : subDisplay.decimalDigits;
  const subNumber = new Intl.NumberFormat(subCode === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(1);
  const subSymbol = subCode === 'USD' ? 'US' + sub.symbol : sub.symbol;
  const subPreview =
    subDisplay.unitPosition === 'front' ? subSymbol + ' ' + subNumber : subNumber + ' ' + subSymbol;

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

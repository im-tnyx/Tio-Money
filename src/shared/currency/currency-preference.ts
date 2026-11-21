/**
 * User display preferences only; not an approval for FX or ledger currencies.
 */
export const CURRENCY_OPTIONS = [
  { code: 'INR', name: 'Indian Rupee', country: 'India', symbol: '₹', minorDigits: 2 },
  { code: 'USD', name: 'US Dollar', country: 'United States', symbol: '$', minorDigits: 2 },
  { code: 'EUR', name: 'Euro', country: 'Euro Area', symbol: '€', minorDigits: 2 },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', symbol: '£', minorDigits: 2 },
  { code: 'JPY', name: 'Japanese Yen', country: 'Japan', symbol: '¥', minorDigits: 0 },
  {
    code: 'AED',
    name: 'UAE Dirham',
    country: 'United Arab Emirates',
    symbol: 'د.إ',
    minorDigits: 2,
  },
  { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', symbol: 'CA$', minorDigits: 2 },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', symbol: 'A$', minorDigits: 2 },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', symbol: 'S$', minorDigits: 2 },
  { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', symbol: 'CHF', minorDigits: 2 },
  { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', symbol: 'ر.س', minorDigits: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', country: 'Kuwait', symbol: 'د.ك', minorDigits: 3 },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];

export type UnitPosition = 'front' | 'end';
export type NumberGrouping = 'indian' | 'international';
export type LargeAmountStyle = 'full' | 'indian' | 'international';
export type DecimalDigits = 'currency' | 0 | 1 | 2 | 3;

export interface CurrencyDisplayPreferences {
  readonly unitPosition: UnitPosition;
  readonly decimalDigits: DecimalDigits;
  readonly grouping: NumberGrouping;
  readonly largeAmounts: LargeAmountStyle;
}

export const DEFAULT_CURRENCY_DISPLAY: CurrencyDisplayPreferences = {
  unitPosition: 'front',
  decimalDigits: 'currency',
  grouping: 'indian',
  largeAmounts: 'full',
};

export function isCurrencyDisplayPreferences(value: unknown): value is CurrencyDisplayPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CurrencyDisplayPreferences>;
  return (
    (candidate.unitPosition === 'front' || candidate.unitPosition === 'end') &&
    (candidate.decimalDigits === 'currency' ||
      candidate.decimalDigits === 0 ||
      candidate.decimalDigits === 1 ||
      candidate.decimalDigits === 2 ||
      candidate.decimalDigits === 3) &&
    (candidate.grouping === 'indian' || candidate.grouping === 'international') &&
    (candidate.largeAmounts === 'full' ||
      candidate.largeAmounts === 'indian' ||
      candidate.largeAmounts === 'international')
  );
}

export interface CurrencyPreferences {
  readonly mainCode: CurrencyCode;
  readonly subCode: CurrencyCode | null;
  readonly display: CurrencyDisplayPreferences;
}

export const DEFAULT_CURRENCY_PREFERENCES: CurrencyPreferences = {
  mainCode: 'INR',
  subCode: null,
  display: DEFAULT_CURRENCY_DISPLAY,
};

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && CURRENCY_OPTIONS.some((option) => option.code === value);
}

export function isCurrencyPreferences(value: unknown): value is CurrencyPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CurrencyPreferences>;
  return (
    isCurrencyCode(candidate.mainCode) &&
    (candidate.subCode === null || isCurrencyCode(candidate.subCode)) &&
    candidate.subCode !== candidate.mainCode &&
    (candidate.display === undefined || isCurrencyDisplayPreferences(candidate.display))
  );
}

/** Invalid or missing local values safely default, without altering booked money. */
export function parseCurrencyPreferences(value: unknown): CurrencyPreferences {
  if (isCurrencyPreferences(value)) {
    return {
      mainCode: value.mainCode,
      subCode: value.subCode,
      display: value.display ?? DEFAULT_CURRENCY_DISPLAY,
    };
  }
  return DEFAULT_CURRENCY_PREFERENCES;
}

export function withMainCurrency(
  current: CurrencyPreferences,
  mainCode: CurrencyCode,
): CurrencyPreferences {
  if (!isCurrencyCode(mainCode)) throw new Error('Invalid Main Currency');
  return {
    ...current,
    mainCode,
    subCode: current.subCode === mainCode ? null : current.subCode,
  };
}

export function withSubCurrency(
  current: CurrencyPreferences,
  subCode: CurrencyCode | null,
): CurrencyPreferences {
  if (subCode !== null && !isCurrencyCode(subCode)) {
    throw new Error('Invalid Sub Currency');
  }
  if (subCode === current.mainCode) {
    throw new Error('Sub Currency must differ from Main Currency');
  }
  return { ...current, subCode };
}

export function withCurrencyDisplay(
  current: CurrencyPreferences,
  patch: Partial<CurrencyDisplayPreferences>,
): CurrencyPreferences {
  const display = { ...current.display, ...patch };
  if (!isCurrencyDisplayPreferences(display)) {
    throw new Error('Invalid currency display preference');
  }
  return { ...current, display };
}

/** Inject the local storage adapter from root composition, not from screens. */
export interface CurrencyPreferenceStore {
  read(): CurrencyPreferences;
  write(value: CurrencyPreferences): void;
}

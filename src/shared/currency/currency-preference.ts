/**
 * User display preferences only; not an approval for FX or ledger currencies.
 */
export const CURRENCY_OPTIONS = [
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];

export interface CurrencyPreferences {
  readonly mainCode: CurrencyCode;
  readonly subCode: CurrencyCode | null;
}

export const DEFAULT_CURRENCY_PREFERENCES: CurrencyPreferences = {
  mainCode: 'INR',
  subCode: null,
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
    candidate.subCode !== candidate.mainCode
  );
}

/** Invalid or missing local values safely default, without altering booked money. */
export function parseCurrencyPreferences(value: unknown): CurrencyPreferences {
  if (isCurrencyPreferences(value)) {
    return { mainCode: value.mainCode, subCode: value.subCode };
  }
  return DEFAULT_CURRENCY_PREFERENCES;
}

export function withMainCurrency(
  current: CurrencyPreferences,
  mainCode: CurrencyCode,
): CurrencyPreferences {
  if (!isCurrencyCode(mainCode)) throw new Error('Invalid Main Currency');
  return {
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
  return { mainCode: current.mainCode, subCode };
}

/** Inject the local storage adapter from root composition, not from screens. */
export interface CurrencyPreferenceStore {
  read(): CurrencyPreferences;
  write(value: CurrencyPreferences): void;
}

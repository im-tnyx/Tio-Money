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
export type NumberGrouping = 'auto' | 'indian' | 'international' | 'none';
export type DecimalDigits = 'currency' | 0 | 1 | 2 | 3;

export interface CurrencyDisplayPreferences {
  readonly unitPosition: UnitPosition;
  readonly decimalDigits: DecimalDigits;
  readonly grouping: NumberGrouping;
}

export const DEFAULT_CURRENCY_DISPLAY: CurrencyDisplayPreferences = {
  unitPosition: 'front',
  decimalDigits: 'currency',
  grouping: 'auto',
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
    (candidate.grouping === 'auto' ||
      candidate.grouping === 'indian' ||
      candidate.grouping === 'international' ||
      candidate.grouping === 'none')
  );
}

/**
 * Automatic display grouping: INR uses lakhs, all other selectable currencies
 * use international millions. An explicit user choice takes precedence until
 * Main Currency changes again; a new Main selection resets grouping to Auto.
 */
export function resolveNumberGrouping(
  mainCode: CurrencyCode,
  grouping: NumberGrouping,
): 'indian' | 'international' | 'none' {
  if (grouping === 'auto') return mainCode === 'INR' ? 'indian' : 'international';
  return grouping;
}

/** A small display-only list. Main/financial account currencies are not affected. */
export const MAX_SUB_CURRENCIES = 5;

/** Display-only overrides for an individual saved Sub Currency. */
export interface SubCurrencyDisplayPreferences {
  readonly unitPosition: UnitPosition;
  readonly decimalDigits: DecimalDigits;
}

export const DEFAULT_SUB_CURRENCY_DISPLAY: SubCurrencyDisplayPreferences = {
  unitPosition: 'front',
  decimalDigits: 'currency',
};

export function isSubCurrencyDisplayPreferences(
  value: unknown,
): value is SubCurrencyDisplayPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SubCurrencyDisplayPreferences>;
  return (
    (candidate.unitPosition === 'front' || candidate.unitPosition === 'end') &&
    (candidate.decimalDigits === 'currency' ||
      candidate.decimalDigits === 0 ||
      candidate.decimalDigits === 1 ||
      candidate.decimalDigits === 2 ||
      candidate.decimalDigits === 3)
  );
}

export interface CurrencyPreferences {
  readonly mainCode: CurrencyCode;
  /** Legacy first-selected alias kept compatible with existing consumers. */
  readonly subCode: CurrencyCode | null;
  readonly subCodes: readonly CurrencyCode[];
  /** Optional for backward-compatible v2 preference records. */
  readonly subDisplay?: Readonly<Partial<Record<CurrencyCode, SubCurrencyDisplayPreferences>>>;
  readonly display: CurrencyDisplayPreferences;
}

export const DEFAULT_CURRENCY_PREFERENCES: CurrencyPreferences = {
  mainCode: 'INR',
  subCode: null,
  subCodes: [],
  display: DEFAULT_CURRENCY_DISPLAY,
};

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && CURRENCY_OPTIONS.some((option) => option.code === value);
}

/** Accepts both legacy single-Sub objects and the canonical multi-Sub model. */
export function isCurrencyPreferences(value: unknown): value is CurrencyPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CurrencyPreferences>;
  if (!isCurrencyCode(candidate.mainCode)) return false;
  if (candidate.subCode !== null && !isCurrencyCode(candidate.subCode)) return false;
  if (candidate.subCode === candidate.mainCode) return false;
  if (candidate.display !== undefined && !isCurrencyDisplayPreferences(candidate.display)) {
    return false;
  }
  if (candidate.subCodes === undefined) return true; // v1 shape, read-only migration
  if (!Array.isArray(candidate.subCodes) || candidate.subCodes.length > MAX_SUB_CURRENCIES) {
    return false;
  }
  const subCodes: readonly unknown[] = candidate.subCodes;
  const validCodes =
    subCodes.every((code) => isCurrencyCode(code) && code !== candidate.mainCode) &&
    new Set(subCodes).size === subCodes.length &&
    (subCodes[0] ?? null) === candidate.subCode;
  if (!validCodes) return false;
  if (candidate.subDisplay === undefined) return true;
  if (
    !candidate.subDisplay ||
    typeof candidate.subDisplay !== 'object' ||
    Array.isArray(candidate.subDisplay)
  ) {
    return false;
  }
  return Object.entries(candidate.subDisplay).every(
    ([code, display]) => subCodes.includes(code) && isSubCurrencyDisplayPreferences(display),
  );
}

/** Invalid local data safely falls back without modifying booked amounts. */
export function parseCurrencyPreferences(value: unknown): CurrencyPreferences {
  if (!isCurrencyPreferences(value)) return DEFAULT_CURRENCY_PREFERENCES;
  const codes = value.subCodes ?? (value.subCode === null ? [] : [value.subCode]);
  return {
    mainCode: value.mainCode,
    subCode: codes[0] ?? null,
    subCodes: [...codes],
    ...(value.subDisplay ? { subDisplay: { ...value.subDisplay } } : {}),
    display: value.display
      ? {
          unitPosition: value.display.unitPosition,
          decimalDigits: value.display.decimalDigits,
          grouping: value.display.grouping,
        }
      : DEFAULT_CURRENCY_DISPLAY,
  };
}

export function withMainCurrency(
  current: CurrencyPreferences,
  mainCode: CurrencyCode,
): CurrencyPreferences {
  if (!isCurrencyCode(mainCode)) throw new Error('Invalid Main Currency');
  const subCodes = current.subCodes.filter((code) => code !== mainCode);
  return {
    ...current,
    mainCode,
    subCode: subCodes[0] ?? null,
    subCodes,
    ...(current.subDisplay
      ? {
          subDisplay: Object.fromEntries(
            Object.entries(current.subDisplay).filter(([code]) =>
              subCodes.includes(code as CurrencyCode),
            ),
          ),
        }
      : {}),
    // A new Main selection restores the INR/other Auto grouping default.
    display:
      mainCode === current.mainCode ? current.display : { ...current.display, grouping: 'auto' },
  };
}

/** Compatibility operation: replace all saved Subs with one code (or None). */
export function withSubCurrency(
  current: CurrencyPreferences,
  subCode: CurrencyCode | null,
): CurrencyPreferences {
  if (subCode !== null && !isCurrencyCode(current.mainCode)) {
    throw new Error('Select a valid Main Currency before adding Sub Currency');
  }
  if (subCode !== null && !isCurrencyCode(subCode)) {
    throw new Error('Invalid Sub Currency');
  }
  if (subCode !== null && subCode === current.mainCode) {
    throw new Error('Sub Currency must differ from Main Currency');
  }
  return {
    ...current,
    subCode,
    subCodes: subCode === null ? [] : [subCode],
    ...(current.subDisplay
      ? {
          subDisplay:
            subCode === null || !current.subDisplay[subCode]
              ? {}
              : { [subCode]: current.subDisplay[subCode] },
        }
      : {}),
  };
}

/** One tap adds a distinct Sub, preserving previous selections and order. */
export function addSubCurrency(
  current: CurrencyPreferences,
  code: CurrencyCode,
): CurrencyPreferences {
  if (!isCurrencyCode(current.mainCode)) {
    throw new Error('Select a valid Main Currency before adding Sub Currency');
  }
  if (!isCurrencyCode(code)) throw new Error('Invalid Sub Currency');
  if (code === current.mainCode) throw new Error('Sub Currency must differ from Main Currency');
  if (current.subCodes.includes(code)) return current;
  if (current.subCodes.length >= MAX_SUB_CURRENCIES) {
    throw new Error('Sub Currency limit reached');
  }
  const subCodes = [...current.subCodes, code];
  return { ...current, subCode: subCodes[0] ?? null, subCodes };
}

/** Delete only the selected Sub, never any other saved currencies. */
export function removeSubCurrency(
  current: CurrencyPreferences,
  code: CurrencyCode,
): CurrencyPreferences {
  const subCodes = current.subCodes.filter((item) => item !== code);
  const subDisplay = current.subDisplay ? { ...current.subDisplay } : undefined;
  if (subDisplay) delete subDisplay[code];
  return {
    ...current,
    subCode: subCodes[0] ?? null,
    subCodes,
    ...(subDisplay ? { subDisplay } : {}),
  };
}

export function resolveSubCurrencyDisplay(
  preferences: CurrencyPreferences,
  code: CurrencyCode,
): SubCurrencyDisplayPreferences {
  return preferences.subDisplay?.[code] ?? DEFAULT_SUB_CURRENCY_DISPLAY;
}

/** Isolated per-Sub display settings. Never change ledger or Main preferences. */
export function withSubCurrencyDisplay(
  current: CurrencyPreferences,
  code: CurrencyCode,
  patch: Partial<SubCurrencyDisplayPreferences>,
): CurrencyPreferences {
  if (!current.subCodes.includes(code)) throw new Error('Sub Currency is not saved');
  const next = { ...resolveSubCurrencyDisplay(current, code), ...patch };
  if (!isSubCurrencyDisplayPreferences(next)) throw new Error('Invalid Sub Currency display');
  return {
    ...current,
    subDisplay: { ...current.subDisplay, [code]: next },
  };
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

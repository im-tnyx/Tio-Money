import Storage from 'expo-sqlite/kv-store';

import {
  DEFAULT_CURRENCY_PREFERENCES,
  isCurrencyPreferences,
  parseCurrencyPreferences,
  type CurrencyPreferenceStore,
} from '@/shared/currency/currency-preference';

const CURRENCY_PREFERENCE_KEY = 'tio-money.currency-preferences.v2';
const LEGACY_CURRENCY_PREFERENCE_KEY = 'tio-money.currency-preferences.v1';

/** Versioned local preference; legacy data stays untouched until successful v2 save. */
export const currencyPreferenceStore: CurrencyPreferenceStore = {
  read() {
    const raw = Storage.getItemSync(CURRENCY_PREFERENCE_KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        (parsed as { version?: unknown }).version !== 2 ||
        !Array.isArray((parsed as { subCodes?: unknown }).subCodes) ||
        !isCurrencyPreferences(parsed)
      ) {
        throw new Error('Invalid v2 currency preferences');
      }
      return parseCurrencyPreferences(parsed);
    }
    const oldRaw = Storage.getItemSync(LEGACY_CURRENCY_PREFERENCE_KEY);
    if (oldRaw === null) return DEFAULT_CURRENCY_PREFERENCES;
    const old: unknown = JSON.parse(oldRaw);
    if (
      !old ||
      typeof old !== 'object' ||
      (old as { version?: unknown }).version !== 1 ||
      !isCurrencyPreferences(old)
    ) {
      throw new Error('Invalid v1 currency preferences');
    }
    // In-memory migration; do not overwrite or delete the legacy key.
    return parseCurrencyPreferences(old);
  },
  write(value) {
    if (!isCurrencyPreferences(value) || !Array.isArray(value.subCodes)) {
      throw new Error('Invalid v2 currency preferences');
    }
    Storage.setItemSync(CURRENCY_PREFERENCE_KEY, JSON.stringify({ version: 2, ...value }));
  },
};

import Storage from 'expo-sqlite/kv-store';

import {
  DEFAULT_CURRENCY_PREFERENCES,
  isCurrencyPreferences,
  parseCurrencyPreferences,
  type CurrencyPreferenceStore,
} from '@/shared/currency/currency-preference';

const CURRENCY_PREFERENCE_KEY = 'tio-money.currency-preferences.v1';

/** Local setting only; never store financial postings or FX quotes here. */
export const currencyPreferenceStore: CurrencyPreferenceStore = {
  read() {
    const raw = Storage.getItemSync(CURRENCY_PREFERENCE_KEY);
    if (raw === null) return DEFAULT_CURRENCY_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as { version?: unknown }).version !== 1 ||
      !isCurrencyPreferences(parsed)
    ) {
      throw new Error('Invalid currency preferences');
    }
    return parseCurrencyPreferences(parsed);
  },
  write(value) {
    if (!isCurrencyPreferences(value)) {
      throw new Error('Invalid currency preferences');
    }
    Storage.setItemSync(
      CURRENCY_PREFERENCE_KEY,
      JSON.stringify({ version: 1, mainCode: value.mainCode, subCode: value.subCode }),
    );
  },
};

import Storage from 'expo-sqlite/kv-store';

import {
  isAccountGroupPreferences,
  parseAccountGroupPreferences,
  type AccountGroupPreferenceStore,
} from '@/features/settings/account-group-preferences';

const ACCOUNT_GROUP_PREFERENCES_KEY = 'tio-money.account-groups-display.v1';

/** Private, versioned local UI labels only; never financial SQLite ledger state. */
export const accountGroupPreferenceStore: AccountGroupPreferenceStore = {
  read() {
    return parseAccountGroupPreferences(Storage.getItemSync(ACCOUNT_GROUP_PREFERENCES_KEY));
  },
  write(value) {
    if (!isAccountGroupPreferences(value)) throw new Error('Invalid account group preferences');
    Storage.setItemSync(ACCOUNT_GROUP_PREFERENCES_KEY, JSON.stringify(value));
  },
};

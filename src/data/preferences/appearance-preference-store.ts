import Storage from 'expo-sqlite/kv-store';

import {
  parseAppearancePreference,
  type AppearancePreferenceStore,
} from '@/shared/theme/appearance-preference';

const APPEARANCE_KEY = 'tio-money.appearance.v1';

/** Local-only non-sensitive preference. No finance database schema mutation. */
export const appearancePreferenceStore: AppearancePreferenceStore = {
  read() {
    return parseAppearancePreference(Storage.getItemSync(APPEARANCE_KEY));
  },
  write(value) {
    Storage.setItemSync(APPEARANCE_KEY, value);
  },
};

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { t } from '@/shared/i18n/strings';

import {
  DEFAULT_CURRENCY_PREFERENCES,
  MAX_SUB_CURRENCIES,
  addSubCurrency,
  removeSubCurrency,
  withCurrencyDisplay,
  withMainCurrency,
  withSubCurrency,
  type CurrencyCode,
  type CurrencyDisplayPreferences,
  type CurrencyPreferences,
  type CurrencyPreferenceStore,
} from './currency-preference';

export interface CurrencySettings {
  readonly preferences: CurrencyPreferences;
  readonly error: string | null;
  selectMainCurrency(code: CurrencyCode): void;
  selectSubCurrency(code: CurrencyCode | null): boolean;
  addSubCurrency(code: CurrencyCode): boolean;
  removeSubCurrency(code: CurrencyCode): boolean;
  updateDisplay(patch: Partial<CurrencyDisplayPreferences>): void;
}

interface CurrencyState {
  preferences: CurrencyPreferences;
  error: string | null;
}

const CurrencyContext = createContext<CurrencySettings | null>(null);

function loadPreferences(store: CurrencyPreferenceStore): CurrencyState {
  try {
    return { preferences: store.read(), error: null };
  } catch {
    return { preferences: DEFAULT_CURRENCY_PREFERENCES, error: t('currencyLoadError') };
  }
}

/** Single globally shared preference, accessible to future feature controllers. */
export function CurrencyPreferencesProvider({
  children,
  store,
}: {
  children: ReactNode;
  store: CurrencyPreferenceStore;
}) {
  const [state, setState] = useState<CurrencyState>(() => loadPreferences(store));
  const current = useRef(state.preferences);

  const commit = useCallback(
    (next: CurrencyPreferences) => {
      try {
        store.write(next);
        current.current = next;
        setState({ preferences: next, error: null });
        return true;
      } catch {
        setState((previous) => ({ ...previous, error: t('currencySaveError') }));
        return false;
      }
    },
    [store],
  );

  const selectMainCurrency = useCallback(
    (code: CurrencyCode) => {
      commit(withMainCurrency(current.current, code));
    },
    [commit],
  );
  const selectSubCurrency = useCallback(
    (code: CurrencyCode | null) => commit(withSubCurrency(current.current, code)),
    [commit],
  );

  const addSubCurrencyChoice = useCallback(
    (code: CurrencyCode) => {
      if (current.current.subCodes.includes(code)) return false;
      if (current.current.subCodes.length >= MAX_SUB_CURRENCIES) {
        setState((previous) => ({
          ...previous,
          error: t('currencySubLimitReached'),
        }));
        return false;
      }
      try {
        return commit(addSubCurrency(current.current, code));
      } catch {
        setState((previous) => ({ ...previous, error: t('currencySaveError') }));
        return false;
      }
    },
    [commit],
  );
  const removeSubCurrencyChoice = useCallback(
    (code: CurrencyCode) => commit(removeSubCurrency(current.current, code)),
    [commit],
  );

  const updateDisplay = useCallback(
    (patch: Partial<CurrencyDisplayPreferences>) => {
      commit(withCurrencyDisplay(current.current, patch));
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      preferences: state.preferences,
      error: state.error,
      selectMainCurrency,
      selectSubCurrency,
      addSubCurrency: addSubCurrencyChoice,
      removeSubCurrency: removeSubCurrencyChoice,
      updateDisplay,
    }),
    [
      state.preferences,
      state.error,
      selectMainCurrency,
      selectSubCurrency,
      addSubCurrencyChoice,
      removeSubCurrencyChoice,
      updateDisplay,
    ],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrencySettings(): CurrencySettings {
  const settings = useContext(CurrencyContext);
  if (!settings) {
    throw new Error('useCurrencySettings must be used within CurrencyPreferencesProvider');
  }
  return settings;
}

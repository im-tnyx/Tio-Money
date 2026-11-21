import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { CURRENCY_OPTIONS } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { t } from '@/shared/i18n/strings';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

export function useSubCurrencyViewModel(): {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
} {
  const router = useRouter();
  const { preferences, error, selectSubCurrency } = useCurrencySettings();

  const onAction = useCallback(
    (action: SubCurrencyAction) => {
      switch (action.type) {
        case 'back':
          router.back();
          break;
        case 'select':
          // Stay on this screen so a storage failure remains visible.
          selectSubCurrency(action.code);
          break;
      }
    },
    [router, selectSubCurrency],
  );

  const state = useMemo<SubCurrencyUiState>(
    () => ({
      mainCode: preferences.mainCode,
      options: [
        {
          key: 'none',
          code: null,
          label: t('currencyNone'),
          selected: preferences.subCode === null,
        },
        ...CURRENCY_OPTIONS.filter((option) => option.code !== preferences.mainCode).map(
          (option) => ({
            key: option.code,
            code: option.code,
            label: option.code + ' – ' + option.country + ' (' + option.symbol + ')',
            selected: preferences.subCode === option.code,
          }),
        ),
      ],
      error,
    }),
    [preferences.mainCode, preferences.subCode, error],
  );

  return { state, onAction };
}

import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

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
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  const onAction = useCallback(
    (action: SubCurrencyAction) => {
      switch (action.type) {
        case 'back':
          router.back();
          break;
        case 'add.open':
          setEditing(false);
          setSheetVisible(true);
          break;
        case 'add.dismiss':
          setSheetVisible(false);
          break;
        case 'edit.toggle':
          if (preferences.subCode !== null) setEditing((current) => !current);
          break;
        case 'remove':
          if (preferences.subCode !== null && selectSubCurrency(null)) {
            setEditing(false);
          }
          break;
        case 'select':
          if (selectSubCurrency(action.code)) {
            setSheetVisible(false);
            setEditing(false);
          }
          break;
      }
    },
    [router, preferences.subCode, selectSubCurrency],
  );

  const state = useMemo<SubCurrencyUiState>(() => {
    const selectedCurrency = CURRENCY_OPTIONS.find(
      (option) => option.code === preferences.subCode,
    );
    return {
      mainCode: preferences.mainCode,
      selectedLabel: selectedCurrency
        ? selectedCurrency.code +
          ' – ' +
          selectedCurrency.country +
          ' (' +
          selectedCurrency.symbol +
          ')'
        : null,
      choices: [
        { key: 'none', code: null, label: t('currencyNone'), selected: preferences.subCode === null },
        ...CURRENCY_OPTIONS.filter((option) => option.code !== preferences.mainCode).map(
          (option) => ({
            key: option.code,
            code: option.code,
            label: option.code + ' – ' + option.country + ' (' + option.symbol + ')',
            selected: preferences.subCode === option.code,
          }),
        ),
      ],
      sheetVisible,
      editing: editing && selectedCurrency !== undefined,
      error,
    };
  }, [preferences.mainCode, preferences.subCode, sheetVisible, editing, error]);

  return { state, onAction };
}

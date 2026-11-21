import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getReferenceRate, type ReferenceRate } from '@/data/market/fx-reference-rates';
import { CURRENCY_OPTIONS, MAX_SUB_CURRENCIES } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { t } from '@/shared/i18n/strings';

import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

export function useSubCurrencyViewModel(): {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
} {
  const router = useRouter();
  const { preferences, error, addSubCurrency, removeSubCurrency } = useCurrencySettings();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rates, setRates] = useState<Record<string, ReferenceRate | null>>({});

  useEffect(() => {
    let active = true;
    const main = preferences.mainCode;
    const subs = preferences.subCodes;
    void Promise.all(
      subs.map(async (code) => {
        const pair = code + '/' + main;
        try {
          return { pair, quote: await getReferenceRate(code, main) };
        } catch {
          return { pair, quote: null };
        }
      }),
    ).then((results) => {
      if (!active) return;
      setRates((previous) => ({
        ...previous,
        ...Object.fromEntries(results.map(({ pair, quote }) => [pair, quote])),
      }));
    });
    return () => {
      active = false;
    };
  }, [preferences.mainCode, preferences.subCodes]);

  const onAction = useCallback(
    (action: SubCurrencyAction) => {
      switch (action.type) {
        case 'back':
          if (editing) setEditing(false);
          else router.back();
          break;
        case 'edit.cancel':
          setEditing(false);
          break;
        case 'add.open':
          setEditing(false);
          setSheetVisible(true);
          break;
        case 'add.dismiss':
          setSheetVisible(false);
          break;
        case 'edit.toggle':
          if (preferences.subCodes.length > 0) setEditing((current) => !current);
          break;
        case 'remove':
          if (removeSubCurrency(action.code) && preferences.subCodes.length === 1) {
            setEditing(false);
          }
          break;
        case 'select':
          // One tap saves directly. Keep the sheet open if persistence fails.
          if (addSubCurrency(action.code)) {
            setSheetVisible(false);
          }
          break;
      }
    },
    [router, editing, preferences.subCodes, addSubCurrency, removeSubCurrency],
  );

  const state = useMemo<SubCurrencyUiState>(
    () => ({
      mainCode: preferences.mainCode,
      selected: preferences.subCodes.map((code) => {
        const item = CURRENCY_OPTIONS.find((option) => option.code === code);
        const pair = code + '/' + preferences.mainCode;
        const rate = rates[pair];
        return {
          code,
          label: item ? item.code + ' – ' + item.country + ' (' + item.symbol + ')' : code,
          rate: rate ?? null,
          rateStatus:
            rate === undefined ? 'loading' : rate === null ? 'unavailable' : 'available',
        } as const;
      }),
      choices: CURRENCY_OPTIONS.filter(
        (item) => item.code !== preferences.mainCode && !preferences.subCodes.includes(item.code),
      ).map((item) => ({
        key: item.code,
        code: item.code,
        label: item.code + ' – ' + item.country + ' (' + item.symbol + ')',
      })),
      sheetVisible,
      editing: editing && preferences.subCodes.length > 0,
      limit: MAX_SUB_CURRENCIES,
      error,
    }),
    [preferences.mainCode, preferences.subCodes, sheetVisible, editing, error, rates],
  );

  return { state, onAction };
}

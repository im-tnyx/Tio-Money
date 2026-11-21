import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getReferenceRate, type ReferenceRate } from '@/data/market/fx-reference-rates';
import {
  CURRENCY_OPTIONS,
  MAX_SUB_CURRENCIES,
  type CurrencyCode,
} from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';

import type {
  SubCurrencyAction,
  SubCurrencyChoiceRow,
  SubCurrencySelectedRow,
  SubCurrencyUiState,
} from './sub-currency-contract';

function currencyLabel(code: CurrencyCode): string {
  const item = CURRENCY_OPTIONS.find((option) => option.code === code);
  if (!item) return code;
  return item.code + ' – ' + item.country + ' (' + item.symbol + ')';
}

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
      const updated: Record<string, ReferenceRate | null> = {};
      for (const result of results) updated[result.pair] = result.quote;
      setRates((previous) => ({ ...previous, ...updated }));
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
          if (addSubCurrency(action.code)) setSheetVisible(false);
          break;
      }
    },
    [router, editing, preferences.subCodes, addSubCurrency, removeSubCurrency],
  );

  const state = useMemo<SubCurrencyUiState>(() => {
    const selected: SubCurrencySelectedRow[] = [];
    for (const code of preferences.subCodes) {
      const rate = rates[code + '/' + preferences.mainCode];
      let rateStatus: SubCurrencySelectedRow['rateStatus'] = 'loading';
      if (rate === null) rateStatus = 'unavailable';
      if (rate !== null && rate !== undefined) rateStatus = 'available';
      selected.push({ code, label: currencyLabel(code), rate: rate ?? null, rateStatus });
    }
    const choices: SubCurrencyChoiceRow[] = [];
    for (const item of CURRENCY_OPTIONS) {
      if (item.code === preferences.mainCode) continue;
      if (preferences.subCodes.includes(item.code)) continue;
      choices.push({ key: item.code, code: item.code, label: currencyLabel(item.code) });
    }
    return {
      mainCode: preferences.mainCode,
      selected,
      choices,
      sheetVisible,
      editing: editing && selected.length > 0,
      limit: MAX_SUB_CURRENCIES,
      error,
    };
  }, [preferences.mainCode, preferences.subCodes, sheetVisible, editing, error, rates]);

  return { state, onAction };
}

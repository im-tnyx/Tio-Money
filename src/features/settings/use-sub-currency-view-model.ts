import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getReferenceRate, type ReferenceRate } from '@/data/market/fx-reference-rates';
import {
  CURRENCY_OPTIONS,
  MAX_SUB_CURRENCIES,
  resolveSubCurrencyDisplay,
  type CurrencyCode,
} from '@/shared/currency/currency-preference';
import { formatSubCurrencyDetailPreview } from '@/shared/currency/sub-currency-detail-preview';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { t } from '@/shared/i18n/strings';

import type {
  SubCurrencyAction,
  SubCurrencyChoiceRow,
  SubCurrencySelectedRow,
  SubCurrencyUiState,
} from './sub-currency-contract';

const decimalLabels = [
  t('currencyDecimalNone'),
  t('currencyDecimalOne'),
  t('currencyDecimalTwo'),
  t('currencyDecimalThree'),
] as const;

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
  const { preferences, error, addSubCurrency, removeSubCurrency, updateSubDisplay } =
    useCurrencySettings();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rates, setRates] = useState<Record<string, ReferenceRate | null>>({});
  const [detailCode, setDetailCode] = useState<CurrencyCode | null>(null);
  const [detailMode, setDetailMode] = useState<'overview' | 'decimal'>('overview');
  const [refreshingPair, setRefreshingPair] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const refreshRequest = useRef(0);

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

  const dismissDetail = useCallback(() => {
    refreshRequest.current += 1;
    setDetailCode(null);
    setDetailMode('overview');
    setRefreshingPair(null);
    setRefreshError(null);
  }, []);

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
          dismissDetail();
          setEditing(false);
          setSheetVisible(true);
          break;
        case 'add.dismiss':
          setSheetVisible(false);
          break;
        case 'edit.toggle':
          dismissDetail();
          if (preferences.subCodes.length > 0) setEditing((current) => !current);
          break;
        case 'remove':
          if (removeSubCurrency(action.code)) {
            if (action.code === detailCode) dismissDetail();
            if (preferences.subCodes.length === 1) setEditing(false);
          }
          break;
        case 'select':
          if (addSubCurrency(action.code)) setSheetVisible(false);
          break;
        case 'detail.open':
          if (!editing && preferences.subCodes.includes(action.code)) {
            dismissDetail();
            setDetailCode(action.code);
          }
          break;
        case 'detail.dismiss':
          dismissDetail();
          break;
        case 'detail.position.select':
          if (detailCode) updateSubDisplay(detailCode, { unitPosition: action.value });
          break;
        case 'detail.decimal.open':
          if (detailCode) setDetailMode('decimal');
          break;
        case 'detail.decimal.back':
          setDetailMode('overview');
          break;
        case 'detail.decimal.select':
          if (detailCode && updateSubDisplay(detailCode, { decimalDigits: action.value })) {
            setDetailMode('overview');
          }
          break;
        case 'detail.refresh': {
          if (!detailCode || !preferences.subCodes.includes(detailCode)) break;
          const main = preferences.mainCode;
          const pair = detailCode + '/' + main;
          if (refreshingPair === pair) break;
          const generation = ++refreshRequest.current;
          setRefreshError(null);
          setRefreshingPair(pair);
          void getReferenceRate(detailCode, main)
            .then((quote) => {
              if (generation !== refreshRequest.current) return;
              setRates((previous) => ({ ...previous, [pair]: quote }));
            })
            .catch(() => {
              if (generation !== refreshRequest.current) return;
              setRefreshError(t('currencyFxRefreshFailed'));
            })
            .finally(() => {
              if (generation === refreshRequest.current) setRefreshingPair(null);
            });
          break;
        }
      }
    },
    [
      router,
      editing,
      detailCode,
      refreshingPair,
      dismissDetail,
      preferences.mainCode,
      preferences.subCodes,
      addSubCurrency,
      removeSubCurrency,
      updateSubDisplay,
    ],
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
    const selectedDetail = selected.find((item) => item.code === detailCode);
    const subDisplay = detailCode ? resolveSubCurrencyDisplay(preferences, detailCode) : null;
    const currency = CURRENCY_OPTIONS.find((item) => item.code === detailCode);
    const displayedDigits = subDisplay
      ? subDisplay.decimalDigits === 'currency'
        ? (currency?.minorDigits ?? 2)
        : subDisplay.decimalDigits
      : 2;
    const preview = detailCode
      ? formatSubCurrencyDetailPreview(preferences, detailCode, selectedDetail?.rate?.rate ?? null)
      : null;
    return {
      mainCode: preferences.mainCode,
      selected,
      choices,
      sheetVisible,
      detail:
        selectedDetail && subDisplay && preview
          ? {
              code: selectedDetail.code,
              label: selectedDetail.label,
              ...preview,
              rateValue: selectedDetail.rate
                ? selectedDetail.rate.rate.toFixed(6)
                : t(
                    selectedDetail.rateStatus === 'loading'
                      ? 'currencyFxLoading'
                      : 'currencyFxUnavailable',
                  ),
              rateStatus: selectedDetail.rateStatus,
              unitPosition: subDisplay.unitPosition,
              decimalDigits: displayedDigits,
              decimalLabel: decimalLabels[displayedDigits],
              refreshing: refreshingPair === detailCode + '/' + preferences.mainCode,
              refreshError,
            }
          : null,
      detailMode,
      editing: editing && selected.length > 0,
      limit: MAX_SUB_CURRENCIES,
      error,
    };
  }, [
    preferences,
    rates,
    detailCode,
    detailMode,
    sheetVisible,
    editing,
    error,
    refreshingPair,
    refreshError,
  ]);

  return { state, onAction };
}

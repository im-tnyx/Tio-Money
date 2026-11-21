import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  CURRENCY_OPTIONS,
  MAX_SUB_CURRENCIES,
  resolveSubCurrencyDisplay,
  type CurrencyCode,
} from '@/shared/currency/currency-preference';
import {
  formatSubCurrencyDetailCaption,
  formatSubCurrencyDetailPreview,
} from '@/shared/currency/sub-currency-detail-preview';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { useFxRates } from '@/shared/currency/fx-rate-provider';
import { fxPairKey } from '@/shared/currency/fx-rate-lifecycle';
import { t } from '@/shared/i18n/strings';

import {
  formatSubCurrencyDecimalExample,
  stepSubCurrencyDecimalDigits,
} from './sub-currency-decimal-step';
import {
  classifySubCurrencyRefresh,
  type SubCurrencyRefreshResult,
} from './sub-currency-refresh-feedback';
import type {
  SubCurrencyAction,
  SubCurrencyChoiceRow,
  SubCurrencySelectedRow,
  SubCurrencyUiState,
} from './sub-currency-contract';

function currencyLabel(code: CurrencyCode): string {
  return formatSubCurrencyDetailCaption(code);
}

export function useSubCurrencyViewModel(): {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
} {
  const router = useRouter();
  const { preferences, error, addSubCurrency, removeSubCurrency, updateSubDisplay } =
    useCurrencySettings();
  const { entries, refreshRate } = useFxRates();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [detailCode, setDetailCode] = useState<CurrencyCode | null>(null);
  const [refreshingPair, setRefreshingPair] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<{
    pair: string;
    result: SubCurrencyRefreshResult;
  } | null>(null);
  const refreshRequest = useRef(0);

  const dismissDetail = useCallback(() => {
    refreshRequest.current += 1;
    setDetailCode(null);
    setRefreshingPair(null);
    setRefreshError(null);
    setRefreshResult(null);
  }, []);

  const onAction = useCallback(
    (action: SubCurrencyAction) => {
      switch (action.type) {
        case 'back':
          router.back();
          break;
        case 'add.open':
          dismissDetail();
          setSheetVisible(true);
          break;
        case 'add.dismiss':
          setSheetVisible(false);
          break;
        case 'remove':
          if (removeSubCurrency(action.code)) {
            if (action.code === detailCode) dismissDetail();
          }
          break;
        case 'select':
          if (addSubCurrency(action.code)) setSheetVisible(false);
          break;
        case 'detail.open':
          if (preferences.subCodes.includes(action.code)) {
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
        case 'detail.decimal.step':
          if (detailCode && preferences.subCodes.includes(detailCode)) {
            const current = resolveSubCurrencyDisplay(preferences, detailCode).decimalDigits;
            const currency = CURRENCY_OPTIONS.find((item) => item.code === detailCode);
            const effective = current === 'currency' ? (currency?.minorDigits ?? 2) : current;
            const next = stepSubCurrencyDecimalDigits(effective, action.delta);
            if (next !== effective) updateSubDisplay(detailCode, { decimalDigits: next });
          }
          break;
        case 'detail.refresh': {
          if (!detailCode || !preferences.subCodes.includes(detailCode)) break;
          const main = preferences.mainCode;
          const pair = fxPairKey(detailCode, main);
          if (refreshingPair === pair) break;
          const previousRate = entries[pair]?.rate;
          const generation = ++refreshRequest.current;
          setRefreshError(null);
          setRefreshResult(null);
          setRefreshingPair(pair);
          void refreshRate(detailCode, main)
            .then((quote) => {
              if (generation !== refreshRequest.current || !quote) return;
              setRefreshResult({
                pair,
                result: classifySubCurrencyRefresh(previousRate, quote),
              });
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
      detailCode,
      refreshingPair,
      dismissDetail,
      entries,
      refreshRate,
      preferences,
      addSubCurrency,
      removeSubCurrency,
      updateSubDisplay,
    ],
  );

  const state = useMemo<SubCurrencyUiState>(() => {
    const selected: SubCurrencySelectedRow[] = [];
    for (const code of preferences.subCodes) {
      const current = entries[fxPairKey(code, preferences.mainCode)];
      const rate = current?.rate ?? null;
      const rateStatus: SubCurrencySelectedRow['rateStatus'] = current?.status ?? 'loading';
      selected.push({ code, label: currencyLabel(code), rate, rateStatus });
    }
    const choices: SubCurrencyChoiceRow[] = [];
    for (const item of CURRENCY_OPTIONS) {
      if (item.code === preferences.mainCode) continue;
      if (preferences.subCodes.includes(item.code)) continue;
      choices.push({ key: item.code, code: item.code, label: currencyLabel(item.code) });
    }
    const selectedDetail = selected.find((item) => item.code === detailCode);
    const fetchedAt = selectedDetail
      ? (entries[fxPairKey(selectedDetail.code, preferences.mainCode)]?.fetchedAt ?? null)
      : null;
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
      mainLabel: currencyLabel(preferences.mainCode),
      selected,
      choices,
      sheetVisible,
      detail:
        selectedDetail && subDisplay && preview
          ? {
              code: selectedDetail.code,
              label: formatSubCurrencyDetailCaption(selectedDetail.code),
              ...preview,
              rateValue: selectedDetail.rate
                ? selectedDetail.rate.rate.toFixed(6)
                : t(
                    selectedDetail.rateStatus === 'loading'
                      ? 'currencyFxLoading'
                      : 'currencyFxUnavailable',
                  ),
              rateStatus: selectedDetail.rateStatus,
              rateDate: selectedDetail.rate?.date ?? null,
              rateFetchedAt: fetchedAt,
              rateFetchedLabel: fetchedAt
                ? t('currencyFxCheckedAt') +
                  ': ' +
                  new Date(fetchedAt).toISOString().slice(0, 16).replace('T', ' ') +
                  ' UTC'
                : null,
              unitPosition: subDisplay.unitPosition,
              decimalDigits: displayedDigits,
              decimalLabel: formatSubCurrencyDecimalExample(displayedDigits),
              refreshing: refreshingPair === detailCode + '/' + preferences.mainCode,
              refreshError,
              refreshStatus:
                refreshingPair === detailCode + '/' + preferences.mainCode
                  ? t('currencyFxChecking')
                  : refreshError
                    ? refreshError
                    : refreshResult?.pair === detailCode + '/' + preferences.mainCode
                      ? t(
                          refreshResult.result === 'updated'
                            ? 'currencyFxRefreshUpdated'
                            : 'currencyFxRefreshUnchanged',
                        )
                      : null,
            }
          : null,
      limit: MAX_SUB_CURRENCIES,
      error,
    };
  }, [
    preferences,
    entries,
    detailCode,
    sheetVisible,
    error,
    refreshingPair,
    refreshError,
    refreshResult,
  ]);

  return { state, onAction };
}

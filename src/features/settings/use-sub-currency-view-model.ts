import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  CURRENCY_OPTIONS,
  MAX_SUB_CURRENCIES,
  isCurrencyCode,
  resolveNumberGrouping,
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

import { formatSubCurrencyDecimalExample } from './sub-currency-decimal-step';
import {
  classifySubCurrencyRefresh,
  type SubCurrencyRefreshResult,
} from './sub-currency-refresh-feedback';
import {
  formatSubCurrencyLastChecked,
  shouldOfferSubCurrencyRefresh,
  summarizeSubCurrencyChecks,
} from './sub-currency-rate-freshness';
import type {
  SubCurrencyAction,
  SubCurrencyChoiceRow,
  SubCurrencySelectedRow,
  SubCurrencyUiState,
} from './sub-currency-contract';

const REFRESH_CONFIRMATION_MS = 3000;

function currencyLabel(code: CurrencyCode): string {
  return formatSubCurrencyDetailCaption(code);
}

export function useSubCurrencyViewModel(initialDetailCode: CurrencyCode | null = null): {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
} {
  const router = useRouter();
  const { preferences, error, addSubCurrency, removeSubCurrency, updateSubDisplay } =
    useCurrencySettings();
  const { entries, refreshRate } = useFxRates();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [freshnessNow, setFreshnessNow] = useState(() => Date.now());
  const [refreshingList, setRefreshingList] = useState(false);
  const [detailCode, setDetailCode] = useState<CurrencyCode | null>(initialDetailCode);
  const [detailSheetKind, setDetailSheetKind] = useState<'decimal' | 'format' | null>(null);
  const [refreshingPair, setRefreshingPair] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<{
    pair: string;
    result: SubCurrencyRefreshResult;
  } | null>(null);
  const refreshRequest = useRef(0);
  const listRefreshInFlight = useRef(false);
  const listRefreshGeneration = useRef(0);

  useEffect(
    () => () => {
      listRefreshGeneration.current += 1;
    },
    [],
  );

  // Foregrounding updates *only* the freshness hint, never starts FX polling.
  useEffect(() => {
    const listener = AppState.addEventListener('change', (next) => {
      if (next === 'active') setFreshnessNow(Date.now());
    });
    return () => listener.remove();
  }, []);

  // Successful FX checks are brief confirmation, not persistent content.
  // Changing the active result, starting another refresh, or unmounting
  // automatically cancels the previous timer.
  useEffect(() => {
    if (!refreshResult) return;
    const timer = setTimeout(() => {
      setRefreshResult((current) => (current === refreshResult ? null : current));
    }, REFRESH_CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [refreshResult]);

  const dismissDetail = useCallback(() => {
    refreshRequest.current += 1;
    setDetailCode(null);
    setDetailSheetKind(null);
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
          if (!isCurrencyCode(preferences.mainCode)) break;
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
          if (!isCurrencyCode(preferences.mainCode)) break;
          if (addSubCurrency(action.code)) setSheetVisible(false);
          break;
        case 'detail.open':
          if (preferences.subCodes.includes(action.code)) {
            router.push({ pathname: '/currency/sub-detail', params: { code: action.code } });
          }
          break;
        case 'detail.dismiss':
          dismissDetail();
          router.back();
          break;
        case 'detail.options.open':
          if (detailCode && preferences.subCodes.includes(detailCode)) {
            setDetailSheetKind(action.sheet);
          }
          break;
        case 'detail.options.dismiss':
          setDetailSheetKind(null);
          break;
        case 'detail.position.select':
          setDetailSheetKind(null);
          if (detailCode) updateSubDisplay(detailCode, { unitPosition: action.value });
          break;
        case 'detail.decimal.select':
          setDetailSheetKind(null);
          if (detailCode && preferences.subCodes.includes(detailCode)) {
            updateSubDisplay(detailCode, { decimalDigits: action.value });
          }
          break;
        case 'detail.format.select':
          setDetailSheetKind(null);
          if (detailCode && preferences.subCodes.includes(detailCode)) {
            updateSubDisplay(detailCode, { grouping: action.value });
          }
          break;
        case 'list.refresh': {
          if (listRefreshInFlight.current) break;
          const main = preferences.mainCode;
          const refreshMoment = Date.now();
          const stale = preferences.subCodes.filter((code) => {
            const current = entries[fxPairKey(code, main)];
            return shouldOfferSubCurrencyRefresh(
              current?.status ?? 'loading',
              current?.fetchedAt ?? null,
              refreshMoment,
            );
          });
          if (stale.length === 0) break;
          listRefreshInFlight.current = true;
          setRefreshingList(true);
          const generation = ++listRefreshGeneration.current;
          void Promise.allSettled(stale.map((code) => refreshRate(code, main))).then(() => {
            if (generation !== listRefreshGeneration.current) return;
            listRefreshInFlight.current = false;
            setRefreshingList(false);
          });
          break;
        }
        case 'detail.refresh': {
          setDetailSheetKind(null);
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
    const mainConfigured = isCurrencyCode(preferences.mainCode);
    // Successful provider timestamps update the check-day view without impure
    // render-time clock calls or a polling timer.
    let currentCheckTime = freshnessNow;
    const selected: SubCurrencySelectedRow[] = [];
    for (const code of preferences.subCodes) {
      const pair = fxPairKey(code, preferences.mainCode);
      const current = entries[pair];
      const rate = current?.rate ?? null;
      const rateStatus: SubCurrencySelectedRow['rateStatus'] = current?.status ?? 'loading';
      if (rateStatus === 'available' && current?.fetchedAt !== null && current?.fetchedAt) {
        currentCheckTime = Math.max(currentCheckTime, current.fetchedAt);
      }
      selected.push({ code, label: currencyLabel(code), rate, rateStatus });
    }
    const checks = summarizeSubCurrencyChecks(
      preferences.subCodes.map((code) => {
        const current = entries[fxPairKey(code, preferences.mainCode)];
        return { status: current?.status ?? 'loading', fetchedAt: current?.fetchedAt ?? null };
      }),
      currentCheckTime,
    );
    const lastCheckedLabel =
      checks.uncheckedCount === selected.length
        ? t('currencyFxNeverChecked')
        : checks.uncheckedCount > 0
          ? t('currencyFxSomeNotChecked')
          : checks.oldestCheckedAt !== null
            ? t('currencyFxCheckedShort') +
              ' ' +
              formatSubCurrencyLastChecked(checks.oldestCheckedAt, currentCheckTime)
            : t('currencyFxNeverChecked');
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
    const formatGrouping = detailCode
      ? resolveNumberGrouping(detailCode, subDisplay?.grouping ?? 'auto')
      : 'international';
    const formatLabel =
      formatGrouping === 'indian'
        ? t('currencyLakhs')
        : formatGrouping === 'international'
          ? t('currencyMillions')
          : t('currencyNoFormat');
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
      mainLabel: mainConfigured ? currencyLabel(preferences.mainCode) : t('currencyChooseMain'),
      canAddSub: mainConfigured,
      selected,
      refreshSummary:
        checks.staleCount > 0 ? { lastCheckedLabel, refreshing: refreshingList } : null,
      choices,
      sheetVisible,
      detailSheetKind: selectedDetail ? detailSheetKind : null,
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
              unitPosition: subDisplay.unitPosition,
              decimalDigits: displayedDigits,
              decimalLabel: formatSubCurrencyDecimalExample(displayedDigits),
              formatGrouping,
              formatLabel,
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
    freshnessNow,
    refreshingList,
    detailSheetKind,
  ]);

  return { state, onAction };
}

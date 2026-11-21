import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import {
  CURRENCY_OPTIONS,
  type CurrencyDisplayPreferences,
} from '@/shared/currency/currency-preference';
import {
  formatCurrencyExample,
  getCurrencyLabel,
} from '@/shared/currency/currency-display-preview';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { t } from '@/shared/i18n/strings';

import type {
  MainCurrencyAction,
  MainCurrencyChoice,
  MainCurrencyChoiceRow,
  MainCurrencySheetKind,
  MainCurrencyUiState,
} from './main-currency-contract';

const decimalChoices = [
  { label: 'Currency default', value: 'currency' },
  { label: '1', value: 0 },
  { label: '1.0', value: 1 },
  { label: '1.00', value: 2 },
  { label: '1.000', value: 3 },
] as const;

function sheetTitle(kind: MainCurrencySheetKind | null): string {
  switch (kind) {
    case 'currency':
      return t('currencyChooseMain');
    case 'position':
      return t('currencyPosition');
    case 'decimal':
      return t('currencyDecimals');
    case 'grouping':
      return t('currencyGrouping');
    case 'compact':
      return t('currencyCompact');
    default:
      return t('currencyMain');
  }
}

export function useMainCurrencyViewModel(): {
  state: MainCurrencyUiState;
  onAction: (action: MainCurrencyAction) => void;
} {
  const router = useRouter();
  const { preferences, error, selectMainCurrency, updateDisplay } = useCurrencySettings();
  const [sheetKind, setSheetKind] = useState<MainCurrencySheetKind | null>(null);
  const onAction = useCallback(
    (action: MainCurrencyAction) => {
      switch (action.type) {
        case 'back':
          router.back();
          break;
        case 'open':
          setSheetKind(action.sheet);
          break;
        case 'dismiss':
          setSheetKind(null);
          break;
        case 'select': {
          const choice: MainCurrencyChoice = action.choice;
          if (choice.kind === 'currency') {
            selectMainCurrency(choice.code);
          } else {
            const patch: Partial<CurrencyDisplayPreferences> =
              choice.kind === 'position'
                ? { unitPosition: choice.value }
                : choice.kind === 'decimal'
                  ? { decimalDigits: choice.value }
                  : choice.kind === 'grouping'
                    ? { grouping: choice.value }
                    : { largeAmounts: choice.value };
            updateDisplay(patch);
          }
          setSheetKind(null);
          break;
        }
      }
    },
    [router, selectMainCurrency, updateDisplay],
  );

  const state = useMemo<MainCurrencyUiState>(() => {
    const d = preferences.display;
    const decimalLabel =
      d.decimalDigits === 'currency'
        ? t('currencyDefaultDigits')
        : decimalChoices.find((item) => item.value === d.decimalDigits)?.label ?? '1.00';
    const rows = [
      { key: 'position', label: t('currencyPosition'), value: d.unitPosition === 'front' ? t('currencyFront') : t('currencyEnd') },
      { key: 'decimal', label: t('currencyDecimals'), value: decimalLabel },
      { key: 'grouping', label: t('currencyGrouping'), value: d.grouping === 'indian' ? t('currencyIndian') : t('currencyInternational') },
      { key: 'compact', label: t('currencyCompact'), value: d.largeAmounts === 'full' ? t('currencyFull') : d.largeAmounts === 'indian' ? t('currencyLakhs') : t('currencyMillions') },
    ] as const;
    let choices: readonly MainCurrencyChoiceRow[] = [];
    if (sheetKind === 'currency') {
      choices = CURRENCY_OPTIONS.map((item) => ({
        key: item.code,
        label: item.code + ' – ' + item.country + ' (' + item.symbol + ')',
        selected: item.code === preferences.mainCode,
        choice: { kind: 'currency', code: item.code },
      }));
    } else if (sheetKind === 'position') {
      choices = ([
        { key: 'front', label: t('currencyFront'), selected: d.unitPosition === 'front', choice: { kind: 'position', value: 'front' } },
        { key: 'end', label: t('currencyEnd'), selected: d.unitPosition === 'end', choice: { kind: 'position', value: 'end' } },
      ] as const);
    } else if (sheetKind === 'decimal') {
      choices = decimalChoices.map((item) => ({
        key: String(item.value),
        label: item.label,
        selected: d.decimalDigits === item.value,
        choice: { kind: 'decimal' as const, value: item.value },
      }));
    } else if (sheetKind === 'grouping') {
      choices = ([
        { key: 'indian', label: t('currencyIndianExample'), selected: d.grouping === 'indian', choice: { kind: 'grouping', value: 'indian' } },
        { key: 'international', label: t('currencyInternationalExample'), selected: d.grouping === 'international', choice: { kind: 'grouping', value: 'international' } },
      ] as const);
    } else if (sheetKind === 'compact') {
      choices = ([
        { key: 'full', label: t('currencyFull'), selected: d.largeAmounts === 'full', choice: { kind: 'compact', value: 'full' } },
        { key: 'indian', label: t('currencyLakhs'), selected: d.largeAmounts === 'indian', choice: { kind: 'compact', value: 'indian' } },
        { key: 'international', label: t('currencyMillions'), selected: d.largeAmounts === 'international', choice: { kind: 'compact', value: 'international' } },
      ] as const);
    }
    return {
      label: getCurrencyLabel(preferences),
      preview: formatCurrencyExample(preferences, 1),
      largePreview: formatCurrencyExample(preferences, 1234567.89, true),
      rows,
      sheetKind,
      sheetTitle: sheetTitle(sheetKind),
      choices,
      error,
    };
  }, [preferences, error, sheetKind]);
  return { state, onAction };
}

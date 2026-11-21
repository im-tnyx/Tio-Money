import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import {
  CURRENCY_OPTIONS,
  resolveNumberGrouping,
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
  { label: t('currencyDecimalNone'), value: 0 },
  { label: t('currencyDecimalOne'), value: 1 },
  { label: t('currencyDecimalTwo'), value: 2 },
  { label: t('currencyDecimalThree'), value: 3 },
] as const;

function sheetTitle(kind: MainCurrencySheetKind | null): string {
  switch (kind) {
    case 'currency':
      return t('currencyChooseMain');
    case 'decimal':
      return t('currencyDecimals');
    case 'grouping':
      return t('currencyGrouping');
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
        case 'position.select':
          updateDisplay({ unitPosition: action.value });
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
              choice.kind === 'decimal'
                ? { decimalDigits: choice.value }
                : { grouping: choice.value };
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
    const effectiveGrouping = resolveNumberGrouping(preferences.mainCode, d.grouping);
    // Preserve native minor-digit defaults without exposing a separate sheet option.
    const displayedDigits =
      d.decimalDigits === 'currency'
        ? (CURRENCY_OPTIONS.find((item) => item.code === preferences.mainCode)?.minorDigits ?? 2)
        : d.decimalDigits;
    const decimalLabel =
      decimalChoices.find((item) => item.value === displayedDigits)?.label ??
      t('currencyDecimalTwo');
    const rows = [
      { key: 'decimal', label: t('currencyDecimals'), value: decimalLabel },
      {
        key: 'grouping',
        label: t('currencyFormat'),
        value:
          effectiveGrouping === 'indian'
            ? t('currencyLakhs')
            : effectiveGrouping === 'international'
              ? t('currencyMillions')
              : t('currencyNoFormat'),
      },
    ] as const;
    let choices: readonly MainCurrencyChoiceRow[] = [];
    if (sheetKind === 'currency') {
      choices = CURRENCY_OPTIONS.map((item) => ({
        key: item.code,
        label: item.code + ' – ' + item.country + ' (' + item.symbol + ')',
        selected: item.code === preferences.mainCode,
        choice: { kind: 'currency' as const, code: item.code },
      }));
    } else if (sheetKind === 'decimal') {
      choices = decimalChoices.map((item) => ({
        key: String(item.value),
        label: item.label,
        selected: displayedDigits === item.value,
        choice: { kind: 'decimal' as const, value: item.value },
      }));
    } else if (sheetKind === 'grouping') {
      choices = [
        {
          key: 'international',
          label: t('currencyMillionsExample'),
          selected: effectiveGrouping === 'international',
          choice: { kind: 'grouping', value: 'international' },
        },
        {
          key: 'indian',
          label: t('currencyLakhsExample'),
          selected: effectiveGrouping === 'indian',
          choice: { kind: 'grouping', value: 'indian' },
        },
        {
          key: 'none',
          label: t('currencyNoFormatExample'),
          selected: effectiveGrouping === 'none',
          choice: { kind: 'grouping', value: 'none' },
        },
      ] as const;
    }
    return {
      label: getCurrencyLabel(preferences),
      unitPosition: d.unitPosition,
      preview: formatCurrencyExample(preferences, 1),
      rows,
      sheetKind,
      sheetTitle: sheetTitle(sheetKind),
      choices,
      error,
    };
  }, [preferences, error, sheetKind]);
  return { state, onAction };
}

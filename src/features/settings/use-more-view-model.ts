import { useCallback, useState } from 'react';

import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { useAppearanceSettings } from '@/shared/theme/theme-provider';

import type { MoreAction, MoreUiState } from './more-contract';

export function useMoreViewModel(): {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
} {
  const { preference, error, selectPreference } = useAppearanceSettings();
  const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);
  const { preferences: currency, error: currencyError, selectMainCurrency, selectSubCurrency } =
    useCurrencySettings();
  const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
  const [currencyStep, setCurrencyStep] = useState<'overview' | 'main' | 'sub'>('overview');

  const onAction = useCallback(
    (action: MoreAction) => {
      switch (action.type) {
        case 'appearance.open':
          setAppearanceSheetVisible(true);
          break;
        case 'appearance.dismiss':
          setAppearanceSheetVisible(false);
          break;
        case 'appearance.select':
          selectPreference(action.preference);
          break;
        case 'currency.open':
          setCurrencyStep('overview');
          setCurrencySheetVisible(true);
          break;
        case 'currency.dismiss':
          setCurrencySheetVisible(false);
          setCurrencyStep('overview');
          break;
        case 'currency.back':
          setCurrencyStep('overview');
          break;
        case 'currency.pick-main':
          setCurrencyStep('main');
          break;
        case 'currency.pick-sub':
          setCurrencyStep('sub');
          break;
        case 'currency.select':
          if (currencyStep === 'main' && action.code !== null) {
            selectMainCurrency(action.code);
            setCurrencyStep('overview');
          } else if (currencyStep === 'sub') {
            selectSubCurrency(action.code);
            setCurrencyStep('overview');
          }
          break;
      }
    },
    [selectPreference, currencyStep, selectMainCurrency, selectSubCurrency],
  );

  return {
    state: {
      appearance: preference,
      error,
      appearanceSheetVisible,
      currency,
      currencyError,
      currencySheetVisible,
      currencyStep,
    },
    onAction,
  };
}

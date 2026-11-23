import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { useAppearanceSettings } from '@/shared/theme/theme-provider';

import type { MoreAction, MoreUiState } from './more-contract';

export function useMoreViewModel(): {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
} {
  const router = useRouter();
  const { preference, error, selectPreference } = useAppearanceSettings();
  const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);
  const { preferences: currency } = useCurrencySettings();

  const onAction = useCallback(
    (action: MoreAction) => {
      switch (action.type) {
        case 'account.groups.open':
          router.push('/account-groups');
          break;
        case 'appearance.open':
          setAppearanceSheetVisible(true);
          break;
        case 'appearance.dismiss':
          setAppearanceSheetVisible(false);
          break;
        case 'appearance.select':
          selectPreference(action.preference);
          break;
        case 'currency.main.open':
          router.push('/currency/main');
          break;
        case 'currency.sub.open':
          router.push('/currency/sub');
          break;
      }
    },
    [router, selectPreference],
  );

  return {
    state: {
      appearance: preference,
      error,
      appearanceSheetVisible,
      currency,
    },
    onAction,
  };
}

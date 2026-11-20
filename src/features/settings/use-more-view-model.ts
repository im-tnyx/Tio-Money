import { useCallback, useState } from 'react';

import { useAppearanceSettings } from '@/shared/theme/theme-provider';

import type { MoreAction, MoreUiState } from './more-contract';

export function useMoreViewModel(): {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
} {
  const { preference, error, selectPreference } = useAppearanceSettings();
  const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);

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
      }
    },
    [selectPreference],
  );

  return { state: { appearance: preference, error, appearanceSheetVisible }, onAction };
}

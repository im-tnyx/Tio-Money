import { useCallback } from 'react';

import { useAppearanceSettings } from '@/shared/theme/theme-provider';

import type { MoreAction, MoreUiState } from './more-contract';

export function useMoreViewModel(): {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
} {
  const { preference, error, selectPreference } = useAppearanceSettings();
  const onAction = useCallback(
    (action: MoreAction) => {
      if (action.type === 'appearance.select') selectPreference(action.preference);
    },
    [selectPreference],
  );
  return { state: { appearance: preference, error }, onAction };
}

import type { AppearancePreference } from '@/shared/theme/appearance-preference';

export interface MoreUiState {
  readonly appearance: AppearancePreference;
  readonly error: string | null;
}

export type MoreAction = {
  readonly type: 'appearance.select';
  readonly preference: AppearancePreference;
};

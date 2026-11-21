import type { AppearancePreference } from '@/shared/theme/appearance-preference';

export interface MoreUiState {
  readonly appearance: AppearancePreference;
  readonly error: string | null;
  readonly appearanceSheetVisible: boolean;
}

export type MoreAction =
  | { readonly type: 'appearance.open' }
  | { readonly type: 'appearance.dismiss' }
  | { readonly type: 'appearance.select'; readonly preference: AppearancePreference };

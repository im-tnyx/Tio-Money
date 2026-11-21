import type { CurrencyCode, CurrencyPreferences } from '@/shared/currency/currency-preference';
import type { AppearancePreference } from '@/shared/theme/appearance-preference';

export interface MoreUiState {
  readonly appearance: AppearancePreference;
  readonly error: string | null;
  readonly appearanceSheetVisible: boolean;
  readonly currency: CurrencyPreferences;
  readonly currencyError: string | null;
  readonly currencySheetVisible: boolean;
  readonly currencyStep: 'overview' | 'main' | 'sub';
}

export type MoreAction =
  | { readonly type: 'appearance.open' }
  | { readonly type: 'appearance.dismiss' }
  | { readonly type: 'appearance.select'; readonly preference: AppearancePreference }
  | { readonly type: 'currency.open' }
  | { readonly type: 'currency.dismiss' }
  | { readonly type: 'currency.back' }
  | { readonly type: 'currency.pick-main' }
  | { readonly type: 'currency.pick-sub' }
  | { readonly type: 'currency.select'; readonly code: CurrencyCode | null };

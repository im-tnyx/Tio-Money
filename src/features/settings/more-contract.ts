import type { CurrencyPreferences } from '@/shared/currency/currency-preference';
import type { AppearancePreference } from '@/shared/theme/appearance-preference';

export interface MoreUiState {
  readonly appearance: AppearancePreference;
  readonly error: string | null;
  readonly appearanceSheetVisible: boolean;
  readonly currency: CurrencyPreferences;
}

export type MoreAction =
  | { readonly type: 'account.groups.open' }
  | { readonly type: 'account.manage.open' }
  | { readonly type: 'appearance.open' }
  | { readonly type: 'appearance.dismiss' }
  | { readonly type: 'appearance.select'; readonly preference: AppearancePreference }
  | { readonly type: 'currency.main.open' }
  | { readonly type: 'currency.sub.open' };

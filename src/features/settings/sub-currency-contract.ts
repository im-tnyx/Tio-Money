import type { CurrencyCode } from '@/shared/currency/currency-preference';

export interface SubCurrencyChoiceRow {
  readonly key: string;
  readonly code: CurrencyCode | null;
  readonly label: string;
  readonly selected: boolean;
}

export interface SubCurrencyUiState {
  readonly mainCode: CurrencyCode;
  readonly options: readonly SubCurrencyChoiceRow[];
  readonly error: string | null;
}

export type SubCurrencyAction =
  | { readonly type: 'back' }
  | { readonly type: 'select'; readonly code: CurrencyCode | null };

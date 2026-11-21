import type { CurrencyCode } from '@/shared/currency/currency-preference';
import type { ReferenceRate } from '@/data/market/fx-reference-rates';

export interface SubCurrencyChoiceRow {
  readonly key: string;
  readonly code: CurrencyCode;
  readonly label: string;
}

export interface SubCurrencySelectedRow {
  readonly code: CurrencyCode;
  readonly label: string;
  readonly rate: ReferenceRate | null;
  readonly rateStatus: 'loading' | 'available' | 'unavailable';
}

export interface SubCurrencyUiState {
  readonly mainCode: CurrencyCode;
  readonly selected: readonly SubCurrencySelectedRow[];
  readonly choices: readonly SubCurrencyChoiceRow[];
  readonly sheetVisible: boolean;
  readonly editing: boolean;
  readonly limit: number;
  readonly error: string | null;
}

export type SubCurrencyAction =
  | { readonly type: 'back' }
  | { readonly type: 'edit.cancel' }
  | { readonly type: 'add.open' }
  | { readonly type: 'add.dismiss' }
  | { readonly type: 'edit.toggle' }
  | { readonly type: 'remove'; readonly code: CurrencyCode }
  | { readonly type: 'select'; readonly code: CurrencyCode };

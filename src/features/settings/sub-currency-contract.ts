import type { CurrencyCode } from '@/shared/currency/currency-preference';

export interface SubCurrencyChoiceRow {
  readonly key: string;
  readonly code: CurrencyCode | null;
  readonly label: string;
  readonly selected: boolean;
}

export interface SubCurrencyUiState {
  readonly mainCode: CurrencyCode;
  readonly selectedLabel: string | null;
  readonly choices: readonly SubCurrencyChoiceRow[];
  readonly sheetVisible: boolean;
  readonly editing: boolean;
  readonly error: string | null;
}

export type SubCurrencyAction =
  | { readonly type: 'back' }
  | { readonly type: 'add.open' }
  | { readonly type: 'add.dismiss' }
  | { readonly type: 'edit.toggle' }
  | { readonly type: 'remove' }
  | { readonly type: 'select'; readonly code: CurrencyCode | null };

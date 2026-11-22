import type {
  CurrencyCode,
  DecimalDigits,
  NumberGrouping,
  UnitPosition,
} from '@/shared/currency/currency-preference';

export type MainCurrencySheetKind = 'currency' | 'decimal' | 'grouping';

export type MainCurrencyChoice =
  | { readonly kind: 'currency'; readonly code: CurrencyCode }
  | { readonly kind: 'decimal'; readonly value: DecimalDigits }
  | { readonly kind: 'grouping'; readonly value: NumberGrouping };

export interface MainCurrencyRow {
  readonly key: MainCurrencySheetKind;
  readonly label: string;
  readonly value: string;
}

export interface MainCurrencyChoiceRow {
  readonly key: string;
  readonly label: string;
  readonly selected: boolean;
  readonly choice: MainCurrencyChoice;
}

export interface MainCurrencyUiState {
  readonly label: string;
  readonly unitPosition: UnitPosition;
  readonly preview: string;
  readonly rows: readonly MainCurrencyRow[];
  readonly sheetKind: MainCurrencySheetKind | null;
  readonly sheetTitle: string;
  readonly choices: readonly MainCurrencyChoiceRow[];
  readonly error: string | null;
}

export type MainCurrencyAction =
  | { readonly type: 'back' }
  | { readonly type: 'open'; readonly sheet: MainCurrencySheetKind }
  | { readonly type: 'position.select'; readonly value: UnitPosition }
  | { readonly type: 'dismiss' }
  | { readonly type: 'select'; readonly choice: MainCurrencyChoice };

import type { ReferenceRate } from '@/data/market/fx-reference-rates';
import type { CurrencyCode, UnitPosition } from '@/shared/currency/currency-preference';

export interface SubCurrencyChoiceRow {
  readonly key: string;
  readonly code: CurrencyCode;
  readonly label: string;
}

export interface SubCurrencySelectedRow {
  readonly code: CurrencyCode;
  readonly label: string;
  readonly rate: ReferenceRate | null;
  readonly rateStatus: 'loading' | 'available' | 'cached' | 'unavailable';
}

export interface SubCurrencyDetail {
  readonly code: CurrencyCode;
  readonly label: string;
  readonly subPreview: string;
  readonly mainPreview: string;
  readonly rateValue: string;
  readonly rateStatus: SubCurrencySelectedRow['rateStatus'];
  readonly rateDate: string | null;
  readonly rateFetchedAt: number | null;
  readonly unitPosition: UnitPosition;
  readonly decimalDigits: 0 | 1 | 2 | 3;
  readonly decimalLabel: string;
  readonly refreshing: boolean;
  readonly refreshError: string | null;
  readonly refreshStatus: string | null;
}

export interface SubCurrencyUiState {
  readonly mainCode: CurrencyCode;
  readonly mainLabel: string;
  readonly canAddSub: boolean;
  readonly selected: readonly SubCurrencySelectedRow[];
  readonly choices: readonly SubCurrencyChoiceRow[];
  readonly sheetVisible: boolean;
  readonly detail: SubCurrencyDetail | null;
  readonly limit: number;
  readonly error: string | null;
}

export type SubCurrencyAction =
  | { readonly type: 'back' }
  | { readonly type: 'add.open' }
  | { readonly type: 'add.dismiss' }
  | { readonly type: 'remove'; readonly code: CurrencyCode }
  | { readonly type: 'select'; readonly code: CurrencyCode }
  | { readonly type: 'detail.open'; readonly code: CurrencyCode }
  | { readonly type: 'detail.dismiss' }
  | { readonly type: 'detail.refresh' }
  | { readonly type: 'detail.position.select'; readonly value: UnitPosition }
  | { readonly type: 'detail.decimal.step'; readonly delta: -1 | 1 };

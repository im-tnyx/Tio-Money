import type { CurrencyCode, CurrencyPreferences } from '@/shared/currency/currency-preference';

export type PreviewGroup = 'cash' | 'bank';

export const bankCapabilities = ['upi', 'debitCard', 'cheque', 'internetBanking'] as const;
export type BankCapability = (typeof bankCapabilities)[number];

interface CommonDraft {
  readonly name: string;
  readonly openingAmount: string;
  readonly currency: CurrencyCode;
  readonly description: string;
}

export type AccountDraft =
  | (CommonDraft & { readonly group: 'cash' })
  | (CommonDraft & {
      readonly group: 'bank';
      readonly bankName: string;
      readonly capabilities: Readonly<Record<BankCapability, boolean>>;
    });

export function isPreviewGroup(value: unknown): value is PreviewGroup {
  return value === 'cash' || value === 'bank';
}

export function draftCurrencies(preferences: Pick<CurrencyPreferences, 'mainCode' | 'subCodes'>) {
  return [preferences.mainCode, ...preferences.subCodes];
}

export function newAccountDraft(group: PreviewGroup, currency: CurrencyCode): AccountDraft {
  const common = { name: '', openingAmount: '', currency, description: '' };
  if (group === 'cash') return { ...common, group };
  return {
    ...common,
    group,
    bankName: '',
    capabilities: { upi: false, debitCard: false, cheque: false, internetBanking: false },
  };
}

export type AccountFormAction =
  | {
      readonly type: 'text';
      readonly field: 'name' | 'openingAmount' | 'description' | 'bankName';
      readonly value: string;
    }
  | { readonly type: 'capability'; readonly capability: BankCapability; readonly value: boolean }
  | { readonly type: 'currency'; readonly value: CurrencyCode };

export function updateAccountDraft(
  draft: AccountDraft,
  action: AccountFormAction,
  allowedCurrencies: readonly CurrencyCode[],
): AccountDraft {
  switch (action.type) {
    case 'text':
      if (action.field === 'bankName') {
        return draft.group === 'bank' ? { ...draft, bankName: action.value } : draft;
      }
      return { ...draft, [action.field]: action.value };
    case 'capability':
      return draft.group === 'bank'
        ? { ...draft, capabilities: { ...draft.capabilities, [action.capability]: action.value } }
        : draft;
    case 'currency':
      return allowedCurrencies.includes(action.value) && draft.currency !== action.value
        ? { ...draft, currency: action.value, openingAmount: '' }
        : draft;
  }
}

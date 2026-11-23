import type { TranslationKey } from '@/shared/i18n/strings';

/** Visual catalogue only: these IDs do not create financial ledger accounts. */
export const BUILT_IN_ACCOUNT_GROUPS = [
  { id: 'cash', label: 'accountGroupCash', detail: 'accountGroupCashInfo' },
  { id: 'bank', label: 'accountGroupBank', detail: 'accountGroupBankInfo' },
  { id: 'credit-card', label: 'accountGroupCreditCard', detail: 'accountGroupCreditCardInfo' },
  { id: 'loan', label: 'accountGroupLoan', detail: 'accountGroupLoanInfo' },
  { id: 'insurance', label: 'accountGroupInsurance', detail: 'accountGroupInsuranceInfo' },
  { id: 'investment', label: 'accountGroupInvestment', detail: 'accountGroupInvestmentInfo' },
  { id: 'wallet', label: 'accountGroupWallet', detail: 'accountGroupWalletInfo' },
] as const satisfies readonly {
  readonly id: string;
  readonly label: TranslationKey;
  readonly detail: TranslationKey;
}[];

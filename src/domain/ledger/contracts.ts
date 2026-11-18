/** Pure finance contracts only. No ledger engine or persistence is implemented in Phase 0. */
export type CurrencyCode = 'INR';
export type AccountClassification = 'asset' | 'liability';
export type LedgerAccountKind = 'asset' | 'liability' | 'income' | 'expense' | 'equity';
export type JournalSide = 'debit' | 'credit';
export type LedgerEventType =
  'opening' | 'income' | 'expense' | 'transfer' | 'refund' | 'adjustment' | 'reversal';

export interface MoneyMinor {
  readonly currency: CurrencyCode;
  readonly paise: number; // validate positive safe integer before future posting
}

export interface JournalPostingDraft {
  readonly ledgerAccountId: string;
  readonly side: JournalSide;
  readonly amountMinor: MoneyMinor;
}

export interface JournalDraft {
  readonly eventType: LedgerEventType;
  readonly occurredAtMs: number;
  readonly postings: readonly JournalPostingDraft[];
}

/** Phase 2 will design idempotent writes after owner resolves TM-ADR-011. */
export interface LedgerRepositoryPort {
  saveBalancedEvent(draft: JournalDraft, clientRequestId: string): Promise<string>;
  getAccountBalanceMinor(accountId: string): Promise<number>;
}

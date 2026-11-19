import type { JournalDraft } from './contracts';

/** Structural preflight only; not a journal builder or complete business validator. */
export function isBalancedDraft(draft: JournalDraft): boolean {
  if (draft.postings.length < 2) return false;
  let debits = 0;
  let credits = 0;
  for (const posting of draft.postings) {
    const paise = posting.amountMinor.paise;
    if (posting.amountMinor.currency !== 'INR' || !Number.isSafeInteger(paise) || paise <= 0) {
      return false;
    }
    if (posting.side === 'debit') debits += paise;
    else credits += paise;
    if (!Number.isSafeInteger(debits) || !Number.isSafeInteger(credits)) return false;
  }
  return debits === credits;
}

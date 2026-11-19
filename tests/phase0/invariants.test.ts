import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isBalancedDraft } from '../../src/domain/ledger/invariants';
import type { JournalDraft, JournalPostingDraft } from '../../src/domain/ledger/contracts';

const posting = (side: 'debit' | 'credit', paise: number): JournalPostingDraft => ({
  ledgerAccountId: 'fixture',
  side,
  amountMinor: { currency: 'INR', paise },
});

const draft = (...postings: JournalPostingDraft[]): JournalDraft => ({
  eventType: 'transfer',
  occurredAtMs: 1,
  postings,
});

test('balanced transfer with separate fee posting passes structural preflight', () => {
  assert.equal(
    isBalancedDraft(
      draft(posting('debit', 500_000), posting('debit', 5_000), posting('credit', 505_000)),
    ),
    true,
  );
});

test('zero, fractional, unsafe and unbalanced values fail', () => {
  assert.equal(isBalancedDraft(draft(posting('debit', 0), posting('credit', 0))), false);
  assert.equal(isBalancedDraft(draft(posting('debit', 0.5), posting('credit', 0.5))), false);
  assert.equal(
    isBalancedDraft(draft(posting('debit', Number.MAX_SAFE_INTEGER + 1), posting('credit', 1))),
    false,
  );
  assert.equal(isBalancedDraft(draft(posting('debit', 1), posting('credit', 2))), false);
  assert.equal(isBalancedDraft(draft(posting('debit', 1))), false);
});

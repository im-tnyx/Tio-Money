# 💸 Product and accounting rules — quick route

**Canonical:** [PRD](../../docs/01-PRD.md) · [Flow](../../docs/02-USER-FLOWS.md) · [Database / ledger](../../docs/04-DATABASE-DESIGN.md) · [Owner decision](../../docs/DECISIONS.md).

- One primary `+` on the root experience opens **one** Income | Expense | Transfer editor. No three Home shortcuts.
- One financial ledger is the source for account balances, History and Reports. Never use fabricated balances or feature-specific math.
- Transfer principal between owned accounts is **not** income or expense. Optional transfer fee is an expense; fee and principal commit atomically.
- Cash, bank and **funded** wallet are assets; credit cards are liabilities. A linked bank-backed UPI instrument is not a second funded balance.
- Integer paise and balanced postings; credit-card purchases, repayments and refunds use correct liability/equity sign rules.
- Import is candidate → deduplicate/review → explicit confirmation → ledger entry. No unconfirmed balance impact.
- Offline-first core, no bank password/OTP requirement. Android SMS is conditional outside Expo Go; iPhone auto-inbox access unavailable.
- **MVP app copy is English only**, including accessibility and validation text; localization readiness is an engineering concern, not an MVP language selector.

Use canonical tables and examples before altering the financial model. Proposed schema/UX choices are not automatically approved.

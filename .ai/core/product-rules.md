# 💸 Product and accounting rules — quick route

**Canonical:** [PRD](../../docs/product/PRD.md) · [Flow](../../docs/product/USER-FLOWS.md) · [Database / ledger](../../docs/architecture/DATABASE-DESIGN.md) · [Owner decision](../../docs/governance/DECISIONS.md).

- **Current UI:** one More-aligned floating Add remains **disabled**. An eventual owner-authorized editor could open one **Income | Expense | Transfer** flow, not three Home shortcuts; no current editor or real automatic banking feature is implemented.
- One financial ledger is the source for account balances, History and Reports. Never use fabricated balances or feature-specific math.
- Transfer principal between owned accounts is **not** income or expense. Optional transfer fee is an expense; fee and principal commit atomically.
- Cash, bank and **funded** wallet are assets; credit cards are liabilities. A linked bank-backed UPI instrument is not a second funded balance.
- **Stage 1 booked amounts:** validated safe-integer **ISO-currency-specific native minor units with immutable currency/exponent** (INR-only historical examples call these paise); native debit/credit postings balance **within each currency**, not across an unapproved FX conversion. Credit-card purchases, repayments and refunds respect asset/liability/equity signs. Mixed-currency settlement/clearing remains [TM-ADR-018 BLOCKED](../../docs/governance/STAGE-1-FINANCE-ADRS.md#tm-adr-018--native-currency-accounting-and-fx).
- Import is candidate → deduplicate/review → explicit confirmation → ledger entry. No unconfirmed balance impact.
- Offline-first core, no bank password/OTP requirement. Android SMS is conditional outside Expo Go; iPhone auto-inbox access unavailable.
- **MVP app copy is English only**, including accessibility and validation text; localization readiness is an engineering concern, not an MVP language selector.

Use canonical tables and examples before altering the financial model. Proposed schema/UX choices are not automatically approved.

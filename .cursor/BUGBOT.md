# Tio Money — Bugbot project rules

Always-on review policy for `im-tnyx/Tio-Money`. Follow with `AGENTS.md`, `.github/REVIEW_GUIDE.md`, and `docs/DECISIONS.md`.

## Prioritize

1. Offline-first finance: the working store is on-device SQLite. No default cloud upload of accounts, transactions, or reports. No signup or Supabase sync unless a later owner-scoped task explicitly opts in. Do not claim local SQLite is encrypted or that data is backed up.
2. TM-DEC-011 dumb screens: every screen renders immutable typed ViewModels and forwards injected callbacks. Screen files own no business logic, financial math, SQL, network/FX, permissions, router commands, or workflow-state hooks.
3. Ledger math stays out of the UI: balances, fees, net worth, and reports come from one canonical balanced journal. Presentation must not calculate them or invent a second ledger.
4. Posting invariants: internal transfer principal is neither income nor expense. Optional transfer fees are expenses and post atomically with the transfer. Cash, bank, and funded wallets are assets; credit cards are liabilities. Booked amounts are validated safe-integer native minor units (INR paise only for INR) with an immutable currency and exponent. Mixed-currency journal posting stays blocked. Do not accumulate booked totals in binary floating point.
5. Privacy: no bank credentials, OTPs, PINs, CVVs, or unrelated message retention. No automatic Android SMS inbox access in Expo Go, and no automatic third-party iOS SMS inbox access. Flag tokens, secrets, `.env` values, or real user finance data in diffs.
6. English-only MVP (TM-DEC-001): initial user-facing app copy, accessibility names, and validation stay English. No language-selection screen.
7. Scope: finance features, schema or migrations, Auth, native SMS permissions, and branch-protection changes belong in their own authorized tasks. Import candidates stay unposted until user review and deduplication.
8. Attribution: no `Co-authored-by` or `Assisted-by` trailers, including AI agent names.

## Output

- Prefer Blocking / Non-blocking / Question with path:line when possible.
- Inline suggestions should be minimal and safe.
- A bot `COMMENT` is not GitHub `APPROVED` and is not merge authorization. Independent review stays optional under TM-DEC-002 unless a configured GitHub check actually requires it.

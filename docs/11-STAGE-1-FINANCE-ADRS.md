# 11 · Stage 1 Finance Architecture Decision Register

> **Status: architecture decision review, 2026-11-21. No executable financial schema or runtime feature is authorized by this document.** [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23) records an agent's documentation-only technical PROCEED after the owner's instruction. The present canonical Phase 0 SQLite is settings/bootstrap only, not a completed finance journal. [Ledger spec](04-DATABASE-DESIGN.md) contains **legacy illustrative INR-only/four-subtype DDL**; it must not be copied into migrations for the six-group/multi-currency product.

[Documentation hub](00-INDEX.md) · [Owner decisions](DECISIONS.md) · [Account Groups](08-ACCOUNT-GROUPS-SPEC.md) · [Currency](10-CURRENCY-SPEC.md) · [Strict dumb-screen boundary](12-DUMB-SCREEN-BOUNDARIES.md) · [Tests](06-IMPLEMENTATION-TEST-PLAN.md)

## 1. Decision authority and interpretation

**DESIGN ACCEPTED** = a documented technical architectural invariant consistent with already merged owner product choices; it can guide separate scoped implementation work **only when every prerequisite in its row is satisfied**. It is not proof of a reviewed implementation, schema migration, device performance or owner acceptance of new business behavior.

**BLOCKED PENDING DECISION** = a material product, calculation, provider/security or platform question requiring a separately recorded owner decision and/or finance/security ADR plus deterministic test vectors. Do not invent a default or silently substitute an approximate calculation. **PARTIAL** = accepted invariant is safe to implement behind approved scope, but named operation is blocked.

Earlier TM-ADR-011–017 were referred to in draft documents without one canonical mapping; the mapping below is **the new canonical prospective definition**, not a claim that old IDs were approved. In conflict, [existing owner decisions TM-DEC-001–011](DECISIONS.md) and actual implementation govern.

| ID | Decision area | Status for *design* | Still blocked before executable implementation |
| :--- | :--- | :--- | :--- |
| TM-ADR-011 | Idempotent finance commands | **DESIGN ACCEPTED** | SQLite schema/transaction test on devices |
| TM-ADR-012 | Atomic posting, account/ledger lock and projections | **DESIGN ACCEPTED** | Actual migration, platform concurrency validation |
| TM-ADR-013 | Refund linked to original, partial cap and reversal | **DESIGN ACCEPTED** for basic same-currency refund | Cross-currency/tax/reward/closed-period refunds |
| TM-ADR-014 | Recorded-at versus effective-at corrections | **PARTIAL** | Backdated period-close/report policy and import timezone |
| TM-ADR-015 | Negative balances and overdrafts | **BLOCKED PENDING DECISION** | Eligibility, limits, reporting and warning behavior |
| TM-ADR-016 | Credit-card cash advances | **BLOCKED PENDING DECISION** | Interest/fees, issuer rules, feature support |
| TM-ADR-017 | Unposted import/dedupe workflow | **PARTIAL** | Source policy, native SMS permissions, fuzzy-match approval |
| TM-ADR-018 | Currency-aware canonical journal / FX transfer | **PARTIAL** | Supported codes, clearing, booked conversion/gain/rounding |
| TM-ADR-019 | Six groups and reference-only wallets | **DESIGN ACCEPTED** | Migration/subtype schema; historical reconciliation |
| TM-ADR-020 | Card liability and tracked bill repayment | **PARTIAL** | Issuer statement minimum/due/holds, autopay semantics |
| TM-ADR-021 | Loan principal and interest | **PARTIAL** | Amortization, day-count, accrual and rounding schedules |
| TM-ADR-022 | Investment cost, valuation and realization | **PARTIAL** | Lot disposal, realized gains, dividends, revaluation postings |
| TM-ADR-023 | External FX quote privacy and refresh | **PARTIAL** | Provider, license, rate direction, supported pairs and SLA |

## 2. Binding common finance invariants

1. **Single canonical ledger.** Append-only double-entry events with immutable postings; assets, liabilities, opening equity, income and expenses have distinct account classes. Canonical Net Worth = **booked assets − booked liabilities**, computed from postings. UI/store never persist editable authoritative balances. A historical reversal and replacement are new immutable events, not edits to old postings.
2. **Exact money.** Each booked posting uses validated safe-integer minor units *in its native ISO currency*. INR paise is just one currency. Currency exponent and supported ISO-code map must be versioned and tested (zero-decimal and non-two-decimal currencies); no JS binary floating-point sums, precision truncation, NaN, Infinity or scientific-notation inputs. Decimal rates remain precise strings for explicit decimal arithmetic.
3. **Currency isolation.** Every booked journal event must reconcile **by currency**: sum of native debits equals native credits for each ISO code. Reject mixed-currency asset-to-asset booking unless a separately accepted FX-clearing/fee/gain/rounding policy defines **balanced, linked** currency-specific legs. Display conversions are *read-only estimates*; never alter original booked amounts.
4. **Atomicity and replay.** A finance command, all its postings, metadata and deterministic idempotency reference commit atomically. Retried network taps/import confirmation/process crash are at-most-one accepted financial result, with clear failure/recovery. Enforce FK/integrity and read projections from one consistent snapshot.
5. **No fake financial activity.** Opening existing positions uses opening equity, **not** income, expense or an extra bank transfer. A zero opening emits metadata only (no zero-value posting). User-directed new purchases/loan disbursements and repayments are distinct confirmed commands.
6. **Corrections and period truth.** Preserve recorded time, explicitly validated effective date, original event link, currency and reversal chain. Do not silently rewrite previous posts. Backdated period presentation remains BLOCKED under TM-ADR-014 pending accepted reporting/close policy.
7. **Privacy and capabilities.** Stage 1 has local SQLite only; only selected FX **currency pair** metadata can leave the device. No account/merchant/ledger/OTP/credential to quote provider. SMS native permissions, backup encryption and Supabase Auth/sync are separate future review gates.
8. **Dumb screens, one finance engine.** All screens receive typed immutable view models and callback commands from controllers; none may import repository/domain services, calculate balances/fees, mutate ledger data, request rates, launch SMS, own routing, write SQL, or perform side effects. See [screen boundary](12-DUMB-SCREEN-BOUNDARIES.md). Existing five bottom tabs and disabled Add remain visually and functionally unchanged.

## 3. Accepted design contracts and pending choices

### TM-ADR-011 and TM-ADR-012 — command durability

CreateEvent accepts a unique stable command key, validated native amounts, source/account IDs and an explicit event kind. Uniqueness must be enforced in persisted storage, not an in-memory debounce. Duplicate identical commands return the previously committed result; duplicate keys with **different payloads reject as conflict**. Replays across app restart must not add postings. Use a single serialized SQLite transaction for metadata + event + N postings + command outcome, no partial commit; validate postings and account ownership before commit. Domain code is pure, SQL bound and parameterized in a data adapter. Device-level journal mode, foreign keys, write-lock semantics and migration recovery are **test prerequisites**, not assumptions.

### TM-ADR-013 and TM-ADR-014 — refund, reversal, effective time

A same-currency refund references a posted original expense (event ID), reduces net expense through a linked contra/expense reversal posting, and returns funds to the originally applicable asset or reverses card liability appropriately. Cumulative linked refund value cannot exceed original eligible expense principal; repeated refunds use independent idempotent commands. Editing a transaction uses full reversal plus replacement, preserving a chain. Record immutable created/posted and explicit effective dates separately, never a silent timestamp mutation. **Policy still pending:** historical report recomputation/backdated period-close, chargeback/card-dispute semantics, and partial refunds in another currency. Do not implement those until accepted.

### TM-ADR-015, TM-ADR-016 and TM-ADR-017 — edge/permission gates

For potential overdrafts, do not silently convert an asset to a liability or assume all bank accounts can go negative; escalate eligibility and warning/limit design. Credit-card cash advance remains an unimplemented feature until issuer fee/interest/date consequences are specified (older ledger example is an illustration, not scope approval). Imports produce unposted review candidates with origin fingerprints; user confirmation, exact duplicate checks and an audited reconciliation command are necessary for posting. Native SMS inbox access remains policy-gated and must never be silently enabled in Expo Go.

### TM-ADR-018 — native-currency accounting and FX

Supported account currency is immutable for already-booked journals; user Main/Sub preferences change **display**, not historical postings. Native event amounts are immutable with ISO code, exponent and effective time. Per-currency balancing and explicit linking are mandatory. A mixed-currency transfer requires an approved pair of balanced local-currency posting legs, a named FX clearing account/policy, **recorded exact rate and quote timestamp**, deterministic rounding/fee/realized gain treatment, reproducible historical reports and rejection of missing/unsupported rates. None of those numerical policies or actual SQL shapes has yet received owner/product acceptance: **mixed-currency posting is BLOCKED**. A nonposting estimated display with cached/stale label may be specified without posting transactions.

### TM-ADR-019 — group/account model

Cash, Bank and independently **funded** Wallet are ASSET. Bank-linked Wallet is link/reference metadata to an eligible Bank account; it inherits currency and **never** creates independent asset, opening journal, balance, or double Net Worth. Credit Card is LIABILITY, with credit limit **not** money. Given Loan is receivable ASSET; Borrowed Loan is LIABILITY. Historical Investment is ASSET at booked cost, with separately dated **unposted** valuation. Positive historical openings post against opening equity exactly once. Archive a linked Wallet reference without archiving/changing Bank journal. Group label is not an accounting class; plan a versioned typed schema and migration only after tests and owner scope.

### TM-ADR-020 — card statements and payments

A card purchase posts expense plus Card LIABILITY, not a Bank deduction. **Repayment** transfers from selected Bank ASSET to reduce the Card LIABILITY, **not another expense**; atomically reflect any separate explicitly authorized fee/interest. Card due dates, billing cycles, minimum/fixed payments, issuer holds and available-credit estimates must not be mislabeled authoritative bank data. Configured **autopay is tracking/reminder metadata, not a real bank debit**. No issuer API or automatic banking permission. Final statement-cutoff and allocation policies remain blocked.

### TM-ADR-021 — loans

Borrowed opening outstanding principal creates LIABILITY vs opening equity; Given opening outstanding creates RECEIVABLE ASSET vs opening equity. The act of importing a historical Loan does not also move money from/to linked Bank. A *new* disbursement is a separately confirmed balanced event. Repayments split principal vs actual interest/fees, never count principal as income/expense. Floating/fixed rate, simple vs compound interest, EMI schedule, grace periods, day-count conventions, prepayment, residual rounding and overdue amounts **remain owner/product policy decisions**.

### TM-ADR-022 — investments

Purchase exchanges Bank asset for Investment asset at **booked cost**; not Expense. Historical opening recognizes cost against equity only, without a second funding-bank withdrawal. A quote may modify a separate **as-of Portfolio market-value estimate**, but never change booked Net Worth or investment cost. Recognized valuation, lot selection (FIFO/average), splits, realized gain/loss, dividend income, disposal fees and taxation require a separate agreed ADR and balanced postings. An estimated market value and booked cost may **not** be counted as two financial assets.

### TM-ADR-023 — FX quote provider and privacy

Owner requires refresh *on currency-dependent use*, not arbitrary 24-hour polling; deduplicate concurrent pair requests. Cache a validated base/quote + decimal rate + source + provider published/effective time + fetched time, never anonymous numeric-only rates. Offline may show cached/stale estimate with timestamp; no quote means **unavailable**, not 0 or 1. Only public currency pair and generic request metadata leave the device; no user ledger. A concrete provider, licensing/usage quota, supported pairs, quote direction, transport authentication/abuse limits, versioned precision and provider failure SLA **must be approved before network integration**.

## 4. Review-ready deterministic test matrix (future code gates)

| ID | Scenario | Expected invariant |
| :--- | :--- | :--- |
| TM-ADR-T01 | Create same command key twice, including app restart | One persisted event; same payload yields same result; changed payload conflicts |
| TM-ADR-T02 | Exception between event and any posting / FK failure | Full rollback, no orphaned event or changed account balance |
| TM-ADR-T03 | 3 × INR 0.01; JPY zero-minor and 3-minor currency input | Correct native integer units; invalid fractional/scientific/overflow rejected |
| TM-ADR-T04 | INR-only income, Expense, transfer+fee | Each event debits = credits; transfer principal not income/expense; fee counted once |
| TM-ADR-T05 | Attempt USD-to-INR journal without accepted FX clearing policy | Explicit rejection, no partial native-currency debit or fabricated conversion |
| TM-ADR-T06 | Funded Wallet plus bank-linked Wallet reference | Funded asset counted once; reference never duplicates Bank or posts opening |
| TM-ADR-T07 | Historical Given/Borrowed Loan, card liability, Investment cost | Proper asset/liability/equity classification, zero duplicate funding moves |
| TM-ADR-T08 | Card repayment, fee, loan principal/interest split | Liability/principal decreases without expense duplication; separately authorized interest as expense |
| TM-ADR-T09 | Refund ¥ or ₹ original fully/partially and repeat command | Native-currency cap + linked reversal, no Income; duplicate idempotent; cross-currency blocked |
| TM-ADR-T10 | Market estimate changes while booked cost does not | Journal Net Worth unchanged; only dated **unposted** Portfolio estimate moves |
| TM-ADR-T11 | FX provider fails, cache exists/no cache, pair switches mid-request | Stale label/source/time or unavailable; out-of-order response ignored; no ledger mutation |
| TM-ADR-T12 | Backdated correction when period policy unresolved | No silent historical restatement; reject/feature-gate until agreed |
| TM-ADR-T13 | Migration from existing settings-only SQLite + interruption | No silent reset; version/FK integrity verified on Android and iPhone |
| TM-ADR-T14 | Account, Transaction, Report and Home consume one journal | Identical balances/reconciliation; no screen-owned SQL, FX, finance math or navigation logic |

**Stage 1 implementation release gate:** no shipping account, card, loan, investment, multi-currency or FX provider behavior until its required policy decisions, schema/migration design, ADR-specific tests and real-device checks are accepted in **separate scoped PRs**. The no-logic-screen constraint applies to **all** of those PRs. A green documentation PR never waives this requirement.

## 5. Decisions requiring explicit follow-on authority

1. **Owner/product:** overdrafts and negative Bank balances; card issuer billing/statement minimum; loan interest/EMI and effective-date policy; investment lot/realized gains; enabled cross-currency transactions and accepted rounding/FX accounting.
2. **Provider/commercial/security:** permitted FX rate provider, pair coverage, license/cost and rate authenticity; any future native SMS permission; backup encryption/key recovery and Cloud/RLS separately.
3. **Engineering validation:** versioned SQLite schema and migration, exact-money library/ISO exponent matrix, transactional write semantics and device/restore QA.
4. **Owner navigation and screen boundary:** already decided; **no UI/tab change** and all screens strictly dumb. Future plus activation is separate scope.

**Disposition:** accepted architectural invariants are final **for design consistency review**; unanswered financial/business choices remain **BLOCKED FOR IMPLEMENTATION** and may not be silently marked approved. [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23) tracks review and later decision sign-off.

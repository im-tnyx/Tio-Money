<div align="center">

# 🧩 08 · Account Groups & Dynamic Account Setup

### One group-specific form; one consistent financial ledger.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)

[🏠 Project](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🎯 PRD](01-PRD.md) · [📌 Owner Decisions](DECISIONS.md)

</div>

---

> [!IMPORTANT]
> **Future Stage 1 product requirements, NOT implemented Phase 0 UI or approved SQLite DDL.** Current Phase 0 remains five blank tabs and a disabled floating +. The existing `04-DATABASE-DESIGN.md` currently allows only Cash/Bank/Wallet/Credit Card and INR; this proposed expansion **must not be coded** until a ledger/schema ADR resolves the gaps. Owner direction: [TM-DEC-007](DECISIONS.md#tm-dec-007--account-group-driven-setup) · [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13).

## 01 · Product contract and terminology

**Account Group** is a UI/setup template, not an accounting class. Every persisted account maps to one or more financial `ASSET`/`LIABILITY` ledger representations; an Investment can require valuation records and a Loan can be asset (given) or liability (taken). Reports must derive from the same canonical balanced journal; UI fields and descriptive metadata never become independent authoritative mutable balances.

| User path | Behavior |
| :--- | :--- |
| Settings → Account Groups | Browse, explain, order and optionally hide future **built-in** group templates; hiding does not delete accounts |
| Accounts → Add Account → Select Group | Render group-specific required/optional fields, help text and validations |
| Edit Account | Preserve stable account ID, ledger classification, old posted events and linked accounts |
| Archive Account | Hide from ordinary pickers, retain historical ledger and backup/sync identity; reactivation explicit |
| Group customization | **Future gated design**; free-form custom groups must not invent unsupported ledger semantics |

One user can have many accounts in a group. Local data is primary; no Tio Money signup required. Currency choice must follow [Currency & FX](10-CURRENCY-SPEC.md); never silently mix minor units.

## 02 · Shared create/edit rules

| Field | Requirement |
| :--- | :--- |
| Name | Required, trimmed, unique **ID** not name; duplicate display names may be allowed if distinguishable |
| Opening Amount | Required on create, interpreted per group; opening is a **balanced opening journal**, not Income/Expense |
| Currency | Required ISO 4217 value allowed by the current approved currency configuration; default Main Currency |
| Description | Optional, plain text, length-limited, escaped on render and excluded from logs |
| Status | Active/archived; prevent new postings to archived accounts unless restored |
| Created/updated dates | Stable UTC timestamps; user-facing dates rendered in local timezone |
| Account links | Reference existing **active** eligible account IDs; prevent self-reference/cycles where semantically invalid |
| Financial totals | Derived from ledger + authorized valuation policy; never edit cached balance as truth |

**Amount UX:** no NaN, infinity or binary floating-point storage; use validated decimal strings and currency minor units. An opening amount is never salary or spending. Existing-account balance corrections should be a documented adjustment/reversal event, not mutation of opening history.

## 03 · Built-in group forms

### 3.1 Cash — asset

**Fields:** `name` (required), `opening_amount` (required, zero allowed), `currency` (required), `description` (optional).

**Actions:** cash expense/income, cash-to-bank/wallet transfer, cash reconciliation adjustment with reason. A negative physical-cash opening amount is invalid unless a separately approved overdraft/debt representation exists.

### 3.2 Bank Account — asset

**Fields:** Cash fields plus `bank_name` (recommended), optional account nickname, optional masked last four digits, optional payment capabilities: **UPI, debit card, cheque, internet banking**, plus extensible authorized payment-mode labels. A capability flag is not a transaction, credential, separate wallet balance or permission for direct banking.

**Examples:** SBI account can be used for UPI, Debit Card and Internet Banking; all three spend from the **same bank asset account**. A prepaid, independently funded wallet is a separate asset account. Bank-linked UPI app is **not** an additional balance. Avoid complete account numbers and never store net-banking passwords, card PIN/CVV, OTP or UPI PIN.

### 3.3 Wallet — asset when independently funded

**Fields:** `name`, `opening_amount`, `currency`, `description`, optional `provider`, `wallet_kind` (`funded` / `bank_linked_reference`), optional `linked_bank_account_id`.

A funded wallet has its own asset balance; a bank-linked reference points to its bank account **without duplicating funds or creating a second asset ledger balance**. Explain this choice in account-creation UX.

### 3.4 Credit Card — liability

| Field | Rule |
| :--- | :--- |
| Card name | Required; display nickname, optional masked last four digits |
| Opening outstanding | Required, `>= 0`; **liability**, not spendable cash |
| Currency | Required; do not silently convert liabilities |
| Total credit limit | Required positive amount; card limit is **not an asset** |
| Current available credit | Read-only **estimate**: limit − posted outstanding − known pending holds + applicable adjustments; unknown issuer holds can cause mismatch |
| Statement date/cycle | Billing day or documented provider-specific cycle boundary; handle 28–31 day month and timezone |
| Payment due date | Actual due-date rule/date (not always a fixed monthly day); weekends/holidays only if issuer rule is known |
| Pay from account | Optional eligible linked Bank account ID; no money movement on link alone |
| Automatic Payment | **Configuration + reminders/confirmation tracking only**, with Off / Full / Minimum / Fixed (future policies); real bank debit not supported |
| Description | Optional |

**Actions and accounting:** card purchase = Expense + Card liability; bank-to-card repayment = Bank asset decrease and Card liability decrease, **not a new expense**; refund reverses relevant original expense; interest/fees are expenses when posted. Handle refunds, prepayments, credit balances, overlimit and partial payments via explicitly tested journal rules. **No auto-posting on due date**: only user-confirmed payments or a future authorized, verified settlement integration post money.

**Security:** never ask for CVV, PIN, full PAN or authentication secrets; autopay controls must not imply money will be debited automatically. Notifications may remind without executing payments.

### 3.5 Investment — asset with separate value tracking

**Fields:** `name`, `investment_kind` (stocks, mutual funds, FD, gold, PPF, other), `currency`, `description`, `invested_cost`, `current_value` plus `valuation_as_of` (where entered), optional `units` and `linked_funding_account_id`. Multi-holding position model is a separate ADR.

**Rules:** bank → investment **purchase principal is an asset acquisition, not ordinary expense**; sale/redemption returns asset cash and handles gains/losses by approved journal policy. Market/current value is **a valuation estimate with timestamp**, not a fabricated bank transaction or a mutable investment cash balance. Cost basis, distributions, realized/unrealized gain/loss and net-worth treatment **BLOCKED pending ADR**; do not count the same value as invested cost and current market value simultaneously.

### 3.6 Loan — asset when given, liability when borrowed

**Fields:** `name`, `loan_direction` (`borrowed` or `given`), `currency`, `original_principal`, `opening_outstanding_principal`, `interest_rate` and rate basis, optional `EMI_or_installment`, `start_date`, `next_due_date`, `linked_payment_account_id`, `description`.

**Rules:** borrowed loan disbursement increases cash and Loan liability, not earned income; given loan disbursement creates receivable asset, not ordinary expense. For borrowed loan repayment, **principal reduces liability**, interest/fees are expenses. For a loan given, principal collection reduces loan receivable, interest received is income under an approved recognition policy. EMI schedule is a plan, **not a posted transaction** until user confirms payment. Interest accrual, compounding, late fees, amortization and prepayments **BLOCKED pending ADR**.

## 04 · Accounting examples and invariant checks

| Event | Ledger effect | Income/expense |
| :--- | :--- | :--- |
| Bank → Cash ₹2,000 | Bank asset −₹2,000; Cash asset +₹2,000 | Neither |
| Card purchase ₹1,500 | Card liability +₹1,500; Expense debit +₹1,500 | Expense +₹1,500 |
| Bank → Card ₹5,000 | Bank asset −₹5,000; Card liability −₹5,000 | Neither |
| Bank → Investment ₹3,000 | Bank asset −₹3,000; invested asset +₹3,000 at historical cost | Neither principal |
| Borrow ₹10,000 | Bank asset +₹10,000; Loan liability +₹10,000 | Neither |
| EMI ₹4,000 (= ₹3,000 principal + ₹1,000 interest) | Bank −₹4,000; Loan liability −₹3,000; Interest expense +₹1,000 | Expense **₹1,000** only |

**Invariant:** every booked event balances at currency-safe journal precision and is atomic; account, History, Stats and Net Worth reconcile. Ignore archived accounts for new selections, but keep historical postings.

## 05 · Dynamic form state, validation and failure behavior

- On group switch **before first save**, preserve common fields if compatible, warn before dropping entered group-specific fields; form reset must not silently lose user work.
- Required and optional labels are explicit; account linking pickers list only eligible accounts; inactive/archived references explain corrective action.
- Invalid dates, negative liabilities, credit limit under outstanding, unknown linked account, unsupported currencies or out-of-range amounts receive actionable errors; some real overlimit states need a warning rather than forced data corruption.
- Editing a group across incompatible ledger classes (Cash → Credit Card; Loan Given → Borrowed) is a **migration event**, not a harmless field change; require a separate controlled conversion policy.
- Deleting a group template never cascades into accounts or journal events.
- Incomplete/malformed account create or failure mid-opening journal must commit **nothing**; retry must be idempotent.
- Currency rate and valuation failures must never prevent local same-currency transaction entry; show unsupported converted totals honestly.

## 06 · Acceptance test IDs (future implementation gates)

| ID | Expected behavior |
| :--- | :--- |
| `TM-AG-001` | Cash form displays 4 core fields and posts opening asset without income |
| `TM-AG-002` | Bank payment-mode flags do not create new wallet/bank balances |
| `TM-AG-003` | Bank-linked UPI reference does not inflate Net Worth |
| `TM-AG-004` | Credit card purchase/repayment uses liability-aware ledger and no duplicate expense |
| `TM-AG-005` | Statement day 31 and short-month due date never create impossible calendar dates |
| `TM-AG-006` | "Autopay" configuration never initiates nor posts bank debit by itself |
| `TM-AG-007` | Investment purchase does not create spending; valuation does not double count |
| `TM-AG-008` | Loan EMI principal/interest split reconciles exactly |
| `TM-AG-009` | Archive/edit preserve IDs, posted history and grouped accounts |
| `TM-AG-010` | Create/opening journal failure rolls back all records |

## 07 · Architecture gate / unresolved decisions

**Not yet approved SQL:** `account_groups` or typed group metadata, subtype classifications, linked accounts, card billing cycles, loan amortization, holdings and valuations need a reviewed ADR + migrations. Do **not** add unrestricted EAV fields as ledger authority; validate typed money and dates. Currency/account limits and posting policies must align with [10 — Currency](10-CURRENCY-SPEC.md) and [04 — Ledger Draft](04-DATABASE-DESIGN.md).

**Open decisions:** fixed six default groups vs future custom groups; cross-group conversions; investment cost basis and valuation accounting; loan accrual; real card available-credit inputs; issuer-specific due day and reminders; whether minimum/fixed autopay is display-only or simulated. **None of these ambiguities authorizes moving funds.** Follow-up architecture PR must define formal SQL, flows, mobile UI, and tests.

[← Docs Hub](00-INDEX.md) · [Currency & FX →](10-CURRENCY-SPEC.md)

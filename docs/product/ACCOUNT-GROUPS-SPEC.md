<div align="center">

# 🧩 08 · Account Groups & Dynamic Account Setup

### One group-specific form; one consistent financial ledger.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)

[🏠 Project](../../README.md) · [📚 Docs Hub](../00-INDEX.md) · [🎯 PRD](PRD.md) · [📌 Owner Decisions](../governance/DECISIONS.md)

</div>

---

> [!IMPORTANT]
> **UI preview and future Stage 1 product contract are distinct.** [Draft PR #97](https://github.com/im-tnyx/Tio-Money/pull/97) contains the Accounts UI preview described in section 01; it does not implement financial persistence, ledger posting or approved SQLite DDL. Sections 02–07 describe future financial requirements, not working UI or authorization to implement finance. The [ledger design](../architecture/DATABASE-DESIGN.md) and [RFC #98](https://github.com/im-tnyx/Tio-Money/issues/98) govern that separate gate. Owner direction: [TM-DEC-007](../governance/DECISIONS.md#tm-dec-007--account-group-driven-setup) · [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13).

## 01 · Product contract and terminology

**Account Group** is a UI/setup template, not an accounting class. Every **ledger-bearing** financial account maps to an appropriate `ASSET`/`LIABILITY` ledger representation; a **bank-linked Wallet reference** is non-ledger metadata pointing to an existing Bank asset and must not create an independent balance, journal account or opening event. An Investment can require dated valuation records and a Loan can be an asset (given) or liability (borrowed). Reports derive from the same canonical balanced journal; UI fields, linked references and descriptive metadata never become independent authoritative mutable balances.

| User path | Behavior |
| :--- | :--- |
| Settings → Account Groups | Browse, explain, order and optionally hide future **built-in** group templates; hiding does not delete accounts |
| Accounts → + → Add Account | Open the Add Account screen, then present Choose Account Group as a bottom sheet. The top Group row reopens the picker. The Bank payment-mode editor opens above the screen. |
| Edit Account | Preserve stable account ID, ledger classification, old posted events and linked accounts |
| Archive Account | Hide from ordinary pickers, retain historical ledger and backup/sync identity; reactivation explicit |
| Group customization | **Future gated design**; free-form custom groups must not invent unsupported ledger semantics |

One user can have many accounts in a group. Local data is primary; no Tio Money signup required. Currency choice must follow [Currency & FX](CURRENCY-SPEC.md); never silently mix minor units.

Add Account keeps a separate in-memory draft for each of the six supported groups until the screen closes. Long forms scroll. The top bar has round Close and Save icons. Insurance remains informational, custom groups do not open forms, and Save stays disabled in the preview. Accounts and Manage Accounts do not expose real financial data. The [source-verified task snapshot](../../.ai/tasks/accounts/accounts-ui-foundation-20261123.md#current-ui-snapshot-source-verified-2026-11-24) records the exact field order and UI-only state.

Inputs start to the right of their icons. Small field captions sit above the input at the same left edge with a 0 dp gap. The Name and Description prompts appear inside their fields. Loan Direction, Wallet Type and Investment Type show the selected value on the right. Tapping any of those rows opens a rounded popup beside the selected value. Tap outside it or go back to dismiss and keep the current value. Credit Card shows a From caption above a non-editable Payment placeholder before Billing Cycle Start Date, without eligibility or unavailable copy. The two Credit Card dates show editable monthly days in the preview, initially 01 and 15. Loan Start Date and Next Due Date default to local Today and open a rounded Day / short Month / Year wheel popup always above the selected date field (compact complete rows if space is limited; no below fallback), with compact 32 dp base rows, 8 dp horizontal and 6 dp vertical card padding, 22-degree-per-row larger-radius native-scroll-synchronized cylindrical perspective, fixed-radius depth and fading edges and a dedicated theme-colored center selection band (flat fallback for Reduced Motion). Scrolling updates the date immediately, including day-to-month and month-to-year carry-over within 1900–2100; outside tap or Back retains the last selection. There is no Save or Done button in the popup. Invalid days are clamped on month/year changes. Investment Valuation Date retains its editable day, month and year inputs. The Loan preview includes an optional, manually entered EMI Amount in the draft currency. One amount row per eligible form carries Main/Sub Currency symbols only when Sub Currencies are configured; the selected symbol uses a tinted state and accessible checked radio state. Switching currency clears monetary inputs, including EMI, but preserves other draft details. The Bank-linked Wallet has no independent opening amount or currency selector, and linking is unavailable. Loan also shows the same non-editable From / Payment field after EMI Amount and before Start Date. Credit Card and Loan show Auto Pay after Description, Off and disabled; Investment has neither control. Actual payment and tracking policy remains gated.

## 02 · Shared create/edit rules

The following rules and subsequent accounting examples apply to future finance implementation, not validation or persistence in the current preview.

| Field | Requirement |
| :--- | :--- |
| Name | Required, trimmed, unique **ID** not name; duplicate display names may be allowed if distinguishable |
| Opening position / amount | **Group-conditional, not universally mandatory.** Cash, Bank and funded Wallet use a nonnegative opening asset balance; Card uses **opening outstanding liability**; Investment uses **opening cost basis** and a separately dated valuation; Loan uses **opening outstanding principal** with a Given/Borrowed direction. A bank-linked Wallet reference has **no independent opening amount or journal**. See [Opening contracts](#21--group-specific-opening-contracts) below. |
| Currency | Default to Main Currency. When Sub Currencies are configured, one amount row per form shows selectable symbols for Main and the configured Subs at its right end. Use Opening Amount, Total Credit Limit, Opening Outstanding Principal or Historical Invested Cost, as applicable. All amount rows in the draft share one selection. Changing it clears entered monetary amounts. Add currencies in Sub Currency settings. A bank-linked Wallet inherits currency from its linked Bank. |
| Description | Optional, plain text, length-limited, escaped on render and excluded from logs |
| Status | Active/archived; prevent new postings to archived accounts unless restored |
| Created/updated dates | Stable UTC timestamps; user-facing dates rendered in local timezone |
| Account links | Reference existing **active** eligible account IDs; prevent self-reference/cycles where semantically invalid |
| Financial totals | Derived from ledger + authorized valuation policy; never edit cached balance as truth |

**Amount UX:** no NaN, infinity or binary floating-point storage; use validated decimal strings and currency minor units. A nonzero financial opening is **never salary or spending** and must create a balanced asset/liability-versus-equity journal **only for a ledger-bearing account**. For zero opening amounts, persist valid account metadata but **do not generate zero-value postings** (postings require strictly positive minor amounts). Existing-account balance corrections should be a documented adjustment/reversal event, not mutation of opening history.

### 2.1 · Group-specific opening contracts

> [!IMPORTANT]
> **Product-facing behavior is specified here; exact SQLite tables, posting API and historical migration/valuation accounting remain blocked until the finance ADR.** Each positive opening principal is a *historical position*, not a new money transfer. Creating the same position must be idempotent and must not debit an existing funding account again.

| Kind | Required opening input | Journal / Net Worth consequence | Explicitly prohibited |
| :--- | :--- | :--- | :--- |
| Cash or Bank | `opening_amount >= 0`, currency | If positive: debit owned **ASSET** + credit **opening EQUITY** in one balanced event. If zero: metadata only | Recognize opening as Income |
| **Funded** Wallet | `wallet_kind=funded`, `opening_amount >= 0`, currency | Same asset-versus-opening-equity treatment as Cash/Bank; independently funded balance is counted **once** | Duplicate an underlying bank balance without a genuine separately funded balance |
| **Bank-linked reference** Wallet | `wallet_kind=bank_linked_reference`, required eligible `linked_bank_account_id`; currency inherited from bank | **Reference metadata only**: no editable opening amount, no new funded ledger account, no opening journal, no standalone asset in Net Worth. Reads linked bank balance **as a view**, not an additional asset | Post `0` or any value as a second wallet asset; add linked balance twice |
| Credit Card | `opening_outstanding >= 0`, currency, limit | If positive: credit owned **LIABILITY** + debit **opening EQUITY** in one balanced journal; if zero, metadata only. Debt reduces Net Worth; card limit remains non-asset metadata | Treat outstanding as cash, positive income, or linked-bank debit |
| Existing Investment (historical position) | `invested_cost >= 0`, currency, optional units; separately `current_value` + `valuation_as_of` | If positive, debit recorded **investment ASSET at cost** + credit **opening EQUITY**, **without** withdrawing the linked funding bank again. The separately dated current value is a **non-posting estimate**, not a second asset. Policy for Net Worth using cost versus current value is **BLOCKED pending valuation ADR** | Post both cost and market value as funded assets; treat initial cost as spending |
| Existing Loan — **Borrowed** | `loan_direction=borrowed`, `opening_outstanding_principal >= 0`, currency; original principal/interest terms separately | If positive, credit **LOAN LIABILITY** + debit **opening EQUITY**; if zero metadata only. Existing cash balance is **not increased** by registering the historical loan. | Post an extra new cash disbursement, recognize loan principal as Income |
| Existing Loan — **Given** | `loan_direction=given`, `opening_outstanding_principal >= 0`, currency; original principal/terms separately | If positive, debit **LOAN RECEIVABLE ASSET** + credit **opening EQUITY**; if zero metadata only. The funding bank is **not debited again** for an already-originated loan. | Post a second disbursement or treat recorded principal as Expense |

**Historical opening versus new financial event:** creating an already-existing Investment or Loan position is **not** a new purchase/loan disbursement. When the user actually invests new funds or originates a new loan, the app must use a separately confirmed **balanced transfer/disbursement transaction** that adjusts the linked bank exactly once, not the historical opening-equity path. Card bill repayment is likewise a separate confirmed bank-to-liability event. A single existing funding asset must never be counted both as retained cash **and** an already-transferred holding; if account-opening snapshots refer to different effective dates, the app needs a documented **as-of reconciliation flow** before it can claim accurate historical Net Worth. Such backdated reconciliation, market-value profit reporting and cross-currency opening transfers are **BLOCKED on their respective finance ADRs**.

**Correctness rules:** for any opening journal that is generated, debit and credit totals match in one currency, created atomically with account metadata; deterministic idempotency key prevents double opening on retry. No posting for zero amounts or non-ledger references. Opening equity is a counter-account, **not Income/Expense**. Display and report asset/liability projections must count each financed position once. These rules are future test contracts; no database migration or posting engine is implemented in Phase 0.



## 03 · Built-in group forms

### 3.1 Cash — asset

**Fields:** `name` (required), `opening_amount` (required, zero allowed), `currency` (required), `description` (optional).

**Actions:** cash expense/income, cash-to-bank/wallet transfer, cash reconciliation adjustment with reason. A negative physical-cash opening amount is invalid unless a separately approved overdraft/debt representation exists.

### 3.2 Bank Account — asset

**Fields:** Cash fields, with **Account Name** as the single display name. Optional metadata includes masked last four digits and payment capabilities for **UPI, debit card, cheque and internet banking**, plus extensible authorized payment-mode labels. A capability flag is not a transaction, credential, separate wallet balance or permission for direct banking.

**Examples:** SBI account can be used for UPI, Debit Card and Internet Banking; all three spend from the **same bank asset account**. A prepaid, independently funded wallet is a separate asset account. Bank-linked UPI app is **not** an additional balance. Avoid complete account numbers and never store net-banking passwords, card PIN/CVV, OTP or UPI PIN.

#### Linked Payment Modes during account setup

The owner’s 2026-11-23 Codex messages and screenshots specify this flow. The requirement is transcribed in the [Accounts RFC](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096773353). Use the screenshots as functional references.

- **Add Bank Account** includes an optional **Linked Payment Modes** section in the form. **Add** opens an editor for a payment mode name and one type from **Debit Card**, **UPI**, **Cheque**, or **Internet Banking**. With no draft modes, the section shows a link icon and guidance below the Add action. The list shows the label and type for each linked mode and offers **Edit** and **Remove** for each entry. Cancelling the editor keeps the previous draft. Cancelling account creation discards the draft modes.
- Per Bank account, the setup draft allows up to **3 Debit Cards, 3 UPI modes, 1 Cheque and 1 Internet Banking mode**. Editing an existing name keeps its slot, changing the type requires room in the destination type, and removing an entry frees its slot.
- Each entry describes how the same Bank account can be used. Adding or removing a mode does not create or archive an account, change a balance, or post a transaction. Names are display labels. The editor does not collect full card numbers, bank credentials, cheque numbers, UPI PINs, CVV or OTPs.
- The same section can be enabled for other eligible account groups once supported modes are agreed for those groups. Keep it separate from Credit Card’s **Payment** row, which links an eligible Bank account for repayment tracking.

### 3.3 Wallet — asset when independently funded

**Fields:** `name`, `currency`, `description`, optional `provider`, required `wallet_kind` (`funded` / `bank_linked_reference`). A **funded** wallet requires `opening_amount >= 0` and creates a distinct asset opening only when positive. A **bank-linked reference** requires an eligible `linked_bank_account_id`, derives its currency from that bank, and **does not show an independent opening_amount input**.

A funded wallet has its own asset balance; a bank-linked reference points to its bank account **without duplicating funds or creating a second asset ledger balance**. Explain this choice in account-creation UX.

### 3.4 Credit Card — liability

| Field | Rule |
| :--- | :--- |
| Card name | Required; display nickname, optional masked last four digits |
| Opening outstanding | Required, `>= 0`; **liability**, not spendable cash |
| Currency | Follows the shared selector rule. The selected currency sets the draft denomination. |
| Total credit limit | Required positive amount; card limit is **not an asset** |
| Current available credit | Read-only **estimate**: limit − posted outstanding − known pending holds + applicable adjustments; unknown issuer holds can cause mismatch |
| Statement date/cycle | Billing day or documented provider-specific cycle boundary; handle 28–31 day month and timezone |
| Payment due date | Actual due-date rule/date (not always a fixed monthly day); weekends/holidays only if issuer rule is known |
| Payment | Optional selection of an active, eligible Bank account for repayment tracking. Linking it does not move money or select a Debit Card, UPI, Cheque, or Internet Banking mode. |
| Auto Pay | One row below Description with an On/Off switch. The switch shows Off and is disabled pending approval of the tracking policy for reminders and payment confirmation. Tio Money never initiates a bank debit. |
| Description | Optional |

**Actions and accounting:** card purchase = Expense + Card liability; bank-to-card repayment = Bank asset decrease and Card liability decrease, **not a new expense**; refund reverses relevant original expense; interest/fees are expenses when posted. Handle refunds, prepayments, credit balances, overlimit and partial payments via explicitly tested journal rules. **No auto-posting on due date**: only user-confirmed payments or a future authorized, verified settlement integration post money.

**Security:** never ask for CVV, PIN, full PAN or authentication secrets; autopay controls must not imply money will be debited automatically. Notifications may remind without executing payments.

### 3.5 Investment — asset with separate value tracking

**Fields:** `name`, `investment_kind` (stocks, mutual funds, FD, gold, PPF, other), `currency`, `description`, `invested_cost` (historical **opening cost basis** where importing an existing position), separately `current_value` plus `valuation_as_of` (when supplied), optional `units` and `linked_funding_account_id`. Initial historical cost uses opening-equity accounting, not a second withdrawal from funding bank; dated current value is non-posting metadata. Multi-holding position and report valuation model remain separate ADRs.

**Rules:** bank → investment **purchase principal is an asset acquisition, not ordinary expense**; sale/redemption returns asset cash and handles gains/losses by approved journal policy. Market/current value is **a valuation estimate with timestamp**, not a fabricated bank transaction or a mutable investment cash balance. Cost basis, distributions, realized/unrealized gain/loss and net-worth treatment **BLOCKED pending ADR**; do not count the same value as invested cost and current market value simultaneously.

### 3.6 Loan — asset when given, liability when borrowed

**Fields:** `name`, `loan_direction` (`borrowed` or `given`), `currency`, `original_principal` (terms/reference), `opening_outstanding_principal` (historical position, not an instruction to disburse cash), `interest_rate` and rate basis, optional `EMI_or_installment`, `start_date`, `next_due_date`, `linked_payment_account_id`, `description`. Borrowed = opening **LIABILITY**, Given = opening **RECEIVABLE ASSET**; new disbursement uses a distinct confirmed transaction.

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
| `TM-AG-002` | Add, edit and remove a named mode in the Bank draft. Verify the selected type and label, cancel without applying edits, and confirm the mode has no independent account, balance or journal. Credit Card repayment-account selection remains separate. |
| `TM-AG-003` | Bank-linked UPI reference does not inflate Net Worth |
| `TM-AG-004` | Credit card purchase/repayment uses liability-aware ledger and no duplicate expense |
| `TM-AG-005` | Statement day 31 and short-month due date never create impossible calendar dates |
| `TM-AG-006` | "Autopay" configuration never initiates nor posts bank debit by itself |
| `TM-AG-007` | Investment purchase does not create spending; valuation does not double count |
| `TM-AG-008` | Loan EMI principal/interest split reconciles exactly |
| `TM-AG-009` | Archive/edit preserve IDs, posted history and grouped accounts |
| `TM-AG-010` | Create/opening journal failure rolls back all records |
| `TM-AG-011` | Adding a bank-linked Wallet reference with a funded ₹10,000 linked Bank creates **no** wallet journal account or opening postings; total assets and Net Worth stay ₹10,000, not ₹20,000 |
| `TM-AG-012` | New funded Wallet opened with ₹2,500 has one debit to Wallet asset and one credit to opening equity; Net Worth rises ₹2,500 without creating Income, and retry adds nothing |
| `TM-AG-013` | Imported Investment opening cost ₹3,000 + current valuation ₹3,400 creates only one ₹3,000 asset-cost/equity journal, no bank withdrawal or second ₹3,400 asset; valuation display remains policy-gated |
| `TM-AG-014` | Historical Borrowed Loan opening ₹10,000 creates one liability/equity event; historical Given Loan opening ₹10,000 creates one receivable/equity event; neither posts a second bank movement; disbursement transactions remain separate |
| `TM-AG-015` | Credit Card opening outstanding ₹1,500 creates a liability/equity event, not Expense or cash; card limit does not count in Net Worth |
| `TM-AG-016` | Every zero-opening ledger-bearing account creates metadata only and zero journal postings; failure/duplicate retry never creates double assets or debt |

## 07 · Architecture gate / unresolved decisions

**Not yet approved SQL:** `account_groups` or typed group metadata, subtype classifications, linked accounts, card billing cycles, loan amortization, holdings and valuations need a reviewed ADR + migrations. Do **not** add unrestricted EAV fields as ledger authority; validate typed money and dates. Currency/account limits and posting policies must align with [10 — Currency](CURRENCY-SPEC.md) and [04 — Ledger Draft](../architecture/DATABASE-DESIGN.md).

**Open decisions:** fixed six default groups vs future custom groups; cross-group conversions; **investment cost basis versus mark-to-market Net Worth and as-of-date reconciliation**; loan accrual and original-versus-outstanding history; real card available-credit inputs; issuer-specific due day and reminders; whether minimum/fixed autopay is display-only or simulated. **None of these ambiguities authorizes moving funds.** Follow-up architecture PR must define formal SQL, flows, mobile UI, and tests. The group-specific opening rules above are a **proposed testable product contract**, not approval of executable investment/loan or multi-currency journal migrations.

[← Docs Hub](../00-INDEX.md) · [Currency & FX →](CURRENCY-SPEC.md)

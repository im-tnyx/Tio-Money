<div align="center">

# 🧭 02 · User Journeys & Transaction Flows

### From a single `+` tap to a trustworthy financial record.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)
![Priority](https://img.shields.io/badge/CORE-P0-118C84?style=flat-square)

[🏠 Home](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🎯 Requirements](01-PRD.md) · [✍️ Standards](90-DOCS-STYLE-GUIDE.md)

</div>

---

> [!NOTE]
> **Design intent, not a pixel-perfect clone.** The supplied Income/Expense/Transfer screenshots are references for tabs, fields and the optional Fees action. The final Tio Money visual system will be original.


## 00 · Stage 1 owner-direction overlay — account groups and currency (2026-11-20)

> [!IMPORTANT]
> **Design review only; not shipped.** Owner product decisions [TM-DEC-006–009](DECISIONS.md#tm-dec-006--local-first-delivery-order-and-backup-boundary) and [RFC #15](https://github.com/im-tnyx/Tio-Money/issues/15) govern these **future** flows. **Current Phase 0 remains splash → five blank selectable tabs and one disabled floating +** (no Settings, editor or onboarding route). Earlier P0 onboarding and four-group diagrams below are **future examples**, not today's app. English-only initial app copy remains. Stage 2 backup and Stage 3 Supabase/Auth are separate later flows, **not part of Stage 1**.

### 00.1 Account groups — dynamic create, edit and archive

```mermaid
flowchart TD
  A["Accounts tab in future Stage 1"] --> B["Add Account"]
  B --> C{"Choose built-in group"}
  C --> D["Cash / Bank / Wallet / Card / Investment / Loan"]
  D --> E["Group-specific fields + eligible account links"]
  E --> F{"Validation and finance rules?"}
  F -->|No| G["Explain error, preserve draft"]
  G --> E
  F -->|Yes| H["Atomic local SQLite account + opening journal"]
  H --> I["Account detail + reconciled summaries"]
  I --> J["Edit metadata / archive, preserve ledger history"]
```

- **Settings → Account Groups** controls built-in template ordering/visibility; a hidden group neither deletes old accounts nor changes historic ledger classification. **Accounts → Add Account** creates records. Multiple accounts per group supported; custom groups remain future design-gated.
- **Cash:** name, opening amount, account currency, description. **Bank:** these plus optional provider and capabilities (UPI, debit card, cheque, internet banking). Modes describe ways to access the **same bank balance**, not separate ledgers. **Funded Wallet:** independently held balance; **bank-linked UPI reference** must not double count the bank asset.
- **Card:** card name, opening outstanding (debt), currency, credit limit, derived available credit, statement/due-cycle settings, optional linked bank account and description. “Automatic Payment” records a **tracking preference**, reminder and future payment choice, never posts or initiates a bank debit. A **Pay Bill** workflow displays source account and amount, and posts a bank-to-card repayment **only after explicit local confirmation**.
- **Investment:** type/holding, cost, latest user-entered value + valuation date, funding account; purchase principal becomes an asset, **not Expense**. Net worth valuation versus cost-basis posting requires finance ADR.
- **Loan:** Borrowed / Given, principal, outstanding, rate basis, installment and linked account; repayment must show principal and interest separately. Loan disbursal is debt/receivable movement, not salary or spending.
- Group switching before save warns about fields that would be dropped. Changing a saved account between incompatible ledger classes or converting loan direction **is not a simple rename**; disallow until a reviewed migration event.
- Account archive removes it from new payment/transfer pickers but preserves history; card outstanding/loan principal and category reports must reconcile after edits, refunds and restores.

| Flow ID | User action / exception | Expected system behavior |
| :--- | :--- | :--- |
| `TM-FLOW-AG-001` | Bank with UPI + debit card enabled | Both modes share one bank asset; no phantom wallet |
| `TM-FLOW-AG-002` | Card purchase then bank pays statement | Expense recognized on purchase, bank/card liability reduce on payment; no second expense |
| `TM-FLOW-AG-003` | User enables card “Automatic Payment” | Show “Tracking/reminders only”; **zero external debit and zero ledger posting** |
| `TM-FLOW-AG-004` | Loan installment ₹4,000: ₹3,000 principal + ₹1,000 interest | Bank −₹4,000, debt −₹3,000, Expense ₹1,000; one atomic event |
| `TM-FLOW-AG-005` | Investment buy ₹3,000 | Bank −₹3,000, investment cost asset +₹3,000, Expense unchanged |
| `TM-FLOW-AG-006` | Create fails during opening journal | Roll back account and all postings; retry idempotently |
| `TM-FLOW-AG-007` | Group hidden or account archived | No historic erasure; existing summaries remain explainable |

### 00.2 Main/Sub Currency — refresh-on-use interaction

```mermaid
flowchart TD
  S["Settings → Currency"] --> M["Choose Main Currency"]
  M --> X{"Optional Sub differs from Main?"}
  X -->|No| N["Sub disabled, no rate request"]
  X -->|Yes| T["Choose distinct Sub Currency"]
  T --> U["Currency-dependent use: refresh latest published quote"]
  U --> R{"Response valid?"}
  R -->|Yes| V["Store quote metadata locally; display updated time"]
  R -->|No, cached| C["Use last valid rate + visible stale warning"]
  R -->|No, no cache| F["Conversion unavailable; original local money remains usable"]
```

**On-use triggers:** app open/foreground with active Sub Currency, change selected pair, enter a currency conversion, multi-currency report, or currency-dependent transaction; manual Refresh Now also forces a request. This means **one valid fetch attempt per meaningful action**, not a background polling promise or one HTTP call per component rerender/keystroke. Coalesce identical in-flight requests; show throttled/network failure honestly. A provider's *latest available published* quote may be unchanged. Show base/quote, provider, rate and fetched/published timestamps. **Never modify booked original amounts due to updated quote**.

**Offline:** same-currency entry and existing ledger are fully usable offline. A cached rate is an explicit stale estimate; if missing, conversion unavailable (not silently 1:1). User's balance, card number, transaction notes or report rows **must not** leave the device in FX requests. Cross-currency posting remains **blocked pending finance ADR**, unlike display-only conversion.

| Flow ID | Acceptance |
| :--- | :--- |
| `TM-FLOW-FX-001` | Sub disabled or identical to Main → no conversion pair and no request |
| `TM-FLOW-FX-002` | Every new relevant user action attempts refresh; same-tick identical calls deduplicated |
| `TM-FLOW-FX-003` | Offline cache → stale provenance, no cache → unavailable |
| `TM-FLOW-FX-004` | Change pair while request pending → late quote cannot populate wrong pair |
| `TM-FLOW-FX-005` | FX-only request contains pair, not personal finance/identity fields |

### 00.3 Scope gates & separate identity flows

**Stage 1:** local SQLite financial data, offline-first manual features, limited network for public FX pair metadata. **No app signup**; do not block normal data entry when rate fetch fails. **Stage 2:** encrypted, optional, user-initiated Google Drive/iCloud-compatible backup & restore; this is a **file-provider flow**, not app login or a live ledger. **Stage 3:** user explicitly opts into Supabase sync, then sees app signup/signin and consent before initial upload. Supabase RLS, conflicts, sessions, cloud deletion and sign-out semantics need separate reviewed technical design; **none** are implemented here.

**Unresolved implementation blockers:** multi-currency balanced postings, investment cost-basis/value, loan accrual/schedule, card issuer due-date and minimum-due rules, backup keys, tenant isolation. See [Account Groups](08-ACCOUNT-GROUPS-SPEC.md), [Currency](10-CURRENCY-SPEC.md), [Ledger](04-DATABASE-DESIGN.md).

## 01 · The navigation promise

**Initial onboarding is English-only:** no language picker in the MVP; future locales remain a separate enhancement ([TM-DEC-001](DECISIONS.md#tm-dec-001--english-only-initial-app)).

**Home stays clean:** one `+` (Add) control opens one unified transaction editor. The Home screen does **not** show three Income / Expense / Transfer shortcut tiles.

```mermaid
flowchart TD
  ENTRY["📲 Launch"] --> FIRST{"First launch?"}
  FIRST -->|Yes| SETUP["Welcome → INR → Accounts (English UI)"]
  FIRST -->|No| HOME["🏠 Home"]
  SETUP --> HOME
  HOME --> ADD["➕ Add transaction"]
  ADD --> TABS{"Income | Expense | Transfer"}
  TABS --> INC["📈 Income form"]
  TABS --> EXP["📉 Expense form"]
  TABS --> TRA["🔄 Transfer form"]
  INC --> VALID["Validate"]
  EXP --> VALID
  TRA --> VALID
  VALID --> SAVE{"Save or Save & Add Another"}
  SAVE -->|Save| HOME
  SAVE -->|Save & Add Another| ADD
```

### Navigation skeleton

| Entry | Destination | Key behavior |
| :--- | :--- | :--- |
| Home `+` | Transaction editor | Last-used tab may be preserved only if owner approves |
| Income tab | Income fields | Category and receiving account required |
| Expense tab | Expense fields | Category and paying account required |
| Transfer tab | Transfer fields | From and To required; optional Fees |
| Save | Return to origin | Show success and freshly derived balances |
| Save & Add Another | Fresh editor | Never save duplicate when tapped twice |
| Back with changes | Confirm discard or keep editing | Never silently lose typed values |

## 02 · Three transaction types

| Field | 📈 Income | 📉 Expense | 🔄 Transfer |
| :--- | :---: | :---: | :---: |
| Date/time | ✓ | ✓ | ✓ |
| Positive amount | ✓ | ✓ | ✓ |
| Category | Income category | Expense category | — |
| Account | **To** | **From** | **From + To** |
| Optional Fees | — | — | ✓ |
| Optional note/description | ✓ | ✓ | ✓ |
| Save / Add Another | ✓ | ✓ | ✓ |

**Type rules:** Internal transfers never contribute principal to income or expense; money arriving from an external payer is not automatically assumed to be salary/income when it could be a refund or a transfer between owned accounts.

## 03 · Transfer fees — important money rule

Fees are **optional** and **collapsed by default**. The Fee action reveals an amount, account charged, and an expense-category preview.

```mermaid
flowchart TD
  T["🔄 Select Transfer"] --> A["Enter amount + From + To"]
  A --> Q{"Fees needed?"}
  Q -->|No| P["Preview principal movement"]
  Q -->|Yes| B["Enter fee amount"]
  B --> C{"Fee charged to?"}
  C -->|Source| S["Source debit = amount + fee<br/>Destination credit = amount"]
  C -->|Destination| D["Source debit = amount<br/>Destination credit = amount - fee"]
  S --> E["Fee = Expense · Bank Charges & Fees"]
  D --> E
  E --> P
  P --> V{"Values valid?"}
  V -->|No| FIX["Show actionable field error"] --> A
  V -->|Yes| STORE["Atomic linked transfer + fee save"]
  STORE --> OUTPUT["Update Account balances, History & Expense report"]
```

### Worked example · Fee charged to source account

**Before:** SBI ₹10,000 · HDFC ₹500.  
**Action:** transfer ₹5,000 with ₹50 fee paid by SBI.

| Ledger impact | Amount | Classification |
| :--- | ---: | :--- |
| SBI change | **−₹5,050** | Source outflow |
| HDFC change | **+₹5,000** | Destination inflow |
| Transfer principal | ₹5,000 | Internal movement — **not income or expense** |
| Bank Charges & Fees | **₹50** | **Expense** |
| Combined assets | ₹10,500 → **₹10,450** | Only the fee reduces the total |

**Atomicity:** If writing the fee expense fails, the transfer must not be committed alone. If a linked transfer is edited/deleted, its fee must follow the edit/delete safely.

### Worked example · Fee deducted from destination

**Action:** source sends ₹5,000; recipient account receives ₹4,950; ₹50 is withheld as a fee.

| From account | To account | Expense |
| ---: | ---: | ---: |
| −₹5,000 | +₹4,950 | +₹50 |

**Validation:** Fee cannot be negative; destination-reduced fees cannot exceed the principal; identical From/To accounts are invalid. For credit-card transfers, show the correct liability change rather than treating the card as an ordinary asset account.

## 04 · Account flows: asset versus credit card

```mermaid
flowchart LR
  B["🏦 Bank"] -->|Self transfer| W["👛 Funded wallet / cash"]
  B -->|Card bill payment| C["💳 Credit-card outstanding decreases"]
  C -->|Card purchase| E["🧾 Expense + outstanding increases"]
```

- **Bank → Cash:** bank goes down, cash goes up, combined assets stay unchanged.
- **Bank → Credit card repayment:** bank cash goes down, card outstanding also decreases. Net worth does not change before fees.
- **Card purchase:** creates expense and increases card debt.
- **Card cash advance:** creates asset inflow plus card liability, with any real charges booked to expenses.
- **UPI linked to bank:** do not double-count the same bank funds as a separate funded wallet.

## 05 · Transaction review and import flows

```mermaid
flowchart TD
  A["📩 Android bank SMS (conditional)"] -.-> P["Parse candidate"]
  B["📄 User-selected CSV / pasted text"] --> P
  P --> BAD{"OTP, promotional, failed or irrelevant?"}
  BAD -->|Yes| IGNORE["Ignore · no finance entry"]
  BAD -->|No| DEDUP{"Reference/amount/account/time match?"}
  DEDUP -->|Yes| DUP["Show possible duplicate"]
  DEDUP -->|No| CHECK["🔎 Candidate review screen"]
  CHECK --> ACTION{"Confirm / Edit / Ignore"}
  ACTION -->|Confirm| SAVE["Apply via same ledger service"]
  ACTION -->|Edit| CHECK
  ACTION -->|Ignore| IGNORE
  SAVE --> REPORT["Balances & reports update"]
```

> [!IMPORTANT]
> **Platform boundary:** Reading incoming bank SMS requires an Android native module, not Expo Go, and distribution depends on restrictive Google Play permission policy. Third-party iOS apps cannot continuously read the SMS inbox. CSV and user-selected text import form the shared cross-platform alternative. Bank credentials/OTPs are not required.

### Import review quality contract

- Do not assume every credit alert equals income.
- Match manual entries and both legs of self-transfers before creating new entries.
- Reference IDs are not necessarily globally unique.
- Let the user correct category, account and date before confirmation.
- Retain only minimal import metadata; unrelated raw SMS and OTP must not be saved.

## 06 · Error, empty and recovery states

| Situation | Desired behavior |
| :--- | :--- |
| No accounts available | Offer **Add account**, then resume the unfinished transaction |
| Empty or zero amount | Inline validation; no write |
| Fee exceeds transferred amount (destination deducted) | Block save, explain why |
| From and To are the same | Explain that a transfer needs two distinct accounts |
| App closes mid-entry | Don't claim autosave; future draft recovery needs explicit implementation |
| Save fails halfway | Roll back all linked changes; clear error and retry |
| Duplicate save tap | Disable/reject duplicate submission while saving |
| Offline | Manual tracking works; cloud-dependent features say unavailable |
| SMS permission unavailable | Manual and CSV/text import still work |
| Imported debit later reversed | Link reversal/refund; don't double-count expenses |
| Credit card insufficient context | Ask for account class instead of silently using bank-account math |

## 07 · Acceptance walkthroughs for developers

- [ ] Tap the only `+` action; all three tabs appear inside one editor.
- [ ] A ₹500 cash expense reduces Cash ₹500 and adds exactly ₹500 to expenses.
- [ ] A ₹5,000 income adds ₹5,000 to the chosen receiving account.
- [ ] An internal ₹2,000 bank→cash transfer changes only account balances.
- [ ] A ₹5,000 bank→bank transfer with ₹50 source-side fee charges exactly ₹50 expense.
- [ ] Destination-side fee reduces destination receipt correctly.
- [ ] Fees and principal commit together or neither commits.
- [ ] Editing/deleting a linked transfer also updates/removes its fee safely.
- [ ] Credit card repayment changes bank and liability, not income/expenses.
- [ ] Same SMS/CSV transaction is not recorded twice.
- [ ] Core manual flows work in Expo Go without network access.

## 08 · Related specifications

- [🎯 Product Requirements](01-PRD.md) — normative product scope and business rules.
- [✍️ Documentation Style](90-DOCS-STYLE-GUIDE.md) — document quality and visual language.
- [🎨 Screen design specification](03-SCREEN-SPEC.md) — original visual patterns, accessibility and field-state definitions.
- **Next:** Database design — signed journal / accounting invariant and SQLite schema.

---

[← Documentation Hub](00-INDEX.md) · [Review PRD →](01-PRD.md)

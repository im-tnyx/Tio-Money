<div align="center">

# 🎨 03 · Screen Design Specification

### An original mobile experience for clear decisions, fast entry and trustworthy money math.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)
![Scope](https://img.shields.io/badge/RELEASE-EXPO%20GO%20CORE%20MVP-118C84?style=flat-square)
![Targets](https://img.shields.io/badge/TARGETS-ANDROID%20%2B%20IOS-596274?style=flat-square)

[🏠 Project](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🎯 Product Requirements](01-PRD.md) · [🧭 User Flows](02-USER-FLOWS.md) · [✍️ Documentation Style](90-DOCS-STYLE-GUIDE.md)

</div>

---

> [!IMPORTANT]
> **Current-versus-future contract (live main 2026-11-21):** Five root destinations and disabled Add remain unchanged; four finance routes export `BlankScreen`, while **More** composes [`MoreRoute`](../src/features/settings/more-route.tsx), `useMoreViewModel` and presentational [`MoreScreen`](../src/features/settings/more-screen.tsx) for persisted System/Light/Dark Appearance. Original 2026-11-19 five-blank copy below is **historical**, not current installed-app verification. No finance editor, onboarding, login or actual ledger UI.


## 00 · Future Stage 1 screen contract — 2026-11-20

> **Mandatory newer owner rule (2026-11-21): every future screen is dumb/presentation-only.** Screens render immutable typed view-model props and forward injected callbacks; **no local workflow hooks, navigation commands, business calculations, SQL, I/O, permissions or side effects inside any screen**. Controllers/hooks own state/routing/async; application use cases own workflows; one pure domain ledger owns all financial math; repositories own SQL. See [TM-DEC-011](DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule), [12 — Dumb-Screen Contract](12-DUMB-SCREEN-BOUNDARIES.md) and future tests `TM-PRES-001–006`. This docs amendment does not enable a feature screen or change the already-correct five-tab shell.


> [!IMPORTANT]
> **UI spec and current-status separation:** Current source has **four blank finance tabs + More → Appearance**, all five destinations and a disabled floating Add. The following detailed finance screens remain **future proposals**, not an authorisation to implement financial logic or UI redesign. See [More](MORE-APPEARANCE.md) and [TM-DEC-011](DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule).

### SCREEN 11 · Accounts → Add Account · `TM-S11` · future local Stage 1

| Step | Visible design and acceptance |
| :--- | :--- |
| Choose Account Group | Six built-in rows: Cash, Bank, Wallet, Credit Card, Investment, Loan, with a short definition. May hide templates in Settings, never delete existing accounts |
| Shared fields | Name and description; currency is selected for ledger-bearing accounts but **inherited from the linked Bank** for reference Wallets. Opening position is **group-conditional**, not a mandatory universal field |
| Cash | Name, native currency, optional description and nonnegative opening asset amount; a positive opening balances against opening equity, never Income |
| Bank | Shared + bank provider (optional), UPI, debit card, cheque, internet banking capability checkboxes; explain all methods use the same balance |
| Wallet | **Funded:** show nonnegative opening asset amount and own currency. **Bank-linked reference:** require eligible linked Bank selection, derive currency and show **no editable opening amount or separate balance/journal**; add/edit/archive reference metadata only |
| Credit Card | Opening outstanding, total limit, statement cycle/day, next due, linked bank payment source, description, tracking-only auto-payment preference |
| Investment | Asset kind, **historical opening cost basis** vs separately dated current valuation, funding account and optional units. Registering an existing position must not debit funding Bank a second time; valuation stays non-posting, report policy ADR-gated |
| Loan | Borrowed / Given, historical outstanding principal (liability vs receivable), rate basis, installment, next due and eligible account link; no bank movement on historical opening; distinguish separately confirmed new disbursement |

**Form behavior:** dynamic fields derive from a typed **group definition**, not bank/payment provider names; required, optional and derived fields visually distinct. A derived balance, available credit, Net Worth or rate is never editable. Validation errors appear by field and screen-reader announcement; on group switch warn before discarding incompatible draft fields. Prevent silent account-class change on edit.

**Account detail:** ledger-bearing kinds display group label, asset/liability context, ledger-derived balance, status, linked accounts, posted transactions and correction/history. **Bank-linked Wallet reference** displays the linked Bank account and its shared balance as a *view*, **not an independent asset**; editing or archiving the reference leaves Bank postings untouched. **Credit card availability is an estimated value** (limit − posted outstanding − known holds + adjustments); if issuer holds aren't known, say so.

### SCREEN 12 · Card Bill & Loan Installment · `TM-S12` · future local Stage 1

| Card bill area | Behavior |
| :--- | :--- |
| Statement | Show statement generation date/billing period; distinguish user-entered issuer amount from computed spend |
| Due date | Show actual known date/rule; 28–31-day months, holidays, overdue status and timezone must not produce impossible dates |
| Total / outstanding / available | Label all individually. Credit limit is **not spendable asset** |
| Pay from | Optional eligible bank account ID, explicitly chosen/confirmed at payment time |
| Automatic Payment | Toggle labelled **“Track bank autopay (reminders only)”**; do **not** imply Tio Money schedules or debits payments. No date-based auto-post |
| Pay Bill | Full / partial / user-entered amount → preview bank −, card liability −, **new expense 0**, explicit Confirm; receipt/history after atomic local commit |

**Loan installment detail:** amount + principal + interest + fees (if known), linked account, due date; preview exactly which postings change. Schedule alone is not a booked payment. If interest allocation unknown, **block posting as if it were known**; allow user to correct/confirm, not silently allocate.

### SCREEN 13 · Settings → Currency · `TM-S13` · future local Stage 1

- Show Main Currency picker and optional Sub Currency control. Sub picker is active **only for currency different from Main**; reject identical pair, not an API call.
- Currency card displays **1 Sub = X Main**, ISO codes, rate provider, **published/effective at** and **fetched at** times, freshness/stale label, Refresh Now.
- On app foreground, pair change, entering conversion, relevant report/transaction action → request latest available published rate. Show loading/nonblocking state; avoid request storms. Cached rate must visibly say **stale**, not “Live”.
- If internet/provider unavailable and cache exists, still show original amounts and approximate cached conversion with time. If no cache, show **Rate unavailable** and omit converted amount; regular same-currency local entry remains accessible.
- Changing display currency never rewrites saved account/transaction original currency. For unsupported cross-currency posting, show explanatory unavailable state until the ledger ADR is approved.
- Accessibility: speak base/quote and “estimated, last fetched ...”; never rely on color alone for stale/error. Format account currency-specific decimal scale, dates in device locale while initial UI labels remain English.

### SCREEN 14 · Local Data & Future Cloud Choices · `TM-S14` · stage-gated

**Stage 1:** only local privacy/storage information, no signup, no inactive cloud controls or false backup indicator. Warn that uninstall/device loss can destroy not-backed-up data.

**Stage 2 (not visible now):** optional “Backup to Google Drive / iCloud Drive / file provider” and “Restore from encrypted backup” surfaces, with confirmation of content, encryption/passphrase risk, timestamps, validation and restore replace-vs-merge warnings. No Tio Money account required.

**Stage 3 (not visible now):** separate optional “Enable Supabase Sync” user choice; **only** on this path present app signup/signin and informed consent. Show explicit upload and conflict expectations, local-only exit and signout outcomes. Never open login on ordinary app launch.

### UI acceptance trace

| ID | Required visible outcome |
| :--- | :--- |
| `TM-SCR-AG-001` | Group selects only permitted fields; Cash has no card-specific inputs |
| `TM-SCR-AG-002` | UPI/debit card capabilities do not render duplicate account balances |
| `TM-SCR-AG-003` | Card outstanding, limit, available and due/statement labels remain distinct |
| `TM-SCR-AG-004` | “Automatic Payment” clearly marked **tracking only** and creates no external payment |
| `TM-SCR-AG-005` | Loan and Investment show cost/valuation or principal/interest separately |
| `TM-SCR-AG-006` | Bank-linked Wallet reference requires Bank selector, inherits currency, has no opening amount and changes no bank balance on edit/archive |
| `TM-SCR-FX-001` | Identical Main/Sub disabled, FX refresh on meaningful currency use |
| `TM-SCR-FX-002` | Stale quote has source/time; no quote shows unavailable, no fake rate |
| `TM-SCR-STAGE-001` | Stage 1 no signup, backup or Supabase controls rendered |

**Implementation/design gates:** dynamic input semantics and card due-date policy require accepted [08 — Account Groups](08-ACCOUNT-GROUPS-SPEC.md); FX refresh, precision and reporting require [10 — Currency](10-CURRENCY-SPEC.md); balance/transfer rules require [04 — Ledger](04-DATABASE-DESIGN.md). This section is not approved pixel-level UI or a claim that these routes exist.

## 01 · Executive design direction

**Personality:** calm · contemporary · trustworthy · precise · approachable. Finance tools must make **the movement of money** more obvious than decoration.

| Design promise | What the user experiences | Deliberately avoid |
| :--- | :--- | :--- |
| **Single entry point** | One recognizable **`+`** leads to a common Income / Expense / Transfer editor | Three action shortcuts on Home |
| **Numbers first** | Money totals, dates and account names are scannable | Loud decorative gradients behind essential numbers |
| **Math without surprises** | Every transfer previews what leaves, what arrives, and what is a fee expense | Treating transfer principal as spending |
| **One consistent language** | Same form structure, controls and messages across both OSs | Platform screenshots copied pixel for pixel |
| **Local-first trust** | Offline entry always visible; privacy/import controls are explicit | Pretending Expo Go can read SMS |
| **Accessible by design** | Scalable text, screen reader labels, generous tap targets and contrast | Red/green color as the only status signal |

### Current implemented Phase 0 visual contract

**Only the following behavior is implemented in the Phase 0 shell on `main`** (merged through PR #1 on 2026-11-19; full cross-platform installed-device/SQLite QA remains unverified):

- **Five** root destinations **Home · Trans. · Stats. · Account · More**: first four bodies blank, More implements Appearance UI with controller-owned state, not a finance dashboard/editor.
- Exactly one **disabled** circular floating `+` placed right-above the **More** tab's center, outside the bottom bar, with no `onPress` or editor route.
- Native splash is held during settings-only SQLite initialization; on success it reveals Home and the five-tab shell directly. Only a genuine startup failure may expose safe retry UI.
- **Current Appearance and geometry:** More System/Light/Dark selection persists through its controller; 24dp SVG icons, 48dp tab hit area, 50dp bar/FAB baseline, 11sp labels, **0dp icon-label gap**, **selected 300/inactive 200**, separate disabled Add with **16dp** clearance, OS inset extra; **160ms theme-safe Reduced Motion-aware crossfade** in root tabs. Screen rendering never owns finance/SQL/navigation logic.
- Route screens are **dumb/presentation-only**; navigation commands, safe-area/FAB positioning and splash lifecycle run in shared hooks/controllers; SQLite and accounting logic are not screen concerns. [Theme implementation](../src/shared/theme/README.md) specifies component-token ownership.
- Owner reports a **physical-device current-UI smoke PASS** without the formerly observed `ExpoSQLite` error (platform and OS details not yet recorded). Full Android **and** iPhone matrix, system-appearance contrast, large fonts/screen reader, on-device SQLite PRAGMA/migration/restart and separate merge authorization remain **NOT_VERIFIED**. See [Phase 0 QA register](07-PHASE-0-FOUNDATION-NOTES.md).

### 1.1 Scope boundaries

| Phase | Screens / interactions | Status |
| :--- | :--- | :--- |
| **Current source shell + More Appearance** | Four blank finance tabs; More → Appearance with System/Light/Dark; disabled Add; selected 300/inactive 200 icons, 0dp gap, 160ms reduced-motion-aware crossfade | **Source merged on main; installed-device Android/iPhone and SQLite/visual matrix not independently verified here** |
| **Future finance feature screens (historical P0 proposal)** | Setup, Home dashboard, active Add, History, account management, Reports, other Settings outside existing Appearance | **Finance design only; More Appearance is implemented**, but account/ledger features are not |
| **P1 · Cross-platform import** | Import source, candidate review, deduplication states | **Specified at flow level** |
| **Conditional Android native** | SMS permission rationale, review inbox, opt-out | **Requires policy eligibility + custom development build** |
| **P2 / later** | Budgets, recurring/instalments, secure backup/sync, advanced receipt management | **Future design only** |

## 02 · Navigation architecture

### Current Phase 0 navigation (owner-approved)

| Home | Trans. | Stats. | Account | More |
| :---: | :---: | :---: | :---: | :---: |
| Blank Home | Blank Trans. | Blank Stats. | Blank Account | More → Appearance |

A **separate disabled floating `+`** sits **above More on the right**; it is **not** a tab and does not open anything. No root header, profile menu or Settings route exists.

```mermaid
flowchart TD
  SPLASH["Native splash + settings-only SQLite init"] --> ROOT["Five destinations: four blank finance tabs + More Appearance"]
  ROOT --> H["Home"]
  ROOT --> T["Trans."]
  ROOT --> S["Stats."]
  ROOT --> A["Account"]
  ROOT --> M["More"]
  ROOT -. "Disabled visual only" .-> FAB["Floating + above More"]
```

### 2.1 Proposal: five positions, one action

> **Historical future-state proposal, NOT the current Phase 0 navigation.** The four root destinations + active center Add flow below were superseded by [TM-DEC-004](DECISIONS.md#tm-dec-004--five-destinations-and-floating-add) and [TM-DEC-005](DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab). Keep this original layout only as archived product exploration; do not implement it without a new owner decision.

Use a shared bottom bar with **four navigable destinations** and a **central action**:

| Left | Left-center | Center | Right-center | Right |
| :---: | :---: | :---: | :---: | :---: |
| **Home** | **History** | **`+` Add** | **Reports** | **Accounts** |
| Root screen | Root screen | **Opens editor; not a root tab** | Root screen | Root screen |

- **Exactly one `+` control in the root shell.** The Home content itself must **not** add a second `+` or separate Income, Expense and Transfer shortcut cards.
- Tapping `+` pushes a **full-screen Add Transaction editor** with its own header and form.
- Root bottom bar is hidden on full-screen editor, detail pages, onboarding, keyboard-driven modal tasks and approval dialogs as appropriate.
- **Settings** opens from a shared, labeled top-bar action/profile menu (not an extra bottom-tab destination).
- Central `+` has a text/accessibility label (`Add transaction`) even if the compact visual uses only the symbol.
- This placement is an **initial design proposal**, not a previously approved owner choice. The confirmed requirement is **one primary `+` entry**, irrespective of final placement.

```mermaid
flowchart TD
  SETUP["📲 First-run setup"] --> HOME["🏠 Home"]
  HOME <--> HIST["📜 History"]
  HOME <--> REPORT["📊 Reports"]
  HOME <--> ACC["🏦 Accounts"]
  ROOT["➕ Shared Add action"] --> EDIT["🧾 Full-screen transaction editor"]
  EDIT --> TYPE{"Income · Expense · Transfer"}
  TYPE --> DONE["Validate & save"]
  DONE --> ORIGIN["Return to originating root screen"]
  HIST --> DETAIL["Transaction detail / edit"]
  ACC --> ACCEDIT["Account create / edit"]
  ROOT -. "visible across root destinations" .-> HOME
```

### 2.2 Header / route rules

> **Future finance feature-screen proposals only.** Current UI has four blank finance bodies plus existing More → Appearance, with five root destinations, disabled Add and no active ledger/editor. The table below does not describe shipped finance behavior.

| Level | Header | Back | Bottom bar |
| :--- | :--- | :--- | :--- |
| Root | Friendly page title + context action | No back button | Visible |
| Add editor | `Add transaction` + optional close | Confirm if dirty | Hidden |
| Detail / Edit | Contextual title + navigation | Returns to caller | Hidden |
| Sheet / selection | Single label + Close/Done | Dismiss to form without losing other fields | Hidden behind overlay |
| Setup | Step title + progress | Previous step where safe | Hidden |

**Safe-area contract:** iPhone home indicator, Android navigation areas, cutouts, status bar and keyboard must not cover amounts or primary actions.

## 03 · Tio Money visual language — proposed tokens

The future design uses a **warm neutral canvas, deep ink, subtle violet brand signal and restrained semantic colors**. Financial color meanings must remain clear. This section contains **candidate design values**, not a second implementation token source. Current UI owns physical values in [`primitives.ts`](../src/shared/theme/primitives.ts), spacing/radius/typography and system light/dark semantic colors in [`tokens.ts`](../src/shared/theme/tokens.ts), and shared **24dp icon roles** plus navigation/FAB/component dimensions in [`component-tokens.ts`](../src/shared/theme/component-tokens.ts). All future top bars, buttons, bottom sheets, cards and text fields must consume those shared roles, with no per-screen hardcoded visual sizes; see the [Core Theme README](../src/shared/theme/README.md).

### 3.1 Light & dark palette

| Semantic token | Light candidate | Dark candidate | Intended use |
| :--- | :--- | :--- | :--- |
| `surface.canvas` | `#F7F8FC` | `#0C1018` | Main background |
| `surface.card` | `#FFFFFF` | `#181F2B` | Summary and group surfaces |
| `surface.elevated` | `#F0F2F8` | `#242D3B` | Inputs, sheets, secondary surfaces |
| `text.primary` | `#172033` | `#F6F8FC` | Main amounts and titles |
| `text.secondary` | `#5B6578` | `#B6C0D0` | Descriptions and metadata |
| `border.subtle` | `#E1E6EE` | `#374254` | Row separators |
| `brand.primary` | `#6049CF` | `#A99BFF` | Primary action and focus |
| `money.income` | `#147D66` | `#5DE0B0` | Credits / positive |
| `money.expense` | `#BC4055` | `#FF8D9C` | Spending / negative |
| `money.transfer` | `#446A9C` | `#9AC6FF` | Internal movement |
| `state.warning` | `#93611E` | `#FFC77A` | Review needed; not for normal transfers |

**Contrast check required:** These are candidates, **not tested WCAG-compliant pairings**. Verify text-on-surface, selected/unselected tabs, disabled buttons, focus/error states and charts in both themes before approving a palette. Do not use a bright background with illegible white text.

### 3.2 Type, spacing and shape

| Element | Candidate rule | Why |
| :--- | :--- | :--- |
| Display balance | 32–36sp/pt, semibold, tabular numerals where available | Quick money scan |
| Screen title | 24–28sp/pt, semibold | Clear hierarchy |
| Section title | 16–18sp/pt, semibold | Stable rhythm |
| Body / field value | At least 16sp/pt in core forms | Readable and keyboard friendly |
| Caption | ~13–14sp/pt, responsive | Useful but subordinate |
| Grid | 4 / 8 / 12 / 16 / 24 / 32 | Predictable vertical rhythm |
| Content gutter | 16–20dp/pt | Consistent margins |
| Cards | 16–20 radius | Soft without clutter |
| Buttons | 12–16 radius; minimum 48dp Android / 44pt iOS touch target | Easy to use |
| Icons | One consistent outline family, ~20–24 | Familiar meanings |
| Motion | 160–220ms simple transitions; respect reduced motion | Calm feedback, not animation-heavy |

**Typography decision:** Prefer platform **system fonts** in the MVP; a custom font needs separate owner approval. Test text scaling and accessibility before visual approval.

**Money format:** `₹12,500.00` where fractional precision is relevant; group Indian digits; avoid forcing decimals when a summary design intentionally rounds *display only*. Storage stays integer paise; never round before ledger calculation.

### 3.3 Color semantics and tone

- Income shows **`+` + label** as well as positive coloring.
- Expense shows **`−` + label** and does not make red the sole cue.
- Transfer shows a **two-way arrow**, `From → To`, and separate fee details.
- Neutral typography is used for total balance; net worth/credit-card outstanding are **named**, never shown as an unlabeled balance.
- App copy is friendly, short and precise. No guilt-oriented labels (e.g., “bad spending”).

## 04 · Design-system component contracts

| Component | Intent | Required states |
| :--- | :--- | :--- |
| `AppShell` | Shared root layout and safe areas | Loading, active root, modal overlay |
| `TopBar` | Title, back, contextual action | Root, nested, editor |
| `BottomNav` | Four destinations + one Add action | Active, keyboard, safe-area |
| `MoneyAmount` | INR formatting with accessible sign | Positive, negative, neutral, hidden/private |
| `SummaryCard` | Context + total + period | Loading, populated, empty |
| `TransactionRow` | Icon, merchant/category, account, amount, date | Income, expense, transfer, pending import |
| `TypeTabs` | Income / Expense / Transfer | Selected, unselected, accessibility announced |
| `FormField` | Visible label, helper, validation | Idle, focused, invalid, disabled |
| `AccountPicker` | Select owned account | Empty, selection, archived/missing |
| `CategoryPicker` | Choose compatible category | Empty, selected, custom |
| `FeeDisclosure` | Expand optional transfer charges | Collapsed by default; expanded; invalid |
| `MoneyMovementPreview` | Show debit, receipt and fee expense | Without fee, source fee, destination fee |
| `PrimaryCTA` | Save | Enabled, submitting, success, error |
| `SecondaryCTA` | Save & Add Another | Enabled, submitting, error |
| `EmptyState` | Explain absent data + one next step | No accounts, no transactions, no imports |
| `FeedbackBanner` | Nonblocking status | Success, warning, error |
| `ConfirmDialog` | Prevent destructive loss | Dirty form, delete, irreversible action |

**Architecture boundary:** presentational components render typed data and emit user intents; they do not calculate balances, parse SMS, or write SQLite. That work belongs to state/domain/data modules specified later.

## 05 · Screen inventory and specifications

> **Future finance design inventory:** Home/Trans./Stats./Account finance content and Add editor are future; **More Appearance is already built**, with dumb screen and controller separation. Future specs are not authority to put business logic into screen files.

### SCREEN 01 · First-run setup `TM-S01` · P0

**Purpose:** Give the user an immediately useful offline tracker.

```mermaid
flowchart LR
  W["Welcome"] --> L["INR defaults (English UI)"]
  L --> A["Choose account type"]
  A --> B["Name + opening balance"]
  B --> C["Confirm & enter Home"]
```

- Welcome: short value proposition; **Get started**; no forced bank login/signup.
- Language: **English-only UI**, with **no MVP language picker**; currency defaults to INR. Keep semantic strings ready for later locales.
- Account: Cash, Bank, funded Wallet or Credit Card (liability).
- Opening balance wording: **Available balance** for assets; **Amount owed** for credit card.
- Confirm screen summarizes what will be stored locally; distinguish future backup from current local storage.
- Validation: no blank account name; sensible number format; prevent creating an unusable first account.
- State: first launch, validation error, database setup failure, resumed setup.

### SCREEN 02 · Home dashboard `TM-S02` · P0

**Purpose:** At a glance — how much do I have, what did I spend, what changed recently?

```text
┌───────────────────────────────────┐
│ Tio Money                  Settings│
│ Good evening                       │
│                                   │
│  TOTAL ASSETS        NET WORTH      │
│  ₹24,500             ₹21,800        │
│  Credit card owed: ₹2,700           │
│                                   │
│ ┌──────────────┬─────────────────┐  │
│ │Income        │Expense          │  │
│ │+₹35,000      │−₹10,500         │  │
│ └──────────────┴─────────────────┘  │
│                                   │
│ Recent activity         See all   │
│  Grocery     · Cash       −₹650   │
│  Salary      · SBI      +₹30,000  │
│  Bank → Cash            ₹2,000    │
│                                   │
│ Home    History   [+]  Reports Accounts│
└───────────────────────────────────┘
```

*Layout illustration, not final screenshot; sample numbers are fictional.*

- Header with page identity, accessible Settings action.
- Primary summary distinguishes **Total Assets**, **Liabilities** and **Net Worth** rather than showing a misleading all-inclusive “balance”.
- Period switch (Today / Month) for income and expense summary; label period clearly.
- Latest 5 activities; transfer principal visually neutral; linked fees display under movement detail or as a clearly related fee line.
- **One shared Add `+` action**. No extra action card section.
- Empty: “No transactions yet” plus supporting copy pointing to `+` (not a second add button).
- Refresh of local figures is derived from canonical ledger, not a remote sync illusion.

### SCREEN 03 · Add transaction `TM-S03` · P0

**Purpose:** Save any standard money event in a small number of predictable steps.

```text
┌───────────────────────────────────┐
│ ←  Add transaction                 │
│ [ Income ] [ Expense ] [ Transfer ]│
│                                   │
│            ₹ 0.00                 │
│         Enter amount              │
│                                   │
│ Date & time     [ Today · 7:35 PM ]│
│ Category        [ Select          ]│
│ Account         [ Choose          ]│
│ Note            [ Optional        ]│
│ Description     [ Optional        ]│
│                                   │
│ [      Save      ] [ Save & Add  ] │
│                   [ Another     ]  │
└───────────────────────────────────┘
```

*Field arrangement is a unique proposed composition, not the row-for-row screenshot.*

**Common behavior**

- Exactly three tabs; switching changes available fields while retaining compatible values only when safe.
- Amount input has large formatting, rupee marker, decimal keyboard, accessible numeric error and **max two decimal places**.
- Date/time defaults to the user's local current time (not a hard-coded date from reference screenshots).
- Use direct labels; never substitute placeholders for field labels.
- The form scrolls while the footer CTA respects keyboard and safe area.
- **Save:** validate → one atomic write → success → return to origin.
- **Save & Add Another:** validate → write once → show success → reset input for next entry on the same transaction tab (proposed; awaiting owner decision on defaults).
- Rapid double tap must not submit twice; disable actions while saving.
- Discard changes: explicit Cancel/Keep editing dialog.

#### Tab A — Income `TM-S03-A`

| Field | Required | UI contract |
| :--- | :---: | :--- |
| Amount | Yes | Positive INR |
| Date/time | Yes | Editable default current |
| Category | Yes | Income-only list (salary, business, gift, other) |
| To account | Yes | Receives money; class-aware |
| Note / Description | No | Optional detail |

**Safe classification:** a credit from another owned account or refund must not automatically be classified as salary; user can choose the correct money event.

#### Tab B — Expense `TM-S03-B`

| Field | Required | UI contract |
| :--- | :---: | :--- |
| Amount | Yes | Positive INR |
| Date/time | Yes | Editable |
| Category | Yes | Expense-only list |
| From account | Yes | Pays bill; credit-card class supported |
| Note / Description | No | Optional detail |

If credit card is selected, the UI clarifies **“Adds to card outstanding”**, not “decreases cash balance”.

#### Tab C — Transfer `TM-S03-C`

```text
┌───────────────────────────────────┐
│ ←  Add transaction                 │
│ [ Income ] [ Expense ] [ TRANSFER ]│
│                                   │
│             ₹5,000                │
│ Date & time  [ Today · 7:35 PM ]   │
│ From         [ SBI Bank        ▾ ]│
│ To           [ HDFC Bank       ▾ ]│
│                     [ ⇅ Swap ]    │
│                                   │
│ [ + Add transfer fees ]            │
│                                   │
│ ┌──────── Movement preview ──────┐ │
│ │ SBI debit           ₹5,000     │ │
│ │ HDFC credit         ₹5,000     │ │
│ │ Expense from fee        ₹0     │ │
│ └───────────────────────────────┘ │
│ Note / Description  (optional)     │
│                                   │
│ [ Save ] [ Save & Add Another ]    │
└───────────────────────────────────┘
```

**When fees are added (the important special case):**

- `+ Add transfer fees` expands an **inline fee section**, not a separate transaction-type shortcut.
- User enters **Fee amount**, **Fee charged to** (source / destination) and sees `Bank Charges & Fees` as expense category (editable when accounting design allows).
- The live movement preview must update *before* Save, including separate values for source debit, destination credit, and expense reported.
- Fee amount `0` is equivalent to no fee; collapse section may remove fee input after clear confirmation if a nonzero amount was entered.
- Destination-deducted fee cannot exceed transfer amount.
- **From** and **To** must differ; the Swap control flips them but **must not silently reverse fee payer semantics** — show the new fee origin in the preview.
- For card-to-account / account-to-card transfers, use **Card outstanding** labels instead of fake asset debit/credit arithmetic.

| Example | Source change | Destination change | Expense |
| :--- | ---: | ---: | ---: |
| ₹5,000 transfer, no fee | −₹5,000 | +₹5,000 | ₹0 |
| ₹5,000, ₹50 fee at source | −₹5,050 | +₹5,000 | **₹50** |
| ₹5,000, ₹50 fee at destination | −₹5,000 | +₹4,950 | **₹50** |

**The ledger owns the truth:** The UI preview should be generated from the same domain calculation rules used for saving, never independently hard-coded. For asset-to-asset transfers, the total change is exactly the fee expense.

### SCREEN 04 · Transaction history `TM-S04` · P0

- Filter chips: **All / Income / Expense / Transfer**; date range, account, category and amount in a filter sheet.
- Group by actual local date; use clear merchant/category and account attribution.
- Sign and icon plus semantic color; transfers show `From → To` and no positive/negative income-style label.
- Linked transfer fee: e.g., `Transfer ₹5,000 · Fee ₹50` (one grouped list item if accounting detail permits), without concealing the fee from expense reporting.
- Empty filters: “No matching transactions. Clear filters.”
- Tap row opens details and actions, not instant edit.

### SCREEN 05 · Transaction detail / edit `TM-S05` · P0

- Header shows type, amount, date/time and origin (Manual / Import).
- Account route, category, notes, optional import reference; source-specific information redacted.
- For fee-bearing transfers, show principal + fee in one grouped detail panel and list the **expense classification** visibly.
- Edit reuses unified editor in edit mode; **no second fee must be created**.
- Delete requires confirmation and safely removes/soft-deletes linked fee with principal.
- Display reversal/refund relationship when present; account status and report consistency guaranteed after changes.
- State: deleted/restored, missing account label, failed edit rollback, stale reference.

### SCREEN 06 · Accounts `TM-S06` · P0

- **Future Stage 1:** list **Cash / Bank / Wallet (funded and bank-linked reference) / Credit Card / Investment / Loan** by UI group. A funded Wallet has its own asset; a bank-linked reference is selectable account-link metadata and **does not create another asset or duplicate the Bank balance in Net Worth**. Ledger class (asset/liability) is independent from the UI group (see SCREEN 11); current Phase 0 screen is blank.
- Ledger-bearing asset card shows its journal-derived available balance; a **bank-linked Wallet reference** shows the existing linked Bank balance clearly labelled **shared / not additional funds**, not an independent financial asset. Credit Card liability card shows **Outstanding**, never indistinct `Balance`.
- Add account is a labeled action within Accounts; it is **not** an Income/Expense/Transfer home shortcut.
- Add/edit form: name, typed group, **group-conditional opening position** (asset balance / Card outstanding / historical Investment cost / Loan outstanding), masked identifier (optional), icon and archive status. For `wallet_kind=bank_linked_reference`, require eligible Bank link, inherit Bank currency and **hide opening amount**; create/edit/archive only reference metadata, **never a funded asset or opening journal**.
- Show all relevant account transactions in account detail.
- Do not double-count UPI handles linked to the same bank account as distinct funded wallets.
- If a ledger-bearing account is archived, preserve history and prevent new transactions unless restored. Archiving a bank-linked Wallet reference only hides its metadata and **must not archive, delete or change its linked Bank account or posted events**.

### SCREEN 07 · Reports `TM-S07` · P0

- Period selector: Today, Week, Month, Custom.
- First row: **Income / Expense / Net** with a clear time context.
- Show category breakdown and trend chart; chart points must have accessible labels, currency units and readable alternatives.
- Distinguish **cashflow** from **profit/savings** and separate **asset / liability / net worth** trends when possible.
- Transfer principal excluded from income and expense bars; related fees included once in expense.
- Filters follow the same semantics as History.
- Empty report shows “No records for this period,” not zero bars suggesting data was verified.

### SCREEN 08 · Import center & review `TM-S08` · P1

```mermaid
flowchart TD
  SRC["Import Center"] --> METHOD{"Choose source"}
  METHOD -->|Text or CSV| CAND["Review candidates"]
  METHOD -. "Android native SMS: policy + custom build" .-> CAND
  CAND --> MATCH["Detected amount / account / direction"]
  MATCH --> DUP{"Possible duplicate or self-transfer?"}
  DUP -->|Yes| VERIFY["Resolve duplicate before saving"]
  DUP -->|No| APPROVE["Confirm / Edit / Ignore"]
  VERIFY --> APPROVE
  APPROVE --> SAVE["Same validated ledger posting"]
```

- Tabs: Pending / Confirmed / Ignored. Do not announce unverified SMS parsing as success.
- Candidate card shows amount, debit/credit, timestamp, source, bank/account match, merchant and suggested category with confidence.
- Pending entry remains **not posted** to balances; only confirmed ledger records affect money.
- Show clear explanation on duplicates, failed/pending payments and reversals.
- A normal iOS app has **no automatic full inbox reading**; user-initiated pasted text and CSV/statement import only.
- Android inbox monitoring requires a native module, custom Expo development build and applicable Play policy approval; not available in Expo Go.
- Never display or retain OTP content, unrelated messages or unmasked account identifiers by default.

### SCREEN 09 · Settings, privacy, export `TM-S09` · P0 basic / P1 advanced

- Appearance: **System / Light / Dark is already implemented in More**, with preference selection/persistence owned outside the presentation screen; other financial settings remain proposals.
- **No MVP language selector**. Initial UI text and accessibility/validation copy are English, centralized in semantic resources; layouts remain future-translation-ready ([TM-DEC-001](DECISIONS.md#tm-dec-001--english-only-initial-app)).
- Import settings: show platform-supported import methods; no misleading toggle to enable unavailable SMS reading.
- Export: user-initiated CSV with clear file destination/share intent.
- Data: privacy summary, export/delete options and an explanation that reinstall/device loss can erase local-only data without a completed backup.
- Lock/encrypted backup/sync controls appear **only after implemented**; don't expose nonfunctional switches.

### SCREEN 10 · Budget planning `TM-S10` · P2 only

- Monthly limits, category progress and approaching-limit alerts.
- Not part of the first Expo Go MVP. Reserve hooks in navigation without rendering fake functionality.

## 06 · Shared states & microcopy matrix

Every financial screen needs **loading, empty, validation error, persistence error, success and offline** representations where applicable. Offline is **normal** for local CRUD, not an error.

| Trigger | English-only MVP copy proposal | Action |
| :--- | :--- | :--- |
| No accounts | “Add an account to start tracking.” | Open Account form |
| Missing amount | “Enter an amount greater than ₹0.” | Focus amount |
| Same transfer account | “Choose two different accounts.” | Focus To account |
| Fee charged | “₹50 fee will be counted as an expense.” | Preview before save |
| Save successful | “Transaction saved.” | Return or reset |
| Save failed | “Couldn’t save. Nothing was recorded.” | Retry; preserve fields |
| No history | “Your transactions will appear here.” | Point to Add |
| SMS unavailable | “Automatic SMS import isn’t supported here.” | Show manual import |
| Possible duplicate | “This may already be recorded.” | Review duplicate |

**Localization note:** App-visible MVP copy, voice labels and validation messages are English; the i18n layer remains extensible for a later separately approved language release.

**Microcopy rule:** No deceptive “synced”, “securely backed up”, “SMS connected” or “verified balance” message unless the corresponding behavior actually exists.

## 07 · Accessibility, responsive & native behavior

- **Targets:** minimum 44 × 44pt (iOS) and 48 × 48dp (Android) interactive regions; focus indicators and screen reader labeling.
- **Text:** dynamic system font scaling and flexible wrapping; no truncating full amounts, charges or account names without a path to full detail.
- **Contrast:** verify proposed palette for both themes; color is supplemental to sign/icon/label.
- **Screen readers:** announce `Expense tab, selected`; `Fee amount, optional`; `SBI account, selected`; `Save transaction`; money movement preview in a useful spoken order.
- **Keyboard:** decimal keypad for amount; Next/Done focus management; the sticky save bar repositions/scrolls without covering content.
- **Inputs:** preserve editing cursor when adding Indian grouping separators; account picker/search support large lists.
- **Layout:** support small phones and large iPhones/Android devices; 320–430 logical width QA, content scrolling and safe areas.
- **Orientations:** portrait-first proposed; confirm whether locking portrait is desired rather than assuming OS support.
- **Motion:** respect reduced-motion; no celebratory animation for spending.
- **Privacy:** optionally hide balances in app switcher/when screen sharing (future security review); no banking secrets or OTP capture.

## 08 · UX acceptance criteria and screen QA

| Test ID | Scenario | Expected screen behavior |
| :--- | :--- | :--- |
| `TM-UX-001` | Open Home | Exactly **one** root `+`; no three transaction shortcut cards |
| `TM-UX-002` | Tap `+` | Editor shows **Income / Expense / Transfer** |
| `TM-UX-003` | Select Expense | Category + From account visible; no transfer fee fields |
| `TM-UX-004` | Select Transfer | From, To and optional collapsed Fees visible |
| `TM-UX-005` | Add ₹50 fee to ₹5,000 transfer | Preview shows exactly ₹50 as expense |
| `TM-UX-006` | Switch fee payer to destination | Preview shows source −₹5,000; destination +₹4,950 |
| `TM-UX-007` | Same From and To | Save blocked; inline explanation |
| `TM-UX-008` | Save & Add Another | Saves once and resets form (retain-tab proposal) |
| `TM-UX-009` | Edit/delete fee-bearing transfer | Fee remains linked; no orphan/duplicate |
| `TM-UX-010` | Credit-card repayment | Screen describes outstanding decrease; not expense |
| `TM-UX-011` | Import candidate pending | Dashboard totals unchanged until confirmed |
| `TM-UX-012` | iPhone import view | No promise of automatic SMS inbox access |
| `TM-UX-013` | Android in Expo Go | Core UI works; SMS inbox feature absent/disabled |
| `TM-UX-014` | Large text + screen reader | Labels and controls remain reachable and understandable |
| `TM-UX-015` | Device offline | Manual editor, history, accounts and reports remain usable |

## 09 · Reusable design files to implement later

Proposed React Native/Expo folder contracts (not created in this repository):

```text
src/
  app/                      # Expo Router shell and nested routes
  shared/
    theme/                  # light/dark semantic tokens
    ui/                     # AppShell, TopBar, BottomNav, fields, buttons, sheets
    i18n/                   # centralized English strings; future locale-ready
    formatting/             # INR, dates, account masking
  features/
    onboarding/             # setup flow
    dashboard/              # home read models
    accounts/               # account list & editor
    transactions/           # unified editor, history, details
    reports/                # charts and accessible summaries
    imports/                # P1; shared review candidates
  domain/
    ledger/                 # asset/liability and fee invariants
  data/
    sqlite/                 # Expo SQLite repositories & migrations
```

**Separation of concerns:** every screen receives typed view state and callbacks; it does not calculate fees directly or read the SMS inbox. The ledger remains the source for preview, save, balances and reports.

## 10 · Decisions requiring owner review

| Decision | Proposed default | Status |
| :--- | :--- | :--- |
| Position of the single `+` | Center of root bottom bar | **Proposed** |
| App color identity | Neutral surfaces + restrained violet brand | **Proposed** |
| Light/dark support | System default; user override | **Proposed** |
| Form entry style | Full-screen editor with large amount field | **Proposed** |
| Save & Add Another behavior | Stay on tab, clear new-entry fields | **Proposed** |
| Account picker behavior | Searchable sheet; preserves unfinished form | **Proposed** |
| Receipt photo in MVP | Deferred | **Aligned with P2** |
| Fees option | Collapsed by default, counts as expense | **Existing product rule** |

**Do not label any proposed styling as approved until reviewed.** The confirmed business rules come from the [PRD](01-PRD.md) and [user-flow document](02-USER-FLOWS.md).

## 11 · Handoff to the data & architecture documents

The [04 — Database Design & Financial Ledger](04-DATABASE-DESIGN.md) draft is now available and should encode the screen contract without duplicating accounting logic:

1. Asset accounts and credit-card liabilities use distinct posting semantics.
2. Transfer principal and fee expense are **linked and atomic**.
3. Transaction revision/deletion preserves history and report accuracy.
4. Import candidates are not balances until reviewed and confirmed.
5. `MoneyMovementPreview` and actual ledger save use the **same domain rule**.
6. Amounts are integer paise; local date presentation never changes the underlying instant.

---

[← Documentation Hub](00-INDEX.md) · [Database & Financial Ledger →](04-DATABASE-DESIGN.md) · [Product Requirements](01-PRD.md)

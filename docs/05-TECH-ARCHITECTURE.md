<div align="center">

# 🏗️ 05 · Technical Architecture

### One reliable financial engine. One beautiful mobile experience. Two platforms.

![Status](https://img.shields.io/badge/STATUS-DRAFT%20FOR%20REVIEW-7357E8?style=flat-square)
![Stack](https://img.shields.io/badge/STACK-REACT%20NATIVE%20%2B%20EXPO-202A44?style=flat-square)
![Storage](https://img.shields.io/badge/DATA-OFFLINE%20FIRST%20SQLITE-118C84?style=flat-square)
![Scope](https://img.shields.io/badge/PHASE-P0%20ARCHITECTURE-596274?style=flat-square)

[🏠 Project](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🎯 PRD](01-PRD.md) · [🎨 Screen Design](03-SCREEN-SPEC.md) · [🗄 Ledger Model](04-DATABASE-DESIGN.md)

</div>

---

> [!IMPORTANT]
> **Architecture proposal — no app has been implemented yet.** Package choices, folder structure, API examples and milestones below are **design intentions**, not claims of completed work. Exact dependency versions, security controls, Android permissions and release approvals must be validated before implementation. The owner-supplied transaction screenshots are functional references, not layouts or code to reproduce.

## 01 · Executive architecture at a glance

**Recommended approach:** React Native + Expo + TypeScript, feature-oriented Clean Architecture, a **pure TypeScript financial domain**, and **Expo SQLite** as the local source of truth. Android SMS reading is an **optional native integration**, never a dependency of the core money tracker.

| Decision | Proposed solution | Why |
| :--- | :--- | :--- |
| Mobile app | **React Native + Expo** | Shared Android/iPhone feature code |
| Navigation | **Expo Router** | Explicit root/editor routes and predictable deep links |
| Language | **TypeScript (strict)** | Typed financial events and less ambiguous app state |
| Local persistence | **Expo SQLite** | Offline-first ledger with relational constraints |
| Finance engine | **Pure TypeScript journal builder** | Same math for preview, saving and reports |
| State | **Zustand for UI state**; repositories as source of truth | Prevent UI stores from becoming a second database |
| Theme + components | Shared typed tokens and reusable components | Original Tio Money design for both platforms |
| Import | Shared candidate parser + review + de-duplication | Cross-platform consistency and privacy |
| Android SMS | Local native module **only in custom development/release build**, subject to Play policy | Expo Go cannot load custom SMS inbox modules |
| iPhone | Manual entry, user-selected text/CSV | No automatic third-party SMS inbox access |
| Cloud | **None required for P0** | No signup, backend, banking credentials or network dependency |

### 1.1 Non-negotiable boundaries

- Home uses **one `+` Add action**, which opens the unified **Income | Expense | Transfer** editor. Never three shortcut cards.
- Transfer principal between tracked accounts is not reported as income/expense. **Optional transfer fee is an expense**, including bank/wallet/card-related real charges.
- A credit card is a **liability**, not a cash balance.
- All money is stored in **integer paise**, never JS floating-point ledger totals.
- Reports, history and balances are derived from the **same balanced journal**.
- No import candidate affects account balances until confirmed and posted.
- Expo Go must run P0 with **zero SMS native-module dependency**.
- Project implementation must not copy styling from the reference screenshots.

## 02 · The system map

```mermaid
flowchart TD
  UI["📱 React Native UI<br/>Screen + reusable components"]
  CTRL["View-models / UI controllers<br/>Typed input + presentation state"]
  CASE["Application use cases<br/>Save · Edit · Reverse · Query"]
  DOMAIN["🧮 Pure TypeScript finance domain<br/>Validate + build balanced journal"]
  REPO["Repositories / ports<br/>Atomic event writes + read models"]
  DB[("🗄 Expo SQLite<br/>Ledger events + postings")]
  READ["Projections<br/>Accounts · History · Reports"]
  IMP["🔎 Import candidate pipeline"]
  TEXT["User-selected text / CSV"]
  NATIVE["Android SMS native adapter<br/>conditional custom build"]
  CLOUD["Optional encrypted backup / sync<br/>future"]
  UI --> CTRL --> CASE --> DOMAIN
  CASE --> REPO --> DB
  DB --> READ --> CTRL
  TEXT --> IMP --> CASE
  NATIVE -. "only if eligibility & permission approved" .-> IMP
  DB -. "not in P0" .-> CLOUD
  classDef planned fill:#F0ECFF,stroke:#7357E8,color:#252040
  classDef future fill:#E8F5F3,stroke:#118C84,color:#16443B
  class DOMAIN,DB planned
  class NATIVE,CLOUD future
```

**Dependence direction:** UI knows application APIs; application knows domain contracts; data adapters implement repositories. **Domain must never import React Native, Expo, SMS, SQLite or navigation.**

### 2.1 Layers and responsibilities

| Layer | Owns | Must not own |
| :--- | :--- | :--- |
| **Presentation** | Screen states, display labels, accessible controls | SQL, bank SMS parsing, ledger calculations |
| **Application** | Transaction commands, orchestration, authorization of local changes | Native permission screens, raw SQL |
| **Domain** | Money types, invariants, balanced journal construction, event classification | Device APIs, React hooks, SQLite |
| **Data** | SQLite migrations, repository adapters, queries, journal persistence | UI colors, untyped business heuristics |
| **Platform adapters** | Files, share/paste, permissions, optional Android SMS bridge | Financial accounting decisions |
| **Infrastructure (later)** | Encrypted backup/sync transport | Replacing local ledger as default source of truth |

## 03 · Proposed repository structure

The route files stay thin. Feature modules own workflows; `shared/domain` owns cross-feature financial rules. **These folders do not exist yet.**

```text
Tio-Money/
├─ src/
│  ├─ app/                         # Expo Router route definitions
│  │  ├─ _layout.tsx                # App initialization / providers / stack
│  │  ├─ (setup)/
│  │  │  ├─ welcome.tsx
│  │  │  └─ account.tsx
│  │  ├─ (tabs)/
│  │  │  ├─ _layout.tsx             # Home · History · + · Reports · Accounts
│  │  │  ├─ index.tsx
│  │  │  ├─ history.tsx
│  │  │  ├─ reports.tsx
│  │  │  └─ accounts.tsx
│  │  ├─ transaction/
│  │  │  ├─ new.tsx                 # Unified 3-tab form; modal/stack route
│  │  │  └─ [id].tsx
│  │  ├─ account/
│  │  │  ├─ new.tsx
│  │  │  └─ [id].tsx
│  │  ├─ import/                    # P1 · selected text/CSV + review
│  │  │  └─ index.tsx
│  │  └─ settings.tsx
│  ├─ features/
│  │  ├─ onboarding/
│  │  ├─ dashboard/
│  │  ├─ transactions/
│  │  │  ├─ ui/
│  │  │  ├─ controllers/
│  │  │  └─ use-cases/
│  │  ├─ accounts/
│  │  ├─ reports/
│  │  ├─ import/                    # Parser + review UI (P1)
│  │  └─ settings/
│  ├─ domain/
│  │  ├─ money/                     # Parse INR → integer paise
│  │  ├─ ledger/                    # Balance, postings, reversals
│  │  └─ contracts/                 # Domain + repository interfaces
│  ├─ data/
│  │  ├─ sqlite/
│  │  │  ├─ migrations/
│  │  │  ├─ repositories/
│  │  │  ├─ queries/
│  │  │  └─ initialize.ts
│  │  └─ projections/
│  ├─ platform/
│  │  ├─ file-import/
│  │  ├─ sms/                       # No-op or conditional native adapter
│  │  └─ security/
│  └─ shared/
│     ├─ ui/
│     ├─ theme/
│     ├─ i18n/
│     ├─ errors/
│     └─ utils/
├─ modules/                         # Future only: Android SMS local Expo module
├─ tests/
│  ├─ domain/
│  ├─ application/
│  ├─ sqlite/
│  └─ e2e/
├─ assets/
├─ docs/
├─ app.json
├─ package.json
└─ tsconfig.json
```

**Naming principle:** Screen = composition; Controller = view state and user intent; Use case = business workflow; Repository = persistence port; SQL adapter = concrete storage. Avoid a single giant `utils.ts`, `financeStore.ts` or screen with inline SQL.

## 04 · Navigation contract

The [Screen Design Specification](03-SCREEN-SPEC.md#02--navigation-architecture) proposes **four root destinations + one central Add action**:

```mermaid
flowchart LR
  ROOT["Root tab shell"] --> H["Home"]
  ROOT --> HIST["History"]
  ROOT --> R["Reports"]
  ROOT --> A["Accounts"]
  ROOT --> PLUS["➕ Add action"]
  PLUS --> NEW["/transaction/new"]
  HIST --> DETAIL["/transaction/:id"]
  A --> ACC["/account/:id"]
  H --> SETTINGS["/settings"]
```

- `+` is an **action**, not a fifth content screen. The root shell owns its press handler.
- `/transaction/new` and `/transaction/:id` open as full-screen stack/editor routes and hide the bottom bar.
- Existing filled fields survive temporary account/category selection overlays; back with dirty fields shows an explicit discard prompt.
- `Save` returns to origin; `Save & Add Another` saves once, then resets for a new entry with a visible success acknowledgement.
- Do not create second `+` controls or three shortcuts on Home.
- Suggested route placements are a **proposal**; the confirmed UX contract is the single Add entry with three inner tabs.

**Route state is not money state.** Avoid passing entire transaction objects through route parameters; pass stable IDs and re-read local repository data.

## 05 · Financial domain model

### 5.1 Canonical ledger contract

The [Database & Financial Ledger](04-DATABASE-DESIGN.md) specifies:
`financial_accounts`, `categories`, `ledger_accounts`, `ledger_events`, `ledger_postings`, `transfer_details`, `import_candidates` and `app_settings`.

An **event** is one user-visible financial action. It contains multiple postings that **must balance**. Transfer fees are an **expense posting in the same transfer event**, not a separately saved free-floating expense. Edits/deletes use reversals and, where needed, replacements, rather than mutating historical postings.

```mermaid
flowchart TD
  INPUT["UI command: amount, type, accounts, fee"] --> PARSE["Parse rupees to integer paise"]
  PARSE --> CHECK["Validate account kinds / required fields"]
  CHECK --> BUILD["Build journal event and postings"]
  BUILD --> BAL{"Total debits = total credits?"}
  BAL -->|No| FAIL["Reject without database write"]
  BAL -->|Yes| ATOMIC["One SQLite commit"]
  ATOMIC --> HISTORY["Read models: balances, history, reports"]
```

### 5.2 Transfer example · debit SBI, credit HDFC, charge ₹50

A ₹5,000 SBI → HDFC transfer with ₹50 fee charged to **SBI** yields these *bookkeeping* postings:

| Account | Debit | Credit |
| :--- | ---: | ---: |
| HDFC (asset) | ₹5,000 | — |
| Bank Charges & Fees (expense) | ₹50 | — |
| SBI (asset) | — | ₹5,050 |
| **Total** | **₹5,050** | **₹5,050** |

**UI result:** SBI −₹5,050; HDFC +₹5,000; **Expense +₹50**. Income +₹0. Do not model ₹5,050 as an expense.

**Destination-deducted alternative:** SBI −₹5,000; HDFC +₹4,950; Fee expense ₹50. Full formulas apply to **asset-to-asset** only; card liability transactions need class-aware posting rules.

### 5.3 Pure TypeScript contracts (illustrative, not shipped)

```ts
type Id = string;
type MoneyMinor = number; // safe integer paise, validated by domain
type TransactionType = "income" | "expense" | "transfer";

type TransferFee = {
  amountMinor: MoneyMinor;   // 0 allowed
  payer: "source" | "destination";
  expenseCategoryId: Id | null;
};

type CreateTransferCommand = {
  clientRequestId: Id;       // retry-safe idempotency key
  amountMinor: MoneyMinor;
  currency: "INR";
  fromAccountId: Id;
  toAccountId: Id;
  occurredAtMs: number;
  fee: TransferFee;
  note?: string;
};

type JournalPosting = {
  accountId: Id;             // ledger_accounts.id
  side: "debit" | "credit";
  amountMinor: MoneyMinor;   // > 0
};

type JournalDraft = {
  eventType: TransactionType | "opening" | "refund" | "reversal";
  postings: readonly JournalPosting[];
  metadata: Record<string, unknown>;
};

// Domain: builds a validated journal; application: persists atomically.
// Actual implementation must handle IDs, account classifications,
// safe-integer overflow, reversal rules and strong input validation.
```

**Use a branded or runtime-validated integer money type** in production. JavaScript `number` is acceptable only for **safe integers**; reject non-integers/overflow. Parse strings such as `"5000.50"` by decimal string decomposition, not floating-point multiplication. INR only in P0.

### 5.4 Core use cases

| Command / query | Input | Output / guarantee |
| :--- | :--- | :--- |
| `CreateAccount` | Name, type, opening amount | Account + balanced opening entry |
| `CreateTransaction` | Type, amount, accounts, category, fee | **One atomic balanced event** |
| `PreviewTransaction` | Same draft as Save | Asset/liability delta, fee expense, validation |
| `CorrectTransaction` | Original event ID + corrected draft | Reversal + replacement in one atomic operation |
| `ReverseTransaction` | Event ID + reason | Compensating postings, no orphan fee |
| `GetAccounts` | Optional archived flag | Asset balances and card outstanding |
| `GetHistory` | Date/type/category/account filters | Stable ordered event projections |
| `GetReports` | Period + account filters | Expense includes fees once; transfers separate |
| `ConfirmImportCandidate` | Candidate ID + reviewed values | Idempotent posting once |

**Preview and Save cannot maintain two different fee calculators.** Both call the same domain validation/journal function. Display projections have no authority to change event math.

## 06 · SQLite lifecycle and transaction safety

### 6.1 Initialization

1. Open a named SQLite database; confirm compatible Expo SDK on both OSs.
2. On the **active write connection**, enable `PRAGMA foreign_keys = ON` and verify it reads as enabled.
3. Enable/check WAL mode if supported and appropriate; test under low storage and device restart.
4. Read `PRAGMA user_version`; apply **versioned migrations** in order with backup/failure policy.
5. Verify required schema/indexes, then expose repositories to the UI.
6. Keep splash/setup in a **database initializing/error** state until the DB contract is ready.
7. Local seed data should be limited to stable built-in categories/settings; **never** generate fabricated money transactions in real user storage.

### 6.2 Transaction nuance — important

Expo SQLite documents that:
- `withTransactionAsync()` may allow other asynchronous DB queries to interleave if they bypass the intended write scope.
- `withExclusiveTransactionAsync()` isolates operations on its `txn` connection, **but uses a new connection**; settings like `PRAGMA foreign_keys = ON` set on the original connection do **not** automatically carry over. Foreign keys cannot be enabled once a transaction has already begun.

**P0 decision proposal:** use **one serialized write coordinator**, a **single controlled SQLite connection**, enforced `foreign_keys=ON`, and `withTransactionAsync()` for all event+postings writes. **Every database operation capable of affecting ledger writes must go through the coordinator**; bypassed/out-of-band writes are forbidden. Verify rollback, foreign-key constraints and concurrency on Android and iPhone before accepting this design as implemented.

Do **not** switch to exclusive transactions casually or claim FK enforcement without an integration test. If a later design uses an exclusive connection, independently establish and test its FK configuration and constraints.

### 6.3 Query safety

- Use bound parameters with `runAsync()` / `getAllAsync()`, or prepared statements with `prepareAsync()`, then `finalizeAsync()` in `finally`.
- Do **not** interpolate user-entered values into `execAsync()`; reserve it for trusted static migrations/PRAGMAs.
- Ensure every financial write is atomic: journal event + all postings + transfer metadata + import confirmation link, if applicable.
- Construct balanced drafts first, then persist; guard with request idempotency and event status/projection rules.
- P0 queries should paginate History rather than loading all transactions in memory.
- Editing an event creates reversible audit events rather than changing debit/credit rows in place.
- Read models are **derived from postings**; cached dashboard aggregates, if ever added, are disposable projections.

### 6.4 Data access contracts (conceptual)

```ts
interface LedgerRepository {
  saveBalancedEvent(draft: JournalDraft, clientRequestId: string): Promise<Id>;
  reverseAndReplace(originalEventId: Id, replacement: JournalDraft): Promise<Id>;
  listHistory(query: HistoryQuery): Promise<HistoryPage>;
  getAccountSummary(accountId: Id): Promise<AccountSummary>;
  getReport(query: ReportQuery): Promise<ReportSummary>;
}

interface ImportCandidateRepository {
  listPending(): Promise<ImportCandidate[]>;
  markIgnored(candidateId: Id): Promise<void>;
  confirmOnce(candidateId: Id, event: JournalDraft): Promise<Id>;
}
```

**Important:** Above interfaces are design sketches; concrete typing of `HistoryQuery`, `HistoryPage`, `ImportCandidate` and `ReportSummary` comes during implementation. Never paste them into a TypeScript compilation unit without defining dependent types.

## 07 · Application state, React performance and consistency

**Three separate kinds of state:**

| State class | Examples | Owner |
| :--- | :--- | :--- |
| **Ephemeral UI** | Selected Income/Expense/Transfer tab, unsaved form input, sheet visible | Local component/controller / small Zustand store |
| **Durable domain data** | Accounts, ledger postings, import candidates, settings | **SQLite repositories only** |
| **Derived read models** | Home totals, category charts, History rows | Memoized query/selectors over SQLite |

Use **Zustand selectively** for editor drafts or cross-screen presentation state; do **not** mirror a writable account balance in a global store. After successful database writes, invalidate/re-read affected queries via a single event/update notification mechanism.

- Controllers return typed view models; screens render and forward actions.
- Use explicit `idle → validating → saving → success/error` state machine for Save.
- Disable repeated submission while saving; still require idempotency at repository boundary for crash/retry.
- Keep input responsive while large reports run; index/filter SQL rather than formatting every record on every render.
- Include error/empty/loading/offline states from [Screen Design](03-SCREEN-SPEC.md).

## 08 · Import pipeline and platform adapters

### 8.1 One pipeline regardless of source

```mermaid
flowchart TD
  TEXT["📄 User-selected CSV / pasted alert"] --> PARSE["Normalize text / date / account / amount"]
  SMS["📩 Android incoming SMS<br/>conditional native build"] -.-> PARSE
  PARSE --> FILTER{"OTP / marketing / failed payment?"}
  FILTER -->|Yes| DROP["Discard / ignore · no posted event"]
  FILTER -->|No| MATCH["Candidate fingerprint + account matching"]
  MATCH --> DUP{"Possible duplicate or self-transfer?"}
  DUP -->|Yes| REVIEW["Review as duplicate / match"]
  DUP -->|No| REVIEW
  REVIEW --> USER{"User confirms?"}
  USER -->|No| IGNORE["Keep ignored / pending"]
  USER -->|Yes| CASE["ConfirmImportCandidate use case"]
  CASE --> DB[("🗄 SQLite journal")]
```

- The **parser** produces untrusted suggestions, not balanced journal events.
- **User review** is required initially, even when a parser reports high confidence.
- Existing manual entries, both sides of self-transfers, reversals and repeated bank messages must be matched before posting.
- Do not store unrelated SMS, OTPs or sensitive full account numbers.
- If amount/account is ambiguous, present it as **Needs Review**, not auto-income or an invented category.

### 8.2 Expo Go versus custom development builds

| Capability | Expo Go P0 | Android custom build (conditional) | iPhone |
| :--- | :---: | :---: | :---: |
| Manual ledger, account, reports | ✅ | ✅ | ✅ |
| SQLite persistence | ✅ | ✅ | ✅ |
| User-initiated text/CSV import | P1 | P1 | P1 |
| Custom native SMS inbox access | **No** | **Only if native feature + policy approval** | **No normal inbox access** |
| SMS receiver parsing and permission screen | **No** | **Conditional** | Not applicable |

**Build integration boundary:** the P0 Expo Go bundle must never eagerly import/call an unavailable native SMS module. Provide a `SmsImportPort` with a disabled implementation; the native implementation is only linked into an explicitly configured Android custom-build flavor after the permission-policy gate. A JavaScript runtime flag alone does not guarantee native module availability. Use build/config separation and validate an actual Expo Go install.

**Permissions:** Never ship `READ_SMS`/`RECEIVE_SMS` in the ordinary Expo Go-oriented default manifest. A distinct reviewed Android build may require sensitive permissions, disclosure and Google Play Console declaration. The case-by-case approval is **not guaranteed**. No accessibility or notification workaround should be used to bypass platform restrictions.

**iOS:** Manual entries and user-selected/pasted financial alert text, plus file-selected CSV statements. No continuous, universal automatic SMS inbox-reading claim.

### 8.3 Domain-level import interfaces

```ts
type ImportSource = "sms" | "csv" | "text";

interface ParsedCandidate {
  source: ImportSource;
  amountMinor: number | null; // untrusted until validated
  direction: "debit" | "credit" | null;
  occurredAtMs: number | null;
  matchedAccountId?: string;
  maskedReference?: string;
  confidence: number;
}

interface ImportSourceAdapter {
  kind: ImportSource;
  collectUserAuthorizedInput(): Promise<unknown>;
}
```

Keep the candidate type separate from the `JournalDraft`. Parsers can fail, date formats vary, and bank credit messages do not always mean earned income.

## 09 · Privacy, security and backups

**Threat model:** personal finance metadata, account identifiers, bank references, device loss, malicious import files, accidental deletion and secret leakage.

| Protection | P0 design | Must be verified |
| :--- | :--- | :--- |
| Least data collection | Account name, masked identifier, event metadata only | No OTP/full unrelated SMS stored |
| Offline-first | No login/backend needed to enter data | Airplane-mode manual entry |
| Local storage privacy | SQLite local sandbox; sensitive data minimization | Device backup behavior and data accessibility reviewed |
| Input validation | Strict amount/date/account/category types | Fuzz and malformed input tests |
| SQL injection | Bound queries and safe migrations | Audit every repository query |
| Permissions | No SMS permission in P0 | Manifest checks, policy review later |
| App lock | Planned milestone, **not core database encryption** | Lock and cold-start tests once delivered |
| Encryption | Require a separately designed/tested at-rest solution before claiming encrypted DB | Threat review, key ownership, cross-platform testing |
| Backup and restore | Future opt-in, clearly distinguished from sync | Encrypt/authenticate, integrity, restore trials |
| Telemetry | No raw SMS, notes, full identifiers or ledger payloads | Log redaction tests and explicit consent decisions |

**No false security claims:** being local-only or having a PIN screen does not, by itself, prove the SQLite file is encrypted. No bank credentials, OTP collection, covert upload or ad analytics in the P0 design.

**Data loss:** Until a real recovery feature ships, uninstalling/loss/resetting a device can delete local data. State this in onboarding/settings rather than suggesting automatic backup exists.

## 10 · Localization, appearance and accessibility

- **MVP language decision:** English-only user-facing text, validation and accessibility labels; **no language selector**. Keep typed semantic string resources future-localization-ready; Hindi and other translations are later features ([TM-DEC-001](DECISIONS.md#tm-dec-001--english-only-initial-app)).
- **Numbers:** Indian grouping, rupee symbol, negative sign, currency label; user display may vary but ledger amounts remain integer paise.
- **Dates:** Store timestamps consistently (UTC epoch milliseconds), render using chosen device locale/timezone; reports group by the user-selected local calendar period.
- **Theme:** Shared light/dark token resolver described in [Screen Design](03-SCREEN-SPEC.md). Candidate tokens are not yet approved or accessibility-tested.
- **Fonts:** prefer system fonts for MVP unless the owner specifically approves an alternative; keep number/date formatting separate from message translation.
- **Tap targets:** minimum suggested 48dp Android and 44pt iOS, and test large-font layouts.
- **Screen readers:** announce full amount, type and source/destination; don't convey debit/credit status with color alone.
- **Keyboard & safe areas:** fixed Save footer stays above IME/home indicator; form scroll stays reachable.
- **Motion:** respect reduced-motion preference; no essential information inside animation.

## 11 · Testing and engineering quality gates

### 11.1 Test pyramid

| Test layer | Important cases | Tooling proposal |
| :--- | :--- | :--- |
| **Pure domain tests** | Debit=Credit; cents/paise parsing; card liability; fee source/destination | TypeScript unit test runner (choose later) |
| **Application tests** | Create/edit/reverse; rollback; idempotency; no duplicated fee | Use-case tests with fake repository |
| **SQLite integration** | Foreign keys ON, migrations, atomic writes, concurrency, indexes | Real SQLite and device/emulator tests |
| **UI component tests** | Tab transitions, errors, accessibility labels, Fee disclosure | React Native component tests |
| **Device E2E** | Onboarding → `+` → Save → History/Reports; no double tap | Android and iPhone builds |
| **Import fixtures (P1)** | Failed/OTP messages, debit/credit, duplicates, self-transfer, privacy | Versioned sanitized samples |
| **Native permission gates** | Expo Go no-SMS; Android opt-out; restricted permissions | Manifest review + conditional build tests |

### 11.2 Release-blocking financial assertions

- [ ] ₹500 cash expense → Cash −₹500 and Expense +₹500.
- [ ] ₹5,000 salary credit → SBI +₹5,000 and Income +₹5,000.
- [ ] ₹2,000 bank → cash transfer → combined assets unchanged, no reported income/expense.
- [ ] ₹5,000 SBI → HDFC with ₹50 **source** fee → SBI −₹5,050; HDFC +₹5,000; Expense +₹50 **once**.
- [ ] Same amount with **destination** fee → SBI −₹5,000; HDFC +₹4,950; Expense +₹50 once.
- [ ] Credit-card purchase → Expense rises and Outstanding rises; no false bank deduction.
- [ ] Card bill repayment → bank and liability decrease together; no new expense.
- [ ] Mid-save injected exception rolls back **all** journal/posting/fee writes.
- [ ] Edit/delete yields valid reversal/replace history with no orphaned fee.
- [ ] 1,000 repeated read/write operations do not break FK/transaction consistency (test corpus to be sized during implementation).
- [ ] No duplicate posted event from the same confirmed import candidate or repeated Save tap.
- [ ] Expo Go P0 can open, enter and read transactions **offline** with no custom SMS module.

### 11.3 Code quality gates

- `tsc --noEmit`, lint, formatting and tests must pass.
- Enforce module boundaries (domain imports no React Native/Expo).
- Every PR updates requirement links and acceptance evidence.
- Never label mocks, planned packages or static UIs as implemented features.
- Store migration tests use real on-disk upgrade paths, not only a fresh empty database.
- Manual device checks: Android physical device and iPhone physical device/simulator for typography, safe area, behavior and persistence.

## 12 · Delivery sequence and go/no-go

```mermaid
flowchart LR
  D["📚 Docs approved"] --> SHELL["📱 Expo Go shell"]
  SHELL --> DATA["🗄 Local SQLite + migration"]
  DATA --> LEDGER["🧮 Pure ledger / use cases"]
  LEDGER --> CORE["➕ Manual flows + reports"]
  CORE --> TEST["✅ Finance + device tests"]
  TEST --> IMPORT["📄 Text / CSV import"]
  IMPORT --> POLICY{"Android SMS eligible?"}
  POLICY -->|No / pending| BASE["Keep safe manual/import product"]
  POLICY -->|Yes| NATIVE["🤖 Custom Android build + permission QA"]
```

| Milestone | Deliverable | Exit gate |
| :--- | :--- | :--- |
| **M0 — Review** | PRD, flows, screens, ledger & architecture | Core design decisions acknowledged |
| **M1 — Shell** | Original theme, setup, bottom nav, one `+` editor | Expo Go opens on Android + iPhone |
| **M2 — Ledger** | Local DB, migrations, account and journal services | All finance assertions + FK/rollback tests pass |
| **M3 — Core features** | Create/edit/reverse, History, Accounts, Reports | Offline E2E; no double count |
| **M4 — Import** | User-selected text + CSV, review workflow | Deduplication and privacy fixtures pass |
| **M5 — Android native (conditional)** | SMS source adapter, policy/permission lifecycle | Approved eligibility + custom build + safety QA |
| **M6 — Hardening/release** | Privacy policy, optional protections, EAS store builds | Real device sign-off and explicit owner approval |

## 13 · Open decisions / architecture review

| ID | Decision still open | Proposal / next validation |
| :--- | :--- | :--- |
| `TM-ADR-001` | Exact branding and palette | Follow original Screen Design; contrast QA before freeze |
| `TM-ADR-002` | Exact `+` button location | Four destinations + center action proposed; owner confirmation |
| `TM-ADR-003` | UI state library | Zustand only for ephemeral state; keep SQL canonical |
| `TM-ADR-004` | SQLite transaction strategy | Verify serialized writes + FK enforcement on both devices |
| `TM-ADR-005` | Ledger correction model | Reversal + replacement, grouped to original event |
| `TM-ADR-006` | Import sources / bank CSV formats | Confirm sample formats; validate sanitization |
| `TM-ADR-007` | Android SMS restricted permission eligibility | Review current Play policy and request approval before enabling |
| `TM-ADR-008` | Encryption and optional backup | Separate threat-model and native platform research |
| `TM-ADR-009` | Exact package versions | Pin compatible Expo SDK / RN packages at implementation kickoff |
| `TM-ADR-010` | Handling app data reinstall/migration | Document recoverability and test upgrade paths |

## 14 · Authoritative references and next steps

**Internal product sources**

- [🎯 01 — Product Requirements](01-PRD.md): goals, field contracts, fees, privacy.
- [🧭 02 — User Flows](02-USER-FLOWS.md): editor, fee preview, import deduplication.
- [🎨 03 — Screen Design](03-SCREEN-SPEC.md): navigation, UI tokens, screen states.
- [🗄 04 — Database & Ledger](04-DATABASE-DESIGN.md): canonical journal schema and financial examples.
- [✍️ Documentation Style](90-DOCS-STYLE-GUIDE.md): visual consistency and honest status labels.

**External documentation — checked 2026-11-18; recheck at build time**

- [Expo Router, core concepts](https://docs.expo.dev/router/basics/core-concepts/) — routing/layout boundaries.
- [Expo SQLite API](https://docs.expo.dev/versions/latest/sdk/sqlite/) — parameters, migrations, transaction semantics and FK nuance.
- [Expo custom native code](https://docs.expo.dev/workflow/customizing/) — Expo Go limits and development builds.
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/) — platform-native extension workflow.
- [Google Play SMS / Call Log restricted permissions](https://support.google.com/googleplay/android-developer/answer/10208820) — case-by-case eligible exceptions and declaration.

**Next document:** `06 — Implementation & Test Plan` to convert this architecture into ordered, testable milestones with verifiable deliverables.

---

[← Documentation Hub](00-INDEX.md) · [Review Ledger Model](04-DATABASE-DESIGN.md) · **Next: Implementation & Test Plan**

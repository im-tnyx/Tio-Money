<div align="center">

# 📚 Tio Money · Documentation Hub

### One elegant map for product decisions, screen behavior, accounting accuracy and engineering delivery.

![Stage](https://img.shields.io/badge/DOCS-DRAFT%20IN%20PROGRESS-7357E8?style=for-the-badge)
![App](https://img.shields.io/badge/APP-PHASE%200%20SHELL%20IN%20REVIEW-596274?style=for-the-badge)

[🏠 Project Home](../README.md) · [🎯 PRD](01-PRD.md) · [🧭 User Flows](02-USER-FLOWS.md) · [🎨 Screen Design](03-SCREEN-SPEC.md) · [🏗 Architecture](05-TECH-ARCHITECTURE.md) · [🧪 Implementation & Tests](06-IMPLEMENTATION-TEST-PLAN.md) · [🧱 Phase 0 Notes](07-PHASE-0-FOUNDATION-NOTES.md) · [✍️ Style Guide](90-DOCS-STYLE-GUIDE.md)

</div>

---

> [!IMPORTANT]
> **Historical Phase 0 source snapshot (pre-merge PR #1, dated 2026-11-20; PR #1 later MERGED):** Five blank selectable screens and one disabled Google SVG Add over More; no top bar/editor/Settings/onboarding/finance posting/SMS. **Current visual tokens:** five Google Material Symbols Outlined SVG tab icons (`home`, `book_2`, `bar_chart_4_bars`, `account_balance`, `more_horiz`) at weight **200** and size **24dp**; floating disabled Google `add` icon at weight **400**, size **24dp**; circular FAB **50dp**; nav baseline **50dp plus actual OS bottom inset** (1dp border + 1dp top padding + 48dp tab hit row); icon/label gap **1dp**; FAB-to-navigation vertical clearance **16dp**. FAB remains over the More tab, not at a fixed right-edge inset. **Current pre-merge source evidence (2026-11-20):** On branch `feat/phase-0-expo-foundation`, source HEAD `c90d1c00462de5e4a5b007a87dade6641a106f40` passed [Phase 0 App CI #44600432345](https://github.com/im-tnyx/Tio-Money/actions/runs/44600432345) (npm/Expo checks, strict TypeScript, lint, Prettier, unit tests, Android/iOS Metro) and [governance CI #44600432365](https://github.com/im-tnyx/Tio-Money/actions/runs/44600432365) (Python tests, links and commit attribution). **Owner reports testing current UI on a physical device and no longer encountering the previous `ExpoSQLite` error.** Record as **OWNER_REPORTED_DEVICE_SMOKE_PASS**; device platform/model/OS/client version and full cold-restart evidence were **not provided**. On-device SQLite PRAGMA checks, migration persistence, both-platform signoff, accessibility/contrast matrix and formal M0 acceptance remain **NOT_VERIFIED**. This is not a new CI or independent device-test claim. See [Phase 0 Foundation Notes](07-PHASE-0-FOUNDATION-NOTES.md). Owner device smoke is reported, but full two-platform/SQLite QA and PR-specific merge permission are still pending. Future screen specs remain proposals.

## 🧭 New owner product direction · 2026-11-20

> [!IMPORTANT]
> **Stage 1:** complete **local SQLite** finance app (Cash, Bank, Wallet, Credit Card, Investment, Loan, full transaction/reporting system and conditional Main/Sub Currency with online **exchange-rate lookup only**). **Stage 2:** optional encrypted Google Drive/iCloud Drive backup and restore. **Stage 3:** optional Supabase synchronization with signup/signin **only after opt-in**. This is **future specification**, not current Phase 0 implementation. See [TM-DEC-006–009](DECISIONS.md#tm-dec-006--local-first-delivery-order-and-backup-boundary) and [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13).

| New product specification | Responsible contract |
| :--- | :--- |
| [08 · Account Groups](08-ACCOUNT-GROUPS-SPEC.md) | Dynamic Cash/Bank/Wallet/Card/Investment/Loan setup, account links and financial boundaries |
| [10 · Currency & Exchange Rates](10-CURRENCY-SPEC.md) | Main + optional distinct Sub Currency, refresh-on-use, stale offline fallback, unresolved ledger ADRs |
| Backup and optional Supabase technical design | **Planned for later documentation PR**; **not implemented**, no login/remote storage today |

**GitHub state verified 2026-11-20:** [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) and [Governance PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) are **merged**. References below to PR #1 "ready for review" are preserved as **historical pre-merge evidence**, not current status. Real-device SQLite/iPhone QA is not established by a merge.

## 🧭 Find the answer you need

| **You want to…** | **Read this first** | **You'll get** |
| :--- | :--- | :--- |
| Review confirmed owner decisions | [📌 Decision register](DECISIONS.md) | English-only initial app; approvals versus pending proposals |
| Define the new account-group system | [08 — Account Groups](08-ACCOUNT-GROUPS-SPEC.md) | Six group forms, payment options, card/loan/investment rules and open ADRs |
| Define currency behavior | [10 — Currency & FX](10-CURRENCY-SPEC.md) | Main/Sub Currency selection, refresh-on-use and offline fallback |
| Understand the product and MVP scope | [🎯 01 — Product Requirements](01-PRD.md) | Goals, screen contracts, scope, and acceptance criteria |
| Understand the exact `+` transaction experience | [🧭 02 — User Flows](02-USER-FLOWS.md) | Journey diagrams, fields, fee behavior, edge cases |
| Create new documentation consistent with the product | [✍️ 90 — Style & Quality Guide](90-DOCS-STYLE-GUIDE.md) | Page anatomy, diagrams, status labeling, quality checklist |
| Understand current shell vs proposed future screens | [🎨 03 — Screen Design Specification](03-SCREEN-SPEC.md) · [Core Theme ownership](../src/shared/theme/README.md) | Current five blank tabs + disabled FAB and centralized tokens explicitly separated from 10 future feature-screen contracts |
| Design the financial data model | [🗄 04 — Database & Financial Ledger](04-DATABASE-DESIGN.md) | Double-entry postings, assets/liabilities, transfer fees, reconciliation |
| Review actual Phase 0 structure and future boundaries | [🏗 05 — Technical Architecture](05-TECH-ARCHITECTURE.md) · [🧱 Phase 0 Foundation Notes](07-PHASE-0-FOUNDATION-NOTES.md) | Typed central theme, navigation/boot controllers, current blank route tree, Expo Go limits and remaining real-device QA |
| Evaluate readiness for release | [🧪 06 — Implementation & Test Plan](06-IMPLEMENTATION-TEST-PLAN.md) | Phases 0–7, financial test cases, permissions, release gates and owner decisions |

## 💎 Product rules that must survive every design revision

| Rule | Why it matters |
| :--- | :--- |
| **Disabled `+` icon (Phase 0)** | Five bottom destinations have blank screens; one right-aligned FAB stays disabled, with no editor or extra route ([TM-DEC-005](DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab)) |
| **Transfer principal ≠ expense** | Moving money between your own accounts must not inflate spending |
| **Transfer fee = expense** | Real bank/card/wallet charges belong in the spending report |
| **Credit card ≠ ordinary cash account** | Outstanding liabilities must be modeled explicitly |
| **One local ledger** | Dashboard, account balances and reports cannot disagree |
| **Reference ≠ copy** | Provided screens are inspiration for fields/flow, not a UI to clone |
| **Expo Go ≠ native SMS access** | Android native integration requires a separate custom-build and policy path |

## 🗺 Future product flow at a glance

> **Planning diagram only.** Its Add/editor, Save, import and Settings features **do not exist in the present Phase 0 app**. The actual current UI is the five blank tabs and one disabled FAB.

```mermaid
flowchart TD
  O["📲 Setup · INR and accounts (English UI)"] --> H["🏠 Home"]
  H --> TRANS["🧾 Trans."]
  H --> STATS["📊 Stats."]
  H --> ACC["🏦 Account"]
  H --> MORE["⚙ More"]
  H -.-> ADD["➕ Floating Add FAB"]
  ADD --> TYPE{"Income / Expense / Transfer"}
  TYPE --> VALID["Validate and preview money movement"]
  VALID --> SAVE["🗄 Atomic local save"]
  SAVE --> H
  SMS["Android SMS candidate<br/>only if permission route approved"] -.-> REVIEW["🔎 Review import"]
  CSV["CSV / pasted alert"] --> REVIEW
  REVIEW --> VALID
```

## 📌 Documentation progress

| Artifact | Stage | Next action |
| :--- | :--- | :--- |
| Product requirements | 📝 Initial draft + 2026-11-20 owner-direction overlay | Reconcile future stage scope across flows/DB/architecture/test plan |
| Detailed flows | 📝 Initial draft | Confirm Save & Add Another and fee exceptions |
| Documentation design language | 📝 Initial standard | Apply to new and existing pages |
| [Account groups](08-ACCOUNT-GROUPS-SPEC.md) | 📝 New draft | Review loan/valuation/card billing ADRs before implementation |
| [Currency & FX](10-CURRENCY-SPEC.md) | 📝 New draft | Approve multi-currency ledger and FX provider ADRs before implementation |
| [Screen specification](03-SCREEN-SPEC.md) | 📝 Current shell documented + future feature draft | Review future palette, fee disclosure and new feature approvals separately from already-decided five-tab navigation |
| [Data model / ledger](04-DATABASE-DESIGN.md) | 📝 Initial draft | Review journal schema, reversal policy, credit-card postings |
| [Technical architecture](05-TECH-ARCHITECTURE.md) | 🧱 Current Phase 0 and future proposal separated | Verify remaining SQLite/device acceptance, future ledger architecture and platform gates |
| [Implementation & test plan](06-IMPLEMENTATION-TEST-PLAN.md) | 📝 Initial draft | Owner review of milestone gates, finance test matrix and unresolved ADRs |
| [Phase 0 foundation notes](07-PHASE-0-FOUNDATION-NOTES.md) | 🧱 Scaffold source under review | Lockfile and latest-head CI verified; document both-platform/device SQLite acceptance and obtain PR-specific merge decision |

## 🧱 Information architecture

```text
Tio-Money/
├─ README.md
└─ docs/
   ├─ 00-INDEX.md                 ← You are here
   ├─ 01-PRD.md                   ← Product contract
   ├─ 02-USER-FLOWS.md            ← Interaction & edge cases
   ├─ 03-SCREEN-SPEC.md           ← Screen design draft
   ├─ 04-DATABASE-DESIGN.md       ← Ledger draft
   ├─ 05-TECH-ARCHITECTURE.md     ← Architecture draft
   ├─ 06-IMPLEMENTATION-TEST-PLAN.md ← Phase-gated delivery & QA draft
   ├─ 07-PHASE-0-FOUNDATION-NOTES.md ← Scaffold choices & pending verification
   └─ 90-DOCS-STYLE-GUIDE.md      ← Documentation contract
```

All listed documentation files now exist. **06** is a planning draft, not evidence of implemented application features or passing tests.

## 🔄 Review gate

```mermaid
flowchart LR
  NEED["💡 Requirement"] --> DOC["📝 Document"]
  DOC --> CHECK["🧮 Finance & privacy review"]
  CHECK --> APPROVE{"Owner approved?"}
  APPROVE -->|No| DOC
  APPROVE -->|Yes| BUILD["💻 Implement + test"]
  BUILD --> VERIFY["✅ Evidence before status change"]
```

**Confirmed owner product decisions:** initial app copy, accessibility text and validation are **English only**, with no MVP language selector. See [TM-DEC-001](DECISIONS.md#tm-dec-001--english-only-initial-app). The current Phase 0 surface is [five blank destinations and a disabled floating FAB (TM-DEC-005)](DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab), superseding editor/Settings previews from TM-DEC-004. Neither decision authorizes a PR merge.

**Next:** review the [technical architecture](05-TECH-ARCHITECTURE.md) and the [Implementation & Test Plan](06-IMPLEMENTATION-TEST-PLAN.md), then resolve owner decisions before coding. New files should follow the [documentation quality standard](90-DOCS-STYLE-GUIDE.md).

---

[← Project Home](../README.md) · [Product Requirements →](01-PRD.md)

<div align="center">

# 📚 Tio Money · Documentation Hub

### One elegant map for product decisions, screen behavior, accounting accuracy and engineering delivery.

![Stage](https://img.shields.io/badge/DOCS-DRAFT%20IN%20PROGRESS-7357E8?style=for-the-badge)
![App](https://img.shields.io/badge/APP-PHASE%200%20SHELL%20IN%20REVIEW-596274?style=for-the-badge)

[🏠 Project Home](../README.md) · [🎯 PRD](01-PRD.md) · [🧭 User Flows](02-USER-FLOWS.md) · [🎨 Screen Design](03-SCREEN-SPEC.md) · [🏗 Architecture](05-TECH-ARCHITECTURE.md) · [🧪 Implementation & Tests](06-IMPLEMENTATION-TEST-PLAN.md) · [🧱 Phase 0 Notes](07-PHASE-0-FOUNDATION-NOTES.md) · [✍️ Style Guide](90-DOCS-STYLE-GUIDE.md)

</div>

---

> [!IMPORTANT]
> **Current Phase 0 source (PR #1 Ready for Review / not merged):** The feature branch renders **only five blank themed screens** under Home, Trans., Stats., Account and More, plus a **disabled floating `+` icon over More**. No app top bar, Add editor, Settings, Welcome, History or additional feature route exists. A **centralized shared 24dp icon-size token**, reusable component sizing, presentation-only screen files and automatic device **light/dark** theme are implemented; see [Core Theme Ownership](../src/shared/theme/README.md). Native splash waits for settings-only SQLite bootstrap. [Latest tokenized source CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44562328304) passed 24/24 app tests and Android/iOS bundles and [governance CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44562328037) passed 29/29 tests; documentation follow-up checks and latest-head Android/iPhone appearance, accessibility and real-SQLite QA remain separate. Native SMS, saved finance transactions, backups and production release are not implemented. Original product documents are **future design drafts**, not descriptions of currently active routes.

## 🧭 Find the answer you need

| **You want to…** | **Read this first** | **You'll get** |
| :--- | :--- | :--- |
| Review confirmed owner decisions | [📌 Decision register](DECISIONS.md) | English-only initial app; approvals versus pending proposals |
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
| Product requirements | 📝 Initial draft | Owner review, versioned decisions |
| Detailed flows | 📝 Initial draft | Confirm Save & Add Another and fee exceptions |
| Documentation design language | 📝 Initial standard | Apply to new and existing pages |
| [Screen specification](03-SCREEN-SPEC.md) | 📝 Current shell documented + future feature draft | Review future palette, fee disclosure and new feature approvals separately from already-decided five-tab navigation |
| [Data model / ledger](04-DATABASE-DESIGN.md) | 📝 Initial draft | Review journal schema, reversal policy, credit-card postings |
| [Technical architecture](05-TECH-ARCHITECTURE.md) | 🧱 Current Phase 0 and future proposal separated | Verify remaining SQLite/device acceptance, future ledger architecture and platform gates |
| [Implementation & test plan](06-IMPLEMENTATION-TEST-PLAN.md) | 📝 Initial draft | Owner review of milestone gates, finance test matrix and unresolved ADRs |
| [Phase 0 foundation notes](07-PHASE-0-FOUNDATION-NOTES.md) | 🧱 Scaffold source under review | Lockfile committed; review CI evidence and complete Expo Go/device verification |

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

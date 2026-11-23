<div align="center">

# 📚 Tio Money · Documentation Hub

### Product clarity · Engineering precision · Evidence kept separate

[🏠 Project README](../README.md) · [🤖 Agent contract](../AGENTS.md) · [📌 Decisions](governance/DECISIONS.md)

</div>

---

This hub is the entry point to **current contracts**. Old PR, CI and diagnostic snapshots live under [History](history/README.md), not in the product README or active specifications. **Planned is not shipped.** Actual source/tests and owner decisions remain the evidence.

## 🎯 Product

| Document | Purpose |
| :--- | :--- |
| [Product requirements](product/PRD.md) | Goals, scope, money rules and staged delivery |
| [User flows](product/USER-FLOWS.md) | Income, expense, transfer and edge-case journeys |
| [Account groups](product/ACCOUNT-GROUPS-SPEC.md) | Cash, bank, wallet, card, investment and loan |
| [Currencies and FX](product/CURRENCY-SPEC.md) | Main/Sub Currency, lookup and offline behavior |
| [Future backup and sync](product/BACKUP-SYNC-SPEC.md) | Stage 2 encrypted backup; Stage 3 optional sign-in/sync |

## 🎨 Design

- [Screen specifications](design/SCREEN-SPEC.md) — flows, controls and future screen design
- [More → Appearance](design/MORE-APPEARANCE.md) — implementation contract for existing settings
- [Shared theme ownership](../src/shared/theme/README.md) — source design-token guidance

## 🏗 Architecture

- [Technical architecture](architecture/TECH-ARCHITECTURE.md) — system responsibilities and boundaries
- [Financial ledger and database](architecture/DATABASE-DESIGN.md) — accounting invariants and data design
- [Dumb-screen boundaries](architecture/DUMB-SCREEN-BOUNDARIES.md) — presentation-only screen contract

## 🛠 Engineering

- [Implementation and testing plan](engineering/IMPLEMENTATION-TEST-PLAN.md) — milestone / test acceptance
- [Codespaces live preview](CODESPACES-LIVE-PREVIEW.md) — current path retained pending PR #88 reconciliation
- [PR Codespaces preview](PR-CODESPACES-PREVIEW.md) — current path retained pending PR #88 reconciliation
- [EAS preview updates](EAS-PREVIEW-UPDATES.md) — current path retained pending PR #88 reconciliation

## 🔒 Security

- [Security baseline setup](security/SECURITY-BASELINE-SETUP.md) — baseline project setup
- [Root security policy](../SECURITY.md) — vulnerability reporting and guidance

## 📌 Governance

- [Owner decisions](governance/DECISIONS.md) — canonical approved and pending product decisions
- [Stage 1 finance ADRs](governance/STAGE-1-FINANCE-ADRS.md) — accounting decisions and outstanding blockers
- [Documentation readiness](governance/DOCUMENTATION-READINESS.md) — implementation-vs-proposal truth
- [Documentation style guide](governance/DOCS-STYLE-GUIDE.md) — Markdown/diagrams/quality rules

## 🗄 History

- [Historical records index](history/README.md) — superseded snapshots and diagnostics
- [Phase 0 foundation notes](history/phase-0/FOUNDATION-NOTES.md) — historical decisions and tests
- [Older Codespaces PR HTTP 403 diagnosis](history/diagnostics/CODESPACES-PR-403-DIAGNOSIS.md)

> **Migration note:** The three preview Markdown paths above are kept at their original locations while [PR #88](https://github.com/im-tnyx/Tio-Money/pull/88) changes those same files. They should be moved only after reconciliation, with backlinks revalidated.

---

[← Tio Money](../README.md) · [Agent workflow](../.ai/README.md)

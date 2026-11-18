# 📌 Tio Money — Owner Decision Register

> **Status: one confirmed MVP language decision.** This is the durable record of explicit owner decisions, **not** an automatic approval to implement, merge or deploy. Proposed architecture and open design choices remain proposals until separately resolved.

[Documentation hub](00-INDEX.md) · [PRD](01-PRD.md) · [Architecture](05-TECH-ARCHITECTURE.md) · [Agent contract](../AGENTS.md)

## Decision index

| ID | Date | Decision | State | Scope |
|---|---|---|---|---|
| [TM-DEC-001](#tm-dec-001--english-only-initial-app) | 2026-11-18 | Initial mobile app user-facing language is **English only** | **Owner decided** | P0/MVP UI, copy, accessibility, validation |

## TM-DEC-001 — English-only initial app

**Decision date:** 2026-11-18  
**Authority:** Direct owner instruction in the AI-context governance task  
**Status:** Confirmed owner decision, pending implementation in a separately approved app branch

### Decision

- All initial user-facing app text, labels, errors, accessibility names/hints and onboarding are **English**.
- **No language-selection screen or Settings language selector** in the initial MVP.
- Hindi and other languages are **future features**, not an initial release acceptance gate.
- Remain localization-ready: centrally organized semantic strings/keys, stable identifiers independent of translations and layout capable of future translations.
- Currency, amounts and dates use formatting utilities independent from translation; INR storage is still **integer paise**.
- **Prefer system fonts** in the MVP unless the owner separately approves a different font.
- Agent conversation language or GitHub documentation prose is **not** the app-language decision.

### Why / superseded drafts

Older PRD `3 / `4.1 / `4.8`, screen setup/settings/microcopy, architecture `10` and implementation-plan Phase 1 included Hindi/English MVP or a language picker. This entry supersedes **those language-specific requirements only**. It does **not** alter the single Add flow, ledger, transfer fees, account classes, security, SMS limits, app implementation scope or other undecided screen designs.

### Impact and acceptance

- Documentation reconciliation on `chore/ai-context-governance`; downstream coding agents must reconcile this choice with their scaffold once owner approves implementation/integration.
- Phase 1 UI validation checks **English** microcopy and screen-reader labels, no active language selector, centralizable strings and accessible system-font behavior.
- Later multilingual support requires its own product design, localization QA and owner-approved scope.

## Pending choices — not decisions

| Topic | Evidence | Status |
|---|---|---|
| Final bottom-bar placement, colors and icons | [Screen spec](03-SCREEN-SPEC.md) | Proposal; owner sign-off pending |
| Detailed ledger correction/idempotency strategy and device transaction behavior | [Database design](04-DATABASE-DESIGN.md) · [test plan](06-IMPLEMENTATION-TEST-PLAN.md) | Proposed / needs implementation validation |
| Android native SMS capability and Play policy eligibility | [Architecture](05-TECH-ARCHITECTURE.md) | Conditional, not authorized |
| Phase 0 Expo PR device QA and merge | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) | Open draft at initial inspection; recheck live |
| Governance PR and its merge | [Governance task](../.ai/tasks/governance/ai-context-setup.md) | Owner review and separate merge approval required |

**Amendment policy:** Future decisions must include date, source/authority, exact scope, superseded passages and verification. Do not infer owner approval from a merged planning document alone.

[← Documentation hub](00-INDEX.md)

# Tio Money

**Cross-platform personal money tracker — Android + iPhone**

> Status: Planning / documentation first. This repository is currently being initialized with product documentation, not an implemented app.

## Product direction

Tio Money (working app name; earlier conversations used “Daily Hisaab” as a placeholder) is an offline-first personal finance tracker for accounts, income, expenses, transfers, optional transfer fees, and financial reports.

**Core UX decision:** Home does **not** show three separate Income / Expense / Transfer shortcut cards. One **+** action opens a common Add Transaction screen with **Income | Expense | Transfer** tabs.

Reference screenshots supplied by the product owner describe the *flow and fields*, **not** a pixel-perfect design to copy. The final UI will be independently designed for Tio Money.

## Documentation

1. [01 — Product Requirements (PRD)](docs/01-PRD.md) — product scope, screen flows, accounting rules, Expo/SMS constraints, acceptance criteria.
2. **Next:** `docs/02-USER-FLOWS.md` — onboarding, money movements, imports and error flows.
3. **Next:** `docs/03-SCREEN-SPEC.md` — original Tio Money UI specifications.
4. **Next:** `docs/04-DATABASE-DESIGN.md` — SQLite entities, accounting invariants and migrations.
5. **Next:** `docs/05-TECH-ARCHITECTURE.md` — Expo / React Native architecture and native module boundaries.
6. **Next:** `docs/06-IMPLEMENTATION-TEST-PLAN.md` — milestones, testing and releases.

## Planned stack

- React Native + Expo + TypeScript
- Expo Router for navigation
- Expo SQLite for local persistence
- Offline-first; optional secure sync/backup later
- Expo Go for core finance features
- Android custom development build for any native SMS-reading functionality (subject to Google Play policy eligibility)
- iOS manual entry and user-initiated import; no automatic inbox reading

## Working principles

- Monetary amounts stored in integer minor units (paise) instead of floating point.
- Moving money between owned accounts is **not** income or expense.
- Transfer fees, when present, **are expenses**.
- SMS-derived suggestions require user review in the initial release; duplicate/reversal/self-transfer safeguards are essential.
- User privacy and offline functionality come first.

See [the PRD](docs/01-PRD.md) for details.

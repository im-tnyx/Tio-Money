# TM-FIN-ADR-20261121-001 — Post-merge product docs, Stage 1 finance ADRs & dumb-screen contract

> **RFC and technical PROCEED:** [Issue #23](https://github.com/im-tnyx/Tio-Money/issues/23) · Docs-only technical decision by current working ChatGPT GPT-6 after owner's direct instruction on 2026-11-21. **Not owner permission to merge, deploy, migrate SQL or implement finance/cloud features.**

| Field | Current verified scope |
| :--- | :--- |
| Repository | `im-tnyx/Tio-Money` |
| Base `main` | `f4332eb338ca75e27a5b35ff57511f522a4bb96a` |
| Branch | `docs/postmerge-stage1-finance-adrs-20261121` |
| Source request | "Naye main ke saath post-merge documentation reconciliation... finance ADRs finalize" and "all screen dump screen rahega koi bhi logic screen m nahi rahega verify ke baad go" |
| Decision maker | ChatGPT GPT-6 agent technical PROCEED for docs; owner directive **TM-DEC-011** for screen boundaries, transcribed |
| State | **IN_PROGRESS / validation pending**; no PR created at this checkpoint |
| Independent review | **DEFERRED** pending draft PR and Codex/finance architecture review; no invented approval |
| Merge authorization | **NOT GRANTED** for any new PR; separately required by AGENTS.md |

## Verified preconditions

- GitHub `main` `f4332eb...`; PR #14, #16, #22 all **CLOSED / MERGED** on separately approved squash commits. Their top task rows were inconsistent; date-stamped old snapshots are preserved historically. This change reconciles **remote docs only**, not a local checkout or archived task state.
- Five current Phase 0 tab modules (`src/app/(tabs)/index.tsx`, transactions, reports, accounts, more) each only import/export `BlankScreen`. Root layouts delegate bootstrap/navigation to external providers/hooks; this is **read-only code inspection**. No app code was modified.
- Existing INR-only four-subtype DDL is legacy illustrative and not approved to support six groups/multi-currency; application SQLite is settings/bootstrap only.

## Owned files / implementation boundaries

Allowed: `docs/11-STAGE-1-FINANCE-ADRS.md`, `docs/12-DUMB-SCREEN-BOUNDARIES.md`, limited index/DECISIONS/ledger/architecture/currency/screen/test-plan/AGENTS/core-boundaries edits, three merged task **current-status corrections**, this task and additive `.ai/current.md`. No `src/`, `tests/`, dependencies, native permissions, SQLite DDL/migrations, GitHub settings, secrets, provider onboarding, backend, theme/tabs/FAB source, main writes, force-push, auto-merge, deployment or branch deletion.

Finance risk: preserve exact native currency, balanced postings, link-only bank Wallet, credit-card liability, Given Loan receivable, Borrowed liability, booked Investment cost and **separate unposted valuation**. Idempotent SQL transactions, reversals, FX contract, fraud/PII boundaries require **later approved executable scope**. Policy decisions that cannot safely be guessed are explicitly **BLOCKED** in ADR register.

## Review and acceptance

- Only Markdown files differ from verified base; all new local paths and section-anchor links resolve at current branch HEAD.
- Current top-of-task lifecycle records identify merges #14/#16/#22 without rewriting historic logs or claiming CodeSpaces/devices were tested.
- Owner TM-DEC-011 forbids ALL screen-local logic. Domain, controllers, use cases, repository and platform adapters have explicit immutable contracts; negative-fixture CI tests `TM-PRES-001–006` are specified but **not claimed implemented**.
- TM-ADR-011–023 have clear accepted/partial/blocked statuses; all design-accepted invariants get deterministic future test IDs. Outstanding provider, period-close, overdraft, loan amortization, investment realization, card statement and FX-clearing choices remain gated.
- GitHub exact-HEAD CI/attribution, review findings and branch protection must be checked on the draft PR; independent review recommended for financial implementation.
- Rollback: close draft PR; never overwrite or edit main directly. No archive until owner-authorized merge and actual verified terminal state.

## Current working checkpoint

- 2026-11-21: Issue #23 created, technical PROCEED recorded. New branch from verified main. Drafted two new specs and scoped reconciliation. PR creation, final link audit, CI, review and handoff status **pending at this checkpoint**.
- All screens remain blank in current actual app; future Stage 1 is a **design-only** planning contract.

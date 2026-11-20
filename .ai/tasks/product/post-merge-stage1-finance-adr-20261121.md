# TM-FIN-ADR-20261121-001 — Post-merge product docs, Stage 1 finance ADRs & dumb-screen contract

> **RFC and technical PROCEED:** [Issue #23](https://github.com/im-tnyx/Tio-Money/issues/23) · Docs-only technical decision by current working ChatGPT GPT-6 after owner's direct instruction on 2026-11-21. **Not owner permission to merge, deploy, migrate SQL or implement finance/cloud features.**

| Field | Current verified scope |
| :--- | :--- |
| Repository | `im-tnyx/Tio-Money` |
| Base `main` | `f4332eb338ca75e27a5b35ff57511f522a4bb96a` |
| Branch | `docs/postmerge-stage1-finance-adrs-20261121` |
| Source request | "Naye main ke saath post-merge documentation reconciliation... finance ADRs finalize" and "all screen dump screen rahega koi bhi logic screen m nahi rahega verify ke baad go" |
| Decision maker | ChatGPT GPT-6 agent technical PROCEED for docs; owner directive **TM-DEC-011** for screen boundaries, transcribed |
| State — 2026-11-21 checkpoint | **IN_REVIEW / Ready for Review** — [PR #24](https://github.com/im-tnyx/Tio-Money/pull/24), base `main`; **NOT MERGED**. After a checkpoint at `e8c53ba35391527e54b9c28a4905b778cd2b4efd`, Phase 0 CI initially failed from isolated EAS CLI npm-ci subprocess (unrelated preview test); **controlled retry of the same failed job passed**. Any subsequent commit requires new exact-head checks. |
| Independent review | **DEFERRED / requested next**; no formal independent APPROVED review claimed. Automated Codex review to be requested on exact new head. |
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

- 2026-11-21: RFC Issue #23 recorded technical PROCEED, new branch from verified main, and [Draft PR #24](https://github.com/im-tnyx/Tio-Money/pull/24) opened. Initial exact-HEAD GitHub checks (Phase 0 static, AI governance, preview signal) **3/3 SUCCESS** on `0929c4099feb34910e5099b677ed02e9654faad7`. Read-only docs audit on that head scanned **16 changed Markdown files, 291 internal relative file paths (0 missing), 82 section-anchor references** and 7 cross-document anchors; no forbidden co-author commit trailer, no diff-added trailing whitespace. 157 external URL occurrences NOT live-HTTP-tested. This task checkpoint itself will advance HEAD; recheck CI and reviewer findings before merge gate.
- All screens remain blank in current actual app; future Stage 1 is a **design-only** planning contract.

### 2026-11-21 — Currency precision consistency and CI diagnostic

- Audit found inherited `AGENTS.md` and architecture/test language implying **all currencies use INR paise**; scoped correction now distinguishes legacy INR examples from future currency-specific native safe integers, ISO exponent/precision and separately **blocked FX-clearing journal implementation** under `TM-ADR-018`.
- [Phase 0 CI run #44796588235](https://github.com/im-tnyx/Tio-Money/actions/runs/44796588235) on `e8c53ba35391527e54b9c28a4905b778cd2b4efd` first failed at `tests/preview/eas-cli-locked-install.test.mjs:32`, because external isolated `npm ci` exited 1 (stderr not surfaced by assertion). Typecheck/lint/format/normal unit tests and navigation cases passed. A GitHub API **rerun of only failed job** (attempt 2) **passed without test bypass**. No runtime source/test/workflow files were changed. This new doc commit changes head and needs fresh checks; do **not** reuse the older CI as current-head evidence.
- Scope remains Markdown only; current five screen files and bottom tab geometry remain unchanged. Finance ADR implementation choices still BLOCKED; no owner PR #24 merge authorization.

# TM-FIN-ADR-20261121-001 — Post-merge product docs, Stage 1 finance ADRs & dumb-screen contract

> **RFC and technical PROCEED:** [Issue #23](https://github.com/im-tnyx/Tio-Money/issues/23) · Docs-only technical decision by current working ChatGPT GPT-6 after owner's direct instruction on 2026-11-21. **Not owner permission to merge, deploy, migrate SQL or implement finance/cloud features.**

| Field | Current verified scope |
| :--- | :--- |
| Repository | `im-tnyx/Tio-Money` |
| Base `main` (latest verified) | `118830c94a7af78dd2c29fdf6d3f7ab561cf4c1a` including merged Appearance, 300/200 nav icons with 0dp gap, 160ms crossfade and preview tooling; earlier base SHAs are historical |
| Branch | `docs/postmerge-stage1-finance-adrs-20261121` |
| Source request | "Naye main ke saath post-merge documentation reconciliation... finance ADRs finalize" and "all screen dump screen rahega koi bhi logic screen m nahi rahega verify ke baad go" |
| Decision maker | ChatGPT GPT-6 agent technical PROCEED for docs; owner directive **TM-DEC-011** for screen boundaries, transcribed |
| State — latest 2026-11-21 reconciliation | **OPEN / Ready for Review** — [PR #24](https://github.com/im-tnyx/Tio-Money/pull/24), base `main`, **NOT MERGED**. Safely reconciled with new main without force push; new-head GitHub CI and Codex review require verification. |
| Independent review | Four prior P2 Codex findings addressed and threads author-side resolved. New P2 stale five-blank/1dp baseline finding requires exact-new-HEAD review/disposition. Agent review `COMMENTED` only, not independent human approval. |
| Merge authorization | **NOT GRANTED** for any new PR; separately required by AGENTS.md |

## Verified preconditions

- GitHub `main` `f4332eb...`; PR #14, #16, #22 all **CLOSED / MERGED** on separately approved squash commits. Their top task rows were inconsistent; date-stamped old snapshots are preserved historically. This change reconciles **remote docs only**, not a local checkout or archived task state.
- Current source-verified `main` has **four BlankScreen finance routes** (`index`, `transactions`, `reports`, `accounts`) and **MoreRoute** using `useMoreViewModel` state/controller and dumb `MoreScreen`/`AppearanceSheet` presentation. Root layout uses 160ms Reduced Motion-aware crossfade; selected icon 300/inactive 200, 0dp gap; Add stays disabled. **No app code changed in this task.**
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
- All **four finance screens** remain blank in current source, while More Appearance is implemented; Stage 1 finance journal/UI is still a **design-only** contract and no device QA was executed by this task.

### 2026-11-21 — Currency precision consistency and CI diagnostic

- Audit found inherited `AGENTS.md` and architecture/test language implying **all currencies use INR paise**; scoped correction now distinguishes legacy INR examples from future currency-specific native safe integers, ISO exponent/precision and separately **blocked FX-clearing journal implementation** under `TM-ADR-018`.
- [Phase 0 CI run #44796588235](https://github.com/im-tnyx/Tio-Money/actions/runs/44796588235) on `e8c53ba35391527e54b9c28a4905b778cd2b4efd` first failed at `tests/preview/eas-cli-locked-install.test.mjs:32`, because external isolated `npm ci` exited 1 (stderr not surfaced by assertion). Typecheck/lint/format/normal unit tests and navigation cases passed. A GitHub API **rerun of only failed job** (attempt 2) **passed without test bypass**. No runtime source/test/workflow files were changed. This new doc commit changes head and needs fresh checks; do **not** reuse the older CI as current-head evidence.
- Scope remains Markdown only; current five screen files and bottom tab geometry remain unchanged. Finance ADR implementation choices still BLOCKED; no owner PR #24 merge authorization.

### 2026-11-21 — PR #24 Codex P2 findings and exact-ID recovery

- Automated Codex review of prior head `983d90ed332b2ad1f044b8438cd6a291c90b1414` returned **four P2** findings: FX pair-only egress; non-INR native minor units in generic checklist/FX currency spec; stale PR #22 task review/rollback rows; and collision of legacy ADR-012/015/016/017 subjects with the new register. GitHub threads are individually unresolved pending author-side evidence and this new-head re-review.
- **Disposition in this branch:** `TM-ADR-011–017` IDs now **preserve original Implementation Plan §9 subjects**; `012` imported provenance source, `015` card cash-advance/overdraft, `016` native amount cap/equal destination fee, `017` Save & Add Another controller UX. Atomic durability remains cross-cutting under `011`, not `012`. Added future tests `TM-ADR-T15–T17` for missing mappings and UX decisions (still unimplemented).
- FX requests now strictly app-supplied **currency-pair only**, while unavoidable HTTP transport metadata is acknowledged without granting fields. Booked money is *only* currency-specific integer native minor units; decimal strings are input/quote not booked ledger. Historic PR #22 task review/rollback now terminal, no fake unmerged Draft instructions.
- **Concurrent main:** verified PR #21 squash merge `097e014d7e2a2015230971751bd5c72ee91e6580`; PR #24 branch safely non-force merged main with both parent histories and preserved PR #21 preview workflow/tests. This fix moves HEAD; CI and Codex reviews must run on exact new SHA. No owner merge authorisation for PR #24.

### 2026-11-21 — Owner Go: safe reconcile PR #24 to current UI main

- Owner "Go" authorises **safe reconciliation, new-head CI and review**, not PR #24 merge. Main SHA `118830c94a7af78dd2c29fdf6d3f7ab561cf4c1a` verified. Previous PR #24 at `a13ab70f8b90e9ecb7bcb77a61cf4e4bb652c3a2` was 52 commits behind and merge-conflicted; [Codex P2](https://github.com/im-tnyx/Tio-Money/pull/24) flagged outdated five-blank/1dp assertions.
- Non-force two-parent reconciliation `150b98cd3adf69e5462c628d07a9afccfc337320` retained current main tree except 16 owned Markdown docs/task paths and semantically preserved entire latest main index. Follow-up corrected docs to **four blank finance routes + More Appearance, selected 300/inactive 200, 0dp icon-label gap, 160ms reduced-motion-aware crossfade**. All source, assets, UI, preview workflows, tests and other agents' changes were preserved.
- Owner TM-DEC-011 **still mandatory**: presentational screen may resolve theme/i18n tokens, but all workflow/async persistence/navigation and ledger/FX/SQL logic must stay in controller/use case/domain/adapter layers. Negative-fixture architecture tests not yet implemented.
- Audit new HEAD with links, finance invariants, changed-file scope and CI/Codex review; author-side review-thread disposition required. **No PR #24 merge authorization.**

### 2026-11-21 — P2 cross-cutting normative monetary rules addendum

- Owner Go remains for PR #24 reconcile/CI/review only. [RFC #23 scoped addendum](https://github.com/im-tnyx/Tio-Money/issues/23#issuecomment-7060826772) records why five previously out-of-scope **Markdown governance/review guidance paths** must be aligned with Stage 1 native ISO minor-unit contract: `.ai/core/coding-rules.md`, `.ai/core/product-rules.md`, `.github/REVIEW_GUIDE.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/copilot-instructions.md`.
- [P2 author re-review](https://github.com/im-tnyx/Tio-Money/pull/24) found five universal-'paise' instructions that could mislead non-INR 0/3-decimal accounting. Corrected them **without changing workflows, source, test code or merge rules**. Historical INR examples still use paise, while general Stage 1 uses native currency-specific safe integers/exponents. Copilot also now reflects **four blank finance routes + implemented More Appearance**, selected 300/unselected 200, 0dp gap and 160ms Reduced Motion-aware fade.
- **Review status:** Codex reported `failed` at `f9de5b2a5494e61a228ca2d246cd8e1eeb22d3f2` because **the automated review could not complete**; this is **not a zero-findings verdict**. Retry on this new SHA and inspect any actual findings. Owner merge approval for PR #24 **NOT GRANTED**.

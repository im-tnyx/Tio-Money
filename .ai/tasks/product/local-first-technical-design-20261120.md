# TM-DOC-ARCH-20261120-002 — Local-first technical document alignment (Phase B)

> **Scope: Markdown documentation only.** Based on owner `Go` (2026-11-20) after PR B proposal. Not permission for source changes, SQLite migration, provider integration, deployment or PR merge.

| Field | Verified value |
| :--- | :--- |
| Repository | `im-tnyx/Tio-Money` |
| Current agent/model | ChatGPT GPT-6, self-identified working session |
| Previous agent for this new task | UNKNOWN_NOT_VERIFIED |
| Persistent RFC | [Issue #15](https://github.com/im-tnyx/Tio-Money/issues/15) |
| Technical decision | **PROCEED for documentation-only drafting**, agent-recorded, based on owner current-chat "Go"; no authenticated GitHub-owner merge approval |
| Owner decisions source | [TM-DEC-006–009](../../../docs/DECISIONS.md#tm-dec-006--local-first-delivery-order-and-backup-boundary) in **PR #14**, since merged into `main` 2026-11-20 |
| Historical stacked PR A base | At task creation, [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) was Draft at `659915ba8c9766082ccc945809b8879df3b5b6ce`; **it later squash-merged to `main` at `582893d0915622623f8c6b3fb9da0f1bbb0a4a60`** |
| Main at task start | `fd154db417b1979d39f855317f252eed37c36e9d` |
| Working branch | `docs/local-first-finance-architecture-20261120`, originally from PR #14 head; **reconciled with new `main` by non-force merge commit and PR #16 base retarget to `main`** on 2026-11-20 (verify live GitHub state) |
| Lifecycle | **RECONCILING** — [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16), draft until exact-head CI and review gate; **NOT MERGED** |
| Independent review | DEFERRED; not performed. Strongly recommended before financial schema/security implementation |
| Merge permission | PR #14 was separately authorized and **merged**; **NOT_GRANTED for PR #16 or PR #22**, separate PR-specific permission required |

## RFC, scope and exclusions

**Purpose:** align future Stage 1 local-only app's user flows, dynamic group screens, canonical ledger/schema conceptual design and modular architecture with PR A six groups, Main + optional Sub Currency refresh-on-use and staged storage/identity plan.

**Allowed paths:** `docs/02-USER-FLOWS.md`, `docs/03-SCREEN-SPEC.md`, `docs/04-DATABASE-DESIGN.md`, `docs/05-TECH-ARCHITECTURE.md`, this task and an additive compact `.ai/current.md` handoff. **No docs/DECISIONS.md, PRD or PR A branch edits**.

**Excluded:** all application code, actual migrations/SQL applied to devices, UI changes, dependency installation, CI/workflows/permissions, provider integration, financial data upload, real autopay, cryptographic key setup, Supabase project creation, main direct writes, merge, auto-merge and branch deletion.

**Threat / policy:** no account/card/bank credentials; no unverified SQLite encryption promise. FX sends only pair metadata; Stage 2 encrypted backup + restore and Stage 3 optional Supabase/Auth need new separately reviewed designs. Currency-aware ledger, loan interest, investment valuation, card due/autopay semantics remain **financial ADR blockers**, not implicitly signed off by proposed table names.

**Alternative:** giant multi-area code+doc PR rejected in favor of stacked PR B and separately reviewed PR C implementation plans.

## Acceptance, verification and rollback

- Correct current Phase 0 empty five-tab UX and disabled floating +, English-only UI; all feature screens future-only.
- Dynamic group, loan, investment, card payment-tracking and FX refresh flows have deterministic expected outcomes and failure states.
- Existing INR-only SQL labelled incompatible with unapproved future multi-currency journal; no executable DDL promoted to released schema.
- One balanced journal, atomicity, idempotency, reversal, transfers/fees and class semantics preserved.
- All changed-file relative Markdown links resolve; only intended Markdown paths differ against parent PR A.
- Test final-head GitHub actions/commit messages if available; documentation validation ≠ app or device QA.
- **Rollback:** close unmerged stacked Draft PR; it does not modify PR A or main.

### 2026-11-20 · Initial checkpoint · ChatGPT GPT-6

- **Previous agent:** UNKNOWN_NOT_VERIFIED (new scoped task).
- **Source:** current-chat "Go" following explicitly proposed PR B; [RFC #15](https://github.com/im-tnyx/Tio-Money/issues/15) includes technical PROCEED for docs-only.
- **Verified branches:** `main` `fd154db417b1979d39f855317f252eed37c36e9d`; PR A draft `659915ba8c9766082ccc945809b8879df3b5b6ce`.
- **Working branch:** `docs/local-first-finance-architecture-20261120`; new isolated branch from PR A HEAD.
- **Checks:** pending exact new-HEAD CI and PR review; no device/software tests claimed.
- **Review:** DEFERRED, not performed; no blocker claimed fixed.
- **Merge:** NOT_GRANTED; task go is not PR-specific merge permission.
- **Next step:** review standalone PR B diff against PR A branch, confirm finance ADR gates and acceptance tests, verify checks, await explicit future authorization for any merge.

### 2026-11-20 · Draft PR #16 and documentation validation

- **PR:** [#16](https://github.com/im-tnyx/Tio-Money/pull/16) open Draft, head before handoff checkpoint `a11beb5dae4f6207c9bf22318fd17a58e0a2e4b5`, target PR A branch, not `main`.
- **Diff:** GitHub comparison to parent PR A `659915ba8c9766082ccc945809b8879df3b5b6ce`: exactly six Markdown paths, 2 commits ahead, 0 behind. Both commit messages had **zero prohibited co-author trailers**.
- **Links:** examined changed Markdown links relative to the branch tree; one incorrect task decision link was corrected in the second commit, then **0 missing local relative targets** on `a11beb5d`.
- **CI at inspection:** Phase 0 checks `in_progress` on inspected SHA ([run 44746915295](https://github.com/im-tnyx/Tio-Money/actions/runs/44746915295)); preview push signal **success** ([run 44746821946](https://github.com/im-tnyx/Tio-Money/actions/runs/44746821946)). **Do not infer final-head CI success from earlier run.** No app/device/SQLite integration tests performed in this task.
- **Independent review:** `DEFERRED`, not performed; accounting/FX/identity finance ADRs remain unresolved, not signed off.
- **Merge authorization:** `NOT_GRANTED` for both PR #14 and PR #16. Reverify actual configured protections and new HEAD before any future merge attempt.
- **Follow-up checkpoint:** this task/index update itself advances HEAD and requires rechecking CI if review-ready; next agent must not treat historical snapshots as live state.

### 2026-11-20 — Safe reconciliation after verified PR #14 squash merge

- **User instruction:** reconcile PR #16 with new `main`, rerun CI/review. This allows only branch integration, PR-base change, documentation consistency fixes and review; **NO permission to merge PR #16**, auto-merge, force-push or alter `main`/PR #22.
- **Merge source:** [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) verified `MERGED` at squash `582893d0915622623f8c6b3fb9da0f1bbb0a4a60`; prior PR #16 head `c5dfec3722a62b6ee0cd5cc30586f1e3a92f745b` (main diverged due to squash; old PR A branch is not the new main).
- **Reconciliation method:** create a **two-parent commit** with parent 1 = exact old PR #16 HEAD, parent 2 = exact current `main` merge SHA, based on main's Git tree. Re-apply only six PR B-owned Markdown files, preserving **every other file exactly as new main**, including newly approved PRD and account-group corrections. This is a **non-force fast-forward** of PR #16's branch, not a history rewrite, no reset/rebase.
- **Content alignment:** update proposed Account/Wallet create flows, Screens and conceptual Ledger/Architecture to honor PR #14's group-conditional opening equity; bank-linked Wallet is a **non-ledger reference**, zero opening/journal, Investments/Loans historic openings never duplicate bank movements. These are **future contracts only**, no implementation.
- **`.ai/current.md` conflict handling:** preserve exact `main` text/historic checkpoints and prepend compact new PR #16 state; no overwrite of PR #14 merge-related provenance.
- **Expected review target:** retarget existing PR #16 to `main` **after** branch becomes descendant of new main. Validate that PR diff is exactly the six owned Markdown files, all internal paths/anchors exist, commit trailers comply and CI matches exact HEAD.
- **Downstream:** [Draft PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) branch remains **untouched**. Its base will advance indirectly with PR #16; separately reconcile it **later** and do not claim its current mergeability/tests.
- **Review:** independent review previously `DEFERRED`; GitHub automated reviewer/CI results must be read **after** the new head and (if requested) ready-for-review transition. No review approvals are fabricated. Finance/identity ADR blockers remain future implementation gates.
- **Owner merge authorization:** **NOT_GRANTED for PR #16**, even when CI/review pass.

### 2026-11-20 — Ready-for-review / CI refresh checkpoint

- **Live PR #16:** transitioned from Draft to **Ready for Review**, base branch retargeted from old PR A branch to **`main`**. Reconciliation merge commit `ec537534ee617b72e481aa14f3f810852bb5fa2a`, not merged.
- **Verified current diff:** GitHub compare new `main` to `ec537534ee617b72e481aa14f3f810852bb5fa2a`: **six Markdown files** (02–05, task, current index), **0 behind**. Every other file, including PR #14 corrected product docs, matches `main`. No force-push/rebase.
- **Link and product review at verified commit:** scanned 18 Markdown docs plus handoff: **314 local file links, 85 section anchors**, 0 missing/broken. 173 external links were enumerated but **not tested for live HTTP**. New Account Opening/Walet/Investment/Loan acceptances are visible in TM-FLOW-AG-008/009, TM-SCR-AG-006, TM-DB-GROUP-005 and TM-ARCH-009. The PR does not implement finance code.
- **GitHub checks issue:** push to the branch while PR targeted old non-`main` base triggered only preview `signal`; docs/governance workflows rely on `pull_request` (`synchronize`) on `main`. This small task/index-only checkpoint commit deliberately triggers current-head PR CI. No CI result claimed until GitHub returns final statuses.
- **Review gate:** Marked Ready for Review to request feedback; initial new-base reviews and inline findings were empty, **not approved**. Review/approval must be verified at the new head. Independent review remains recommended (financial docs and identity/privacy boundaries); no fictitious signoff.
- **PR #22:** currently `mergeable:false` after parent PR #16 advanced; **branch untouched**. Needs separate review/reconciliation.
- **Owner authority:** user requested safe PR #16 reconciliation and new CI/review. **No PR #16 merge authorization**, no deployment and no authorization for PR #22 merge.

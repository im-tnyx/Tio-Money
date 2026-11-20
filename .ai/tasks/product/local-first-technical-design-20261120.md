# TM-DOC-ARCH-20261120-002 — Local-first technical document alignment (Phase B)

> **Scope: Markdown documentation only.** Based on owner `Go` (2026-11-20) after PR B proposal. Not permission for source changes, SQLite migration, provider integration, deployment or PR merge.

| Field | Verified value |
| :--- | :--- |
| Repository | `im-tnyx/Tio-Money` |
| Current agent/model | ChatGPT GPT-6, self-identified working session |
| Previous agent for this new task | UNKNOWN_NOT_VERIFIED |
| Persistent RFC | [Issue #15](https://github.com/im-tnyx/Tio-Money/issues/15) |
| Technical decision | **PROCEED for documentation-only drafting**, agent-recorded, based on owner current-chat "Go"; no authenticated GitHub-owner merge approval |
| Owner decisions source | [TM-DEC-006–009](../../../docs/DECISIONS.md#tm-dec-006--local-first-delivery-order-and-backup-boundary) in **open PR #14**, not merged |
| Stacked PR A base | [Draft PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) HEAD `659915ba8c9766082ccc945809b8879df3b5b6ce` |
| Main at task start | `fd154db417b1979d39f855317f252eed37c36e9d` |
| Working branch | `docs/local-first-finance-architecture-20261120`, from PR #14 head; target PR A feature branch, **not main** |
| Lifecycle | **IN_REVIEW** — [Draft PR #16](https://github.com/im-tnyx/Tio-Money/pull/16), stacked on open Draft PR #14; **NOT MERGED** |
| Independent review | DEFERRED; not performed. Strongly recommended before financial schema/security implementation |
| Merge permission | **NOT_GRANTED** for PR #14 or any PR B; separate explicit owner instruction naming repo and PR required |

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

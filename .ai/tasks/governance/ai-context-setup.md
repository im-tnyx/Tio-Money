# TM-GOV-20261118-001 — AI context and feature governance

> **Authorized task:** AI context, agent handoffs, documentation reconciliation and architecture contracts **only**. This task does not authorize app changes or merging PRs.

## Identity and verified snapshot

| Field | Evidence at initial checkpoint |
|---|---|
| Task ID | `TM-GOV-20261118-001` |
| Repository | `im-tnyx/Tio-Money` |
| Current agent | ChatGPT using connected GitHub tooling |
| Model | GPT-6 (model identified in this session) |
| Previous agent | `UNKNOWN_NOT_VERIFIED` — no verified prior working agent for this task |
| Git commit author | `UNKNOWN_NOT_VERIFIED` prior to governance commit; never infer agent from author |
| PR author / reviewer / owner | PR author/reviewer not yet verified; repository owner account `im-tnyx`, distinct role |
| Started / checkpoint (UTC) | 2026-11-18; **exact UTC timestamp to record at next verified checkpoint** |
| Task status | Active; governance branch created, PR not open at initial checkpoint |
| Working branch | `chore/ai-context-governance` |
| Base / initial HEAD | `b57df1ff92e3ff3e51b8e12b173282b536f06d74` (verified GitHub `main` commit) |
| Phase 0 branch | `feat/phase-0-expo-foundation` — **outside this task** |
| PR | Not opened at initial checkpoint |
| Next agent | Unassigned; continue only with owner-authorized scope |

## Requested and authorized

- Build root `AGENTS.md`, `.ai/` router, task templates, current index, provenance registry, feature contracts and [decision register](../../../docs/DECISIONS.md).
- Reconcile **English-only initial UI** in existing PRD, flows, screen spec, architecture, ledger settings narrative and implementation test plan only where necessary.
- Follow [documentation style](../../../docs/90-DOCS-STYLE-GUIDE.md), inspect live GitHub and Tio Workspace reference, keep governance independently reviewable.
- **Do not** modify `src/`, SQLite schema, Expo scaffold, feature branches, SMS entitlements, Supabase, Auth, repository security settings or `main`.
- **Do not merge** either PR. Owner approval remains pending.

## Initial verified investigation

- Live `main`: documentation-only; verified commit `b57df1ff92e3ff3e51b8e12b173282b536f06d74`.
- [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) was **open/draft**, HEAD `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f`. PR body reports CI and **does not verify real-device QA**; this governance session did not rerun CI.
- No root `AGENTS.md` or `.ai/` on `main` at initial inspection.
- Inspected Tio Workspace's `AGENTS.md` and compact `.ai/` patterns for reference; **did not transplant its product-specific Auth/workout rules**.
- Found old Hindi/English MVP claims in PRD, screen spec, architecture, user flows and implementation plan conflicting with new owner English-only directive.
- Owners of the parallel PR, current/previous AI agent identity and physical-device test results **not independently verified**; do not invent them.

## Checkpoint and continuation instructions

- **Completed at initial inspection:** verified repository, branch set, PR state, existing docs, reference patterns; created this isolated branch from `main`.
- **Attempted but failed:** none of these initial reads; full runtime/device test harness not available from GitHub-only session.
- **Changed files:** to be populated from the actual governance branch diff after commit; do not treat proposed filenames as changed-file evidence.
- **Remaining:** author docs, validate links/diagrams/permissions/paths, compare branch against `main`, open separate governance PR and record URL.
- **Do not change:** PR #1, Phase 0 branch, financial invariants, app source, `main` or rulesets.
- **Read first:** [AGENTS](../../../AGENTS.md), [current index](../../current.md), this task, then [feature boundaries](../../core/feature-boundaries.md) and related [docs hub](../../../docs/00-INDEX.md).
- **Exact next safe action:** verify governance branch HEAD and changed-path scope, complete documentation validation, then open a **draft review PR** to `main`; await owner review.

## PR and archive gate

Status remains Active/Review while PR is open. Record checked commit SHAs, validations and any owner decision. Only archive after GitHub confirms terminal state (including merge if requested). [Workflow](../../core/workflow-rules.md).

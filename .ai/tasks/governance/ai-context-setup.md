# TM-GOV-20261118-001 — AI context and feature governance

> **Authorized task:** AI context, agent handoffs, documentation reconciliation and architecture contracts **only**. This task does not authorize app changes or merging PRs.

## Identity and latest verified status

| Field | Verified evidence / status |
|---|---|
| Task ID | `TM-GOV-20261118-001` |
| Repository | `im-tnyx/Tio-Money` |
| Current agent | ChatGPT using connected GitHub tooling |
| Model | GPT-6 (model identified in this session) |
| Previous agent | `UNKNOWN_NOT_VERIFIED` — no verified prior working agent for this task |
| Git commit author | GitHub maps verified commit `e767387869abf4294f562e8460fa439be30689db` to account `im-tnyx`; **not proof of agent/model** |
| PR author / reviewer / owner | PR #2 author: `im-tnyx` (GitHub verified); no review recorded here; repository owner: `im-tnyx` — distinct role |
| Started / checkpoint (UTC) | Start: `UNKNOWN_NOT_VERIFIED` (date 2026-11-18 known, exact UTC start not captured); last precise checkpoint: `2026-11-18T17:21:19Z` |
| Task status | **Review** — PR #2 open, awaiting owner review and separate merge authorization |
| Working branch | `chore/ai-context-governance` |
| Base / initial HEAD | `b57df1ff92e3ff3e51b8e12b173282b536f06d74` (verified GitHub `main` commit) |
| Phase 0 branch | `feat/phase-0-expo-foundation` — **outside this task** |
| PR | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2), open / not merged at checkpoint |
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
- **Changed files:** initial inspection only; complete observed diff and validation appear in the verified checkpoint below.
- **Remaining:** owner review of open PR #2; future agent rechecks branch/PR/checks. No merge is authorized.
- **Do not change:** PR #1, Phase 0 branch, financial invariants, app source, `main` or rulesets.
- **Read first:** [AGENTS](../../../AGENTS.md), [current index](../../current.md), this task, then [feature boundaries](../../core/feature-boundaries.md) and related [docs hub](../../../docs/00-INDEX.md).
- **Exact next safe action:** review [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) against current `main`; obtain separate, explicit owner merge approval before any merge.

## Verified checkpoint — 2026-11-18T17:21:19Z (UTC)

- **Current / previous:** ChatGPT (GPT-6) / `UNKNOWN_NOT_VERIFIED` (no prior verified working agent).
- **Observed repository and refs:** `im-tnyx/Tio-Money`; `main` `b57df1ff92e3ff3e51b8e12b173282b536f06d74`; governance branch pre-checkpoint HEAD `e767387869abf4294f562e8460fa439be30689db` (2 commits ahead, 0 behind); PR #2 open (not merged). **This record's own commit advances HEAD; recheck live HEAD.**
- **Completed and verified:** 18 new governance/decision Markdown files; 8 existing docs corrected to the English-only owner decision. No `src/`, app build/config, `.github/`, SQLite schema, permissions or branch rewrite in the GitHub compare.
- **Exact added files:** `AGENTS.md`, `.ai/README.md`, `.ai/current.md`, `.ai/core/README.md`, `.ai/core/product-rules.md`, `.ai/core/architecture.md`, `.ai/core/coding-rules.md`, `.ai/core/ui-rules.md`, `.ai/core/security-rules.md`, `.ai/core/workflow-rules.md`, `.ai/core/feature-boundaries.md`, `.ai/tasks/README.md`, `.ai/tasks/TEMPLATE.md`, `.ai/tasks/governance/ai-context-setup.md`, `.ai/agents/README.md`, `.ai/agents/registry.md`, `.ai/archive/README.md`, `docs/DECISIONS.md`.
- **Exact modified files:** `docs/00-INDEX.md`, `docs/01-PRD.md`, `docs/02-USER-FLOWS.md`, `docs/03-SCREEN-SPEC.md`, `docs/04-DATABASE-DESIGN.md`, `docs/05-TECH-ARCHITECTURE.md`, `docs/06-IMPLEMENTATION-TEST-PLAN.md`, `docs/90-DOCS-STYLE-GUIDE.md`.
- **Link validation:** connected GitHub `fetch_file` of all 27 repository Markdown files on governance branch; relative-target script checked **273** links, **0 missing targets**.
- **Markdown/diagram validation:** triple-backtick parity check plus recognized diagram-header check for **32 Mermaid blocks**; basic structural PASS, **full Mermaid renderer not run**.
- **Content/scope:** 8 docs changed through 30 exactly-once anchored replacements; bilingual-MVP strings checked in target specs; initial new-doc scan found no common credential/key patterns. GitHub compare found no app source changes.
- **Not run / not claimed:** npm CI, TypeScript/lint tests, physical Android/iOS QA, actual SQLite device tests, full Mermaid parser and repository security enforcement; GitHub connector does not establish a local clean worktree.
- **Attempted but failed:** initial all-file validator exceeded connector tool-call limit; retried in three scoped batches which succeeded (10 + 8 + 9 files). No files were lost from that attempt.
- **Owner decision reference:** [TM-DEC-001](../../../docs/DECISIONS.md#tm-dec-001--english-only-initial-app); no other product change approved by this docs task.
- **Unresolved:** owner review and merge authorization; separate decisions on Phase 0 device QA, screen placement/theme, ledger design details and native Android SMS eligibility.
- **PR:** [#2](https://github.com/im-tnyx/Tio-Money/pull/2), open, proposed to `main`; [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) remains isolated, open draft at inspection.
- **Do not modify:** `main`, Phase 0 branch, PR #1, app source, security settings, schema, native permissions.
- **Next agent should read first:** [AGENTS](../../../AGENTS.md) → [current](../../current.md) → this task → relevant [core](../../core/README.md), then live commits and PRs.
- **Exact next safe action:** independently inspect PR #2's current diff, checks, review and target-branch SHA; request/await owner review and separately authorized merge. Do not archive until verified terminal state.

## PR and archive gate

Status remains Active/Review while PR is open. Record checked commit SHAs, validations and any owner decision. Only archive after GitHub confirms terminal state (including merge if requested). [Workflow](../../core/workflow-rules.md).

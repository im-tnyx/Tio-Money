# TM-GOV-20261118-001 — AI context and feature governance

> **Authorized task:** AI context, agent handoffs, documentation reconciliation and architecture contracts **only**. This task does not authorize app changes or merging PRs.

## Identity and latest verified status

| Field | Verified evidence / status |
|---|---|
| Task ID | `TM-GOV-20261118-001` |
| Repository | `im-tnyx/Tio-Money` |
| Current agent | ChatGPT using connected GitHub tooling |
| Model | GPT-6 (model identified in this session) |
| Previous agent | Prior **verified checkpoint** identifies ChatGPT (GPT-6) at `2026-11-18T17:21:19Z`; any agent before that remains `UNKNOWN_NOT_VERIFIED` |
| Git commit author | GitHub maps verified commit `e767387869abf4294f562e8460fa439be30689db` to account `im-tnyx`; **not proof of agent/model** |
| PR author / reviewer / owner | PR #2 author: `im-tnyx` (GitHub verified); Copilot reviewed older HEAD as `COMMENTED` with 3 unresolved threads; Codex review failed due usage limits, **not a passing review**; repository owner: `im-tnyx` — distinct roles |
| Started / checkpoint (UTC) | Original session exact start: `UNKNOWN_NOT_VERIFIED`; latest verified V2 checkpoint `2026-11-18T18:48:44Z`; historical original checkpoint `2026-11-18T17:21:19Z` retained below |
| Task status | **IN_REVIEW** — V2 scope pushed to PR #2, Copilot 3 threads still unresolved, independent re-review pending, separate owner merge authorization **not granted** |
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

## V2 scope and decisions — owner chat, agent-transcribed

- [V2 Stage A RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) recorded technical scope and acceptance. [Stage B approval](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987125950) authorized the existing PR #2 governance/docs plus Python stdlib helper/tests, **not merging**.
- [Later owner policy refinement](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176) supersedes **mandatory** pre-implementation owner signoff: technical RFC and **documented PROCEED decision** remain mandatory, owner implementation approval is **optional** for ordinary bounded work. Restricted/security/product decisions remain separately gated. **Explicit owner merge approval is mandatory for all PRs.**
- [Strict attribution instruction](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987814777): **no Git `Co-authored-by:` trailers**, AI or otherwise. Keep authentic Git author and agent provenance separate.
- **Provenance limitation:** These PR comments are agent transcriptions of owner statements in chat, not independent direct GitHub-owner messages. Owner merge approval has never been claimed or granted.

## Initial verified investigation

- Live `main`: documentation-only; verified commit `b57df1ff92e3ff3e51b8e12b173282b536f06d74`.
- [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) was **open/draft**, HEAD `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f`. PR body reports CI and **does not verify real-device QA**; this governance session did not rerun CI.
- No root `AGENTS.md` or `.ai/` on `main` at initial inspection.
- Inspected Tio Workspace's `AGENTS.md` and compact `.ai/` patterns for reference; **did not transplant its product-specific Auth/workout rules**.
- Found old Hindi/English MVP claims in PRD, screen spec, architecture, user flows and implementation plan conflicting with new owner English-only directive.
- Owners of the parallel PR, current/previous AI agent identity and physical-device test results **not independently verified**; do not invent them.

## Historical initial inspection and continuation notes

> The following original inspection text was recorded **before V2 implementation**. For the latest validated state see [V2 Stage B checkpoint](#v2-stage-b-checkpoint) below; the old initial “remaining” list is historical, not the current handoff.

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

Status remains **IN_REVIEW** while PR #2 is open. Record checked commit SHAs, validation and **distinct** owner implementation/merge decisions. Do not archive until independently verified terminal state and all affected links updated. [Workflow](../../core/workflow-rules.md).

## V2 Stage B checkpoint

**Verified UTC:** `2026-11-18T18:48:44Z` (recorded just before this checkpoint commit; it advances the branch HEAD). **Task:** `TM-GOV-20261118-001`. **Current working agent/model:** ChatGPT (GPT-6), connected GitHub tools. **Prior verified checkpoint agent:** ChatGPT (GPT-6) at `2026-11-18T17:21:19Z`; model/identity prior to that remains `UNKNOWN_NOT_VERIFIED`. GitHub PR/commit author is account `im-tnyx` and must not be confused with AI agent, reviewer or owner approvals.

### Exact inspected state and permissions

- **Repository/branch:** `im-tnyx/Tio-Money`, `chore/ai-context-governance`.
- **HEAD inspected/tested source:** `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75` (pre-checkpoint HEAD); base `main` `b57df1ff92e3ff3e51b8e12b173282b536f06d74`. No merges.
- **Parallel Phase 0 branch:** `feat/phase-0-expo-foundation`, `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f`, [draft PR #1](https://github.com/im-tnyx/Tio-Money/pull/1); untouched.
- **PR:** [#2](https://github.com/im-tnyx/Tio-Money/pull/2) **open, not merged**. [RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549), [specific Stage B implementation approval](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987125950), [optional future implementation-signoff owner change](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176), [no co-author owner instruction](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987814777). These are **agent-recorded** chat decisions, not GitHub-owner-authored comments. **Owner merge approval is NOT granted.**
- **Lifecycle:** `IN_REVIEW` (not `COMPLETED`); Copilot `COMMENTED` with **3 unresolved** findings on original reviewed SHA `8654f1069e38553262ed23279a4b3c32e3cca1be`. Codex review was quota-limited/incomplete, not independent PASS. First two thread replies now provide fix evidence; third needs review after this checkpoint. A re-review of the **new** HEAD remains necessary.

### Stage B completed work, exact file changes relative to old governance HEAD

- **Governance documents updated:** `AGENTS.md`, `.ai/README.md`, `.ai/core/coding-rules.md`, `.ai/core/security-rules.md`, `.ai/core/workflow-rules.md`, `.ai/core/feature-boundaries.md`, `.ai/tasks/README.md`, `.ai/tasks/TEMPLATE.md`, `.ai/archive/README.md`, `.ai/agents/README.md`, `.ai/current.md`, `.ai/agents/registry.md` and **this** task record (last three in checkpoint commit).
- **New:** `.ai/discussions/README.md`, `.ai/discussions/TEMPLATE.md`, `scripts/ai_context.py`, `tests/governance/test_ai_context.py`.
- **Commits already pushed:** `677a318c1738cd1aeb140eafdcdbf4dd40e8d848` (RFC/feature rules), `a5cd881ed55fdc740517985fb87f2f1f681fa272` (lifecycle and archive rules), `e9137031cb66e60305f8e3aac43d37ead2657956` (owner implementation signoff optional; merge signoff mandatory), `686da37db5c5546e463e9b6c38a29ed14ab93353` (strict no co-author trailers), `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75` (Python helper and regression tests).
- **Copilot remediation:** `archive-task` dry-run, outbound/inbound link rewriting with headings/anchors, collisions and terminal-state assertion; `create-task` nested copied-template link rebasing. Historical initial checkpoint preserved and the current task/index links now refer to this post-validation V2 checkpoint; not retroactively backdated. **This doc does not replace independent review evidence.**
- **Out of scope preserved:** no app `src/`, Expo config/package, SQLite/schema, native entitlements, Auth, Supabase, `.github/` CI/rulesets, Phase 0 branch, `main` or finance product-rule changes. `TM-DEC-001` English-only MVP remains unchanged.

### Executed validation and environmental limits

- **Python environment:** Python 3.13.5, Git 2.47.3; isolated local test files have **exactly matching Git blob SHA** with code committed on GitHub: script `85fcd20e99d0dc2b1f65b70e9f0ec0e8a53fc896`, tests `c2e1c0242b3fdc942d1ec81238ca68a575758535`.
- `python3 -m unittest discover -s tests/governance -v` — **9 tests passed**: nested template copy, archive incoming/outgoing links and anchors, dry run, terminal and collision guard, traversal/symlink rejection, missing anchor rejection, preservation of unrelated/fenced links, state transition gate (technical proceed without mandatory owner implementation signoff but merge owner approval required), co-author trailer rejection, real temporary Git commit history positive/negative cases.
- `python3 -m py_compile scripts/ai_context.py tests/governance/test_ai_context.py` — **PASS**.
- `python3 scripts/ai_context.py check-transition --before DECISION_PENDING --after APPROVED --rfc-recorded --proceed-recorded` — **PASS**; `python3 scripts/ai_context.py check-transition --before IN_REVIEW --after COMPLETED --owner-merge-approved --terminal-verified` — **PASS** (self-attested flags only). Omitting `--owner-merge-approved` correctly returns **FAIL/exit 1**. CLI/test checks do **not** prove real GitHub/owner authorization.
- GitHub-connected audit of **29 repository Markdown files** at `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75`: **313 relative .md link targets** existed; **zero missing** under the structural target-only check. **32 Mermaid blocks** had recognized headers and balanced Markdown code fences. Full Mermaid renderer and all GitHub-generated heading anchors **not** run; fixture tests cover conventional anchor cases.
- GitHub PR #2 history at `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75`: 8 commit messages inspected, **zero `Co-authored-by:` trailers**. Local Git `check-commits` exercised on synthetic clean/forbidden histories; it was **not** run over a full local clone of this private repository. No CI enforcement/ruleset was installed; policy is documented and manually checkable.
- **Not run / not claimed:** npm/Expo build or device QA, full Mermaids rendering, GitHub branch-protection assessment, all potential Markdown syntax variants, real merge permission verification, full local Git checkout/source tree, full secrets scanner. Review threads have **not** been silently resolved.
- **Attempted but failed:** no failing regression tests on final committed helper source; Codex external review failed due usage limit; that is neither a code finding nor a passing review.

### Remaining review risks and exact next safe action

**Open:** independent review of latest commit and the three Copilot findings, remaining CLI limitations (simple inline Markdown links and conventional-heading anchor checks; review reference-style links manually), no active CI enforcement of governance or no-coauthor checks, and separate owner **merge** approval. Keep PR #1 and `main` untouched.

**For next agent:** Read [AGENTS](../../../AGENTS.md) → [current](../../current.md) → [RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) / [policy revisions](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176) → this [checkpoint](#v2-stage-b-checkpoint) → live PR #2 commits/review threads → relevant [core workflow](../../core/workflow-rules.md) → actual helper/tests. Confirm branch HEAD, compare diff, review findings and exact approved scope.

**Next safe action:** post the third Copilot-thread reply pointing to this checkpoint; update PR description/re-review request against **current** HEAD; allow independent reviewers to reassess. **Do not merge, archive, auto-resolve reviewer findings, rewrite history or modify the Phase 0 branch.** An explicit, **separate** owner merge decision is required even after a passing review.

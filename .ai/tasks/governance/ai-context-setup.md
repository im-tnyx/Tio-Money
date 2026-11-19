# TM-GOV-20261118-001 — AI context and feature governance

> **Current verified task disposition:** **COMPLETED / MERGED**. Governance [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) merged on **2026-11-19 at 06:16:11 UTC**, resulting in main commit `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`. Its six GitHub review threads are now resolved. The `IN_REVIEW`, `NOT_GRANTED` and older PR-head references in the dated sections below are preserved as **historical snapshots**, not current status. See [verified post-merge reconciliation](#verified-post-merge-reconciliation--2026-11-19).

> **Authorized task:** AI context, agent handoffs, documentation reconciliation and architecture contracts **only**. This task does not authorize app changes or merging PRs.

## Identity and latest verified status

| Field | Verified evidence / status |
|---|---|
| Task ID | `TM-GOV-20261118-001` |
| Repository | `im-tnyx/Tio-Money` |
| Current agent | ChatGPT using connected GitHub tooling |
| Model | GPT-6 (model identified in this session) |
| Previous agent | Previous verified working checkpoint: ChatGPT (GPT-6), `2026-11-18T18:48:44Z` UTC; earlier verified checkpoint also ChatGPT (GPT-6), `2026-11-18T17:21:19Z`; agents before that `UNKNOWN_NOT_VERIFIED` |
| Git commit author | GitHub maps verified commit `e767387869abf4294f562e8460fa439be30689db` to account `im-tnyx`; **not proof of agent/model** |
| PR author / reviewer / owner | PR #2 author: `im-tnyx` (GitHub verified); Copilot `COMMENTED` with 3 previous open threads; reviewer `im-tnyx` `COMMENTED` on old head with 2 more open P2 findings; **no passing independent re-review**; Codex previously quota-limited; account/owner and actual agent are distinct |
| Started / checkpoint (UTC) | Original session exact start: `UNKNOWN_NOT_VERIFIED`; latest verified checkpoint `2026-11-18T20:19:48Z` (before its recording commit); prior V2 checkpoint `2026-11-18T18:48:44Z`, older inspection `2026-11-18T17:21:19Z` preserved below |
| Task status | **IN_REVIEW** — two new P2 findings remediated and GitHub governance integrated; all **five** review threads still open for independent re-review; separate owner merge authorization **NOT GRANTED** |
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

## Governance P2 and GitHub automation checkpoint

**Verified checkpoint:** `2026-11-18T20:19:48Z` UTC; this snapshot records **pre-checkpoint HEAD** `90998568566bad7264e146e87451af8caedaaaa6` and the checkpoint commit itself will advance HEAD. **Current agent:** ChatGPT (GPT-6), connected GitHub tools. **Previous verified working agent:** ChatGPT (GPT-6) in [V2 Stage B checkpoint](#v2-stage-b-checkpoint) at `2026-11-18T18:48:44Z`; any earlier unverified agent remains `UNKNOWN_NOT_VERIFIED`. GitHub author `im-tnyx` and review identity are separate from AI/model attribution.

### Discussion, decisions, and exact scope

- [P2 remediation RFC and technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6989114060): repair reference-style Markdown link creation/archive/check logic, fail closed on unsupported broken references, and require BLOCKED recovery attestations/negative tests.
- [GitHub integration RFC and technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6989498878): five GitHub Issue Forms, PR template, read-only governance workflow, review and post-merge guides, short Copilot instructions, navigation/cross-links. Both records are **agent-authored technical decisions within the user-requested bounded tasks**, not direct owner GitHub approvals.
- Owner policy unchanged: RFC and technical `PROCEED` before implementation; **owner implementation signoff optional** for ordinary bounded work, restricted operations separately gated; **explicit separate owner MERGE approval mandatory** for every PR and **NOT GRANTED**. No `Co-authored-by:` trailers for anyone.
- [Review #5963421660](https://github.com/im-tnyx/Tio-Money/pull/2#pullrequestreview-5963421660) was `COMMENTED` at old HEAD `7f46ca4e76c5922c1d76befc770937abed85685f`, with two **P2** threads for reference-style links and BLOCKED recovery. Three earlier Copilot threads also remain open. No previous GitHub review passes automatically for the changed head.

### Branch, commits, exact files

- Repo `im-tnyx/Tio-Money`; working branch `chore/ai-context-governance`; PR [#2](https://github.com/im-tnyx/Tio-Money/pull/2) open/unmerged, pre-checkpoint HEAD `90998568566bad7264e146e87451af8caedaaaa6`; `main` `b57df1ff92e3ff3e51b8e12b173282b536f06d74` unchanged; [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) open/draft `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` untouched.
- **P2 fix** `ea4ddd17202fc1a27c8e69acd5267aae0804adbf`: `scripts/ai_context.py`, `tests/governance/test_ai_context.py`, `.ai/tasks/README.md`, `.ai/archive/README.md` — supported inline and single-line reference-style definitions, inbound/outbound rebasing and pre-apply target/anchor validation, self-attested BLOCKED recovery risk/branch/PR/review evidence; staged temporary files and best-effort rollback on ordinary errors, NOT crash-atomic.
- **Issue Forms** `9d0c7269a78f007e2fd88e004493fad3c86a30bc`: `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `architecture_decision.yml`, `task_discussion.yml`, `config.yml`.
- **PR template and CI** `bc5759d45cfc8dd4c511ede029a16ff4ddfd076d`: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/ai-governance-checks.yml`. Workflow `pull_request` to `main` / `workflow_dispatch`, read-only `contents:read`, pinned checkout, Python syntax/tests/Markdown check and no-coauthor commit-history scan. This is **not independently trusted branch protection**.
- **Guides** `2d7cd2d2a52fabbd90d559a494aac94f207fc8b2`: `.github/README.md`, `POST-MERGE-SYNC.md`, `REVIEW_GUIDE.md`, `copilot-instructions.md`. **Crosslinks** `632a54f1f69df26d702549e68c8f917c7fb202e9`: `AGENTS.md`, `.ai/README.md`, `.ai/discussions/README.md`, `.ai/core/workflow-rules.md`, `.ai/tasks/README.md`, `.ai/archive/README.md`.
- **Final supported inline-code handling** `90998568566bad7264e146e87451af8caedaaaa6`: `scripts/ai_context.py`, `tests/governance/test_ai_context.py`; avoids falsely checking links shown inside backtick code examples. Tests on committed **exact source blobs** `20afbd074f75425baa4d5ccd51d83aa1b4938798` and `0875100822dd5f115349088d005e64b67c1d0805`.
- **Checkpoint paths in this commit:** `.ai/tasks/governance/ai-context-setup.md`, `.ai/current.md`, `.ai/agents/registry.md`; preserve earlier V2 and initial records without backdating. No application `src/`, Expo/Node dependencies, ledger/schema, SMS permissions, Auth/Supabase, Phase 0 workflow/branch or `main` writes.

### Executed validation, at which SHA, and known limits

- Python **3.13.5**, standard-library helper/tests at committed pre-checkpoint `90998568566bad7264e146e87451af8caedaaaa6` (blob hashes above): `python3 -m unittest discover -s tests/governance -v` — **24/24 PASS**, covering original archive/template cases, new inbound/outbound reference definitions, missing file/anchor/undefined/ambiguous definitions, fenced and inline-code examples, ordinary I/O rollback, BLOCKED recovery bypass negative cases, strict `Co-authored-by:` fixture tests. `python3 -m py_compile scripts/ai_context.py tests/governance/test_ai_context.py` — **PASS**.
- `python3 scripts/ai_context.py check-transition --before BLOCKED --after IN_REVIEW` — **expected FAIL, exit 1** without PR/review/recovery evidence. `--before DECISION_PENDING --after APPROVED --rfc-recorded --proceed-recorded` — **PASS**. These flags and recovery JSON are **self-attestation**, not GitHub identity/permission verification.
- Local PyYAML **6.0.3** (validation environment only, **not** added to repo dependencies): checked all five Issue Form YAML/config files, supported field types, unique IDs, required fields and meaningful dropdown options: **PASS**. Workflow parsed with `yaml.BaseLoader`: `pull_request` (main) + `workflow_dispatch`, only `contents: read` permissions, one governance job, pinned immutable checkout SHA, no `pull_request_target`: **PASS**. This is syntax/schema/structural inspection, **not** an actual Actions run or GitHub's own workflow acceptance.
- GitHub-connected inspection of all **34 Markdown files at `90998568566bad7264e146e87451af8caedaaaa6`**: **359 supported relative internal link targets, zero missing**, **32 Mermaid blocks** structurally identified; inline code examples excluded. Full Mermaid renderer/complex GitHub anchor equivalence not tested. Reference-style positive/negative behavior verified on isolated Python fixtures. The whole-repo `check-links` CLI was **not run on a local clone** (GitHub-only private repository access); do not claim otherwise.
- Connected GitHub PR commit-history audit before checkpoint: all actual messages read; **zero forbidden `Co-authored-by:` trailers**. `python3 scripts/ai_context.py check-commits` tested with synthetic Git histories, **not** on a full local clone. No coauthor trailer is present in any commit created here.
- **Not run / not claimed:** real GitHub Actions run at this new head, required branch-protection checks, independent passing re-review, full repository checkout, Expo app/Android/iPhone tests, full secrets scanner, actual SQLite device tests, full Mermaid parser, or merge permission. `.github/workflows/phase-0-checks.yml` exists only on parallel Phase 0 draft branch; the governance workflow does not overwrite it and runs **different** test categories.
- **Security limitations:** workflows on `pull_request` execute PR-authored code with read-only permissions and no secrets, **not** a tamper-proof, trusted required check; owner must separately authorize/configure protections. The Markdown helper conservatively supports simple inline and single-line reference forms and may reject unsupported Markdown constructs. Multi-file archive replacement is best-effort rollback and **not** power-loss/crash atomic. No git branch ruleset changes performed.

### Remaining findings and exact next safe action

- Five **unresolved** reviewer threads: [original archive link](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4618137630), [template copying](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4618137740), [stale checkpoint](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4618137805), [new P2 reference-style links](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4619484260), [new P2 BLOCKED recovery](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4619484276). Existing earlier replies are historical, not independent closure. No thread is automatically resolved.
- **Next agent read order:** [AGENTS](../../../AGENTS.md) → [current](../../current.md) → this [checkpoint](#governance-p2-and-github-automation-checkpoint) → both [RFC records](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6989498878) → [review guide](../../../.github/REVIEW_GUIDE.md) → live PR HEAD/diff and five threads → helper/test source and actual check logs.
- **Exact next safe action:** post evidence-based replies to **all five** review threads with new fix SHAs and test results; append updated PR #2 scope/review summary, request eligible **independent re-review at the new HEAD**; leave threads unresolved until verified disposition. After that, seek **separate explicit owner approval to merge**. **Never merge automatically, force-push, auto-resolve, archive an open PR or modify Phase 0/main.**

## CI validation follow-up — 2026-11-18

**Actual UTC check:** `2026-11-18T20:28:18Z`. Current working agent/model: ChatGPT (GPT-6), connected GitHub tooling. Previous verified agent: ChatGPT (GPT-6) in the [P2 and GitHub governance checkpoint](#governance-p2-and-github-automation-checkpoint); all earlier agent uncertainties remain preserved. **Repository:** `im-tnyx/Tio-Money`; **branch:** `chore/ai-context-governance`; pre-checkpoint HEAD `821300cb62c435ec11457b3b1cc0318c72c0690c`; base `main` unchanged at `b57df1ff92e3ff3e51b8e12b173282b536f06d74`; Phase 0 PR #1 remains separate and draft.

### GitHub Actions observed evidence and correction

- **Failure diagnosis:** [Workflow run #44390365810](https://github.com/im-tnyx/Tio-Money/actions/runs/44390365810) on prior head `e8560e65ab7e4b36d022ce8c1d914b4a4044f39d` **FAILED** in the Markdown-link step while Python syntax and 24/24 regression tests passed. Runner log reported `.ai/archive/README.md: Undefined reference-style link: [ref]` and missing `file.md#anchor`. The examples were incorrectly **escaped literal backticks** in Markdown, not valid code spans; the link checker correctly flagged them. Co-author scan was **SKIPPED** in that failed run.
- **Fix:** `821300cb62c435ec11457b3b1cc0318c72c0690c` — corrected Markdown backtick escaping in **only** `.ai/archive/README.md` and `.ai/tasks/README.md`; left runtime helper/tests, existing document history, app/Phase 0 and repository settings unchanged. No hidden suppression of reference validation.
- **Real GitHub Actions success:** [Workflow run #44391147124](https://github.com/im-tnyx/Tio-Money/actions/runs/44391147124) on **`821300cb62c435ec11457b3b1cc0318c72c0690c`** — **COMPLETED SUCCESS** (GitHub job ID `135108820082`, runner Ubuntu 24.04 / Python 3.12.3). Verified via GitHub run/job/actual decoded logs:
  - **PASS:** Python syntax compilation (`py_compile`)
  - **PASS:** `python3 -m unittest discover -s tests/governance -v`, **24/24 tests**
  - **PASS:** `python3 scripts/ai_context.py check-links` on actual PR checkout/merge tree (all supported local Markdown links resolved)
  - **PASS:** `python3 scripts/ai_context.py check-commits --base b57df1ff92e3ff3e51b8e12b173282b536f06d74 --head 821300cb62c435ec11457b3b1cc0318c72c0690c`, **17 Git commit messages**, **0 forbidden `Co-authored-by:` trailers**.
- **Other completed validation:** Python 3.13.5 locally 24/24 tests PASS / `py_compile` PASS on matching source/test blob hashes; all five Issue Forms and workflow YAML validated locally using PyYAML 6.0.3 with no new repo dependency; GitHub-connected 34 Markdown files / 359 supported relative targets / zero missing and 32 Mermaid structural blocks. Full Mermaid rendering, malicious self-modified workflow trust, application/device QA and actual branch protection are not covered or claimed.
- **Caveat:** A green read-only PR-authored workflow is useful test evidence but **not a tamper-proof independent reviewer** or owner merge approval. No `pull_request_target`, deployment, tokens/secrets beyond minimal GitHub read access, required-check/ruleset changes or approval bypass were added. This checkpoint commit will advance HEAD again; **reverify any new CI run** and exact reviewed SHA.

### Review status and next safe action

All five inline threads have evidence replies (three previous Copilot, two new P2), but as of this checkpoint they remain **unresolved**. Independent re-review of current HEAD is **pending**, and **separate owner merge authorization is NOT GRANTED**. Preserve `TM-DEC-001` English-only MVP and all offline/canonical-ledger/native SMS invariants.

**Next safe action:** Verify latest PR head and latest GitHub Actions run, append updated PR description with observed successful CI and previously failed run, request eligible independent review of current HEAD, and leave review threads unresolved until actual reviewer disposition. **Do not merge, auto-resolve, force-push, modify `main` or Phase 0 PR #1, or archive while PR #2 is open.**

## Owner review and agent merge policy — 2026-11-19

**Checkpoint UTC:** `2026-11-19T05:34:43.459Z`, recorded *before this checkpoint commit*, so it advances the branch HEAD. **Current agent/model:** ChatGPT (GPT-6) via connected GitHub tools. **Previous verified working agent/model:** ChatGPT (GPT-6) from 2026-11-18's last [CI follow-up checkpoint](#ci-validation-follow-up--2026-11-18); pre-session history remains `UNKNOWN_NOT_VERIFIED` when not documented. GitHub author/reviewer/owner are distinct roles.

### Owner decision evidence and technical PROCEED

- **Owner instruction:** explicit statement in connected chat on 2026-11-19, transcribed in the [PR #2 technical decision](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-7000574123). This is **not an owner-authored GitHub comment** and is not merge authorization. **Confirmed owner policies recorded canonically:** [TM-DEC-002 independent review optional by default](../../../docs/DECISIONS.md#tm-dec-002--independent-review-optional-by-default) and [TM-DEC-003 authorized agent merge](../../../docs/DECISIONS.md#tm-dec-003--owner-authorized-agent-merge).
- **Policy:** mandatory pre-task RFC + documented `PROCEED`, optional owner implementation signoff for ordinary bounded work, **optional independent review** (strongly recommended for ledger/migration/security/privacy/authentication/sensitive platforms), factual `PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED` status, never fabricate approval. **Known blocking findings and actual GitHub-required reviewers/checks/protections remain binding.**
- **Owner merge gate:** action-specific owner instruction must identify repository, specific PR, **permission to merge** and any conditions; an agent may perform an allowed **non-force** merge only after [preflight](../../../.github/POST-MERGE-SYNC.md#authorized-agent-merge-preflight-before-any-merge). Re-fetch head/base `main`, required checks/reviews/protections, open blockers, authorized vs actual scope; renew approval for material changes; verify resulting GitHub merged state/SHA; post-merge sync and archive afterward. Enabling auto-merge requires **separate express approval**.
- **This is NOT authority to merge PR #2**. `main` remains `b57df1ff92e3ff3e51b8e12b173282b536f06d74` at this snapshot; separate Phase 0 draft PR #1 `feat/phase-0-expo-foundation` at `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` untouched.

### Exact implementation, files and commits

- **Minimal helper and regression fix:** `e238b7d9f886064b0e54705d4e025258b939c69b`: `scripts/ai_context.py`, `tests/governance/test_ai_context.py`. Preserved `BLOCKED` risk/branch/proceed and PR gates; optional independent review now requires an **explicit recorded disposition** (and reason for skipped/unavailable/deferred, self-attested only). Also fixed [additional P2 inline non-Markdown link relocation finding](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4624621676): `![Diagram](../../assets/diagram.png)` / `[Fixture](../../tests/example.json)` now fail closed before task copy/archive, with negative tests.
- **Owner policy documentation commit:** `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7`, modified: `AGENTS.md`, `.ai/README.md`, `.ai/core/workflow-rules.md`, `.ai/tasks/README.md`, `.ai/tasks/TEMPLATE.md`, `.ai/discussions/README.md`, `.ai/discussions/TEMPLATE.md`, `.ai/archive/README.md`, `.github/REVIEW_GUIDE.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/POST-MERGE-SYNC.md`, `.github/copilot-instructions.md`, `.github/README.md`, `docs/DECISIONS.md`. Existing workflow remains unchanged and read-only; no new dependencies, secrets, rulesets, app `src/`, Expo, SQLite/ledger, SMS, Auth, `main` or Phase 0 modifications.
- **Checkpoint commit:** updates only this task, `.ai/current.md` and `.ai/agents/registry.md`; historical checkpoint entries not rewritten.

### Actual validation and open risks

- [GitHub Actions run #44465201294](https://github.com/im-tnyx/Tio-Money/actions/runs/44465201294) on `e238b7d` — **SUCCESS**: Python syntax, **29 governance unit tests PASS**, supported Markdown links PASS, no co-author trailers in 19 PR commits. 
- [Latest run #44465777121](https://github.com/im-tnyx/Tio-Money/actions/runs/44465777121) on `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7` — **SUCCESS** verified in GitHub job logs: Python syntax **PASS**, 29/29 tests **PASS**, whole-checkout supported Markdown links **PASS**, **20 actual PR commits without any `Co-authored-by:` trailer**.
- Tests include negative `BLOCKED → IN_REVIEW` recovery checks, omitted/invalid review disposition, positive `SKIPPED/UNAVAILABLE/DEFERRED` with recorded rationale, and image/JSON inline-link copy/archive rejection plus safe code/URL cases. Tests are **self-attested fixtures**, not GitHub-owner identity, scope approval or branch protection verification.
- **Review status:** six GitHub threads exist, **all unresolved** as of this checkpoint; five earlier fixes documented, and the sixth [P2](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4624621676) has a [fix/test evidence reply](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4624732455). Independent review is optional but is recommended here for concrete P2 safety; no external review PASS or terminal disposition is claimed. **Known blockers remain blocking** if not appropriately resolved/verified.
- **Limitations:** helper handles supported single-line Markdown links and simple inline code; complex CommonMark may remain unsupported. Multi-file archive is best-effort rollback, not crash-atomic. Read-only PR-authored governance CI is not a tamper-proof required check. No physical Android/iPhone checks, full Mermaid rendering or independent proof of GitHub rulesets was performed.

**Next exact safe action:** Verify new HEAD and its CI after checkpoint commit, update PR #2 description to link TM-DEC-002/003 and latest 29-test evidence, confirm six open thread statuses and changed-file scope, and invite optional independent re-review especially for P2. **Do not merge PR #2** until a later distinct, authenticated, action-specific owner instruction names this repository/PR and explicitly authorizes merging with conditions; do not enable auto-merge, auto-resolve reviews or touch Phase 0/main.

## Verified post-merge reconciliation — 2026-11-19

**Verified terminal state for original governance task `TM-GOV-20261118-001`: COMPLETED / MERGED**, but **NOT ARCHIVED**. This checkpoint is appended under [post-merge reconciliation Issue #6](https://github.com/im-tnyx/Tio-Money/issues/6), rather than editing or erasing the earlier pre-merge task/audit history.

| Evidence | Verified state |
|---|---|
| Repository and PR | `im-tnyx/Tio-Money`, [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) |
| Actual final state | GitHub `MERGED`, merged at **2026-11-19 06:16:11 UTC**, resulting `main` SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90` |
| PR source head before squash merge | `d3bcbad8a33a7d9dbc692c50c35d1209c2133d85`; squash merge result differs, as expected |
| Review-thread disposition | GitHub reports **6/6 inline review threads resolved** at 2026-11-19 verification. Earlier date-stamped "six unresolved" statements remain correct for their recorded time. Prior Copilot review `COMMENTED` is not a fabricated `APPROVED`. Independent review remains **UNAVAILABLE / NOT_VERIFIED** as a new-head passing assessment; do not equate thread resolution with formal independent approval. |
| Pre-merge CI source | [AI Governance checks #44466151813](https://github.com/im-tnyx/Tio-Money/actions/runs/44466151813) **SUCCESS** on source head `d3bcbad8a33a7d9dbc692c50c35d1209c2133d85`: Python syntax, **29/29 governance tests**, Markdown relative links, prohibited co-author commit scan. This is source-level evidence, not an independent identity/approval/branch-protection verification. |
| Owner permission record | The owner gave **separate explicit permission to merge PR #2 subject to six findings, current checks and unchanged scope** in the connected 2026-11-18/19 project conversation. GitHub subsequently reports the actual merge; earlier no-permission assertions in this task preceded that separate instruction. Owner authorization for **PR #1** and any **new PR** remains `NOT_GRANTED`. |
| Updated agent/provenance | Previous verified governance working session: **ChatGPT (GPT-6)** from the dated checkpoints above, not from Git author. Post-merge reconciliation working agent: **ChatGPT (GPT-6)**, separately recorded in [Issue #6](https://github.com/im-tnyx/Tio-Money/issues/6) and [post-merge task](post-merge-reconciliation-20261119.md). GitHub PR author and authenticated account are not model/agent evidence. |
| Scope | Governance docs, issue/PR templates and read-only workflow, supporting Python helper/tests and decision documentation. **No** Phase 0 app, financial SQLite schema, SMS access, Auth, Supabase, permissions or protected-branch settings were merged via PR #2. |
| Branch-protection and native QA | Actual GitHub branch protection/rulesets could not be independently read through the connector. This governance task does not establish device QA, real SQLite migration QA or installed Android/iOS results. |
| Archive/next step | Terminal state recorded **without moving/renaming any task file**. Archive only via a separately scoped, reviewable link-safe operation, never inferred from merge success. Continue the independent [documentation correction PR](https://github.com/im-tnyx/Tio-Money/issues/6) in its own branch; leave [draft PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) untouched. |

**Review:** No new independent security review is claimed for this docs-only reconciliation; disposition **DEFERRED**. The prior governance workflow is not tamper-proof and does not itself grant any owner permission. For future PRs, independent review is optional by default but known blocking findings and actual required GitHub settings remain binding.

**Provenance:** Current documentation agent ChatGPT/GPT-6; previous verified governance agent ChatGPT/GPT-6. Historical `NOT_GRANTED` statuses refer to their earlier timestamps, not to a permanent prohibition on the completed PR #2 merge.

**Rollback:** If the new cleanup is rejected, revert only the separate cleanup-branch documentation diff. No direct `main` changes, force push, branch deletion, authorization changes or automated merge are part of this checkpoint.

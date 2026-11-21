# 🪪 Verified agent registry

> **Current verified status (2026-11-19):** Governance [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) is **MERGED** (2026-11-19 06:16:11 UTC, SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`); all six review threads are resolved at latest inspection. Prior `IN_REVIEW`, `NOT_GRANTED` and open-thread statements in the timestamped older registry entries below are **historical**, not current. Current work is the separate [documentation-only reconciliation task](../tasks/governance/post-merge-reconciliation-20261119.md); no merge permission for its new PR.

**Policy:** Registration is evidence-based and task-specific; it is not an authorization list. Unknown agents and unverified historical work remain `UNKNOWN_NOT_VERIFIED`. No prior agent sessions are reconstructed from Git authors.

> **Latest verified continuation 2026-11-18T20:19:48Z UTC (before checkpoint commit):** [TM-GOV-20261118-001 P2 and GitHub integration](../tasks/governance/ai-context-setup.md#governance-p2-and-github-automation-checkpoint) is **IN_REVIEW**, observed pre-checkpoint HEAD `90998568566bad7264e146e87451af8caedaaaa6`, **5 open review threads**, no independent passing re-review or owner merge approval. The row below is **historical kickoff state**, not live status.

| Task | Working agent | Model (if actually exposed) | Previous verified agent | Evidence | Snapshot status |
|---|---|---|---|---|---|
| [TM-GOV-20261118-001](../tasks/governance/ai-context-setup.md) | ChatGPT / connected GitHub session | GPT-6 | `UNKNOWN_NOT_VERIFIED` | Owner-requested governance work, branch and checkpoint recorded in linked task | Active at initial 2026-11-18 inspection |

**Not registered as an agent:** Phase 0 PR #1 author, Git commit author, repository owner and reviewers; none establishes the AI model or agent that performed the work.

When task ownership transfers, update the individual task with the actual current/previous agent relationship and verifiable timestamp; do not silently rewrite this historical snapshot.

## Latest verified continuation — 2026-11-18T18:48:44Z UTC

| Task | Working agent | Exposed model | Previous verified checkpoint agent | Review/decision provenance |
|---|---|---|---|---|
| [TM-GOV-20261118-001](../tasks/governance/ai-context-setup.md#v2-stage-b-checkpoint) | ChatGPT with GitHub tools | GPT-6 | ChatGPT (GPT-6) at 2026-11-18T17:21:19Z; earlier history unknown | [RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549), [owner Stage B chat approval (agent-transcribed)](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987125950), [optional implementation signoff policy](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176), [strict no co-authors](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987814777); **IN_REVIEW, merge approval absent** |

Do not infer actual agent/model from authenticated Git author or `Co-authored-by:` (strictly prohibited) trailers. Owner merge consent is separate and must be verified at the time of merge, never assumed from a current index.

## Latest verified working checkpoint — 2026-11-18T20:19:48Z UTC

| Task | Working agent and model | Previous verified working agent | Exact source and pending decision |
|---|---|---|---|
| [TM-GOV-20261118-001](../tasks/governance/ai-context-setup.md#governance-p2-and-github-automation-checkpoint) | ChatGPT using connected GitHub tools (GPT-6) | ChatGPT (GPT-6), previous verified V2 checkpoint `2026-11-18T18:48:44Z` | [P2 RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6989114060), [GitHub integration RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6989498878), [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2). `IN_REVIEW` with 5 unresolved threads. **Owner merge approval NOT GRANTED**. |

GitHub commit/PR author is a separate source of metadata, never proof of agent identity. No `Co-authored-by:` trailers are permitted. Do not rewrite prior registry snapshots or infer a successful CI/review from this note.

## Latest observed CI-backed handoff — 2026-11-18T20:28:18Z UTC

[TM-GOV-20261118-001](../tasks/governance/ai-context-setup.md#ci-validation-follow-up--2026-11-18) · Current working agent **ChatGPT (GPT-6)** · Previous verified agent **ChatGPT (GPT-6)** · pre-checkpoint SHA `821300cb62c435ec11457b3b1cc0318c72c0690c` · [actual GitHub workflow SUCCESS](https://github.com/im-tnyx/Tio-Money/actions/runs/44391147124) (24/24 tests, full-checkout Markdown links, 17 actual commits without co-author trailers) · **IN_REVIEW** (five unresolved threads, independent re-review pending) · **Owner merge approval NOT GRANTED**. Verify live state before assigning a next agent or editing.

## 2026-11-19 — Owner policy and safe-merge continuation

**Observed before checkpoint commit at 2026-11-19T05:34:43.459Z:** current working ChatGPT (GPT-6); previous verified agent ChatGPT (GPT-6) at 2026-11-18's CI checkpoint; earlier unknown. [Task and owner policy checkpoint](../tasks/governance/ai-context-setup.md#owner-review-and-agent-merge-policy--2026-11-19) records base `main`, branch `chore/ai-context-governance`, pre-checkpoint HEAD `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7`, 29-test/Markdown/20-message [actual CI SUCCESS](https://github.com/im-tnyx/Tio-Money/actions/runs/44465777121), all six unresolved review threads and next safe action. [TM-DEC-002](../../docs/DECISIONS.md#tm-dec-002--independent-review-optional-by-default) and [TM-DEC-003](../../docs/DECISIONS.md#tm-dec-003--owner-authorized-agent-merge) govern future tasks. **No owner merge authorization for PR #2 has been granted**. Never infer agent identity or owner authorization from Git author metadata or an agent-authored comment.

## Verified governance terminal handoff — 2026-11-19

| Task | Working agent / model | Prior verified agent | Actual source and terminal state |
|---|---|---|---|
| [TM-GOV-20261118-001](../tasks/governance/ai-context-setup.md#verified-post-merge-reconciliation--2026-11-19) | Earlier governance session: ChatGPT (GPT-6), from explicit recorded task checkpoints | ChatGPT (GPT-6), previously verified governance checkpoint; earlier history `UNKNOWN_NOT_VERIFIED` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) **MERGED** 2026-11-19 06:16:11 UTC; GitHub actual merge SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`; **6/6 review threads resolved** when inspected. [29/29-governance-test CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44466151813) passed on the source PR head. Task **COMPLETED**, **not archived**; do not confuse prior `COMMENTED` with `APPROVED`. |
| [TM-GOV-CLEANUP-20261119-001](../tasks/governance/post-merge-reconciliation-20261119.md) | Current ChatGPT / connected GitHub tools (GPT-6) | Previously verified governance session ChatGPT (GPT-6) | [Issue #6 RFC / technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/6), new docs-only branch `docs/governance-post-merge-reconciliation-20261119`; **IN_REVIEW** on [PR #7 — Ready for review](https://github.com/im-tnyx/Tio-Money/pull/7), independent review **DEFERRED**; owner-merge permission **NOT_GRANTED**. Review/test/merge outcomes must be recorded from actual new-head evidence, not inferred. |

**Identity boundary:** GitHub account `im-tnyx`, PR author, reviewer, owner, authenticated committer and AI model/working agent are **distinct roles**. No `Co-authored-by:` trailer or historical Git author should be used to invent agent identity. This register records current verified **status**, but live GitHub remains authoritative and future updates should be appended without deleting prior checkpoints.

## 2026-11-22 — Verified EAS security PR #60 terminal handoff

| Task | Working agent / model | Previous verified scoped agent | Verified outcome / next agent task |
| --- | --- | --- | --- |
| [TM-SEC-EAS-20261122-001](../tasks/security/eas-cli-transitive-security-20261122.md#verified-pr-60-merge-terminal--2026-11-22-ist) | ChatGPT via GitHub connected session (GPT-6) | ChatGPT (GPT-6), earlier issue/task recorded checkpoints; origin before these `UNKNOWN_NOT_VERIFIED` | [PR #60](https://github.com/im-tnyx/Tio-Money/pull/60) **MERGED** via non-force squash at 2026-11-21T22:35:30Z; actual merge SHA **`3c6cfac26ddf822dd4a9d087a4fa073c5bc6042b`**, separately verified equals `main` HEAD. Owner's renewed explicit merge instruction and Low risk acceptance recorded in [Issue #59](https://github.com/im-tnyx/Tio-Money/issues/59#issuecomment-7070298079). Before merge: exact-head 3/3 checks SUCCESS, no unresolved review threads, no protections bypass. **2 Low npm entries** (one diff GHSA + parent) still need compatible remediation. Android+iPhone no-QR physical device recheck via existing Actions is **UNVERIFIED/PENDING**, not assumed PASS. Independent Codex review was UNAVAILABLE due quota, no fabricated approval. Next agent must first reverify live `main`, then monitor rescan, coordinate device QA and handle Low finding in a separate bounded RFC/branch. Task implementation MERGED; follow-ups open. |

Only this task-specific verified terminal state is asserted; earlier registry entries above remain historical. This agent registry update is in a **separate post-merge docs-only branch**, not an authorized modification of protected main or permission to merge that documentation PR.

## 2026-11-22 — Security baseline PR #58 verified terminal

| Task / RFC | Current agent and model | Prior verified scoped agent | Exact verification and next task |
| --- | --- | --- | --- |
| [Security baseline Issue #57](https://github.com/im-tnyx/Tio-Money/issues/57) | ChatGPT using GitHub connected tools (GPT-6) | ChatGPT (GPT-6) from PR #58 reconciliation checkpoint; earlier origins `UNKNOWN_NOT_VERIFIED` | [PR #58](https://github.com/im-tnyx/Tio-Money/pull/58) **MERGED** via GitHub non-force squash on 2026-11-21T22:50:06Z; independently verified actual merge commit **`7d595bf334a2fd81c4e9e220fda00226c38d6305`** equals `main` HEAD. Owner explicitly authorized “Go to merge 58”; pre-merge 3/3 exact-head checks PASS, 0 unresolved threads, no bypass. Bounded root npm/GitHub Actions weekly Dependabot version proposals only; **no auto-merge**, security setting, scan or credential changes. CodeQL/Dependabot alerts/legacy branch settings remain **UNVERIFIED** (admin-only follow-up), and one post-merge Dependabot job remained IN_PROGRESS at last check. Next agent must confirm live `main` and Dependabot runs, evaluate bot proposals under separate review, and seek owner-specific permission before future admin setting changes or another PR merge. |

This terminal entry supplements rather than rewrites older, date-scoped records. It is staged in a separate documentation PR; no implicit merge permission for that PR or PR #53.

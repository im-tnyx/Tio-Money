# 🧭 Current task index

> **Latest live snapshot 2026-11-18T20:19:48Z UTC (before this checkpoint commit).** Compare with live GitHub branch and PR state before any subsequent edit. This multi-task index is **not an agent lock** and cannot itself establish merge status or test success. Older V2 checkpoint remains preserved in the task history.

| Task | Task file | Working branch | PR at snapshot | Verified owner / current agent | Status | Last verified checkpoint | Next safe action |
|---|---|---|---|---|---|---|---|
| `TM-GOV-20261118-001` | [AI governance](tasks/governance/ai-context-setup.md) · [latest P2 and GitHub checkpoint](tasks/governance/ai-context-setup.md#governance-p2-and-github-automation-checkpoint) | `chore/ai-context-governance` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) — open/unmerged | ChatGPT (GPT-6); prior verified checkpoint ChatGPT (GPT-6) | **IN_REVIEW** — two P2 remediations + GitHub governance submitted; 5 reviewer threads OPEN, independent re-review required, owner merge approval absent | `2026-11-18T20:19:48Z` UTC; pre-checkpoint HEAD `90998568566bad7264e146e87451af8caedaaaa6` | Reply to all 5 threads with fix/test evidence; independent review of current HEAD; **separate owner merge approval required**; do not merge |

## Parallel work discovered (not this task's ownership)

| Repository work | Live state at inspection | Authorship / agent evidence | Forbidden action |
|---|---|---|---|
| [Phase 0 Expo PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) on `feat/phase-0-expo-foundation` | **Open draft**, not merged; observed head `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` | Working agent/model `UNKNOWN_NOT_VERIFIED`; PR author is not proof of model; some CI claimed in PR body but not independently rerun here | Do not edit its branch, change app code, merge or rewrite history |

**Latest owner policy:** [Governance V2 RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) requires **documented technical discussion and a proceed decision**, but [owner implementation signoff is optional for ordinary scoped work](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176). **Explicit owner merge approval is mandatory** for every PR. [Strict commit attribution](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987814777): **zero `Co-authored-by:` trailers**, including any agent credits; keep AI provenance in task records. These comments transcribe owner chat decisions; they are not owner-authored GitHub comments. No merge permission granted.

**Latest validation snapshot at `90998568566bad7264e146e87451af8caedaaaa6`:** Python 3.13.5 `unittest` **24/24 PASS**, `py_compile` PASS; exact GitHub blob match for tested helper/tests; 5 Issue Forms and governance workflow local YAML schema/structural PASS (PyYAML 6.0.3, not a repo dependency); GitHub read of 34 Markdown files, 359 supported relative targets, 0 missing; 32 Mermaid blocks structurally inspected. All PR commit messages audited through GitHub, **0 co-author trailers**. A real GitHub Actions run, full local repo CLI check and independent re-review were **NOT** verified. New checkpoint commit advances HEAD; recheck live state.

**Coordination:** Only the governance task above is assigned to this session. Treat Phase 0 as a separate, concurrently changing PR; its test and device-validation status must be checked from the PR/checks, never inferred from the index.

**Before the next write:** fetch live `main`, both branch HEADs, both PR states and changed paths. If these conflict with this snapshot, update the task evidence rather than silently assuming continuity.

[Agent contract](../AGENTS.md) · [Task protocol](tasks/README.md) · [Decisions](../docs/DECISIONS.md)

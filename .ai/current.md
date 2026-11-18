# 🧭 Current task index

> **Snapshot verified 2026-11-18T17:21:19Z (before the checkpoint commit).** Each entry must be compared with live GitHub branch and PR state before an edit. This file is **not an agent lock** and cannot establish a merged PR or a passed test.

| Task | Task file | Working branch | PR at snapshot | Verified owner / current agent | Status | Last verified checkpoint | Next safe action |
|---|---|---|---|---|---|---|---|
| `TM-GOV-20261118-001` | [AI governance](tasks/governance/ai-context-setup.md) | `chore/ai-context-governance` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) — open, not merged | ChatGPT (GPT-6), verified current session only | **Review** | `2026-11-18T17:21:19Z`; pre-checkpoint HEAD `e767387869abf4294f562e8460fa439be30689db` | Owner reviews PR #2; keep unmerged; revalidate HEAD/checks before any subsequent change |

## Parallel work discovered (not this task's ownership)

| Repository work | Live state at inspection | Authorship / agent evidence | Forbidden action |
|---|---|---|---|
| [Phase 0 Expo PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) on `feat/phase-0-expo-foundation` | **Open draft**, not merged; observed head `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` | Working agent/model `UNKNOWN_NOT_VERIFIED`; PR author is not proof of model; some CI claimed in PR body but not independently rerun here | Do not edit its branch, change app code, merge or rewrite history |

**Coordination:** Only the governance task above is assigned to this session. Treat Phase 0 as a separate, concurrently changing PR; its test and device-validation status must be checked from the PR/checks, never inferred from the index.

**Before the next write:** fetch live `main`, both branch HEADs, both PR states and changed paths. If these conflict with this snapshot, update the task evidence rather than silently assuming continuity.

[Agent contract](../AGENTS.md) · [Task protocol](tasks/README.md) · [Decisions](../docs/DECISIONS.md)

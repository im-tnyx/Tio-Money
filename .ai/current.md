# 🧭 Current task index

> **Latest live snapshot 2026-11-18T18:48:44Z UTC (before this checkpoint commit).** Compare with live GitHub branch and PR state before any subsequent edit. This multi-task index is **not an agent lock** and cannot itself establish merge status or test success. Historical checkpoints remain in the linked task.

| Task | Task file | Working branch | PR at snapshot | Verified owner / current agent | Status | Last verified checkpoint | Next safe action |
|---|---|---|---|---|---|---|---|
| `TM-GOV-20261118-001` | [AI governance](tasks/governance/ai-context-setup.md) · [latest V2 checkpoint](tasks/governance/ai-context-setup.md#v2-stage-b-checkpoint) | `chore/ai-context-governance` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) — open, unmerged | ChatGPT (GPT-6), observed working session; prior verified checkpoint also ChatGPT (GPT-6) | **IN_REVIEW** — 3 Copilot findings awaiting re-review, owner merge permission missing | `2026-11-18T18:48:44Z` UTC; pre-checkpoint head `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75` | Respond to remaining review thread, obtain independent re-review of actual new HEAD, then **separate explicit owner merge approval**; never merge automatically |

## Parallel work discovered (not this task's ownership)

| Repository work | Live state at inspection | Authorship / agent evidence | Forbidden action |
|---|---|---|---|
| [Phase 0 Expo PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) on `feat/phase-0-expo-foundation` | **Open draft**, not merged; observed head `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` | Working agent/model `UNKNOWN_NOT_VERIFIED`; PR author is not proof of model; some CI claimed in PR body but not independently rerun here | Do not edit its branch, change app code, merge or rewrite history |

**Latest owner policy:** [Governance V2 RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) requires **documented technical discussion and a proceed decision**, but [owner implementation signoff is optional for ordinary scoped work](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176). **Explicit owner merge approval is mandatory** for every PR. [Strict commit attribution](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987814777): **zero `Co-authored-by:` trailers**, including any agent credits; keep AI provenance in task records. These comments transcribe owner chat decisions; they are not owner-authored GitHub comments. No merge permission granted.

**Validation snapshot:** Python 3.13.5 `unittest` 9/9 PASS; `py_compile` PASS; GitHub blob SHA matches tested helper/tests; 29 Markdown docs, 313 relative link targets, zero missing paths; 32 Mermaid blocks passed structural checks (renderer NOT run). Remote PR #2's 8 original commits inspected at `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75`: zero forbidden co-author trailers. New checkpoint commit will advance HEAD; reverify.

**Coordination:** Only the governance task above is assigned to this session. Treat Phase 0 as a separate, concurrently changing PR; its test and device-validation status must be checked from the PR/checks, never inferred from the index.

**Before the next write:** fetch live `main`, both branch HEADs, both PR states and changed paths. If these conflict with this snapshot, update the task evidence rather than silently assuming continuity.

[Agent contract](../AGENTS.md) · [Task protocol](tasks/README.md) · [Decisions](../docs/DECISIONS.md)

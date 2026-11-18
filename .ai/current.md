# 🧭 Current task index

> **Latest verified snapshot 2026-11-18T20:28:18Z UTC (before this checkpoint commit).** Compare with live GitHub branch and PR state before any subsequent edit. This multi-task index is **not an agent lock** and cannot itself establish merge status or test success. Older V2 checkpoint remains preserved in the task history.

| Task | Task file | Working branch | PR at snapshot | Verified owner / current agent | Status | Last verified checkpoint | Next safe action |
|---|---|---|---|---|---|---|---|
| `TM-GOV-20261118-001` | [Governance task](tasks/governance/ai-context-setup.md) · [latest CI follow-up](tasks/governance/ai-context-setup.md#ci-validation-follow-up--2026-11-18) | `chore/ai-context-governance` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) — open/unmerged | ChatGPT (GPT-6), previous verified agent ChatGPT (GPT-6) | **IN_REVIEW** — five reviewer threads open, independent re-review pending; owner merge permission NOT GRANTED | `2026-11-18T20:28:18Z` UTC, pre-checkpoint HEAD `821300cb62c435ec11457b3b1cc0318c72c0690c` | [Real governance CI PASS](https://github.com/im-tnyx/Tio-Money/actions/runs/44391147124) 24/24, links and 17-commit attribution; re-check new head/CI and request independent review; **do not merge** |

## Parallel work discovered (not this task's ownership)

| Repository work | Live state at inspection | Authorship / agent evidence | Forbidden action |
|---|---|---|---|
| [Phase 0 Expo PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) on `feat/phase-0-expo-foundation` | **Open draft**, not merged; observed head `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` | Working agent/model `UNKNOWN_NOT_VERIFIED`; PR author is not proof of model; some CI claimed in PR body but not independently rerun here | Do not edit its branch, change app code, merge or rewrite history |

**Latest owner policy:** [Governance V2 RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) requires **documented technical discussion and a proceed decision**, but [owner implementation signoff is optional for ordinary scoped work](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176). **Explicit owner merge approval is mandatory** for every PR. [Strict commit attribution](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987814777): **zero `Co-authored-by:` trailers**, including any agent credits; keep AI provenance in task records. These comments transcribe owner chat decisions; they are not owner-authored GitHub comments. No merge permission granted.

**Latest verification at pre-checkpoint HEAD `821300cb62c435ec11457b3b1cc0318c72c0690c`:** [GitHub Actions run #44391147124](https://github.com/im-tnyx/Tio-Money/actions/runs/44391147124) **SUCCESS**: Python syntax, 24/24 governance tests, supported Markdown `check-links` on actual PR checkout, 17 commit messages with 0 co-author trailers. An earlier [failed run](https://github.com/im-tnyx/Tio-Money/actions/runs/44390365810) exposed incorrectly escaped Markdown examples and was corrected in commit `821300cb62c435ec11457b3b1cc0318c72c0690c`. Local Issue Form/workflow YAML checks PASS (PyYAML validation environment only); 34 Markdown docs / 359 structural target checks / 32 Mermaid blocks; full renderer, independent review and branch protection still NOT verified. This checkpoint commit will advance HEAD and require a fresh CI lookup.

**Coordination:** Only the governance task above is assigned to this session. Treat Phase 0 as a separate, concurrently changing PR; its test and device-validation status must be checked from the PR/checks, never inferred from the index.

**Before the next write:** fetch live `main`, both branch HEADs, both PR states and changed paths. If these conflict with this snapshot, update the task evidence rather than silently assuming continuity.

[Agent contract](../AGENTS.md) · [Task protocol](tasks/README.md) · [Decisions](../docs/DECISIONS.md)

# 🪪 Verified agent registry

**Policy:** Registration is evidence-based and task-specific; it is not an authorization list. Unknown agents and unverified historical work remain `UNKNOWN_NOT_VERIFIED`. No prior agent sessions are reconstructed from Git authors.

> **Current verified status (2026-11-18T18:48:44Z UTC, before checkpoint commit):** [TM-GOV-20261118-001 V2 Stage B checkpoint](../tasks/governance/ai-context-setup.md#v2-stage-b-checkpoint) records **IN_REVIEW**, previously observed branch HEAD `206d7e9a01f3d5caf1abbfbaab64e6f6a63a3d75`, 3 open Copilot threads and no owner merge approval. The row below is **historical kickoff state**, not live status.

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

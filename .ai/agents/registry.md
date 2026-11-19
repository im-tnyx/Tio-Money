# 🪪 Verified agent registry

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

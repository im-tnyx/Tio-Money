# 👥 Agent identities and handoff provenance

**Strict attribution:** Never write a Git `Co-authored-by:` trailer for Claude/Opus, Codex, Cursor, ChatGPT, any AI agent **or anyone else**. All such trailers are prohibited; preserve authentic Git author metadata and keep verified working-agent attribution only in task checkpoints. [Commit-message checker](../../scripts/ai_context.py) is a local governance check, not GitHub branch protection.

An agent is **not** a Git commit author, PR author, reviewer, or repository owner. Model identity is only the actual exposed model, otherwise `UNKNOWN_NOT_VERIFIED`; never reconstruct working agent identity from a commit author, bot or PR username.

**Resume order:** [AGENTS](../../AGENTS.md) → [current tasks](../current.md) → one scoped [task](../tasks/README.md) → its durable [RFC and owner decision](../discussions/README.md) → relevant core summaries → actual source and live GitHub PR. Verify reviewed/inspected commit SHA, implementation scope and latest checkpoint before taking ownership. Agent replacement does not require rewriting history.

Every **new** working session appends a timestamped checkpoint with task ID, current agent/model, previous **verified** agent, branch/base/HEAD, discussion and owner approval references, exact changed paths, tests and results, review findings, unfinished work, risks and exact safe action. If the previous agent is unknown, record `UNKNOWN_NOT_VERIFIED`, not a guessed historical model.

The [registry](registry.md) links task-specific verified snapshots, **not** permissions. No private data, OTPs, chat transcripts or fictitious past sessions. A branch's existence or a commit's signature is not authorization.

[Task template](../tasks/TEMPLATE.md) · [Discussion template](../discussions/TEMPLATE.md).

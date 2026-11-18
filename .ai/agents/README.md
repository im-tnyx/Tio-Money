# 👥 Agent identities and handoff provenance

`agents/` is a **protocol/registry**, not automated model detection or a source of historical certainty.

Distinguish **current working agent, previous verified working agent, actual model, Git commit author, PR author, reviewer, and repository owner**. These can all be different identities. Never infer an agent or model from commit email, bot label, PR author or a previous chat.

For each actual task session, record the stable task ID, agent/tool, known model or `UNKNOWN_NOT_VERIFIED`, previous verified agent, UTC start/checkpoint, repository, working branch, base and observed HEAD SHA, exact changed paths, test results, PR and one next action in that [task file](../tasks/TEMPLATE.md).

The optional [registry](registry.md) links only **verified present sessions** to their task records. Do not manufacture historical agents, future assignments or a permanent identity based on a temporary tool account. New agents must recheck GitHub and source.

[Root contract](../../AGENTS.md) · [Current tasks](../current.md).

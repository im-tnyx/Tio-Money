# RFC — TM-TASK-ID — [title]

> **Template only: not permission to implement, merge or deploy.** Link this document to a persistent GitHub Issue/Discussion or existing PR and a [scoped task](../tasks/TEMPLATE.md). Do not duplicate a full PR thread here.

| Field | Evidence |
|---|---|
| Task ID and title | Stable unique identifier |
| Source requirement | Owner request + date/reference |
| Discussion URL | Persistent Issue/Discussion/PR |
| Participants and roles | Names/tools actually verified; agent vs owner separate |
| Existing behavior / limitation | Verified code, docs, branch/PR state |
| Proposed user behavior | Expected flows and affected screens/states |
| Related canonical docs | [PRD](../../docs/product/PRD.md), [architecture](../../docs/architecture/TECH-ARCHITECTURE.md), [ledger](../../docs/architecture/DATABASE-DESIGN.md), relevant exact paths |
| Implementation status | Discussion + documented proceed decision required; owner implementation signoff optional |
| Proceed decision | `PROCEED` with decision maker, source, date, scope and conditions; not necessarily an owner approval |
| Optional owner implementation approval | Direct owner source/date/scope when given; otherwise `NOT_REQUIRED` for ordinary scope |
| Merge authorization | Separate later owner instruction naming repo, PR, explicit merge permission and conditions; authorized agent may execute after preflight |
| Independent review | Optional by default; `PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED` with reason/source and actual evidence if performed |

## Product and end-to-end flow
- Problem, why necessary, user intent, explicit non-goals:
- Entry actions, screens/routes, states, API inputs and outputs:
- Error cases, recovery, data validation, import candidate/deduplication cases if relevant:

## Architecture and feature ownership
- Proposed owner module and **public** API; private implementation boundaries:
- Reused interfaces, new dependencies and feature tests:
- Shared financial ledger/domain/SQLite effect and circular dependency risk:
- Alternatives and trade-offs (at least one meaningful alternative when applicable):

## Threat, privacy and platform policy review
- Actual applicable sensitive data exposure/retention/logging or telemetry risks:
- Authentication/permission/OS/store constraints, if relevant:
- Supply chain, native permissions, rollback/restore and mitigations:
- If not applicable, say why instead of adding decorative checklists:

## Acceptance, risk and decision
- Testable success criteria and planned test commands/platforms:
- Rollback or recovery method; residual risks:
- Open decisions/questions for owner:
- Canonical decision or accepted ADR URL (do not duplicate text):
- Recorded decision: `PROCEED / APPROVED_FOR_IMPLEMENTATION (optional owner signoff) / CHANGES_REQUESTED / DEFERRED / REJECTED / BLOCKED_PENDING_DECISION`
- Decision source, date, scope and conditions:
- Agent transcription vs direct owner action:
- Task link / implementation branch / PR (only after verified):
- Explicit note: **owner implementation signoff and independent review are optional by default** (review strongly recommended for sensitive work). Known blockers and configured required reviews/checks remain mandatory. **Owner merge authorization is always separate**, and agent execution is allowed only with specific instruction and verified preflight. This template grants no such authority.

[Discussion guide](README.md) · [Agent contract](../../AGENTS.md)

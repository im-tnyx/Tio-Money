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
| Related canonical docs | [PRD](../../docs/01-PRD.md), [architecture](../../docs/05-TECH-ARCHITECTURE.md), [ledger](../../docs/04-DATABASE-DESIGN.md), relevant exact paths |
| Implementation status | `BLOCKED_PENDING_DECISION` until owner decision recorded |
| Implementation approval | Direct owner source, date, precise scope and conditions (or none) |
| Merge approval | **Separate later decision**, never inherited |

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
- Recorded decision: `APPROVED_FOR_IMPLEMENTATION / CHANGES_REQUESTED / DEFERRED / REJECTED / BLOCKED_PENDING_DECISION`
- Decision source, date, scope and conditions:
- Agent transcription vs direct owner action:
- Task link / implementation branch / PR (only after verified):
- Explicit note: **implementation approval is not merge approval**.

[Discussion guide](README.md) · [Agent contract](../../AGENTS.md)

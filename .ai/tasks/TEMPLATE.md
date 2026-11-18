# TM-TASK-ID — [descriptive scoped task title]

> **Template only. Not permission to implement/merge/deploy.** When copying to a nested `.ai/tasks/<area>/` path, **rebase all relative links** using [task creation guidance](README.md) / [helper](../../scripts/ai_context.py); this template's links are relative to `.ai/tasks/`.

## Task identity, decision and lifecycle

| Required field | Verified value |
|---|---|
| Task ID | `TM-...` (stable unique ID) |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle state | `PROPOSED / DISCUSSION / DECISION_PENDING / APPROVED / ASSIGNED / IN_PROGRESS / VALIDATING / IN_REVIEW / COMPLETED / ARCHIVED / BLOCKED / DEFERRED / CANCELLED / CHANGES_REQUESTED` |
| RFC / discussion | Persistent GitHub Issue/Discussion/existing PR URL |
| Implementation decision | `APPROVED_FOR_IMPLEMENTATION / CHANGES_REQUESTED / DEFERRED / REJECTED / BLOCKED_PENDING_DECISION` |
| Approval evidence | Exact owner statement/source, date, scope, conditions; mark agent-transcribed vs direct |
| Current agent | Self-identified working agent/tool or `UNKNOWN_NOT_VERIFIED` |
| Model | Actually exposed model or `UNKNOWN_NOT_VERIFIED` |
| Previous verified agent | Actual prior working agent or `UNKNOWN_NOT_VERIFIED` |
| Git commit author / PR author | Observed separately, not proof of agent/model |
| Reviewer / owner | Verified separately, not interchangeable with agent |
| Working branch | Live verified branch |
| Base / inspected HEAD | Immutable actual SHAs; snapshot time |
| Started at / last checkpoint (UTC) | Actual ISO 8601 UTC timestamps or `UNKNOWN_NOT_VERIFIED` |
| Authorized scope | Exact behavior, file paths, exclusions, decision source |
| PR | Verified URL, or Not opened |
| Next agent | Verified assignee or Unassigned |

## Mandatory discussion and architecture contract

- Request/problem, expected user behavior and explicit non-goals:
- [RFC template](../discussions/TEMPLATE.md) / actual discussion URL:
- Product flow, errors and failure cases:
- Module ownership, public/private interfaces, architecture contracts, reuse and dependencies:
- Security/privacy, applicable platform policies, alternatives, risks and rollback:
- Acceptance tests **defined before coding**:
- Canonical owner decision / [decision register](../../docs/DECISIONS.md) / conditions:
- Implementation approval gate: only move from `DECISION_PENDING` to `APPROVED` after a valid explicit owner decision.
- Independent merge approval: **not granted** unless later explicitly recorded.

## Scope, ownership and integration

- Read required [core summaries](../core/README.md), [docs hub](../../docs/00-INDEX.md), relevant actual source and live PRs on demand.
- Allowed file paths:
- Excluded files/business rules:
- Parallel PR/agent overlaps:
- Defined feature-specific tests and approved plan:
- Do not infer previous agent from Git history.

## Immutable session checkpoints — append, do not rewrite prior history

### [ISO-8601 UTC] — [actual agent/model or UNKNOWN_NOT_VERIFIED]

- **Prior verified agent:**
- **Discussion / owner implementation approval reference:**
- **Base / HEAD inspected / current branch / PR:**
- **Requested, completed and verified work:**
- **Attempted but failed:**
- **Exact changed files:**
- **Test commands, executed environment, observed results and tested SHA:**
- **Checks not run / limitations:**
- **Independent reviewer, reviewed SHA, finding severity and open threads:**
- **Owner merge approval (separate) and conditions:**
- **Remaining work, blockers and risk:**
- **What next agent must not change:**
- **Next agent should read first:**
- **Exact next safe action:**

## Independent review and terminal archive gate

- Reviewer identity + link, review type `APPROVED` / `COMMENTED` / independent analysis:
- Actual inspected commit and findings severity:
- Fix SHA and evidence, unresolved review threads, re-review after material changes:
- Required versus optional CI; scanner/service limits distinguished from app findings:
- Explicit owner **merge** decision and evidence:
- Verified merge/terminal status/resulting SHA and residual risks:
- Archive only after terminal state verified and all incoming/outgoing Markdown links repaired.

[Task guide](README.md) · [Root agent contract](../../AGENTS.md) · [Discussions](../discussions/README.md)

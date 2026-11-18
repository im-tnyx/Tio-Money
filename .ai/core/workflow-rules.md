# 🔄 Discussion-first task, review and agent handoff workflow

**Canonical:** [Root agent contract](../../AGENTS.md) · [RFC guide](../discussions/README.md) · [Task state machine](../tasks/README.md) · [Task template](../tasks/TEMPLATE.md) · [Current multi-task index](../current.md).

```mermaid
flowchart LR
  A["Owner requirement"] --> B["Inspect repo and context"]
  B --> C["Technical RFC: architecture, threat, policy, tests"]
  C --> D{"Documented PROCEED decision?"}
  D -->|No| C
  D -->|Yes| E["Finalize task, assignee and branch"]
  E --> F["Implement only bounded scope"]
  F --> G["Validate at SHA, independent review"]
  G --> H{"Owner separately approves merge?"}
  H -->|No| G
  H -->|Yes| I["Verify terminal outcome, archive and handoff"]
```

1. Read `AGENTS.md`, `.ai/current.md`, assigned task and **linked durable RFC/decisions**; inspect live repo/branch/PR and actual source. No blanket task creation or code writes merely because a plan exists.
2. Record product purpose, error paths, module ownership, dependency directions, applicable security/OS policy, alternatives/trade-offs, testable acceptance, rollback and outstanding decisions in GitHub Issue/Discussion/existing PR. Use [discussion template](../discussions/TEMPLATE.md).
3. No `IN_PROGRESS` until the durable RFC contains a documented decision to **PROCEED** with date, source, scope and conditions, and confirmed agent/feature ownership, branch, non-goals and tests. **Owner implementation signoff is optional**, but unresolved material restricted-operation risks block progress. New scope/risk returns to discussion; routine bounded subtasks may continue.
4. Work only on the verified, scoped feature branch after the documented proceed decision. No direct `main` commits, editing concurrent PR branches, unapproved schema/permissions/security changes, force-push or automatic merge.
5. Record exact commands/results, tested SHA, independent reviewer, review type/verdict/severity and outstanding threads. `COMMENTED` is not formal approval; reviewer outage/quota failure is `INCONCLUSIVE`, not code failure or review pass. Re-review after material changes.
6. Require **distinct express owner merge permission** before merge. After verified terminal outcome, move to archive only with [link repair](../archive/README.md), provenance/risks and `.ai/current.md` index reconciliation.
7. Before PR/merge review, inspect the actual commit message range and **reject every `Co-authored-by:` trailer** (Claude, Codex, Cursor, ChatGPT or any contributor). Use `python3 scripts/ai_context.py check-commits --base <base> --head <head>` in a real local Git checkout. Never spoof commit author; agent/model attribution belongs **only** in task provenance. This is documented/tool-checked, not an active GitHub CI gate.
8. Append handoff checkpoints; current/previous verified working agents, Git commit author, PR author, reviewer and owner remain distinct. Do not overwrite old records or infer model from commit metadata.

No template checkbox or Python helper verifies the owner's identity, reviews or GitHub status by itself. Concurrency requires live source verification on every shared-file write. Product/language/financial contracts remain under their canonical owner documents.

# 🗣️ Mandatory technical discussion and RFC router

> **Discussion is a required entry gate.** Every substantive task needs a durable RFC and documented decision to proceed before implementation. **Explicit owner implementation approval is optional**; material restricted-operation decisions still need their applicable authority. **Owner merge approval is always mandatory.**

[Root agent contract](../../AGENTS.md) · [Task lifecycle](../tasks/README.md) · [RFC template](TEMPLATE.md) · [Owner decisions](../../docs/DECISIONS.md)

## Discussion-first procedure

1. Verify live repo, requested behavior, current/parallel task ownership and source of truth.
2. Open one persistent, reviewable **GitHub Issue/Discussion** when supported, use an **existing PR discussion** for an active PR (including governance PR #2), or link a focused RFC document. Do not assume GitHub Discussions is enabled.
3. Cover product purpose, UX/data flow, failure states, feature ports, dependencies, canonical ledger implications, applicable threats/store permissions, alternatives and trade-offs, recovery and acceptance tests. Avoid irrelevant security boilerplate.
4. Record unresolved questions and a **documented technical decision**: `PROCEED`, optional owner `APPROVED_FOR_IMPLEMENTATION`, `CHANGES_REQUESTED`, `DEFERRED`, `REJECTED` or `BLOCKED_PENDING_DECISION`. Include source/URL, decision maker, date, scoped change and conditions. `PROCEED` alone is not owner approval; no decision/unknown high-risk policy means no implementation.
5. A linked RFC plus documented `PROCEED` **or optional** owner `APPROVED_FOR_IMPLEMENTATION`, with scope, owner/agent assignment and verified branch, permits the [task state](../tasks/README.md) to advance where no unresolved restricted decision blocks work. **All PR merges require a separate explicit owner merge approval**, even with CI and review passing.
6. Link **one canonical decision register or accepted ADR** for enduring decisions. Do not mirror whole threads into `.ai/`; task checkpoint links the original RFC, decision and actual code/PR.
7. Renew discussion for new features, scope expansion, material architecture/security risk or changed business behavior. Routine subtasks within the previously documented proceed scope need no repeated owner implementation signoff.

## Scope of the current V2 update

The [V2 RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) and [owner chat authorization recorded on PR #2](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987125950) describe this governance-only bounded task. The latter is **agent-transcribed**, not a GitHub-owner-authored approval. Owner **merge approval remains pending**. The [later owner policy refinement](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987299176) makes owner implementation signoff optional for future ordinary tasks; it does not revoke this task's already-granted Stage B permission.

[Discussion template](TEMPLATE.md) · [Task template](../tasks/TEMPLATE.md)

# 🗣️ Mandatory technical discussion and RFC router

> **Discussion is a required entry gate**, not optional prose and not approval. Every substantial feature, UI change, dependency, migration, security/policy action or deployment must be discussed and **explicitly approved for implementation** before code or configuration changes.

[Root agent contract](../../AGENTS.md) · [Task lifecycle](../tasks/README.md) · [RFC template](TEMPLATE.md) · [Owner decisions](../../docs/DECISIONS.md)

## Discussion-first procedure

1. Verify live repo, requested behavior, current/parallel task ownership and source of truth.
2. Open one persistent, reviewable **GitHub Issue/Discussion** when supported, use an **existing PR discussion** for an active PR (including governance PR #2), or link a focused RFC document. Do not assume GitHub Discussions is enabled.
3. Cover product purpose, UX/data flow, failure states, feature ports, dependencies, canonical ledger implications, applicable threats/store permissions, alternatives and trade-offs, recovery and acceptance tests. Avoid irrelevant security boilerplate.
4. Record unresolved questions and a **separate owner implementation decision**: `APPROVED_FOR_IMPLEMENTATION`, `CHANGES_REQUESTED`, `DEFERRED`, `REJECTED`, or `BLOCKED_PENDING_DECISION`. Include exact source/URL, date, approved scope and conditions; mark agent transcription versus a direct owner GitHub post.
5. Only `APPROVED_FOR_IMPLEMENTATION` plus task/owner/branch/scope checks permits the [task state](../tasks/README.md) to advance to `ASSIGNED` / `IN_PROGRESS`. Explicit approval to implement **never** authorizes merge.
6. Link **one canonical decision register or accepted ADR** for enduring decisions. Do not mirror whole threads into `.ai/`; task checkpoint links the original RFC, decision and actual code/PR.
7. Renew discussion for new features, scope expansion, material architecture/security risk or changed business behavior. Routine subtasks within an already approved exact scope need no repeated approval.

## Scope of the current V2 update

The [V2 RFC](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6986950549) and [owner chat authorization recorded on PR #2](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-6987125950) describe this governance-only bounded task. The latter is **agent-transcribed**, not a GitHub-owner-authored approval. Owner **merge approval remains pending**.

[Discussion template](TEMPLATE.md) · [Task template](../tasks/TEMPLATE.md)

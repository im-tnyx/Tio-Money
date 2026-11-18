# 🗄 Verified task archive and link-safe relocation

An **open PR is not a completed task**. Archive only after externally verified terminal state (for merge tasks: actual PR merge, target SHA and explicit owner approval), preserving agent/checkpoint history and remaining known risks.

Moving `.ai/tasks/<area>/<slug>.md` to `.ai/archive/<year>/<slug>.md` changes how its **outbound relative links** resolve. Incoming links from `.ai/current.md`, `.ai/agents/registry.md`, `docs/DECISIONS.md` and any other Markdown files also need rewriting; changing the index alone is **insufficient**.

## Safe procedure

1. Confirm live repo/PR/owner terminal evidence and current working tree/branch scope; don't archive an open or blocked task.
2. Dry-run the stdlib helper from repo root:
   `python3 scripts/ai_context.py archive-task --task .ai/tasks/governance/example.md --year 2026`
3. Review intended incoming/outgoing link changes, collisions, historical timestamps and preserved anchors. After external verification, add `--apply --verified-terminal`. The flag is **self-attestation only** and never verifies GitHub/owner approval.
4. Validate relative targets: `python3 scripts/ai_context.py check-links` (optionally `--anchors` for conventional heading anchors); inspect `git diff` for unintended edits. Update `current.md`, task/registry *status text*, last SHAs and next action separately. Do **not** rewrite historical agent checkpoints.
5. If tooling is unavailable, manually rewrite each moved task's outgoing Markdown link relative to its **new directory**, find/update **all** inbound references to the old task path including registry/decisions/current, confirm each target and anchor, review the diff, then commit in an authorized branch.

The helper never changes task lifecycle status, approves merge, deletes branches or alters application code. It defaults to **dry-run**, validates files before writing, rejects symlinks and path collisions. Git history is the recovery mechanism after an I/O interruption; review/stage changes deliberately.

There are no archived governance tasks at the time of initialization; do not invent completed sessions.

[Agent contract](../../AGENTS.md) · [Task lifecycle](../tasks/README.md) · [Link helper](../../scripts/ai_context.py)

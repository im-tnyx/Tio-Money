# 🗄 Verified task archive and link-safe relocation

An **open PR is not a completed task**. Archive only after externally verified terminal state (for merge tasks: actual PR merge, target SHA and explicit owner approval), preserving agent/checkpoint history and remaining known risks.

Moving `.ai/tasks/<area>/<slug>.md` to `.ai/archive/<year>/<slug>.md` changes how its **outbound relative links** resolve. Incoming links from `.ai/current.md`, `.ai/agents/registry.md`, `docs/DECISIONS.md` and any other Markdown files also need rewriting; changing the index alone is **insufficient**.

## Supported reference-style Markdown links and fail-closed behavior

The Python helper supports inline \`[Task](file.md#anchor)\` and explicit reference-style \`[Task][ref]\` with single-line \`[ref]: relative.md#anchor\` definitions (including angle-bracket targets and supported titles). It rebases definitions when copying nested tasks and moving tasks to the archive, and also changes incoming definitions in other Markdown files. It checks definitions and conventional local Markdown anchors **before writing**.

Unsupported/ambiguous references, missing definitions or relative non-Markdown references inside a moved document cause a **fail-closed error**; do not manually force the source deletion. Fenced examples, remote URLs and unrelated links are left alone. Unsupported Markdown dialects/complex nested markup are **not** automatically verified. Archive writes stage temporary files and restore prior content on ordinary filesystem errors; multi-file operations are **not crash-atomic**, so review the Git diff and recover from version control if an interruption occurs.

For a GitHub-merged task, follow the [manual post-merge sync guide](../../.github/POST-MERGE-SYNC.md) before any tracked archival changes; verify the actual resulting merge SHA and clean worktree, not only an agent flag.

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

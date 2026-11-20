# Tio Money — verified post-merge sync (manual only)

**Source of truth:** [root agent contract](../AGENTS.md), [active task index](../.ai/current.md), [owner decision register](../docs/DECISIONS.md) and live GitHub PR. This is a **manual, authorization-gated procedure**: the preflight is for a specifically authorized agent before merging, and the sync steps are for after GitHub confirms MERGED. This document itself grants no merge, deployment or branch-settings permission. **Historical distinction:** This procedure itself did not authorize PR #2; the owner later gave separate PR-specific permission and GitHub verifies PR #2 **MERGED** at `04e6aa8d657627516b8ce7de91bd8304fdcbcf90` on 2026-11-19. Every **new** PR still requires its own separate owner authorization.

## Authorized agent merge preflight (before any merge)

**An agent may merge only after an explicit owner instruction** which identifies **repository, specific PR number, permission to merge and any conditions**. Authenticate the owner/source; an agent-authored PR summary is not owner authorization. Generic requests to implement, fix, review or open a PR do **not** authorize merging.

1. Verify authentic owner merge instruction, exact PR and any conditions. If unclear or absent, **STOP**.
2. Re-fetch live PR state, HEAD SHA and base. Confirm repository and target branch **`main`**.
3. Confirm all **configured required** GitHub checks, required reviews and protected-branch rules are satisfied. The default *optional independent review* policy does not override actual GitHub settings.
4. Check every **known unresolved blocking finding**. Do not merge with unresolved blocking high/medium findings.
5. Compare actual current diff/HEAD against owner-authorized scope and reviewed scope (when review was performed). **Material scope changes after authorization require renewed owner approval**; do not infer it from previous discussion.
6. Select only an owner- and GitHub-allowed **non-force merge method**. **Never enable auto-merge without separate explicit owner permission.**
7. Only the specifically authorized agent may then execute the merge. If an applicable check fails, protection blocks, permission is unclear or scope changed, **STOP and seek renewed permission**.
8. Verify GitHub reports actual `MERGED` state, timestamp, target branch and resulting `merge_commit_sha`. Record that SHA even for squash merges; do not claim success from invocation alone.
9. Follow the post-merge sync steps below. Update `.ai/current.md`, agent/handoff and archive only after the verified terminal outcome.

**Current status:** PR #2 is already merged; this historical preflight must **not** be construed as permission to merge PR #1 or any new PR.

## 1. Independently confirm the actual merge

Verify PR number, base `main`, state **MERGED** (not merely CLOSED), `merged_at`, actual `merge_commit_sha`, changed-file scope and owner authorization. Using an already authorized GitHub CLI session is optional:

```bash
gh pr view PR_NUMBER --repo im-tnyx/Tio-Money --json state,mergedAt,mergeCommit,baseRefName,headRefOid
```

Record the returned merge SHA in the task checkpoint. **Squash merge caveat:** original PR-head SHA normally differs from the commit added to `main`; do not use `git branch --contains PR_HEAD` as squash-merge proof. If merge status or SHA is unverified, stop here.

## 2. Inspect the exact local worktree and its owner

Use the correct repository checkout and confirm it is the worktree you are permitted to modify:

```bash
git rev-parse --show-toplevel
git remote -v
git status --short --branch
git branch --show-current
git worktree list
```

Check staged, modified **and untracked** files and other agent-owned worktrees. A nonempty status or a different agent's checkout means **stop and coordinate**. Never `git reset --hard`, `git clean`, force checkout, silently stash, delete worktrees or overwrite local changes. Check whether another worktree already owns `main`.

## 3. Fetch and fast-forward only after a clean-worktree check

```bash
git fetch --prune=false origin
git switch main
git pull --ff-only origin main
git status --short --branch
git rev-parse main
git rev-parse origin/main
```

`--ff-only` must refuse divergence instead of making surprise merge commits. If it fails, **stop** and investigate; do not rebase another agent's branch or repair by destructive reset. `git fetch` updates remote-tracking refs, not necessarily the local `main` checkout.

## 4. Confirm actual merged result and checks

```bash
git merge-base --is-ancestor VERIFIED_MERGE_SHA main
git show --check --stat VERIFIED_MERGE_SHA
git log --oneline -5
```

Replace placeholder with the **actual** GitHub `merge_commit_sha`. Confirm expected `.ai/`, `AGENTS.md`, `.github/` and source files exist on updated `main`. Check the exact workflow files:

- `.github/workflows/ai-governance-checks.yml` — Python docs/link/task-state/commit-message checks only.
- `.github/workflows/phase-0-checks.yml` — **only when Phase 0 PR #1 independently merges**; application Expo/TypeScript/Metro verification, not the governance job.

Rerun relevant checks proportionate to the actual merged diff: for governance work, `python3 -m py_compile scripts/ai_context.py tests/governance/test_ai_context.py`, `python3 -m unittest discover -s tests/governance -v`, `python3 scripts/ai_context.py check-links`, and a current commit-message audit using an appropriate verified base/head range. For app changes, use the Phase 0 app workflow, npm/Expo tests and device validation **only as actually applicable**. Never infer a physical-device check, native SMS permission, encryption or financial correctness from a docs PR or CI badge.

## 5. Reconcile the durable task and agent handoff

Only **after** the verified terminal outcome, update the owning task with GitHub merge SHA, merge type, actual checks/results/skips, reviewed SHA, findings and residual risk. Update [`.ai/current.md`](../.ai/current.md), [agent registry](../.ai/agents/registry.md) and linked decision references without overwriting historical checkpoints. For archival use the documented [archive procedure](../.ai/archive/README.md), preview the link repairs first, verify every inbound/outbound target and anchor, then archive in a **separately authorized tracked follow-up**. Do not pretend a CLI `--verified-terminal` flag confirms GitHub owner approval; it is a manual assertion.

Record the next verified agent, prior verified agent, affected branch, exact next safe action and any still-open follow-ups. Stop if owner approval or terminal state is ambiguous.

## 6. Preserve parallel branches, especially Phase 0

The Phase 0 `feat/phase-0-expo-foundation` branch and draft [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) are **independent**. Do not switch into its worktree, force-push, rebase, merge, delete or copy over its files. Governance PR #2 **already merged**; the Phase 0 task must separately verify the current base and any prior safe integration without assuming it authorizes PR #1 to merge. Any future integration is an independently reviewed, scoped operation. Do not treat doc merge as permission to merge the app PR or to alter active app code.

**Never automatically:** force-push, hard-reset, clean untracked files, delete branches, rebase another agent's branch, merge a pending PR, alter required checks or approve a PR. **An agent merge is allowed solely after the explicit, verified owner authorization and preflight above; it is never an inferred/scheduled action.**

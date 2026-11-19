# Tio Money — GitHub governance integration

**Canonical:** [AGENTS.md](../AGENTS.md) → [current task](../.ai/current.md) → [mandatory technical discussion](../.ai/discussions/README.md) → [decision register](../docs/DECISIONS.md). These are instructions and review affordances, not technical enforcement of owner identity or merge permission.

| Resource | Responsibility |
|---|---|
| [Issue Forms](ISSUE_TEMPLATE/task_discussion.yml) | Durable bug/feature/architecture/task RFC input; selection does **not** authorize implementation/merge |
| [Pull Request Template](PULL_REQUEST_TEMPLATE.md) | Records scope, decided approach, exact tested/reviewed SHA, separate owner merge evidence |
| [AI governance checks](workflows/ai-governance-checks.yml) | Python-only governance tests, Markdown targets, no-coauthor commit audit; read-only token and SHA-pinned checkout |
| [Review guide](REVIEW_GUIDE.md) | Independent assessment at current HEAD, finding severity, all outstanding threads |
| [Post-merge sync](POST-MERGE-SYNC.md) | Verified owner-approved merge, safe clean worktree and fast-forward, then archive/handoff |
| [Copilot instructions](copilot-instructions.md) | Concise routing to AGENTS.md and Tio Money invariants |

## Coexistence with Expo Phase 0

[Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) contains **`.github/workflows/phase-0-checks.yml`**, a separate workflow that runs Node/Expo compatibility, TypeScript, lint, formatting, tests and Metro exports. It is **unmerged parallel work at governance setup**. This governance PR must not overwrite it.

Once each independently authorized PR merges, **both workflows can coexist**: `AI governance checks / governance` handles documentation and policy regression; `Phase 0 checks / static` handles application tooling and builds. Both currently trigger on PRs, but their actual checks are **different**, not duplicate installs/tests. If the team later wants changed-path filtering for resource efficiency, discuss it in a separately reviewed CI task; filtering governance out of app PRs would also skip commit attribution checks.

**Owner policy:** [TM-DEC-002/003](../docs/DECISIONS.md) makes independent review optional by default, while retaining blocking findings and actual required GitHub checks/reviews. Every merge needs action-specific owner permission naming repo, PR, merge action and conditions. An agent may perform a non-force merge only after [preflight](POST-MERGE-SYNC.md#authorized-agent-merge-preflight-before-any-merge). **This update is not merge permission for PR #2.**

**Trust and limitations:** This PR workflow checks out and executes untrusted PR code with **read-only** GitHub permissions and no secrets, which is suitable for nonprivileged test/diagnostic feedback, **not a trusted security gate resistant to a malicious PR modifying its own checker**. This document does not configure required status checks, branch protection, review eligibility, repository environments or App tokens. Their availability depends on owner settings/plan; never claim them configured. Only a separate, explicit owner approval can permit merge.

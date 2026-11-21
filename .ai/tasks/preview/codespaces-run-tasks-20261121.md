# TM-DEV-CODESPACES-TASKS-20261121 — Codespaces Run Task shortcuts

## Task identity, decision and lifecycle

| Field | Value |
|---|---|
| Task ID | `TM-DEV-CODESPACES-TASKS-20261121` |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle | `VALIDATING` — implementation submitted on isolated feature branch; live CI and Codespace/device validation pending |
| RFC and decision | [Issue #48](https://github.com/im-tnyx/Tio-Money/issues/48), technical `PROCEED` on 2026-11-21 (agent-authored decision grounded in user's task request) |
| Working agent/model | ChatGPT / GPT-6 (self-identified); previous verified agent `UNKNOWN_NOT_VERIFIED` |
| Owner implementation request | User requested two reusable Codespaces tasks in this conversation; transcribed by agent, not a GitHub-authored approval |
| Branch | `chore/codespaces-run-tasks-20261121` created from main `9d2f0c793442b76131834a9ffc0c1962734ab00d` |
| PR | Not opened at initial source checkpoint; link in Issue #48 when opened |
| Review disposition | `DEFERRED` — routine developer-tool convenience; current-HEAD CI/review still required where configured |
| Merge authorization | `NOT_GRANTED` — separate PR-specific owner instruction required |
| Physical Codespace/Expo Go QA | `NOT_VERIFIED` |

## Implementation contract and failure cases

The **Start Expo Project (Tunnel)** VS Code process task invokes `node scripts/start-codespace-expo.mjs --start` in `${workspaceFolder}`. Existing Codespaces postStart launch, Expo owner login checks, tunnel validation, process ownership, lock and port 8081 protection remain unchanged. No duplicate CLI invocation, Expo identity change, account token or preview automation.

The **Git Pull (FF-only)** VS Code process task executes exact `git pull --ff-only` in `${workspaceFolder}`. Git chooses the active branch's tracking upstream at invocation time; no fixed branch, no force, no reset, checkout, stash, rebase or hidden conflict resolution. Missing upstream, divergence or conflicting changes show a terminal error and require manual inspection.

Share only `.vscode/tasks.json` via the narrowly scoped gitignore exception; keep local settings ignored. No mobile app features, finance/domain logic, native modules, GitHub workflow permissions or automatic Codespace management.

## Acceptance and evidence

- Defined tests: `node --test tests/preview/vscode-tasks.test.mjs`, `npm run preview:test`, GitHub Phase 0 and governance CI, task JSON parsing and branch-independent invocation. CI and physical Codespace task-menu/device checks **not yet executed at initial checkpoint**.
- Source paths: `.vscode/tasks.json`, `.gitignore`, `tests/preview/vscode-tasks.test.mjs`, `docs/CODESPACES-LIVE-PREVIEW.md`, `.ai/tasks/preview/codespaces-run-tasks-20261121.md`, additive `.ai/current.md` row.
- Rollback: revert scoped config/docs/test changes through a reviewed PR; existing devcontainer and managed starter untouched.
- Security/privacy: no new secrets, external permissions, destructive Git actions, privileged automation, service accounts, EAS updates or always-on service.
- Local worktree cleanliness, exact current Codespace branch, terminal behavior, physical device launch and signed Expo tunnel availability **NOT_VERIFIED** from GitHub connector.
- Current-head CI, PR reviews and owner merge approval must be checked independently. No claims of tests passing merely from configuration inspection.

## Checkpoint — 2026-11-21, ChatGPT GPT-6

- **PROCEED:** Issue #48 is the durable RFC and agent technical decision. Implementation authorization is bounded to tooling changes; owner merge authorization `NOT_GRANTED`.
- **Verified base:** `9d2f0c793442b76131834a9ffc0c1962734ab00d`; direct commits to main prohibited, new branch created.
- **Review:** `DEFERRED` pending PR/current-head checks; no independent review result asserted.
- **Next action:** verify committed files, open scoped draft PR, run/review actual CI and report untested real Codespace behavior. Merge only with separate explicit owner PR authorization.

## Follow-up checkpoint — 2026-11-21, ChatGPT GPT-6 (third task)

- **Source/PROCEED:** Owner follow-up in ChatGPT requested the third Expo Go command shortcut. Bounded RFC addendum: [Issue #48 comment](https://github.com/im-tnyx/Tio-Money/issues/48#issuecomment-7060391801). This is not merge authorization.
- **Additional task:** `Expo Go Tunnel (Interactive)` in `.vscode/tasks.json`. Its foreground process runs a Codespaces Linux `bash -lc` chain: managed launcher `--check-account` → verified-owner-only `--stop` → `CI=false npm run mobile` (locked `expo start --tunnel --go`), stopping with Ctrl+C. No duplicate Metro, unrelated process termination, or Expo credentials in source.
- **Minimal launcher extension:** `scripts/start-codespace-expo.mjs --check-account` reuses existing `requireExpoAccount()` without starting/stopping Metro. No existing startup, restart, stop, PID ownership or tunnel verification behavior changed. The interactive task fails closed on mismatched account, missing Expo CLI, unowned Metro or managed stop failure.
- **Focused regression:** test three labels, correct execution order/account gate and original pull `--ff-only` command. Documentation and additive task index updated. File set expands narrowly to existing managed starter and its consumers.
- **State:** In review preparation. Exact-head CI, on-Codespace terminal execution and real Expo Go launch must be rechecked on this follow-up commit. No false assertion of CI/device success; independent review remains `DEFERRED`; owner merge authorization **NOT_GRANTED**.

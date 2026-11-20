# TM-PR-PREVIEW-20261120-001 — Trusted owner-selected PR Codespaces preview

- **Agent/task:** GPT-6, scoped Stage B source-only workflow after [RFC #3 source-only PROCEED checkpoint](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7031828178).
- **Repository:** private `im-tnyx/Tio-Money`.
- **Isolation:** dedicated branch `feat/pr-codespaces-preview-gate` from exact PR #5 head `5828db1c73c877f82b9e4e2dff61fcc37f78dacb`; stack on PR #5, which stacks on PR #4; no direct `main` write.
- **Goal:** feature branch owner PR UI preview in Expo Go without merge, with one-time `tio-preview` opt-in label/manual initial dispatch; later authenticated owner pushes automatically sync via workflow_run.
- **Owner-confirmed environment evidence:** screenshot shows `tio-money-eas-preview-trusted` and `tio-money-codespaces-trusted`, each with 1 protection rule and 1 secret; owner reports both restrict to `main`. Token scopes, GitHub entitlement and exact key names **NOT independently verified**; token values never read or recorded.

## Owned scope

1. `.github/workflows/tio-money-preview-push-signal.yml` — owner push signal, read-only, no source checkout, no secrets.
2. `.github/workflows/tio-money-codespaces-pr-preview.yml` — main-only owner/event/repo/branch/PR/label/exact-SHA gates, source allowlist, main-only Codespaces environment, owner-selected Codespace with no implicit fallback, trusted main sync script over SSH.
3. `.github/scripts/sync-pr-codespaces-preview.sh` — remote expected repo/clean worktree, immutable fetch, no force/reset, managed Metro stop/start, locked dependencies; detached-HEAD **preview-only** checkout.
4. `.devcontainer/devcontainer.json` — add SSHD feature for trusted Actions worker, requiring owner to rebuild existing selected Codespace once.
5. `docs/PR-CODESPACES-PREVIEW.md` — owner flow, trust/activation/cost/limitations.
6. `tests/preview/pr-codespaces-workflow.test.mjs` — source-level security invariants included in existing `npm run check` → `npm run preview:test`.

## Explicit exclusions and safety

No user app UI or ledger/Auth/SQLite code changes; no Expo project/UUID changes, EAS Update, preview APK, Expo credentials, private finance data, secret values, new Codespace creation, `main` merge, privileged workflow dispatch, bypass of GitHub protection, or Tio-Workspace modifications. Existing Expo Go grey Projects card is **NOT_FIXED / NOT_VERIFIED**; the feature targets the observed working account-signed Development Servers path and can wake on **owner push**, not on phone tap. No claim of permanent always-on availability.

Independent review status **DEFERRED / strongly recommended** for trusted Actions/SSH/token handling. Current owner has only requested implementation and reported environment setup. **No PR-specific merge authorization** for #4, #5 or this new PR. After this source change, verify new-head CI, source path diff and authorization before activating any worker. Do not treat a passing source check as proof of real Codespaces SSH or phone behavior.

## Acceptance to collect

- Source: `npm run check`, `npm run preview:test`, Expo SDK alignment, GitHub Actions workflow lint and default branch rule assessment on exact head.
- Owner-run after separate permission/authorized merges: prepare dedicated SSH-enabled Codespace, set `TIO_MONEY_PREVIEW_CODESPACE` variable, select only one labeled PR, main-only dispatch once, confirm exact SHA Metro status and Android Expo Go Development Servers UI; push subsequent JS-only change and verify auto-sync without terminal commands.
- Negative tests: fork PR, non-owner actor, stale SHA, multiple labels, wrong remote, dirty worktree, unexpected native/tooling file, missing SSH/secret and wrong Codespace fail closed.
- iPhone, Expo Go Projects card, always-on wake by phone, actual financial-data handling remain **NOT_VERIFIED**.

**Roll back:** close this stacked source PR if rejected, or revert reviewed merge commits after integration. Never reset someone else's Codespace or branch, force push, or remove secrets automatically.

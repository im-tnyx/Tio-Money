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

## 2026-11-20 — independent P2 Codespace isolation review fix (no activation)

- **Evidence:** Supplied independent security review at prior exact PR HEAD `972d9149a9d327bdc45cfd5c4609b0adfacd3128` found the worker selected any matching repository Codespace. Owner's earlier PR comment names `automatic-orbit-jjxwq55wqr5gcj7gj` as **editing** Codespace. A clean git status guard does not protect that workspace from Metro stop/detached checkout/`npm ci`.
- **Technical decision:** [PR #10 review-fix PROCEED](https://github.com/im-tnyx/Tio-Money/pull/10#issuecomment-7035504476), scoped to PR branch only. Add trusted-main identity validator and negative regression test. The worker requires both non-secret Environment allowlist vars `TIO_MONEY_PREVIEW_CODESPACE` and `TIO_MONEY_PREVIEW_CODESPACE_ID`, exact GitHub-owned `display_name=Tio Money PR Preview Only`, owner and repository match, plus an unconditional known-editing-name deny before Codespace start/SSH. Recheck identity after waking. Existing environment variable still points to an editing Codespace and **must not be used**.
- **Changed scope:** trusted workflow, new `.github/scripts/verify-pr-preview-codespace.mjs`, source invariant tests, this task and owner runbook. No app/ledger/schema/Expo config/secret changes, Codespace creation/renaming, privileged dispatch, EAS publish, merge or direct `main` write. This validator only enforces owner-provided purpose metadata; a dedicated workspace and effective permissions still require owner verification.
- **Validation:** pending exact-head GitHub Phase 0 CI and test evidence after commit. Reviewer finding status: **P2 UNDER FIX; independent review PERFORMED on old HEAD; re-review of new HEAD PENDING**. Owner PR #10 merge authority **NOT GRANTED**. Re-review privileged worker/credentials before merge; no device acceptance claimed.


## 2026-11-20 — New P2 moving changed-path race — source remediation

- **Finding:** [P2 immutable PR path snapshot](https://github.com/im-tnyx/Tio-Money/pull/10#issuecomment-7037000600), confirmed on prior HEAD `149aefe71c2dc830ae573900950c09ac189a2a13`: selecting PR SHA before reading the moving `/pulls/{pr}/files` endpoint may validate another revision. Owner requested fixing the P2 in chat; technical [PROCEED checkpoint](https://github.com/im-tnyx/Tio-Money/pull/10#issuecomment-7037107279).
- **Fix:** capture both immutable `head_sha` and `base_sha`, query GitHub compare with those exact SHAs, run the trusted-main `.github/scripts/verify-pr-preview-pr-snapshot.mjs` on captured PR + immutable diff + newly fetched PR, check every renamed source and target path, and reject missing/moving mismatches before any privileged Codespaces wake/SSH. The actual validator is exercised by regression tests simulating a PR head changing between the two reads, a base change, changed compare SHA, path count mismatch and renamed native path. Reject newline paths. Workflow now pins reviewed `actions/checkout` SHA and requires the original owner triggering actor + first attempt for privileged manual dispatch.
- **Preservation:** existing Codespace allowlist, editing Codespace deny, preview-label uniqueness and exact repo/actor checks, source-only allowlist, non-production behavior, existing Expo tunnel and config untouched. `main` unmodified. No privileged dispatch, EAS publish, new Codespace, secret or merge executed.
- **Review:** new P2 is `FIX_APPLIED_SOURCE`; latest-HEAD independent security review **PENDING**, actual Codespace configuration/permission verification and the earlier mutable SSHD feature option remain **NOT VERIFIED**. Green CI is required on final HEAD. **PR #10 merge authority is NOT GRANTED.**

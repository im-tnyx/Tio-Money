# TM-EAS-PREVIEW-20261119-001 — Manual EAS preview for existing Tio-Money

**Status:** IN_PROGRESS / stacked draft. **Owner merge authorization:** NOT_GRANTED.
**Agent:** ChatGPT GPT-6 (current task), previous EAS-task agent UNKNOWN_NOT_VERIFIED.
**Repository:** `im-tnyx/Tio-Money` private.
**Branch:** `feat/eas-preview-updates-foundation`, starting at `97711170e0b30a950c5e13c1e726e9f7f093360c` from Stage A [PR #4](https://github.com/im-tnyx/Tio-Money/pull/4).
**RFC / technical decision:** [Issue #3 scoped PROCEED](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7004990185).
**Owner evidence:** Existing `tnyx-23/tio-money` UUID `722e6857-1159-4414-a024-6a4351e7d3e1`; Expo Update groups page empty; a Tio Money Development Servers entry opens on one phone; separate Tio-TNYX project has Android+iOS manual preview updates.

## Scope
Add only the exact Tio-Money `expo-updates` SDK 58 runtime config, locked dependency, single internal `preview` profile, manual main-branch/owner-gated JS-only OTA workflow, non-production documentation and static tests. Tio Workspace is read-only reference. No PR #4 or Phase 0 PR #1 changes; no `main` merge. No EAS project creation, build, update publication, tokens/secrets, workflow environment creation or Codespace privileged worker. The preview workflow has no automatic `push`, `pull_request` or `workflow_run` trigger.

## Risks and policy
- Expo Update is a remote JS distribution surface and needs an installable native runtime with matching fingerprint before OTA works; `runtimeVersion`-based published updates cannot be assumed to load in Expo Go. Changing `app.json` and `expo-updates` is native-affecting, so current configuration PR must **not** be published as a JS-only OTA.
- Tio-Money private repo requires separate assessment of main branch checks and restricted environment support before merging/activating the workflow. Owner must secure a Tio-Money-scoped Expo token in the dedicated branch-restricted environment, not repository/global or copied from TNYX.
- The manually invoked workflow checks owner actor and repo-owned PR/head, but executing owner PR code before publishing carries code/supply-chain trust risks. Independent security/platform review **DEFERRED, strongly recommended**; no approvals fabricated. Owner must authorize any publish, build or merge as distinct actions.
- Preview app identifiers for Android and iOS are not yet owner-approved; do not generate them or run build.

## Acceptance and evidence (fill after execution)
- `npm ci --no-audit --no-fund`, Expo dependency checks, `npm run check`, public config and both platform Metro exports: **PENDING CI**.
- New workflow syntax and manual-only/owner/env/identity guard static tests: **PENDING**.
- Repo GitHub protections/private environment restrictions, Expo account token, signed builds and actual EAS Update group publication: **NOT_VERIFIED / NOT_CONFIGURED**.
- Physical Expo Go Projects tile direct launch: **NOT_VERIFIED**; current successful Codespace Development Servers launch is separate.
- Rollback: close this stacked PR or revert config commit with reviewed non-force change; don't rewrite other branches.

[Task index](../../current.md) · [Agent contract](../../../AGENTS.md) · [New preview guide](../../../docs/EAS-PREVIEW-UPDATES.md) · [Existing Stage A guide](../../../docs/CODESPACES-LIVE-PREVIEW.md)

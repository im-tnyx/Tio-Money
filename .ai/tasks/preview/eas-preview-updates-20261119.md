# TM-EAS-PREVIEW-20261119-001 — Manual EAS preview for existing Tio-Money

**Status:** VALIDATING / stacked draft. **Owner merge authorization:** NOT_GRANTED.
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
- **PASS** on exact tested source SHA `1abcb45ff9c4b55d1867fef121419e835200c6f2`, [GitHub Actions run #44496569603](https://github.com/im-tnyx/Tio-Money/actions/runs/44496569603): locked `npm ci --no-audit --no-fund`; `npx expo install --check`; `npm run check` (strict TypeScript, ESLint, Prettier, Phase 0 tests plus the nine Stage A preview tests and four new EAS static tests); `npx expo config --type public`; Android + iOS Metro exports; default restricted SMS-permission scan.
- **PASS source static checks** at the tested SHA: preview-specific tests assert exact owner/project UUID, EAS URL/fingerprint runtime policy, dedicated internal profile, npm package/lock integrity and manual-only GitHub workflow owner/environment/JS-only rules. This does **not** prove GitHub environment eligibility, EAS server authentication or workflow publication safety at runtime.
- Repo GitHub protections/private environment restrictions, Expo account token, signed builds and actual EAS Update group publication: **NOT_VERIFIED / NOT_CONFIGURED**.
- Physical Expo Go Projects tile direct launch: **NOT_VERIFIED**; current successful Codespace Development Servers launch is separate.
- Rollback: close this stacked PR or revert config commit with reviewed non-force change; don't rewrite other branches.

[Task index](../../current.md) · [Agent contract](../../../AGENTS.md) · [New preview guide](../../../docs/EAS-PREVIEW-UPDATES.md) · [Existing Stage A guide](../../../docs/CODESPACES-LIVE-PREVIEW.md)

## Implementation checkpoint — 2026-11-19

- **Agent:** ChatGPT GPT-6, this specific EAS task; previous independently verified EAS-task agent UNKNOWN_NOT_VERIFIED. Owner statement and RFC: [Issue #3](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7004990185). PR: [stacked draft #5](https://github.com/im-tnyx/Tio-Money/pull/5), based on unchanged Stage A draft PR #4.
- **First source SHA** `2b087edea1c46533cbc6decdc7779949dadf4f6f` **CI FAILED** on stale Stage A unit assertion expecting the Expo Update URL to be absent. Existing stage test was updated on `1abcb45ff9c4b55d1867fef121419e835200c6f2` to expect the exact owner-verified Tio-Money EAS URL and fingerprint policy. **Full Phase 0 CI SUCCESS** on [run #44496569603](https://github.com/im-tnyx/Tio-Money/actions/runs/44496569603) at that exact tested SHA. This docs checkpoint creates a subsequent untested HEAD until its new CI completes.
- **Changed paths vs PR #4 base:** `.ai/current.md`, this task file, `.github/workflows/tio-money-eas-pr-preview.yml`, `app.json`, `docs/EAS-PREVIEW-UPDATES.md`, `eas.json`, `package.json`, `package-lock.json`, old Stage A identity test and new EAS config test. All source within scoped owner-requested EAS preview setup. Two commits on tested head, **zero forbidden coauthor trailers** in inspected GitHub commit messages. No changes to the PR #4 branch, PR #1 or Tio-Workspace.
- **Execution and verification distinction:** Actual Expo account auth and phone *Development Servers* launch owner-observed in Stage A; GitHub CI is source-only, not a published EAS Update, signed preview build or Expo Go Projects tile test. Owner's Tio-Money Update groups empty; Tio-TNYX reference Update groups already have Android+iOS PR #17 previews. Tio Money remote EAS environment, `EXPO_TOKEN`, credentials, package identifiers, build, publishing, branch mapping and physical OTA reception remain **NOT_VERIFIED / NOT_EXECUTED**.
- **Review disposition:** **DEFERRED**, independent platform/Actions supply-chain review strongly recommended; no reviewer approval fabricated, configured rules/known blockers not bypassed. No owner authorization to merge PR #5, PR #4, PR #1, build or publish, or enable Codespaces Stage B.
- **Next safe action:** check fresh CI exact docs head, request platform/security review, verify repo-private GitHub environment restriction capability before activating workflow. Explicit owner authorization needed for any build, OTA publication or merge; do not prompt for secrets in chat.

# Tio Money — owner-selected pre-merge UI preview in Expo Go

Status: **source-only proposal, NOT ACTIVATED**. Stacked after [PR #5](https://github.com/im-tnyx/Tio-Money/pull/5) and [PR #4](https://github.com/im-tnyx/Tio-Money/pull/4). Owner authorizes implementation for review, **not merge or privileged workflow execution**. See [RFC #3](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7031828178).

## Goal

For each new UI feature branch, keep its PR **unmerged** while previewing the exact current PR commit on Android Expo Go. Select the PR once, then each later **owner push** on that labeled branch wakes the chosen Codespace, syncs that exact SHA and refreshes its Expo tunnel. UI changes can be corrected on the same PR before an independent review/merge gate.

This path serves live **Expo Go Development Servers** via Metro. It **does not guarantee** that Expo Go's grey **Projects** card becomes clickable, that the server stays alive when Codespaces idle-stops, or that tapping Projects wakes a stopped Codespace. The trusted worker wakes on **push**, not phone taps. Published fingerprint-runtime EAS Updates in PR #5 are an entirely separate internal-build experience.

## Trust model

- GitHub Environment **`tio-money-codespaces-trusted`** is restricted to exact `main` per the owner's GitHub UI report. It holds `CODESPACES_TOKEN` (one secret reported). **Secret key/scopes and effective plan permission remain unverified by agent**. Do not reuse Tio-Workspace tokens or disclose values in chat/logs.
- The owner configures **two** non-secret Environment variables in `tio-money-codespaces-trusted`: `TIO_MONEY_PREVIEW_CODESPACE` (the name of one dedicated Codespace) and `TIO_MONEY_PREVIEW_CODESPACE_ID` (the exact immutable numeric ID shown by the GitHub Codespaces API). Independently name the **dedicated**, non-editing Codespace **`Tio Money PR Preview Only`** via its GitHub *display name*. The worker rejects anything except an API response matching all three, owner `im-tnyx` and repository `im-tnyx/Tio-Money` before start/SSH; it always rejects the known editing Codespace `automatic-orbit-jjxwq55wqr5gcj7gj`. A display name is an owner-applied purpose label, not a secret or a substitute for separating workspaces. No fallback. Use one small instance; compute billing applies when awake.
- The untrusted `tio-money-preview-push-signal.yml` runs on non-main pushes with **read-only permissions, no checkout, no secrets**. The separate `tio-money-codespaces-pr-preview.yml` runs from trusted default `main` on a successful signal or on owner-only manual dispatch.
- Every worker run requires `main` context, repository/push actor `im-tnyx`, an **open owner-authored, repository-local PR targeting main**, exact current branch and SHA, the `tio-preview` label, and **exactly one** labeled open PR globally. Draft PRs are allowed for testing. A changed or stale SHA fails closed.
- Only **UI/source-only PRs** are eligible. Changed paths must be in `src/`, `assets/`, `tests/`, `docs/`, `.ai/` or the explicitly allowed root Markdown files. No native directories, `app.json`, npm dependency manifests, action scripts/workflows, devcontainer or secrets/config changes from the PR are accepted by this worker. Review and test those changes separately.
- Actions checks out only the **trusted main SHA** to obtain `.github/scripts/sync-pr-codespaces-preview.sh` and sends it by SSH to the selected Codespace. PR files are **never checked out/executed on the privileged Actions runner**. Inside the Codespace, verify exact origin, clean worktree and fetched SHA, stop only the managed Expo server, switch to detached immutable HEAD without force/reset, then reuse/restart the Expo Go signed tunnel. No automatic creation, merge, publish, production release or changes to the unrelated `@tnyx-23/tnyx`.
- The selected PR's JavaScript runs inside the preview Codespace and is therefore **owner-authored only**. A PR containing malicious JS/Metro config could still affect its **Codespace-local** credentials. Do not load untrusted forks or sensitive finance fixtures. Review requested platform changes separately.

## One-time setup — only after PR #4, #5 and this PR are independently reviewed and separately authorized to merge in order

1. Confirm all three reviewed PRs are merged into **Tio-Money `main`**, and actual required GitHub checks/protections passed. **Do not merge them simply because these instructions exist.** The Codespaces preview PR is stacked on PR #5, so its target must be reconciled with current `main` after PR #5 merges.
2. In **Settings → Environments → `tio-money-codespaces-trusted`**, verify selected deployment branch is exact `main`, and `CODESPACES_TOKEN` secret exists with appropriate Codespaces read + lifecycle permissions. If GitHub private-repo plan blocks Environment secrets or SSH operations, stop and diagnose; do not make the repository public. Do not paste tokens anywhere outside GitHub's secret form.
3. Choose a **dedicated preview-only** Codespace on reviewed Tio-Money source, separate from all editing sessions. Rename its *display name* in GitHub Codespaces to exactly **`Tio Money PR Preview Only`**. Read its actual `.name` and numeric `.id` from the authenticated GitHub Codespaces API, and configure both **Environment variables** `TIO_MONEY_PREVIEW_CODESPACE` and `TIO_MONEY_PREVIEW_CODESPACE_ID` with those exact values. Do **not** reuse the owner's editing Codespace `automatic-orbit-jjxwq55wqr5gcj7gj` currently referenced by the old `TIO_MONEY_PREVIEW_CODESPACE` setting: it is explicitly denied, even if renamed or configured with matching ID. The worker verifies name, immutable ID, exact purpose label, owner and repository *before* waking a Codespace or changing any worktree; an absent or mismatched field fails closed. The preview worker will switch this dedicated checkout to detached HEAD, so never use it for editing. Provisioning/renaming and paid compute require separate owner action and permission; no automatic creation here.
4. The Tio-Money `.devcontainer/devcontainer.json` now declares `ghcr.io/devcontainers/features/sshd:1`, matching Tio-Workspace's SSH connectivity. **Rebuild the selected Codespace container once** if it was created before this setting; verify SSH works before trusting automation. Rebuilding may require private re-login to Expo CLI.
5. In that Codespace, privately sign into Expo CLI (`npx expo login --no-browser`) as `tnyx-23` if necessary; use an SDK-58-compatible Expo Go on Android, also logged into `tnyx-23`. The managed startup is already in PR #4 and is idempotent.
6. In **Tio-Money → Issues → Labels**, create a label named exactly `tio-preview` (no special meaning to GitHub; it is checked by the worker). Label **only one open owner-authored PR targeting main**. Do not label several PRs simultaneously. New feature PR may be draft while UI is being tested.
7. On **Tio-Money → Actions → Tio Money trusted PR Codespaces preview**, choose **Run workflow** on `main`, enter the PR number and manually trigger it **only after explicitly authorizing use of Codespaces compute and verified credentials**. This first dispatch loads the PR's current exact SHA. No terminal command/QR is required each time.
8. On subsequent pushes by `im-tnyx` to the same labeled PR branch, the **secretless signal → trusted worker** updates that Codespace automatically. Check the Actions run and open the Tio Money entry in Expo Go **Development Servers**. Verify its five tabs, live changes and reconnect behavior. If Codespace was stopped, a qualifying push is needed to wake it; opening Expo Go alone does not wake it.
9. To switch to another feature PR, remove `tio-preview` from the old PR, add it to the new main-targeting owner PR, and dispatch once with its number. Continue pushing corrections to that branch until acceptance. **Do not merge until owner authorization for that specific PR.**

## Failure modes and recovery

| Situation | Expected safe result |
|---|---|
| Missing/wrong label or no owner push PR | No automatic preview switch |
| More than one labeled open PR | Worker refuses preview |
| PR is forked, non-owner, closed, or not targeting main | Refused |
| New PR changes native/tooling/dependencies | Refused; use independent native/device review instead |
| Changed/stale push SHA or wrong Codespace | Refused |
| Selected editing Codespace, missing/mismatched numeric ID, wrong owner/repo or missing exact `Tio Money PR Preview Only` display label | Refused **before Codespace start/SSH**; provision a separate preview-only target |
| Selected Codespace has uncommitted/untracked work | Refused; never stash/reset/force it |
| Incorrect remote or unexpected fetched SHA | Refused |
| No SSHD yet / Codespace suspended / no login | Run fails visibly; owner remedies Codespace and retries |
| Expo Go Projects card still grey | NOT_VERIFIED / unaffected; test Development Servers and investigate account/Expo publication separately |

**Testing gates:** source tests in `tests/preview/pr-codespaces-workflow.test.mjs`, all `npm run check` / `npm run preview:test`, CI and manual Android owner acceptance after a trusted authorized workflow dispatch. iPhone can be tested later. The workflow is intentionally not operational from a feature branch; it must be reviewed and merged into `main` with owner-specific merge permission and secrets/protections still intact.

**P2 review mitigation (20 November 2026):** [PR #10 reviewer finding](https://github.com/im-tnyx/Tio-Money/pull/10) identified risk to the existing editing Codespace. The GitHub API's owner-set display name plus separate ID/name allowlists and explicit editor deny rule are enforced by a tested trusted-main helper; this does **not** mean real Codespace SSH or device acceptance is verified, nor that any worker may be run or merged without authorization.

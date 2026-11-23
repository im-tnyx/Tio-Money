# Tio Money — Expo PR review: OTA updates and internal builds

## Run workflow on main

The [preview workflow proposal](https://github.com/im-tnyx/Tio-Money/issues/102) changes the Actions display name to **TIO MONEY EXPO PR PREVIEW**. The existing [workflow file](../.github/workflows/tio-money-eas-pr-preview.yml) and the automatic Codespaces push signal keep their identifiers. The form takes a positive integer `pr_number` for an open owner-authored PR in this repository targeting `main`. Select `android`, `ios` or `all` (default).

| Operation | Eligible PR | Destination |
|---|---|---|
| `codespaces_live` (default) | Draft or ready, with the `tio-preview` label | Existing Expo Go Codespace tunnel and platform source probe |
| `publish_update` | Ready | EAS Update branch `pr-preview` |
| `publish_draft_update` | Draft | Unmapped EAS Update branch `pr-draft-<PR_NUMBER>` |
| `build_preview` | Ready | Existing EAS internal preview build profile |

EAS runs only on an owner manual dispatch from trusted `main`. Selection and validation use read-only GitHub access and no Expo credentials. The separate publishing runner uses the existing trusted Environment and pinned EAS CLI. Its final operation receives `EXPO_TOKEN`. See [Codespaces preview](PR-CODESPACES-PREVIEW.md) for automatic push behavior and live Expo Go verification.

## Load a Draft OTA update

1. Use a separate development build of the existing Tio Money Expo project, with `expo-dev-client` and `expo-updates` already installed. The installed build must match the update's platform and native runtime fingerprint. Confirm the build uses the Tio Money updates project and has development-client support. The current repo does not declare `expo-dev-client` or a development build profile, and a matching device build has not been verified. Provisioning such a native client, if needed, requires separate approval. Adding a native library can change the fingerprint, so use a compatible build/update pair from the approved native baseline.
2. After a separately authorized Draft OTA publication, open the **Expo group** link in the GitHub Actions summary. Sign in with an Expo account that has access to the project, choose **Preview**, then scan the QR with the device camera or open the matching simulator/emulator with Expo Orbit. In the development build, the signed-in **Extensions** tab also lets you choose the per-PR branch and update. Match the exact group ID so a later push cannot change which update you test. [Expo development build preview guide](https://docs.expo.dev/eas-update/expo-dev-client/)
3. Check that the selected screen loads on each requested device. The summary records the PR, full SHA, platform, branch, native runtime, update ID and dashboard group URL. The workflow does not edit Expo channel mappings. Expo Go uses `codespaces_live`. An installed build on the shared `pr-preview` channel continues to use its existing channel mapping.

Draft eligibility and the captured head and base are checked again immediately before publish. The final action rejects a branch associated with any channel it can verify and fails closed if mapping data is unverifiable. GitHub PR and Expo channel state live in separate services, so their checks and the publish cannot be atomic. Keep the PR Draft and the branch unmapped during publication. The draft bundle is exported without Expo credentials or EAS environment variables, and the short-lived artifact carries only the native bundle files and assets needed for publication. Use Draft OTA for UI changes that do not depend on EAS environment variables at bundle time.

### Historical 20 November checkpoint

> **Current status: 20 November 2026.** This is the living guide for the **existing** Expo project `@tnyx-23/tio-money`, not Tio-Workspace. GitHub PRs [#4](https://github.com/im-tnyx/Tio-Money/pull/4), [#5](https://github.com/im-tnyx/Tio-Money/pull/5), and [#11](https://github.com/im-tnyx/Tio-Money/pull/11) are **MERGED** into `main`. [PR #12](https://github.com/im-tnyx/Tio-Money/pull/12) is **OPEN / NOT MERGED** and proposes the new operation/platform choices; [PR #10](https://github.com/im-tnyx/Tio-Money/pull/10) is **OPEN / NOT MERGED** and covers a separate privileged Codespaces preview worker. **No merge or EAS dispatch is authorized by this guide.** All of these are live GitHub states checked while updating this guide, not assertions that any build or OTA has been published.

## Historical PR #12 form proposal

After PR #12 is **separately approved and merged** into trusted `main`, GitHub Actions will display **TIO MONEY EXPO PR REVIEW** with the following inputs:

| Field | Required value / choices | Default |
|---|---|---|
| Use workflow from | `main` only | `main` |
| `pr_number` | Open, non-draft, owner-authored, same-repository PR targeting `main`, with changes limited to `src/*` and/or `assets/*` | None |
| `operation` | `publish_update` or `build_preview` | `publish_update` |
| `platform` | `android`, `ios`, or `all` | `all` |

The two dropdowns are **independent**. `all` selects both Android and iOS for the chosen operation; it does not mean an app is automatically tested on either physical device.

- **`publish_update`** distributes a JS/assets OTA update to EAS branch `pr-preview` with EAS environment `preview`, using `eas update --branch pr-preview --environment preview --platform <choice> --non-interactive`. It does **not** create an installable APK or IPA.
- **`build_preview`** requests a **non-production internal** EAS build, using the project's **only** approved profile `preview` and `eas build --profile preview --platform <choice> --non-interactive --no-wait`. Android's preview profile specifies `apk`; iOS requires an appropriate signed internal-distribution build. **A successful Actions run means the remote build request was queued, not that a binary was built, signed or installed.** Verify each result in EAS Build.

`operation` and `platform` values are independently allowlisted; invalid selections fail before Expo credentials are exposed. Do not select `build_preview` merely to see whether the GitHub form works: a valid request may consume paid EAS compute.

**Current `main` differs:** The trusted, already-merged workflow on `main` still has the former name `Tio Money manual EAS PR preview` and only a `pr_number` input. **PR #12 must first pass security review and receive separate owner merge authorization.** Selecting the PR #12 feature branch in the workflow menu is not a workaround for its trusted-main gate.

## Internal build prerequisites

The native/internal preview build path is **source-implemented but not operationally ready** because the current `app.json` deliberately has neither:

- `expo.android.package` (an owner-approved Android application ID).
- `expo.ios.bundleIdentifier` (an owner-approved iOS bundle identifier).

**Do not invent these identifiers in the workflow.** Configure them in a separately reviewed native configuration PR and obtain the relevant signing credentials first. For `build_preview`, the Actions preflight checks whichever identifier(s) correspond to the selected `platform`; `all` needs **both**. If an ID is absent, the run fails **before reading `EXPO_TOKEN` or queuing a build**.

The existing `eas.json` already specifies `cli.version=27.4.1`, `build.preview.distribution=internal`, `channel=pr-preview`, and `android.buildType=apk`. The build preflight checks those properties and refuses a production profile or unexpected build configuration. Any Android keystore or iOS Apple distribution/provisioning credentials must already be available through the owner's reviewed EAS credentials setup for non-interactive builds. **Existing credentials, EAS permissions, Apple team/device registration and private-repo Environment protections have not been independently verified.** A missing or invalid remote credential can still cause EAS Build to reject the request; the workflow does not create/repair credentials, publish to a store, or submit an app.

**Important policy:** The same restrictive `src/*|assets/*` changed-path allowlist applies to **both** operations. PRs that alter `app.json`, `eas.json`, native directories, dependencies, workflows or tooling must pass their **own** security/merge review first and are **not eligible** as the `pr_number` for this credential-bearing workflow. After such platform configuration is merged, prepare a **separate eligible source-only PR** to test build and OTA against reviewed native settings.

## Existing Expo Go experience

The owner reported and demonstrated that **iPhone Expo Go → Projects → Tio Money** opens the app and displays the Phase 0 five-tab shell. Record this as **OWNER-VERIFIED IPHONE PROJECTS-LAUNCH PASS**, not as proof of an OTA release or EAS Build. Earlier Android Expo Go Phase 0 device acceptance was also owner reported; do not invent device build IDs, SDK/runtime fingerprints or native signing QA.

The **Expo Go Projects / Development Servers** experience can depend on a live account-signed Metro tunnel and is distinct from EAS remote Updates and installed preview applications. `runtimeVersion.policy=fingerprint` is present in `app.json`; published runtime-version-targeted updates cannot be assumed to load directly in Expo Go. To verify `publish_update`, use a compatible, separately reviewed internal preview build with `expo-updates`, the matching runtime and `pr-preview` channel. Neither `build_preview` nor an EAS Update is needed just to keep using the owner's already-working Expo Go setup.

Do not claim an EAS Update group exists merely because PR #11 was merged or because Expo Go displayed the app. The last screenshot of empty Update groups was historical; **current remote Update groups have not been independently checked for this guide**.

## Historical PR #12 security gates and usage sequence

1. **Review/merge the workflow source separately.** PR #12 is open; merge requires a fresh, explicit owner instruction identifying `im-tnyx/Tio-Money`, PR #12, and permission to merge after checks and known findings are satisfied. Any new changes must pass GitHub Phase 0 / Governance CI on their exact final SHA. Independent security review of a credential-bearing build/publish workflow is strongly recommended.
2. **Before first actual build:** approve Android/iOS application identifiers in a separate platform-config PR, merge after independent review, configure the relevant signing credentials in EAS and provision any required iOS internal distribution devices. Verify the exact Tio-Money EAS account/project and expected costs/quotas. Verify `tio-money-eas-preview-trusted` has main-only Environment restrictions and a minimally scoped `EXPO_TOKEN`; these settings are not established by source CI.
3. **Select a safe test PR** in the form. It must be open, non-draft, owner `im-tnyx`, in this repository targeting `main`, and change only `src/*` / `assets/*`. Neither this workflow-modifying PR #12 nor Codespaces PR #10 qualifies. Verify exact source SHA, CI and reviewed source before any remote execution.
4. **Obtain a separate action-specific owner authorization** for the intended platform and for `build_preview` or `publish_update`, respectively. Then select GitHub Actions → `TIO MONEY EXPO PR REVIEW` → **Run workflow** from `main`; enter the approved PR number, operation and platform. Do not run based solely on this guide or the presence of a green button.
5. **Interpret results precisely.** EAS Update success confirms publication metadata, not device load; EAS Build with `--no-wait` confirms submission/queue, not build success. Check the project's [EAS Updates](https://expo.dev/accounts/tnyx-23/projects/tio-money/updates) or [EAS Builds](https://expo.dev/accounts/tnyx-23/projects/tio-money/builds) by operation. Test with a compatible signed physical Android/iPhone build before declaring platform acceptance. Record the run URL, SHA, platform and resulting build/update IDs.

The workflow retains owner-only GitHub `actor` and `triggering_actor` checks, `run_attempt == 1`, `main` only, open same-repo PR validation, immutable SHA checkout, app owner/slug/EAS project UUID verification, and the strict PR path policy. GitHub's token is read-only for repo/PR access. `EXPO_TOKEN` is **absent during checkout, dependency installation, source tests and EAS CLI integrity verification** and exists only in the final dispatch operation step. GitHub Actions `checkout` and `setup-node` use immutable commit SHAs and EAS CLI `27.4.1` has an isolated committed npm dependency lock, SHA512 registry integrity checks and `npm audit signatures`. A trusted workflow is still an external distribution surface: the account, remote credentials and server-side behavior require live verification.

## Source of record and historical review notes

- **Project identity:** Expo owner `tnyx-23`, slug `tio-money`, project ID `722e6857-1159-4414-a024-6a4351e7d3e1` and update URL `https://u.expo.dev/722e6857-1159-4414-a024-6a4351e7d3e1`. These must not drift or be copied from Tio-Workspace.
- **Historical merged foundation:** [PR #5](https://github.com/im-tnyx/Tio-Money/pull/5) introduced the reviewed `expo-updates` configuration, internal preview profile, manual owner-gated OTA workflow and pinned EAS CLI; its old **OPEN / stacked draft / not on main** status is obsolete. For the chronological P2 fixes (mutable `eas-cli@latest`, retry actor, pinned Actions and committed lock), use [the original task record](../.ai/tasks/preview/eas-preview-updates-20261119.md) and [RFC #3](https://github.com/im-tnyx/Tio-Money/issues/3).
- **Current source extension:** [PR #12](https://github.com/im-tnyx/Tio-Money/pull/12) adds the `TIO MONEY EXPO PR REVIEW` display name, operation selector, Android/iOS/All selector, fail-closed build preflight, tests and this runbook. Exact-HEAD CI and any review dispositions must be verified after each update. **No merge, EAS build or update was performed by the source implementation.**
- **Separate Codespaces track:** [PR #10](https://github.com/im-tnyx/Tio-Money/pull/10) is a different, privileged main-only preview worker with its own pending security and owner merge gates. It does not control OTA build/update release and must not be silently merged or activated as part of PR #12.

**Rollback:** Keep the app/Expo identity and any production signing unchanged. If the new form/CI policy is incorrect, revert the PR #12 workflow changes through an authorized reviewed GitHub PR; do not force-push `main`, delete credentials, reset another Codespace, or modify Tio-Workspace.
## Historical PR #88 review correction

The unified manual entry selects the owner/non-Draft PR and immutable SHA in a **secretless selection job** without PR checkout. Another secretless runner checks that SHA, project identity, changed-path allowlist, signing conditions, dependency compatibility and tests. A separate fresh runner in `tio-money-eas-preview-trusted` then checks the current PR against the selection job's SHA and repeats the identity, source and signing gates before installing locked dependencies with lifecycle scripts disabled and verifying the committed EAS CLI. PR tests cannot rewrite the selection job's output. `EXPO_TOKEN` is passed only to the final EAS operation step on that runner. Codespaces remains in its own environment and automatic pushes cannot reach either EAS operation. The EAS publishing/building path itself has not been dispatched for this Draft PR; exact-HEAD CI checks workflow source and tests, not a live EAS operation.

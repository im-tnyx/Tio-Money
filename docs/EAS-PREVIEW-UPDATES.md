# Tio Money — Expo PR review: OTA updates and internal builds

> **Current status: 20 November 2026.** This is the living guide for the **existing** Expo project `@tnyx-23/tio-money`, not Tio-Workspace. GitHub PRs [#4](https://github.com/im-tnyx/Tio-Money/pull/4), [#5](https://github.com/im-tnyx/Tio-Money/pull/5), and [#11](https://github.com/im-tnyx/Tio-Money/pull/11) are **MERGED** into `main`. [PR #12](https://github.com/im-tnyx/Tio-Money/pull/12) is **OPEN / NOT MERGED** and proposes the new operation/platform choices; [PR #10](https://github.com/im-tnyx/Tio-Money/pull/10) is **OPEN / NOT MERGED** and covers a separate privileged Codespaces preview worker. **No merge or EAS dispatch is authorized by this guide.** All of these are live GitHub states checked while updating this guide, not assertions that any build or OTA has been published.

## 1. What the Run workflow form will show

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

## 2. Current project build readiness — not yet authorized

The native/internal preview build path is **source-implemented but not operationally ready** because the current `app.json` deliberately has neither:

- `expo.android.package` (an owner-approved Android application ID).
- `expo.ios.bundleIdentifier` (an owner-approved iOS bundle identifier).

**Do not invent these identifiers in the workflow.** Configure them in a separately reviewed native configuration PR and obtain the relevant signing credentials first. For `build_preview`, the Actions preflight checks whichever identifier(s) correspond to the selected `platform`; `all` needs **both**. If an ID is absent, the run fails **before reading `EXPO_TOKEN` or queuing a build**.

The existing `eas.json` already specifies `cli.version=27.4.1`, `build.preview.distribution=internal`, `channel=pr-preview`, and `android.buildType=apk`. The build preflight checks those properties and refuses a production profile or unexpected build configuration. Any Android keystore or iOS Apple distribution/provisioning credentials must already be available through the owner's reviewed EAS credentials setup for non-interactive builds. **Existing credentials, EAS permissions, Apple team/device registration and private-repo Environment protections have not been independently verified.** A missing or invalid remote credential can still cause EAS Build to reject the request; the workflow does not create/repair credentials, publish to a store, or submit an app.

**Important policy:** The same restrictive `src/*|assets/*` changed-path allowlist applies to **both** operations. PRs that alter `app.json`, `eas.json`, native directories, dependencies, workflows or tooling must pass their **own** security/merge review first and are **not eligible** as the `pr_number` for this credential-bearing workflow. After such platform configuration is merged, prepare a **separate eligible source-only PR** to test build and OTA against reviewed native settings.

## 3. Existing Expo Go experience is different

The owner reported and demonstrated that **iPhone Expo Go → Projects → Tio Money** opens the app and displays the Phase 0 five-tab shell. Record this as **OWNER-VERIFIED IPHONE PROJECTS-LAUNCH PASS**, not as proof of an OTA release or EAS Build. Earlier Android Expo Go Phase 0 device acceptance was also owner reported; do not invent device build IDs, SDK/runtime fingerprints or native signing QA.

The **Expo Go Projects / Development Servers** experience can depend on a live account-signed Metro tunnel and is distinct from EAS remote Updates and installed preview applications. `runtimeVersion.policy=fingerprint` is present in `app.json`; published runtime-version-targeted updates cannot be assumed to load directly in Expo Go. To verify `publish_update`, use a compatible, separately reviewed internal preview build with `expo-updates`, the matching runtime and `pr-preview` channel. Neither `build_preview` nor an EAS Update is needed just to keep using the owner's already-working Expo Go setup.

Do not claim an EAS Update group exists merely because PR #11 was merged or because Expo Go displayed the app. The last screenshot of empty Update groups was historical; **current remote Update groups have not been independently checked for this guide**.

## 4. Security gates and usage sequence

1. **Review/merge the workflow source separately.** PR #12 is open; merge requires a fresh, explicit owner instruction identifying `im-tnyx/Tio-Money`, PR #12, and permission to merge after checks and known findings are satisfied. Any new changes must pass GitHub Phase 0 / Governance CI on their exact final SHA. Independent security review of a credential-bearing build/publish workflow is strongly recommended.
2. **Before first actual build:** approve Android/iOS application identifiers in a separate platform-config PR, merge after independent review, configure the relevant signing credentials in EAS and provision any required iOS internal distribution devices. Verify the exact Tio-Money EAS account/project and expected costs/quotas. Verify `tio-money-eas-preview-trusted` has main-only Environment restrictions and a minimally scoped `EXPO_TOKEN`; these settings are not established by source CI.
3. **Select a safe test PR** in the form. It must be open, non-draft, owner `im-tnyx`, in this repository targeting `main`, and change only `src/*` / `assets/*`. Neither this workflow-modifying PR #12 nor Codespaces PR #10 qualifies. Verify exact source SHA, CI and reviewed source before any remote execution.
4. **Obtain a separate action-specific owner authorization** for the intended platform and for `build_preview` or `publish_update`, respectively. Then select GitHub Actions → `TIO MONEY EXPO PR REVIEW` → **Run workflow** from `main`; enter the approved PR number, operation and platform. Do not run based solely on this guide or the presence of a green button.
5. **Interpret results precisely.** EAS Update success confirms publication metadata, not device load; EAS Build with `--no-wait` confirms submission/queue, not build success. Check the project's [EAS Updates](https://expo.dev/accounts/tnyx-23/projects/tio-money/updates) or [EAS Builds](https://expo.dev/accounts/tnyx-23/projects/tio-money/builds) by operation. Test with a compatible signed physical Android/iPhone build before declaring platform acceptance. Record the run URL, SHA, platform and resulting build/update IDs.

The workflow retains owner-only GitHub `actor` and `triggering_actor` checks, `run_attempt == 1`, `main` only, open same-repo PR validation, immutable SHA checkout, app owner/slug/EAS project UUID verification, and the strict PR path policy. GitHub's token is read-only for repo/PR access. `EXPO_TOKEN` is **absent during checkout, dependency installation, source tests and EAS CLI integrity verification** and exists only in the final dispatch operation step. GitHub Actions `checkout` and `setup-node` use immutable commit SHAs and EAS CLI `27.4.1` has an isolated committed npm dependency lock, SHA512 registry integrity checks and `npm audit signatures`. A trusted workflow is still an external distribution surface: the account, remote credentials and server-side behavior require live verification.

## 5. Source of record and historical review notes

- **Project identity:** Expo owner `tnyx-23`, slug `tio-money`, project ID `722e6857-1159-4414-a024-6a4351e7d3e1` and update URL `https://u.expo.dev/722e6857-1159-4414-a024-6a4351e7d3e1`. These must not drift or be copied from Tio-Workspace.
- **Historical merged foundation:** [PR #5](https://github.com/im-tnyx/Tio-Money/pull/5) introduced the reviewed `expo-updates` configuration, internal preview profile, manual owner-gated OTA workflow and pinned EAS CLI; its old **OPEN / stacked draft / not on main** status is obsolete. For the chronological P2 fixes (mutable `eas-cli@latest`, retry actor, pinned Actions and committed lock), use [the original task record](../.ai/tasks/preview/eas-preview-updates-20261119.md) and [RFC #3](https://github.com/im-tnyx/Tio-Money/issues/3).
- **Current source extension:** [PR #12](https://github.com/im-tnyx/Tio-Money/pull/12) adds the `TIO MONEY EXPO PR REVIEW` display name, operation selector, Android/iOS/All selector, fail-closed build preflight, tests and this runbook. Exact-HEAD CI and any review dispositions must be verified after each update. **No merge, EAS build or update was performed by the source implementation.**
- **Separate Codespaces track:** [PR #10](https://github.com/im-tnyx/Tio-Money/pull/10) is a different, privileged main-only preview worker with its own pending security and owner merge gates. It does not control OTA build/update release and must not be silently merged or activated as part of PR #12.

**Rollback:** Keep the app/Expo identity and any production signing unchanged. If the new form/CI policy is incorrect, revert the PR #12 workflow changes through an authorized reviewed GitHub PR; do not force-push `main`, delete credentials, reset another Codespace, or modify Tio-Workspace.

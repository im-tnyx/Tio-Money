# TM-UI-APPEARANCE-20261120-001 — More appearance selector

| Field | Status |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| Source request | Owner chat, 2026-11-20: new UI PR, More → General Settings → System/Light/Dark |
| RFC | [#17](https://github.com/im-tnyx/Tio-Money/issues/17), technical `PROCEED` decision |
| State | `IN_PROGRESS` for proposed draft implementation, pending exact-head CI and device acceptance |
| Assigned agent | ChatGPT GPT-6, architect/implementation (not Git author or reviewer) |
| Branch | `feat/more-general-settings-appearance` based on `fd154db417b1979d39f855317f252eed37c36e9d` |
| Allowed scope | `src/app/(tabs)/more.tsx`, `src/app/_layout.tsx`, `src/features/settings/*`, appearance theme/data adapter, English strings, tests, docs, `.ai/*` |
| Exclusions | Other tab body behavior, finance ledger/schema, native config, dependencies, CI/workflows, secret values, EAS release |
| Review | `DEFERRED` until draft PR exact SHA; optional for UI, known blockers remain binding |
| Merge authorization | `NOT_GRANTED`; requires separate owner instruction for repository and PR number |
| Codespaces activation | `NOT_GRANTED`; separate owner approval and live verification required |

## Design and acceptance

- No mutable state in MoreScreen: typed state/action via MoreRoute and useMoreViewModel.
- One global preference source, offline persisted in existing Expo SQLite kv-store; no finance migration.
- System follows OS; Light/Dark overrides the palette and status bar; values persist across restart.
- Failed reads show safe System fallback, failed writes don't falsely select a new value.
- Test pure mode resolution, structural screen boundaries, native/UI checks in CI and owner device smoke.
- Remaining: confirm exact-head GitHub CI, optional review disposition, owner Codespaces preview validation and merge-specific approval.
- Neither this task nor RFC permits any workflow dispatch, preview Codespace mutation or PR merge.

## 2026-11-21 — Latest-main reconciliation handoff

- **Requested action:** branch-only safe reconciliation, not merge into `main`; old HEAD `7ed3a1c1c41eb2e730fb22e9e8d4b44e6cd5cf56`, new `main` `0c295316940fc73e0c8e8bce127aaedede5d3d49`.
- **Integration:** preserve unchanged feature source, Route / ViewModel / dumb Screen architecture, original preference store and Phase 0 shell; only `.ai/current.md` overlaps. Merge latest `main` (including PR #21/#26 workflow fixes) with non-force two-parent commit. Changes to docs/ledger/workflow on `main` must not be overwritten.
- **Preview safety:** temporarily disable `tio-preview` before branch update so the automatic privileged `workflow_run` cannot start a Codespace, then only restore after observing safe skip. Manual preview dispatch is NOT performed by reconciliation.
- **Exact-head acceptance:** run/check GitHub Phase 0, governance and preview signal at new SHA; review diff, safety findings, `main` ancestry, UI structure and owner device-test gaps. This task log is a historical checkpoint; GitHub live state overrides it.
- **Review disposition:** independent review `DEFERRED` (optional under TM-DEC-002); no independent approval claimed. **Merge authorization for PR #18 NOT_GRANTED**.

## 2026-11-21 — Owner-approved More Appearance row and bottom-sheet revision

- **Owner request:** UI previously device checked; reconcile PR #18 to merged main first, then change **General Settings** to plain section text, one full-width **Appearance** card with chevron, and open a native bottom sheet showing existing System/Light/Dark circular radios, hints and dividers.
- **RFC and technical PROCEED:** [issue #17 follow-up](https://github.com/im-tnyx/Tio-Money/issues/17#issuecomment-7050140344). PR #18 stays Draft; no new route, no data/finance changes.
- **Starting UI SHA:** `0dda6cfc1196e69fcfb6ef4c54ea7662616ec3da`; latest main `a83c608c8cd6399712813d884e9179babb535ee6` is already a second parent after non-force merge; 0 behind. `tio-preview` temporarily removed before source push, so no unsolicited Codespaces execution. No direct main write, force push or privileged EAS dispatch.
- **Ownership:** `MoreScreen` renders the plain General Settings header, full-width Appearance row and chevron; new stateless `AppearanceSheet` renders native modal/accessible radio options and top dividers; `more-contract.ts` defines open/dismiss/select; `use-more-view-model.ts` owns modal open state. Existing theme provider/kv-store persistence and all five tabs remain untouched.
- **Safety and acceptance:** native safe-area modal and backdrop/Android Back/Close dismiss, original options and save error retained. Updated structural tests forbid screen-owned state and enforce token use/accessibility. GitHub exact-head CI and owner Android+iPhone retest needed; review disposition `DEFERRED` (independent optional), no approval invented.
- **Owner merge authorization:** `NOT_GRANTED`; a separate PR #18-specific action is mandatory.

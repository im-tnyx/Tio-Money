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

## 2026-11-21 — Screenshot refinement: official 200-weight option icons

- **Owner:** provided a visual screenshot and three Google Fonts icon URLs (`routine`, `dark_mode`, `light_mode`, `wght200`); follow-up clarifies that option **order is not the problem**, implement layout. The existing bottom sheet was already committed separately; avoid replacing concurrent source history.
- **Implementation:** add canonical official Google SVG copies to `src/shared/assets/google-material-icons/` and embed their exact XML in `appearance-option-icon.tsx`. The sheet renders left icon, text, **right** accessible selected radio and theme-token divider between choices, with labels System Mode / Light Mode / Dark Mode. Choice descriptions remain available through `accessibilityHint` only. Keep existing presentation-only UI and global preference store.
- **Security:** no new dependency, remote icon loading, workflow changes, EAS build/update or new route. `tio-preview` remains removed until separately authorized Codespace activation; no PR #18 merge authorization.
- **Acceptance:** preview regression checks official SVG provenance, source matching, right radio layout and screen-owned-state ban; exact-head GitHub CI and fresh Android/iPhone device testing pending new commit.

## 2026-11-21 — Safe icon data refactor and parallel HEAD reconciliation

- Previous Phase 0 attempts consistently passed TypeScript/ESLint but failed Prettier on long inline SVG literals in `appearance-option-icon.tsx`. Extract those exact literals into bundled `appearance-option-svg.json` with byte-for-byte equality regression against official `.svg` assets; the small stateless TypeScript icon component uses `SvgXml`. No runtime network, package or native change.
- While preparing this fix, parallel branch commits added the owner's edge-to-edge flat Appearance row and `Settings` heading plus matching tests. Reconcile on current live PR HEAD, preserve those changes and use non-force expected-head ref update. `tio-preview` remains absent; CI and owner revised-layout device QA still required, no PR merge permission.

## 2026-11-21 — Owner bottom-sheet header + flat-top refinement

- **Owner chat change:** In PR #18 Appearance bottom sheet, center the `Appearance` title, remove the visible extra sentence beneath it, add a divider immediately beneath the header, replace the visible `Close` text with an accessible X icon, and remove rounded sheet corners.
- **Decision:** Bounded UI-only `PROCEED` within previously approved RFC #17 feature; preserve stateless `AppearanceSheet`, `useMoreViewModel` ownership, three selectable radios and local theme persistence. Avoid unrelated More-screen heading changes, finance, workflows, dependencies or native config.
- **Safety:** Because this PR has the `tio-preview` label, remove it before any branch push to prevent unauthorized automatic privileged preview activation; do not restore or dispatch without separate approval. No merge permission.
- **Acceptance:** Regression assertions for balanced centered title, no hint caption/Close text, accessible X button, divider below title, square top corners, dismissal, unchanged selection and current-head CI. Android/iPhone device acceptance remains pending; independent UI review deferred, not claimed as performed.

## 2026-11-21 — Reconcile refined bottom sheet with newer main

- **Owner request:** Safely reconcile existing Draft PR #18, not merge into main. Existing PR head `d6178ab26e0075302742b29ab60e88e37a4e13c5`, incoming main `4614285071fd96e9010e2ca7f34653be1c2a61b4`, shared ancestor `e0e4c617c2aea2b892baa9b5dd327d6a4483350d`. GitHub compare: 2 behind, 17 ahead before reconciliation, no touched-path overlap.
- **Implementation boundary:** Adopt newer EAS preview workflow and EAS-preview config regression test verbatim from `main`. Preserve all PR #18 UI, state-management, preference persistence, assets and tests including the centered flat-top Appearance header, header divider and X dismiss.
- **Method:** Two-parent merge commit with PR head first and main second, non-force expected-head guarded branch update; verify main ancestry, feature blob retention, exact changed paths and fresh CI after commit. No direct `main` change or unrelated scope.
- **Security:** `tio-preview` label is present at preflight; remove before source push to prevent unintended privileged Codespaces workflow. Do not re-enable privileged preview, dispatch, publish EAS or merge. Owner device acceptance remains pending; formal independent UI review deferred, not falsely claimed.

## 2026-11-21 — Owner screenshot acceptance refinement: compact header

- **Source:** Owner screenshot of the iPhone More → Appearance sheet and explicit request: wasted blank space above sheet heading, move `Appearance` text left and minimize vertical space. This supersedes only the prior centered-title presentation choice.
- **Technical PROCEED:** Within the approved RFC #17 UI task, remove decorative handle + top spacing, left-align title, use token-driven 48dp header/minimum X target, keep right X and header divider, shrink row vertical padding to shared `md` without violating 48dp minimum press target. Preserve existing three modes, radio a11y, backdrop/Back dismissal, flat corners and persistence.
- **Scope and safeguards:** `appearance-sheet.tsx`, Phase 0 regression, feature guide and additive AI task/index record only. No new dependency, financial/native/CI changes. Because `tio-preview` may be restored independently, remove it before push to prevent privileged Codespaces automatic activity and do not re-add it without explicit authorization. No direct main merge, force, EAS or preview dispatch.
- **Acceptance:** New exact-head CI, structural source assertions, no visible drag handle, left title, no extra subtitle, divider immediately below header, mode rows accessible with >=48dp targets. Real iPhone/Android dynamic-type device QA still pending. Independent UI review DEFERRED (not claimed as pass); merge authorization NOT_GRANTED.

## 2026-11-21 — Owner follow-up: compact handle restored

- **Owner direction:** After visually confirming the sheet now uses less top space, bring back its handle. This supersedes only the handle-removal part of the preceding compact-header revision.
- **Technical PROCEED:** Restore the existing pill handle immediately above the left-aligned title, using existing spacing tokens (8dp top, 4dp tall, 4dp bottom), with no large padding row. Retain the 48dp-min header, X dismiss, header divider, flat corners, compact mode rows, ViewModel state ownership and theme preference storage.
- **Scope:** Appearance Sheet, corresponding static regression, feature guide, additive task/index checkpoints. This is a visual indicator, not new swipe gesture support. No finance, native config, dependency, workflow, or security change.
- **Safety/acceptance:** Non-force guarded PR #18 branch commit only; avoid `tio-preview` privileged activation, no merge into `main`, EAS publish or Codespaces dispatch. Fresh exact-head CI and iPhone/Android visual smoke pending; independent UI review deferred, owner merge permission not granted.

## 2026-11-21 — Owner header vertical alignment and rounded-sheet corners

- **Owner instruction:** Move Appearance text/header row slightly up so it looks centered and restore bottom-sheet corners. Prior owner request restored the handle; retain it.
- **Technical decision PROCEED:** Minimal 4dp upward adjustment by removing the handle's `space.xxs` bottom margin, preserving its 8dp top margin and decorative size; apply existing 16dp `radius.md` only to sheet top corners. Keep left title/X, 48dp minimum accessible hit target, header divider, mode rows and theme persistence unchanged.
- **Scope:** Sheet presentation, matching regression assertions, feature guide and additive AI task/index checkpoint on PR #18 feature branch. No screen-owned state, finance, native, CI/workflow, dependency or privileged Codespaces changes.
- **Safeguards:** Guard exact PR/head/main, ensure `tio-preview` absent before non-force branch push. Exact-new-head CI/device visual validation required. Formal independent UI review deferred; PR #18 stays Draft and **NOT MERGE AUTHORIZED**.

## 2026-11-21 — Owner revision: center title, remove X at same height

- **Owner direction:** Remove visible X from Appearance bottom sheet and center the title at the current header height. This supersedes prior left-title/X choices, but not the handle, rounded top corners or compact row geometry.
- **Technical PROCEED:** Keep `minHeight: theme.buttons.minimumHeight` (48dp), horizontal inset, bottom divider; center single title full width and delete unused X SVG. Preserve backdrop and Android Back dismissal; support iOS VoiceOver escape with `onAccessibilityEscape` for accessibility after removing visible X.
- **Scope:** Sheet, Phase 0 structural tests, appearance guide and additive task/index checkpoint only. No theme state/store, other tabs, finance, native config, new dependency or privileged workflow edits.
- **Safety:** Only guarded, non-force feature-branch commit on draft PR #18. Keep `tio-preview` absent; no Codespaces dispatch, EAS release or `main` merge. Exact-head CI and owner device test remain acceptance gates. Independent UI review deferred and no merge permission granted.

## 2026-11-21 — Owner top-only outline and more rounded corners

- **Owner direction:** Add a light outer top border, integrated with rounded top corners. The former 16dp rounding looked too subtle; increase to the shared 20dp radius.
- **Technical PROCEED:** Set both sheet top radii to `theme.radius.lg` and only the top outer border to 1dp `theme.navigation.borderWidth` and semantic `theme.colors.border`. Keep existing clipping, centered 48dp header without X, drag indicator, divider and three accessible radio options. No side/bottom outer border or extra shadow.
- **Quality fix:** Prior commit `76319588` failed Phase 0 Prettier on the appearance regression test. Simplify the escaped-quote assertion and assert the border/corner theme tokens. Require exact-head CI and device acceptance.
- **Scope/security:** Feature UI, tests, docs and task/index records only. No ViewModel/store/finance changes, dependencies, native setup, CI workflow or EAS. Keep `tio-preview` absent before non-force PR branch push; no Codespaces dispatch, force push or PR #18 merge. Independent UI review deferred.

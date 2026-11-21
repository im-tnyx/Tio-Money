# TM-UI-TAB-CROSSFADE-20261121 — Root tab scene transition

| Field | State at implementation start |
|---|---|
| Repo | `im-tnyx/Tio-Money` |
| Task status | `IN_PROGRESS`, exact-head CI / review and device acceptance pending |
| Source / RFC | [Issue #46](https://github.com/im-tnyx/Tio-Money/issues/46), owner requested implementation through merge gate on 2026-11-21 |
| Technical proceed decision | [Issue #46 decision](https://github.com/im-tnyx/Tio-Money/issues/46#issuecomment-7060225970) — PROCEED by implementer, not owner merge approval |
| Branch | `feat/root-tab-crossfade-160ms-46` |
| Base | `main` at `9d2f0c793442b76131834a9ffc0c1962734ab00d` (verified) |
| Agent | ChatGPT GPT-6, architect/implementer (self-declared, not independent reviewer or Git author) |
| Independent review | `DEFERRED` until stable PR and actual finding verification; optional for UI, blockers mandatory |
| Merge permission | `NOT_GRANTED`; owner asked to reach merge gate, not merge |
| Privileged preview | `NOT_GRANTED`; no `tio-preview` or EAS/Codespaces dispatch |

## Architecture and scope

- Current `Slot` replaces child routes without an animation. A new scene-only Expo Router JavaScript Tabs navigator enables true **160ms crossfade** without adding an `Animated.View` inside feature screens or duplicating route state. `tabBar={() => null}` hides the navigator's built-in bar.
- Keep one existing, independent `RootTabBar` and one disabled `FloatingAddButton` alongside the scene navigator; exactly 5 routes and current `router.navigate` active state; explicit history Back semantics are to be validated on devices.
- `motion.tabCrossfadeDurationMs` in primitives provides numeric 160ms; `navigationTokens.tabCrossfadeDurationMs` is its semantic role. Do not change previously approved icon weight (300 active/200 inactive), 0dp icon-label gap, 24dp icon, safe area or FAB geometry.
- React Native `AccessibilityInfo` hook defaults Reduced Motion to true while unknown, updates from OS initial query and `reduceMotionChanged`, avoids async stale state and unsubscribes. Selected state is not stored inside screens.
- No new dependencies, screens, data migrations, finance, identity, SMS, native permission/config, route rewrites, splash or bottom-sheet animation. No gesture/spring/scale or FAB/tab-bar movement.

## Risk, alternatives and rollback

- Crossfade needs both outgoing and incoming scenes; a `Slot`-wrapped fade-in is not a real crossfade. A global captured previous screen is unnecessary route duplication. JS Tab Scene host has a possible navigation-history, deep-link, screen-lifetime, focus and insets regression risk; keep design stable, test route structure and plan Android/iPhone QA.
- Roll back this one feature PR if tab state/history or Reduced Motion misbehaves. No financial/data rollback or migration is required.

## Acceptance checklist

- [ ] Source theme token 160ms; crossfade on scene only and default off under Reduced Motion.
- [ ] Exactly five unchanged paths; custom bar/FAB stationary; accessible tab selected state remains.
- [ ] Existing navigation, Theme, More Appearance, shared sheet, splash/SQLite and Phase 0 tests PASS.
- [ ] New structural tests cover Expo tabs scene host, 160ms, absence of shift/spring and Reduced Motion dynamic changes/unsubscription.
- [ ] Exact-head strict TS/ESLint/Prettier/unit+preview, Expo config, Android/iOS Metro smoke, governance + review PASS; track actual links/SHAs.
- [ ] Manual Android/iPhone rapid tab switches, deep link, Android Back, More appearance persistence, safe area, Reduced Motion and screen reader smoke verified by owner on an actual build; do not infer from Metro CI.
- [ ] Merge gate only. Separate explicit permission required to merge PR #46 implementation.

## Handoff

Technical issue/RFC and implementation branch created 2026-11-21. Observe CI and Codex results, reconcile any new `main` commits and surface any outstanding device QA; keep PR unmerged. No exact-head PASS claimed at issue start.

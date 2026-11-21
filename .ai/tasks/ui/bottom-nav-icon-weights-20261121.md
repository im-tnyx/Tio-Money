# TM-UI-NAV-WEIGHTS-20261121 — Bottom navigation active icon weights

| Field | Verified value |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle | `IN_PROGRESS` — implementation in feature branch; CI/review still required |
| RFC and decision | [Issue #44](https://github.com/im-tnyx/Tio-Money/issues/44), [technical PROCEED checkpoint](https://github.com/im-tnyx/Tio-Money/issues/44#issuecomment-7059593229) |
| Owner instruction | 2026-11-21: selected icon 400, unselected 200; implement and advance only to merge gate |
| Agent | ChatGPT GPT-6, self-identified architect/implementer, not Git author or independent reviewer |
| Branch | `feat/bottom-nav-selected-400-20261121` |
| Inspected base | `main` at `28af00b40020af4986bfd2843a22d88e6c584c0c` |
| Review disposition | `DEFERRED` until CI-stable PR head; independent UI review optional, blockers binding |
| Merge authorization | `NOT_GRANTED`; owner requested merge gate only |
| Codespaces/EAS | `NOT_GRANTED`; `tio-preview` must remain absent |

## Architectural decision and bounded behavior

- Existing `RootTabBar` already calculates active state from the pathname. Pass that state into the reusable `RootTabIcon` without introducing navigation/selection state in a presentation component.
- `navigationTokens.selectedIconWeight=400` and `unselectedIconWeight=200` are semantic artwork choices. Use authentic official 24px Google Material Symbols Outlined SVGs, not stroke-width simulation. For selected: original `<name>_24px.svg` (regular 400). Unselected: retain existing `<name>_wght200_24px.svg` bytes unchanged. Apache 2.0 source/license and exact per-tab mapping remain documented.
- Keep icon size 24dp, semantic brand/secondary colors, labels, 1dp gap, 48dp tab touch target, 50dp bar baseline, safe areas, independent disabled 50dp Add FAB and all existing behavior.
- This owner decision supersedes previous weight 200 maximum **only for selected bottom tabs**; appearance mode icons and FAB unchanged. No new dependencies, native config, CI workflow, finance/SMS changes or product routes.

## Threat/risk and rollback

- Visual regression or source-provenance mistakes are the principal risks. Verify exact local artwork matches upstream and contains distinct 200/400 paths, conditional rendering from parent selected state, explicit tests and Android/iPhone visual QA. No data or financial semantics touched.
- Rollback is revert of the feature PR, with no database migration. Do not activate privileged Codespaces or merge before separate owner instruction and current GitHub protection recheck.

## Acceptance plan / agent handoff

1. Five existing unselected SVG files remain unchanged; five authentic selected SVGs added, source mapping documented. Shared tokens select 400 for active and 200 for inactive, tint remains theme-driven.
2. `RootTabBar` passes selected boolean, `RootTabIcon` picks correct XML; no new state/routing. Existing accessibilityRole tab and selected semantics remain unchanged.
3. Update `tests/phase0/navigation-shell.test.ts` + `design-tokens.test.ts` for both weights, exact SVG, size invariants, no icon font/dependency.
4. Phase 0 (TS, ESLint, Prettier, unit/preview, Expo config, Android/iOS Metro) + AI Governance CI pass at exact PR head; examine independent review findings. Document any unavailable physical-device QA honestly.
5. Open a Draft PR for owner/review; only after stable checks move to Ready for Review, but **not merge** without PR-specific authorization.

## Checkpoint

- RFC and task scope recorded on 2026-11-21; verified source base `28af00b40020af4986bfd2843a22d88e6c584c0c`. Final PR/CI SHA to be added only after observation. Post-merge handoff not yet applicable.

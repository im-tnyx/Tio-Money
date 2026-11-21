# TM-UI-BOTTOM-SHEET-20261121-042 — Shared AppBottomSheet

| Field | Verified task state |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle | `IN_PROGRESS` — source branch and scoped implementation underway; exact-head CI pending |
| RFC / owner source | [Issue #42](https://github.com/im-tnyx/Tio-Money/issues/42); user requested task start on 2026-11-21 |
| Proceed decision | Architect-recorded `PROCEED` on [Issue #42](https://github.com/im-tnyx/Tio-Money/issues/42#issuecomment-7059311342), based on bounded owner request (not merge approval) |
| Agent | ChatGPT GPT-6, current implementer (self-reported; not Git author or independent reviewer) |
| Branch | `feat/shared-app-bottom-sheet-42` |
| Base | `main` at `001d5338836faeffdaf7450e66351d3d5b3f7868` (verified before branch creation) |
| Prior feature | [PR #18](https://github.com/im-tnyx/Tio-Money/pull/18) merged, final Appearance UI baseline |
| Review | `DEFERRED` — optional independent UI review until stable PR head; do not claim independent approval |
| Merge authorization | `NOT_GRANTED` for the future Issue #42 implementation PR |
| Privileged preview | `NOT_GRANTED`; do not apply `tio-preview` label or dispatch Codespaces/EAS |

## Scope, decision and architecture

- Shared `AppBottomSheet` UI shell owns Modal, safe area, backdrop, Android Back, VoiceOver escape, compact decorative handle and centered 48dp-min header/divider. Props are controlled by caller: `visible`, `title`, `dismissAccessibilityLabel`, `onDismiss`, `children`.
- Common semantic `bottomSheetTokens` references the single radius `radius.xl = size.dp24`, role-based handle sizes/gaps, backdrop opacity, header min height/horizontal inset/divider and max height. No outer top border or X; preserve current owner-accepted visual geometry.
- `AppearanceSheet` composes the shell and owns only radio choices/error display. `useMoreViewModel` still owns visibility and actions; shared theme provider/data adapter still own preference storage and safe fallback. No new user feature routes, screen state, global manager, gestures, finance logic, package/native or workflows.
- Alternatives: duplicating shell per feature causes drift; global modal singleton introduces unnecessary control/state complexity; gesture/dynamic text redesign is out-of-scope and requires separate evidence.
- Risks and mitigations: avoid nested dismiss actions, preserve 48dp header and safe-area behavior; keep backdrop semantics and no false persistence on failed write. Static tests + CI do not prove on-device iOS/Android accessibility; record actual QA separately.

## Acceptance and test plan

1. Source tests assert a single common shell, exact controlled props, one backdrop-dismiss touch surface, safe-area/Back/VoiceOver, no outer top border, shared 24dp radius, handle, header and divider.
2. Existing Appearance radio/selection tests continue to pass; no feature-owned Modal and no ViewModel changes.
3. Isolated test-only second consumer fixture demonstrates distinct content in the same shell without creating a new product route.
4. Exact-head `npm run check`, Expo config/dependency validation and Android/iOS Metro smoke in Phase 0 GitHub workflow; governance CI PASS. Record the actual SHA and failed/skipped steps honestly.
5. Manual iPhone/Android screenshot, screen-reader, backdrop/Back, Dynamic Type and appearance-persistence QA after build is available. Do not mark complete based on CI alone.

## Current checkpoint / handoff

- Start date: 2026-11-21; separate Draft PR to be opened from the verified branch. No merge approval granted.
- Next: finish scoped implementation, verify exact latest HEAD, audit changes/CI and assess any blocking review findings. No privileged preview.

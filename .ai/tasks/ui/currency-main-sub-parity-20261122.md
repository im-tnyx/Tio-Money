# TM-CUR-UI-20261122-001 — Main/Sub Currency UI parity

| Field | Record |
| --- | --- |
| Repository | `im-tnyx/Tio-Money` |
| Owner instruction | 2026-11-22 chat: create new branch, fix audited Main/Sub mismatches, follow AGENTS.md; agent-transcribed, not a GitHub-authored approval |
| Agent | ChatGPT / GPT-6 (working agent), previous source agent UNKNOWN_NOT_VERIFIED |
| RFC / technical PROCEED | [Issue #81](https://github.com/im-tnyx/Tio-Money/issues/81) |
| Baseline main / branch start | `bb6638b56d2dea6d1e067806be009f500666e82c` |
| Branch | `fix/currency-main-sub-ui-parity-20261122` |
| Lifecycle | IN_REVIEW after code submission; exact-HEAD CI and physical-device QA pending |
| Review | Agent self-audit PERFORMED; independent human review DEFERRED, not required by owner's default policy unless GitHub protection says otherwise |
| Merge | NOT AUTHORIZED |

## Scoped implementation
- Match Main/Sub visible viewport bottom inset treatment and spacing without changing OS home indicator or scrolling semantics; preserve swipe outside-dismiss.
- Make Sub screen strictly presentational: swipe gesture lifecycle in controller hook, FX formatted labels in ViewModel, no storage/network/ledger calls in screen.
- Disable Add at five Subs; preserve domain guard. Show last successfully checked local date in Sub detail alongside provider publication date; preserve raw six-decimal FX quote and cached indicator.
- Regression source/pure geometry tests and current Currency specification correction only.
- **Overlap constraints:** PR #80 independently owns `app-top-bar.tsx`, `action-button.tsx`, `component-tokens.ts`, `strings.ts`, `more-screen.tsx` and `.ai/current.md`; untouched. Shared topbar migration and 42dp button surface deferred until PR #80 merges. Owner's special USD label remains intentionally unchanged. Large Numbers is not currently approved for implementation.

## Validation and security gates
- CI must validate `npm run check`/Phase 0 checks at the proposed exact PR HEAD; no local checkout available through connector, so no local command or device run claimed.
- Manually check iOS right/left navigation gestures, Sub row swipe-outside-delete, bottom gesture bar, Android scrolling, keyboard, VoiceOver/TalkBack, light/dark and dynamic type before merging.
- No new package, third-party request, rate provider, account or journal conversion, login, secret, cloud movement, workflow change, protected main write or risk acceptance.
- Rollback: close Draft PR without merging; no schema or saved preferences changed.

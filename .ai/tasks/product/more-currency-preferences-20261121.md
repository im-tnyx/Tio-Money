# TM-CURRENCY-PREF-20261121-001 — Local Main/Sub preference and More UI

> **No merge permission.** This is a display-preference foundation, not FX or multi-currency ledger implementation.

| Field | Verified value |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| Source | Owner 2026-11-21 chat request to prioritize More Main/Sub Currency before Accounts/Logs/Stats; agent-transcribed, not a GitHub-authored approval |
| Agent | ChatGPT GPT-6; unknown prior source owner |
| RFC | [#52](https://github.com/im-tnyx/Tio-Money/issues/52) |
| Technical decision | [Agent PROCEED](https://github.com/im-tnyx/Tio-Money/issues/52#issuecomment-7061682129) bounded local preferences only |
| Lifecycle | IN_PROGRESS — owner screenshot UI expansion under RFC #54; final-head checks pending |
| Base | `b49a4a90d653090e1b4ed4de7302dd6b9f2365c0` (`main`) |
| Branch | `feat/more-currency-preferences-20261121` |
| PR | [#53](https://github.com/im-tnyx/Tio-Money/pull/53), OPEN, changed under [RFC #54](https://github.com/im-tnyx/Tio-Money/issues/54) |
| Owner merge authorization | **NOT_GRANTED** for the future PR |

## Architecture / security
- More Appearance remains intact. A second full-width Currency settings row opens a shared AppBottomSheet offering Main (default INR) and optional distinct Sub / None, with per-selection typed controller actions and English accessible copy.
- Pure shared contract and globally injected root provider expose the same locally persisted preference to future features. Current finance screens remain blank. Curated ISO-labelled options represent **display settings only**, not a vetted FX/ledger list.
- Versioned local `expo-sqlite/kv-store` data, no migrations, no network, no FX rates or stale/unavailable quote promises, no cloud/Auth, SMS, background tasks, native permissions, new dependencies, workflow edits or account/ledger posting changes.
- Material TM-ADR-018/023 and cross-currency posting remain **BLOCKED**. Main/Sub setting does not touch original/historical money.
- Alternative screen-local state rejected (would drift between Accounts, Logs and Stats). Alternative new finance SQLite migration rejected (too early / financial policy still unresolved). In error, keep last persisted value with visible recoverable error.
- Rollback: close PR before merge; no new financial records to migrate, no destructive recovery; if later reverted, versioned settings key is ignored.

## Validation gates
- `TM-CUR-001–008` pure parsing, collisions, invalid values, root context, local writer, dumb/accessibility, unchanged financial DB; `npm run check` TypeScript/ESLint/Prettier/tests/preview on the actual PR HEAD via CI, not inferred from earlier SHA.
- On-device Android/iPhone selection, offline restart, VoiceOver/TalkBack, light/dark and dynamic text **NOT_RUN** unless independently documented.
- Independent review **DEFERRED** until PR; no passing verdict presumed. Actual GitHub required checks, reviews, security findings and review threads must be verified; no protection bypass.
- No direct `main` writes, merge/auto-merge, force-push, branch deletion, privileged preview or deployment. Future owner permission must name exact PR.

## 2026-11-21 — Main Currency display UI expansion

Owner screenshot and follow-up: More has a separate Currency section; Main Currency is a dedicated nested screen with Back/centered title/Change, preview amount, **inline Front/End buttons**, and Decimal Point + Indian/International Number Format + optional Large Numbers reusable bottom sheets. Change opens currency-list bottom sheet; Sub Currency remains accessible from More. This is same-feature, unmerged PR #53 scope under [RFC #54 technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/54#issuecomment-7061914160). New local display preference model preserves original saved Main/Sub payloads, never rewrites booked money; sample formatter is for UI preview only, not ledger math. Added deterministic UI/pure formatting coverage. Exact new-head CI/device QA pending. Merge still **NOT_GRANTED**.

## 2026-11-21 — Owner segmented-control screenshot reference

Owner supplied screenshot with dark `Write | Preview` pill selector. This is the visual basis for the **Front | End** segmented presentation, not new labels or app top-bar behavior. [RFC #54 comment](https://github.com/im-tnyx/Tio-Money/issues/54#issuecomment-7062453526) records technical PROCEED for the reusable `AppSegmentedControl` and semantic dark/light tokens. This extension stays in unmerged PR #53; `TM-CUR-014` checks props-only radio semantics, semantic tokens and shared control reuse. There are no financial data, FX, migration, app route, payment or cloud changes. Known existing Prettier failure in `main-currency-screen.tsx` remains a separate CI blocker until fixed at exact HEAD; **MERGE_AUTHORIZATION=NOT_GRANTED**.

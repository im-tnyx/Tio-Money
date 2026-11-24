# TM-ACCOUNTS-20261123-001 — Accounts UI foundation

| Field | Verified value |
| --- | --- |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle | IN_REVIEW |
| RFC | [#96](https://github.com/im-tnyx/Tio-Money/issues/96) |
| Decision | [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096382991) for UI only. Finance BLOCKED_PENDING_DECISION. |
| Current agent | Codex Cloud, GPT-6 family. Exact variant UNKNOWN_NOT_VERIFIED. |
| Previous agent | No previous assignee verified for this task. |
| Branch | `feat/accounts-ui-foundation-20261123` |
| Base and starting HEAD | `f865969d200d70fbc8e84dd6a48d8020a155e42c` |
| Review | DEFERRED. No independent review of the draft has been performed. |
| Merge authorization | NOT_GRANTED |
| PR | [Draft #97](https://github.com/im-tnyx/Tio-Money/pull/97) |

## Scope and ownership

Owner directions dated 2026-11-23 were transcribed by the agent in the RFC. The owner requested Accounts creation through the tab header and a separate Manage Accounts destination. The agent recorded the bounded technical decision after checking live refs and the source. No open PR claimed the Accounts route. PRs #80, #88 and #90 had merged. Issue #94 owns reconciliation of prior task history and #91 tracks the Android Back defect separately.

The Accounts feature owns group selection, transient typed Cash/Bank form drafts and the unavailable Manage Accounts view. Routes compose controllers and presentation. Screens receive immutable state and callbacks per [TM-DEC-011](../../../docs/governance/DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule). Reuse the visual group definitions, shared theme/components and currency preferences. No finance schema, journals, account data, default seeding, real Save, account lifecycle writes or fake totals.

Acceptance before coding: check routing from the Accounts header and Settings, disabled unsupported groups, guarded draft navigation, Main/Sub currency choices, no persistence, unchanged tabs/FAB, and the screen/controller boundary. Run static checks, Expo bundles and governance. Device QA covers Back, keyboard, safe area, reduced motion, theme and accessibility.

## Checkpoints

- 2026-11-23 UTC — Verified clean dedicated checkout at the exact main SHA above after posting the separate technical decision. UI and tests assigned to this Codex Cloud session. Finance work remains at the design gate.


### 2026-11-23T09:20:42Z — UI and local validation

- Clean initial checkout and audited base `f865969d200d70fbc8e84dd6a48d8020a155e42c`. Rechecked main, branch and open PRs before handoff. The account picker dismisses before route navigation. The new Android picker uses a nonanimated modal to avoid overlapping native transitions; detail routes use shared motion. No owner reference images were attached.
- Local Node `24.22.3` / npm `11.19.1`. `npm ci --cache /tmp/tio-money-npm-cache --no-audit --no-fund` passed with the writable cache. `npm run check` passed with network/socket permission: TypeScript, ESLint, Prettier, 137 application tests and 66 preview tests. One preview test intentionally skipped outside CI (isolated npm registry-signature verification).
- `npx --no-install expo install --check` and `npx --no-install expo config --type public` passed. Metro `expo export --platform android --platform ios --max-workers 1` passed in offline mode. The bundles are build-time smoke evidence. Device interaction, keyboard, accessibility, theme, Reduced Motion and white-flash acceptance remain unverified. #91 remains open.
- `python3 -m unittest discover -s tests/governance` passed (29 tests). `python3 scripts/ai_context.py check-links` and `git diff --check` passed. Exact GitHub SHA, attribution audit, required CI and independent review follow at Draft PR handoff.
- Finance persists at BLOCKED_PENDING_DECISION. Next design gate: reviewed SQLite schema, opening equity/idempotency, lifecycle and Default Cash restore protocol, followed by an independently reviewed finance PR with deterministic failure and recovery tests.
- Changed files:
  - `.ai/current.md`
  - `.ai/tasks/accounts/accounts-ui-foundation-20261123.md`
  - `src/app/(tabs)/accounts.tsx`
  - `src/app/_layout.tsx`
  - `src/app/add-account/[group].tsx`
  - `src/app/manage-accounts.tsx`
  - `src/features/accounts/account-form-contract.ts`
  - `src/features/accounts/account-page.tsx`
  - `src/features/accounts/accounts-route.tsx`
  - `src/features/accounts/accounts-screen.tsx`
  - `src/features/accounts/add-account-route.tsx`
  - `src/features/accounts/add-account-screen.tsx`
  - `src/features/accounts/index.ts`
  - `src/features/settings/index.ts`
  - `src/features/settings/more-contract.ts`
  - `src/features/settings/more-screen.tsx`
  - `src/features/settings/use-more-view-model.ts`
  - `src/shared/i18n/strings.ts`
  - `src/shared/ui/app-bottom-sheet.tsx`
  - `tests/accounts/accounts-preview.test.ts`
  - `tests/phase0/design-tokens.test.ts`
  - `tests/phase0/navigation-shell.test.ts`
  - `tests/phase0/settings-topbar-groups.test.ts`
  - `tests/phase0/shared-bottom-sheet.test.ts`
  - `tests/phase0/tab-crossfade.test.ts`


### Draft handoff — 2026-11-23 UTC

- GitHub confirmed open Draft PR #97 from the assigned branch to main at the base above. Initial implementation HEAD `c154c40cfee2071eef94a440624a479bff3d999a`; GitHub PR author `im-tnyx`, Git commit author Santosh Jangid. Agent provenance is recorded separately above.
- The staged implementation tree matched the connector commit tree `1759f29b5e098fe52675f99da34142bd842092b4`. Local `python3 scripts/ai_context.py check-commits --base f865969d200d70fbc8e84dd6a48d8020a155e42c --head c154c40cfee2071eef94a440624a479bff3d999a` passed (1 commit).
- Main ruleset `protect-main` requires `static`, `Governance / Python, links and commit attribution` and resolved review threads. Governance passed on the initial draft HEAD and static was in progress. The handoff-only commit requires fresh exact-HEAD CI. Follow the [PR checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for current evidence.
- Independent review DEFERRED. No device acceptance recorded and no merge authorization granted. Safest next steps are exact-HEAD CI, review and on-device navigation checks for the UI draft, and separate owner review of the finance design in RFC #96.

### 2026-11-23T09:42:03Z — Source audit and finance design handoff

- Draft [#97](https://github.com/im-tnyx/Tio-Money/pull/97) reviewed by the implementing Codex agent at `7042a1ba8ac78b6fd1b7a347666212cd1630a7f6`, based on live main `f865969d200d70fbc8e84dd6a48d8020a155e42c`. Source audit PERFORMED (self-review). Independent review DEFERRED. GitHub had zero submitted reviews, inline comments and review threads at inspection.
- Exact reviewed HEAD: [static CI passed](https://github.com/im-tnyx/Tio-Money/actions/runs/45148010190/job/137602004874) and [Governance passed](https://github.com/im-tnyx/Tio-Money/actions/runs/45148010201/job/137602004535). Local diff whitespace and commit attribution passed. No device tests performed in this audit.
- Runtime scope remains transient Cash/Bank forms, shared picker and unavailable Manage Accounts. The routing guard accepts only supported groups. The screens render state and callbacks per TM-DEC-011. New draft fields are held in React state. No new save, accounts, ledger, credential capture, network or permission path was observed.
- Medium accessibility follow-up: currency selection uses color alone visually, alongside the accessibility checked state. Add a non-color selection marker and verify screen-reader and modal focus behavior before UI acceptance.
- Low draft-state follow-up: form callbacks update from the render snapshot, so rapid batched actions can lose prior edits. Use a functional updater with a batch regression fixture before enabling persistence.
- Verify modal handoff on physical devices: iOS uses the dismissal callback, Android hides the nonanimated sheet and schedules navigation one frame later. Source inspection does not prove focus, keyboard, gesture Back, double-tap or white-flash behavior. [#91](https://github.com/im-tnyx/Tio-Money/issues/91) remains open and separate.
- [Technical decision and review](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096975333) authorizes only appending this checkpoint and the current index entry. [Finance RFC #98](https://github.com/im-tnyx/Tio-Money/issues/98) is DECISION_PENDING. Schema, migration, posting runtime, Default Cash and restore remain BLOCKED_PENDING_DECISION. Separate smallest next PR candidate is pure monetary parsing and opening-journal domain logic with test fixtures and no runtime wiring. It needs its own scoped PROCEED. Merge authorization NOT_GRANTED.

### 2026-11-23T10:12:25Z — Complete Add Account UI previews

- [Owner direction transcribed in RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7097489587) and [separate technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7097494971). Verified clean branch `feat/accounts-ui-foundation-20261123` at starting HEAD `3d3b9bd61f56e24af376c6aa2afb5099172e1c80`, live main `f865969d200d70fbc8e84dd6a48d8020a155e42c`, Draft #97 ownership. PR #100 overlaps this task index only; preserved all existing entries.
- Accounts picker renders all seven built-ins with shared icon tokens. Cash, Bank, Credit Card, Wallet, Loan and Investment open typed previews. Insurance is informational. Custom groups remain display-only. Bank payment modes are in-memory named draft rows. Card repayment-account and payment tracking controls, and Bank-linked Wallet's Bank selector, are unavailable. Loan and dated investment fields collect reference text only. Save is visibly disabled and Cancel discards the form. No database, new permissions, balance projection, or management mutation is in this change. [RFC #98](https://github.com/im-tnyx/Tio-Money/issues/98) remains DECISION_PENDING.
- Source review PERFORMED by Codex. The currency selector now has a visible checkmark plus accessible checked state. Functional state updates preserve consecutive edits and Wallet section values. The picker locks choice across dismissal and the route transition. Shared detail motion, themed surfaces, safe area and keyboard-aware Bank mode sheet are wired. Independent review DEFERRED. Device interaction, screen-reader focus, keyboard and transition behavior remain unverified. [Issue #91](https://github.com/im-tnyx/Tio-Money/issues/91) remains separate.
- Tested source tree before this documentation checkpoint: `d196a189514f705a4657def67f919552156278d3`. Node 24.22.3 and npm 11.19.1. `npm run check` passed typecheck, ESLint, Prettier, 139 application tests (including 7 Accounts tests), and 66 preview tests. One CI-only signature check skipped locally. Also ran `node --import tsx --test --test-isolation=none tests/accounts/accounts-preview.test.ts` (7 passed).
- `CI=1 __UNSAFE_EXPO_HOME_DIRECTORY=/tmp/tio-ui-expo-cache EXPO_NO_TELEMETRY=1 npx --no-install expo install --check` and `CI=1 EXPO_NO_TELEMETRY=1 npx --no-install expo config --type public` passed. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 npx --no-install expo export --platform android --platform ios --output-dir /tmp/tio-add-account-native --max-workers 2` passed for both platforms.
- `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/governance` (29 passed), `python3 scripts/ai_context.py check-links` and `git diff --check` passed. Exact published HEAD, attribution and GitHub CI are recorded in the RFC handoff. Draft #97 remains open; owner merge authorization NOT_GRANTED.
- Files in this slice, in addition to this task and the current index:
  - `src/features/accounts/account-form-contract.ts`
  - `src/features/accounts/account-form-controls.tsx`
  - `src/features/accounts/account-group-icon.tsx`
  - `src/features/accounts/account-picker.ts`
  - `src/features/accounts/accounts-route.tsx`
  - `src/features/accounts/accounts-screen.tsx`
  - `src/features/accounts/add-account-route.tsx`
  - `src/features/accounts/add-account-screen.tsx`
  - `src/features/accounts/bank-payment-modes.tsx`
  - `src/shared/i18n/strings.ts`
  - `tests/accounts/accounts-preview.test.ts`

### 2026-11-23T10:28:45Z — Owner correction for Currency and Credit Card

- [Owner transcript and technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7097962644). Verified starting Draft #97 HEAD `0f470fc4f29d477abb28c2f9a567e8b0e0468b76`, live main `f865969d200d70fbc8e84dd6a48d8020a155e42c` and Accounts branch ownership. PR #100 overlaps the shared index only. Existing records were preserved.
- The view model hides the entire Currency selector when no Sub Currency is configured or the Wallet is bank-linked. New eligible drafts default to Main. Removed currency choices reconcile the in-memory draft and clear old amounts, so re-adding a currency cannot revive them. Funded Wallet section data is retained when its currency remains eligible. The six group field layouts and named Bank linked-mode editor are covered by regression tests. Card uses Total Credit Limit and Due Date and displays a dedicated disabled tracking-only Auto Pay control alongside Pay From Account. Finance RFC #98 remains DECISION_PENDING.
- Source self-review PERFORMED. Controllers own preferences and draft changes. The screen uses typed props, radio checkmarks and disabled states; Auto Pay has no handler. No finance writes or new account operations. Independent review DEFERRED. No physical screen-reader, keyboard or navigation QA performed. [Android #91](https://github.com/im-tnyx/Tio-Money/issues/91) remains separate.
- Tested source tree before this checkpoint `c6b7e475f9735110b42a3a5f42e1b0cf808b0c1f`. `npm run check` passed typecheck, ESLint, Prettier, 143 app tests and 66 preview tests. One CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/accounts/accounts-preview.test.ts` passed all 11 Accounts tests.
- `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 npx --no-install expo export --platform android --platform ios --output-dir /tmp/tio-account-correction-native --max-workers 2` exported both bundles. `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/governance` passed 29 tests. `python3 scripts/ai_context.py check-links` and `git diff --check` passed. Exact published HEAD and CI are recorded in RFC #96. Draft status retained and owner merge authorization NOT_GRANTED.
- Changed paths in addition to this task and the index:
  - `docs/product/ACCOUNT-GROUPS-SPEC.md`
  - `src/features/accounts/account-form-contract.ts`
  - `src/features/accounts/add-account-route.tsx`
  - `src/features/accounts/add-account-screen.tsx`
  - `src/shared/i18n/strings.ts`
  - `tests/accounts/accounts-preview.test.ts`

### 2026-11-23 — Owner correction follow-up

- Codex Cloud reverified Draft #97 at `d7552a732382b82d78540395af7f2aeeb0433664` before editing and recorded the [scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7098232880). The starting HEAD passed both required GitHub checks.
- The controller contract uses the same configured currency options for rendering and for accepting draft actions. The linked Wallet explains Bank currency inheritance while Bank selection is unavailable. Regressions cover both preference states, amount clearing and other draft retention across all six groups, Bank editor retention and accessibility attributes.
- Changed paths besides this record and the index are `src/features/accounts/account-form-contract.ts`, `src/shared/i18n/strings.ts` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and physical screen-reader and navigation QA remain pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for exact published HEAD and validation results. Finance RFC #98 remains pending. Merge authorization NOT_GRANTED.

### 2026-11-23 — Reconcile Draft #97 with main

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7098601639) records the owner’s branch alignment request. Draft HEAD `9dcb6e1bd53f09254f6b503bc443981924ccfa4e` was five commits behind main `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- The only conflict was in `.ai/current.md`. Both the Accounts and the merged PR #100 preview recovery records are preserved. The Accounts application source and tests match the prior Draft HEAD. The preview implementation matches main.
- Source reconciliation reviewed by Codex Cloud. Independent review remains DEFERRED. Exact published HEAD and validation evidence are recorded in [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96). Draft status and finance gates remain in effect. Merge authorization NOT_GRANTED.

### 2026-11-23 — Borderless Add Account fields

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7098953741) records the owner’s visual request on Draft #97 at starting HEAD `6c9b18972783ac6e35f81a454398e026b7b9d769`.
- All main-form text inputs opt into the shared borderless appearance, including suppression of the Android native underline. The Linked Payment Modes sheet uses the default outlined input. Labels, dimensions, keyboard types and form behavior are preserved.
- Changed paths besides this record and the index are `src/shared/ui/app-text-field.tsx`, `src/features/accounts/add-account-screen.tsx` and `tests/accounts/accounts-preview.test.ts`. The regression covers the main form and sheet appearance boundary.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and observed validation. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Currency row and Account Settings card

- [Currency technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099073273) and [Account Settings technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099098074) record the owner’s visual requests against Draft #97 head `8f2b30a907f5635846c87727081c44127704b1d3`.
- The controller supplies currency symbols from the shared catalog. The main form reuses radio choices with a single scrollable row, codes and checked states. A new draft defaults to Main, and preference eligibility and guarded amount clearing are preserved.
- Account Groups and Manage Accounts share the Currency card surface and divider styles. Each row continues to dispatch its existing action.
- Changed paths besides this record and the index are `src/features/accounts/account-form-contract.ts`, `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/add-account-route.tsx`, `src/features/accounts/add-account-screen.tsx`, `src/features/settings/more-screen.tsx` and `tests/accounts/accounts-preview.test.ts`.
- The first full test run found that TM-CUR-025 expected inline styles. Updated `tests/phase0/more-currency-group.test.ts` to verify that Currency still uses one card and one inset divider through the shared styles.
- Source self-review PERFORMED, independent review DEFERRED and device visual QA pending. Exact published HEAD and validation evidence are recorded in [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96). Save remains disabled and merge authorization NOT_GRANTED.

### 2026-11-23 — Leading icons for Add Account fields

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099510319) records the owner’s icon-and-name reference against Draft #97 head `bf88272dc8ab6d3edecd34612ef947c993082cfa`.
- Main Add Account fields use an inset label and a themed leading icon column. Name uses the field label as its empty-input placeholder. Monetary fields use the chosen draft currency symbol and an empty-state zero. Date fields use a calendar and retain the reference-date format. Icons are hidden from assistive technology and fields keep their accessible names. The Linked Payment Modes sheet keeps its outlined field.
- Changed paths besides this record and the index are `src/shared/ui/app-text-field.tsx`, `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/account-form-contract.ts`, `src/features/accounts/add-account-route.tsx`, `src/features/accounts/add-account-screen.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and results. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Linked Payment Modes list

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099730686) records the owner’s list and header reference against Draft #97 head `10b78812d43779df12caaa44cc5f15cfdba4608d`.
- The existing compact button adds a draft mode from the header. Flat rows pair a themed type icon with the entered name, then show round Edit and Remove controls. Each action has a row-specific accessible name and a 48dp touch target. The outlined editor and stable-ID draft actions are preserved.
- Changed paths besides this record and the index are `src/features/accounts/bank-payment-modes.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and results. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Symbol-only Currency choices

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099810331) records the owner’s filled-selection reference against Draft #97 head `b98a9c2f0a09876c1e6f77889116cb0320d80999`.
- Currency choices show only their symbols. The selected option uses theme brand fill and contrasting text. The radio labels retain the codes and checked state. Main stays selected on new eligible drafts, and the existing visibility and amount-clearing rules are preserved. Other choices keep their existing label and checkmark treatment.
- Changed paths besides this record and the index are `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/account-form-contract.ts`, `src/features/accounts/add-account-route.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Compact Currency row and Description

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099965028) and [selected placement clarification](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7099988365) record the owner’s requests against Draft #97 head `33fe62f93be9336b9f3ccec0a555aafe17982a99`.
- The Currency label and small symbol boxes share one row. The selected radio stays at the right edge with a translucent brand fill. The other configured choices scroll in the remaining space. The visible box is compact and the radio target stays at least 48dp. Main remains the default and amount clearing is preserved.
- Description starts at the same height as the single-line inputs, shows its label inside when empty, wraps using native input layout and uses Done on the keyboard. The draft stores the original text.
- Changed paths besides this record and the index are `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/add-account-screen.tsx`, `src/shared/theme/tokens.ts`, `src/shared/ui/app-text-field.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Shorter Linked Payment Modes Add button

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100100853) records the owner’s request against Draft #97 head `cbb10ecf7cba30c710f7d0522f33058e18ae0d02`.
- The header action opts into the shared 32dp minimum painted height. The 48dp press target, editor callback, accessibility label and expansion for font scaling are preserved. Other buttons use the default 42dp minimum painted height.
- Changed paths besides this record and the index are `src/features/accounts/bank-payment-modes.tsx`, `src/shared/theme/component-tokens.ts`, `src/shared/theme/README.md`, `src/shared/ui/action-button.tsx`, `tests/accounts/accounts-preview.test.ts` and `tests/phase0/shared-action-button-size.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Single Bank account name

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100148939) records the owner’s clarification against Draft #97 head `960a8df709b68ec17eabcc912c5c0e531a21bdeb` and supersedes the earlier two-name Bank form direction.
- Bank shares the Account Name and opening input with Cash. The typed transient draft carries one name, which is retained while users edit linked payment modes. Currency and Description remain available under the existing form rules.
- Changed paths besides this record and the index are `docs/product/ACCOUNT-GROUPS-SPEC.md`, `src/features/accounts/account-form-contract.ts`, `src/features/accounts/add-account-screen.tsx`, `src/shared/i18n/strings.ts` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Currency and input dimensions and Credit Card field order

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100290763) and [placement clarification](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100318699) record the owner’s requests against Draft #97 head `e3b53d35197d8090fd1d1a53cd603223b235538b`.
- Currency boxes are 36 × 36dp with 48dp touch targets. Each radio dispatches its own code and the shared draft determines the checked state. The checked box remains at the right edge. Credit Card renders the row directly below Total Credit Limit.
- Borderless fields and their leading icons align at a 46dp minimum height. Description expands with native wrapping. Outlined inputs retain the 48dp minimum.
- Changed paths besides this record and the index are `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/add-account-screen.tsx`, `src/shared/theme/README.md`, `src/shared/theme/component-tokens.ts`, `src/shared/theme/primitives.ts`, `src/shared/theme/theme-provider.tsx`, `src/shared/ui/app-text-field.tsx`, `tests/accounts/accounts-preview.test.ts` and `tests/phase0/design-tokens.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Credit Card Auto Pay switch

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100361542) records the owner’s request against Draft #97 head `ebc0a1aa3a4f44dd5a92378ae8053ca3ec7bdbb4`.
- The Credit Card form shows a single Auto Pay row below Description. The native switch is Off and disabled, with the tracking-only policy available as an accessibility hint. The visible option list was removed.
- The [owner clarified](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100426277) that **Payment** is the visible name of the eligible Bank repayment-account row. The preview still shows it as unavailable until eligible accounts exist.
- Strict TypeScript at the preceding sizing commit rejected the test fixture’s unchecked array indexes. Explicit configured codes now drive the successive-selection regression.
- Updated `tests/phase0/account-group-display-preferences.test.ts` to verify that the Account Groups sheet still uses the default outlined field after sizing moved to dedicated field tokens.
- Changed paths besides this record and the index are `docs/product/ACCOUNT-GROUPS-SPEC.md`, `src/features/accounts/add-account-screen.tsx`, `src/shared/i18n/strings.ts` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Stable Currency selection

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100580606) records the owner’s correction against Draft #97 head `33c788a3d4628746ff67cb7385801c135ad107f5`. The previous selected slot reparented currencies when selection changed.
- Render the complete configured list in a single scrollable strip. The chosen code drives only the checked and filled styling. Main and Sub options keep their positions and existing amount-reset rules.
- Changed paths besides this record and the index are `src/features/accounts/account-form-controls.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Add Account text hierarchy

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100690697) records the owner’s reference against Draft #97 head `571a4bf367bd56d3c76abeae0ea03544278f60e4`.
- Caption labels use secondary text. Borderless placeholders have a distinct theme color with calculated contrast against the canvas of 4.66:1 in Light and 5.67:1 in Dark. Entered values and leading icons use the primary foreground. Name, amount and date use title size. Other borderless text uses section size. Description has a distinct lines icon and still wraps.
- Changed paths besides this record and the index are `src/features/accounts/add-account-screen.tsx`, `src/shared/ui/app-text-field.tsx`, `src/shared/theme/tokens.ts`, `src/shared/theme/README.md`, `tests/accounts/accounts-preview.test.ts`, `tests/phase0/account-group-display-preferences.test.ts` and `tests/phase0/design-tokens.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native device visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Amount symbol Currency picker

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7100887525) records the owner’s request against Draft #97 head `afb92d9d11576594380293531abd3a472aa769d1`.
- When configured Sub Currencies exist, amount symbols open one shared sheet with Main, configured Subs, checked selection and an amount-reset hint. Both Card amounts use the same draft code. With Main alone the symbol is informational, and the linked Wallet remains ineligible.
- Add Currency closes the picker before pushing Sub Currency settings with the existing Add sheet initially open. The Accounts draft stays on the stack. The existing settings cap and persistence rules apply.
- Changed paths besides this record and the index are `docs/product/ACCOUNT-GROUPS-SPEC.md`, `src/features/accounts/account-currency-picker.tsx`, `src/features/accounts/account-form-contract.ts`, `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/add-account-route.tsx`, `src/features/accounts/add-account-screen.tsx`, `src/features/settings/sub-currency-route.tsx`, `src/features/settings/use-sub-currency-view-model.ts`, `src/shared/i18n/strings.ts`, the shared theme README and chip tokens, `tests/accounts/accounts-preview.test.ts` and `tests/phase0/design-tokens.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual, touch and navigation QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Shared 46dp text field height

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7109719765) records the owner’s request against Draft #97 head `8e4404a452a5ed570b098c44db994f44ba36a9ac`.
- Both appearances now use one 46dp minimum. Linked Payment Modes and Account Groups use the shared outlined field and receive the same height. Description still expands with wrapping. Buttons and interactive currency symbols keep their 48dp targets.
- Changed paths besides this record and the index are `src/shared/theme/component-tokens.ts`, `src/shared/theme/README.md`, `src/shared/ui/app-text-field.tsx`, `src/features/accounts/account-form-controls.tsx`, `tests/accounts/accounts-preview.test.ts`, `tests/phase0/design-tokens.test.ts` and `tests/phase0/account-group-display-preferences.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — One inline Currency control per form

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7110102250) and [single-row clarification](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7110155081) record the owner’s requests against Draft #97 head `f087f29cf67e41ce12d52511b4d20838c787bcbf`.
- With configured Sub Currencies, one amount row per form shows 36dp symbol boxes to the right of the input. Overflow scrolls and each option has a 48dp target. The other amount symbols track the same draft currency. Credit Card uses Total Credit Limit, Loan uses Opening Outstanding Principal and Investment uses Historical Invested Cost.
- Selection remains in configured order and clears prior amounts via the existing guard. Remove the Currency sheet, its transient controller state and the direct Add shortcut. Sub Currency settings remains the entry for adding currencies. The 46dp text field minimum remains in effect.
- Changed paths include `docs/product/ACCOUNT-GROUPS-SPEC.md`, the Accounts form contract, controls, route and screen, removal of `src/features/accounts/account-currency-picker.tsx`, the two existing Sub Currency settings files from the shortcut, centralized strings and theme files, and the Accounts and design-token regressions.
- Source self-review PERFORMED. Independent review DEFERRED and native visual and touch QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Compact payment type tabs

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111045650) records the owner’s request against Draft #97 head `02f02b1559043929f840eff9a8549f92e4735c45`.
- Add/Edit Payment Mode shows the name prompt inside the outlined field and the type options in one scrollable row. Compact pill selection uses border and text contrast with accessible checked state and 48dp targets. Apply, Cancel and the existing draft actions remain available.
- Changed paths besides this record and the index are `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/bank-payment-modes.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual and touch QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Smaller payment actions and Apply-only editor

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111219399) records the owner’s requests against Draft #97 head `2071e4bf3fdfc802a48a0018ca8d4bc2da7074d2`.
- Edit and Delete use 18dp glyphs in 32dp painted circles with 48dp controls. Credit card, QR, checkbook and globe marks use official weight-200 Material Symbols Outlined for Debit Card, UPI, Cheque and Internet Banking. The sheet exposes Apply and uses shared dismissal to discard unapplied edits.
- Changed paths besides the task and index are `src/features/accounts/bank-payment-modes.tsx`, `src/shared/assets/google-material-icons/payment-mode-icons.json`, `src/shared/assets/google-material-icons/README.md`, `src/shared/theme/README.md`, `src/shared/theme/component-tokens.ts`, `tests/accounts/accounts-preview.test.ts` and `tests/phase0/design-tokens.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual and touch QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Add Account field and currency alignment

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111341207) records the owner’s visual report against Draft #97 head `22e5cb7c1a9b646d554343fd98bc22bd430cdc7e`.
- The form uses symmetric outer padding. Decorative leading icons occupy the theme’s icon width, with the same offset for captions and values. Painted currency boxes sit closer to the right gutter and keep their 48dp press targets. The amount-reset warning is no longer shown visually and remains available to assistive technology.
- Changed paths besides the task and index are `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/add-account-screen.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Linked Payment Mode limits and action spacing

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7111930485) records the owner’s request against Draft #97 head `32ecd3f2975bd51c71a9c1b5b3c5e185b524682c`.
- The Bank draft accepts at most three Debit Cards, three UPI modes, one Cheque and one Internet Banking mode. Full types cannot take a new mode or receive a type change. Rename stays available for existing entries, deletion frees capacity and Add is disabled at full capacity. Editor affordances use the same rules as the draft reducer.
- Edit and Delete targets sit directly adjacent and retain their 48dp sizes. Changed paths besides the task and index are `docs/product/ACCOUNT-GROUPS-SPEC.md`, `src/features/accounts/account-form-contract.ts`, `src/features/accounts/account-form-controls.tsx`, `src/features/accounts/add-account-route.tsx`, `src/features/accounts/add-account-screen.tsx`, `src/features/accounts/bank-payment-modes.tsx`, `src/shared/i18n/strings.ts` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual and touch QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Save remains disabled. Merge authorization NOT_GRANTED.

### 2026-11-23 — Add Account footer

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7112024624) records the owner’s request against Draft #97 head `5761173f47f2e0ec5a84cd914fdf6e8523dc0f7e`.
- Add Account’s footer shows disabled Save and its availability message. The header Back action and platform Back behavior still leave the transient draft. The Payment Mode sheet retains accessible dismissal.
- Changed paths besides the task and index are `src/features/accounts/add-account-screen.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED and native visual and navigation QA pending. See [RFC #96](https://github.com/im-tnyx/Tio-Money/issues/96) for published HEAD and checks. Merge authorization NOT_GRANTED.

### 2026-11-24T05:37Z — Stacked Add Account bottom sheets

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7112159681) records the owner’s request against verified starting HEAD `a8a92aa60940ff60c7451694f659bdb21977e0a5` and live `main` `6468b62786d56edb1a70b7a5c90146e17566e23b`. On resuming, GitHub’s timeline showed `im-tnyx` marked #97 Ready for Review at `2026-11-23T20:00:41Z`. Preserve that owner change. The PR was open with no auto-merge request or submitted reviews.
- Accounts + opens a shared Add Account sheet. Group starts at Select above Account Name. Group choices and the Bank Add/Edit Payment Mode editor use the same native modal host above the retained form. Back, accessibility escape and backdrop dismissal go to the top sheet first. Long forms expand within the top safe area and scroll above the keyboard. Separate in-memory group drafts retain fields, payment modes and their currency guards until Add Account closes. Insurance remains informational. Save and Auto Pay stay disabled.
- `npm run check` passed TypeScript, ESLint, Prettier, 155 app tests and 71 preview tests. One CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/accounts/accounts-preview.test.ts tests/phase0/{account-group-display-preferences,tab-crossfade,bottom-sheet-layout,shared-bottom-sheet}.test.ts` passed 52 targeted tests. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir /tmp/tio97-add-account-sheet-native --max-workers 2` exported both bundles. `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/governance` passed 29 tests. `python3 scripts/ai_context.py check-links` and `git diff --check` passed. See RFC #96 for the exact published SHA, attribution audit and required checks.
- Changed paths beyond this record and the index:
  - `docs/product/ACCOUNT-GROUPS-SPEC.md`
  - `src/app/_layout.tsx` and `src/app/add-account/[group].tsx` (removed route)
  - `src/features/accounts/account-add-session.ts`, `account-form-contract.ts`, `account-group-picker.tsx`, `account-picker.ts` (removed), `accounts-route.tsx`, `accounts-screen.tsx`, `add-account-route.tsx` (removed), `add-account-screen.tsx`, `bank-payment-modes.tsx`, `index.ts` and `use-add-account-sheet.ts`
  - `src/shared/i18n/strings.ts` and `src/shared/ui/app-bottom-sheet.tsx`
  - `tests/accounts/accounts-preview.test.ts` and `tests/phase0/{account-group-display-preferences,bottom-sheet-layout,shared-bottom-sheet,tab-crossfade}.test.ts`
- Source self-review PERFORMED. Independent review DEFERRED. Physical-device checks for keyboard, safe area, Back, drag and screen-reader focus are pending. Finance RFC #98 remains DECISION_PENDING. Merge authorization NOT_GRANTED.

### 2026-11-24 — Group-first Add Account and transparent fields

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7123331800) records owner direction against verified Ready for Review PR #97 head `36cc70b9caae0779294e61083615673189bb5078` and live main `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- Accounts + opens Choose Account Group. The first supported selection opens its named Add Account sheet in the same native modal host. Group selection is removed from inside the form. The owner also requested removal of the preview sentence. One draft stays mounted while the Bank payment editor is open and is discarded when the parent closes. Save and Auto Pay are disabled.
- The shared borderless appearance has a transparent background. It retains the 46 dp input minimum and leading icons. The main form uses 20 dp between field groups and 4 dp from labels to inputs. The outlined Payment Mode input retains its appearance and its sheet’s 16 dp control spacing.
- `npm run check` passed TypeScript, ESLint, Prettier, 155 app tests and 71 preview tests with one CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/accounts/accounts-preview.test.ts` passed 22 tests. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir /tmp/tio97-group-first-final-native --max-workers 2` exported both bundles. `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/governance` passed 29 tests. `python3 scripts/ai_context.py check-links` and `git diff --check` passed. Exact published HEAD, attribution and CI are recorded in RFC #96.
- Changed paths beyond this record and the index are `docs/product/ACCOUNT-GROUPS-SPEC.md`, `src/features/accounts/account-add-session.ts`, `src/features/accounts/account-form-contract.ts`, `src/features/accounts/account-group-picker.tsx`, `src/features/accounts/add-account-screen.tsx`, `src/features/accounts/use-add-account-sheet.ts`, `src/shared/i18n/strings.ts`, `src/shared/ui/app-text-field.tsx` and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED. Independent review DEFERRED. Native device checks for group-to-form focus, keyboard, drag and input appearance remain pending. Merge authorization NOT_GRANTED.

### 2026-11-24 — Add Account sheet entrance

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7123681685) records owner direction against verified Ready for Review PR #97 head `e236bee4f935c7b612e046961b2c1703229ab48b` and live main `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- Group selection keeps the native modal and backdrop in place. The form surface opts into a 240 ms upward entrance from its measured height. The shared UI uses native-driven translation and stops the entrance on unmount. Reduced Motion skips the entrance. The already-open form does not replay its entrance on layout changes.
- `npm run check` passed TypeScript, ESLint, Prettier, 156 app tests and 71 preview tests, with one CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/{accounts/accounts-preview,phase0/shared-bottom-sheet,phase0/bottom-sheet-layout}.test.ts` passed 37 tests. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir /tmp/tio97-entry-native --max-workers 2` exported both bundles. `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/governance` passed 29 tests. `python3 scripts/ai_context.py check-links` and `git diff --check` passed. See RFC #96 for exact published HEAD, attribution and required checks.
- Changed paths beyond this record and the index are `src/features/accounts/add-account-screen.tsx`, `src/shared/theme/component-tokens.ts`, `src/shared/theme/primitives.ts`, `src/shared/ui/app-bottom-sheet.tsx`, `tests/accounts/accounts-preview.test.ts` and `tests/phase0/shared-bottom-sheet.test.ts`.
- Source self-review PERFORMED and independent review DEFERRED. Physical-device motion, including Reduced Motion and early dismiss, remains pending. Merge authorization NOT_GRANTED.

### 2026-11-24 — Add Account sheet timing

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7123925491) records the owner’s report that the form entrance feels faster than the group picker, against verified Ready for Review PR #97 head `086bb8880c09e9d52d63348a76c0e8bc43109b16` and live main `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- The picker uses the platform’s native Modal entrance. The opted-in form used a 240 ms cubic ease-out, which covers about 58% of its travel in the first quarter. Use 300 ms and sinusoidal ease-in-out for a gentler start and finish. Preserve native-driven motion and Reduced Motion.
- `npm run check` passed TypeScript, ESLint, Prettier, 156 app tests and 71 preview tests, with one CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/{accounts/accounts-preview,phase0/shared-bottom-sheet,phase0/bottom-sheet-layout}.test.ts` passed 37 tests. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir /tmp/tio97-timing-native --max-workers 2` exported both bundles. Governance tests (29), Markdown links and diff whitespace passed. See RFC #96 for the exact published SHA and required checks.
- Changed paths beyond this record and the index are `src/shared/theme/primitives.ts`, `src/shared/ui/app-bottom-sheet.tsx` and `tests/phase0/shared-bottom-sheet.test.ts`. Source self-review PERFORMED and independent review DEFERRED. Perceived speed in the new build remains to be verified on device. Merge authorization NOT_GRANTED.

### 2026-11-24 — Add Account editor screen

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124239053) records owner direction against verified Ready for Review PR #97 head `6631bffc2a051bc2694fd49347f319be6c7a95a6` and live main `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- Accounts + opens the Add Account screen with shared detail motion. On native screens with motion enabled, the Group picker presents after the opening transition. In the editor, the Group row above the fields reopens it. Separate group drafts are kept in memory and reconciled with currency preferences, including while inactive. Close or native Back from the editor discards them. Back from a modal closes that modal first. The Bank editor is still a sheet.
- Round Close and Save icons use shared top-bar tokens. The centered title stays Add Account. Save is disabled in the header and there is no footer Save button. The prior form-only sheet entrance was removed because the editor is a screen. The group picker uses the existing native slide and Reduced Motion policy.
- `npm run check` passed TypeScript, ESLint, Prettier, 155 app tests and 71 preview tests, with one CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/accounts/accounts-preview.test.ts tests/phase0/{bottom-sheet-layout,shared-bottom-sheet,tab-crossfade,settings-topbar-groups,account-group-display-preferences}.test.ts` passed 56 tests. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir /tmp/tio97-account-screen-native --max-workers 2` exported both bundles. Governance tests (29), Markdown links and diff whitespace passed. Exact published HEAD and GitHub required checks are recorded in RFC #96.
- Changed paths beyond this record and the index:
  - `docs/product/ACCOUNT-GROUPS-SPEC.md` and `src/app/{_layout,add-account}.tsx`
  - `src/features/accounts/account-add-session.ts`, `account-form-contract.ts`, `account-group-picker.tsx`, `account-page.tsx`, `accounts-route.tsx`, `accounts-screen.tsx`, `add-account-screen.tsx`, `index.ts` and `use-add-account-view-model.ts` (renamed from `use-add-account-sheet.ts`)
  - `src/shared/i18n/strings.ts`, `src/shared/theme/{component-tokens,primitives}.ts` and `src/shared/ui/{app-bottom-sheet,app-top-bar}.tsx`
  - `tests/accounts/accounts-preview.test.ts` and `tests/phase0/{shared-bottom-sheet,tab-crossfade}.test.ts`
- Source self-review PERFORMED. Independent review DEFERRED. Physical-device route/picker ordering, keyboard, Back, and accessibility focus are pending. Merge authorization NOT_GRANTED.

### 2026-11-24 — Add Account spacing and header polish

- [Spacing technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124570281), [Save SVG follow-up](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124589250) and [owner weight 300 clarification](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7124614466) apply to verified Ready for Review PR #97 head `024a49c1d59c74202b20a290f292f903613bd4b6` and live main `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- Add Account has 16 dp outer padding and 12 dp between field groups. The Group row uses a 32 dp visual minimum with 8 dp vertical hit expansion on each side. Header actions use a 36 dp outlined round surface and a 20 dp glyph canvas. The X has round stroke caps. The disabled Save icon uses Google Fonts’ exact weight 300 unfilled Material Symbols Outlined SVG at optical size 24, with the theme secondary text color.
- `npm run check` passed TypeScript, ESLint, Prettier, 155 app tests and 71 preview tests. One CI-only signature test skipped locally. `node --import tsx --test --test-isolation=none tests/accounts/accounts-preview.test.ts tests/phase0/{settings-topbar-groups,design-tokens,account-group-display-preferences}.test.ts` passed 38 tests. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir /tmp/tio97-polish-native --max-workers 2` exported both bundles. Governance tests (29), Markdown links and diff whitespace passed. The Save SVG digest matches the Google Fonts download. Exact published SHA and GitHub required checks are recorded in RFC #96.
- Changed paths beyond this record and the index are `src/features/accounts/{account-group-picker,add-account-screen}.tsx`, `src/shared/assets/google-material-icons/{README.md,save-icon.json}`, `src/shared/theme/component-tokens.ts`, `src/shared/ui/app-top-bar.tsx`, `tests/accounts/accounts-preview.test.ts` and `tests/phase0/{account-group-display-preferences,settings-topbar-groups}.test.ts`.
- Source self-review PERFORMED, independent review DEFERRED, and native appearance and tap target verification pending. Merge authorization NOT_GRANTED.

### 2026-11-24 — Inline Add Account rows

- [Scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-follow-up-decision--proceed) records the connected owner direction against Ready for Review PR #97 head `3451aa943d26cb111d69caff886c5f0b98c97127` and main `6468b62786d56edb1a70b7a5c90146e17566e23b`. Current agent Codex, GPT-6 family. Exact model variant UNKNOWN_NOT_VERIFIED.
- Add Account aligns the icon, label and input or selected value in one row. Loan Direction, Wallet Type and Investment Type use the existing sheet host. The draft survives dismissals and group changes. Payment From precedes Statement Date. Description remains multiline within its input column. Currency choices and Bank payment mode editing keep their existing behavior.
- `npm run typecheck`, `npm run lint`, `npm run format:check` and `node --import tsx --test --test-isolation=none tests/**/*.test.ts` passed (156 app tests). The Node runner bypassed the local socket restriction on the tsx CLI. `npm run preview:test` passed 71 tests with one CI-only signature check skipped. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node_modules/.bin/expo export --platform android --platform ios --output-dir ../tio-layout-native-final --max-workers 2` exported both bundles. `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 npm run expo:config` and `npm run expo:deps` passed locally, with Expo reporting offline compatibility validation limits. Governance tests (29), Markdown links and diff whitespace passed.
- Changed paths beyond this checkpoint and index are `docs/product/ACCOUNT-GROUPS-SPEC.md`, `src/features/accounts/{account-add-session.ts,account-form-contract.ts,account-form-controls.tsx,account-group-picker.tsx,add-account-screen.tsx,bank-payment-modes.tsx,use-add-account-view-model.ts}`, `src/shared/i18n/strings.ts`, `src/shared/ui/app-text-field.tsx`, and `tests/accounts/accounts-preview.test.ts`.
- Source self-review PERFORMED, independent review DEFERRED. Physical-device visual alignment, keyboard and dropdown interaction remain unverified. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for current-head CI. Merge authorization NOT_GRANTED.

### 2026-11-24 — Restore Account Group layout

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-correction--proceed) records the owner’s correction at PR #97 head `65ed42c651c0e172eae4114bb5b17a73516c57eb`. Codex verified the restored Account Group control and picker match `3451aa9` byte for byte. The top bar components, route configuration and header props also match that revision. The Group row remains above all fields and opens Choose Account Group.
- The correction touches `src/features/accounts/{account-form-controls,account-group-picker,add-account-screen}.tsx` and `tests/accounts/accounts-preview.test.ts` plus this record and the index. Loan, Wallet and Investment dropdowns and the Credit Card field sequence retain their preview behavior.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

### 2026-11-24 — Place text inputs directly beside their icons

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-input-placement-correction--proceed) records the owner’s correction at PR #97 head `f1e8cc5ac3c727aaf64527c7b31124da0274b30c`. Codex removed the split column from editable fields. The input starts directly after the icon. Name and Description use their original inline placeholders. Other labels appear in the same row after the input, with currency choices at the end.
- Changed `src/features/accounts/{account-form-controls,add-account-screen}.tsx`, `src/shared/i18n/strings.ts`, `tests/accounts/accounts-preview.test.ts`, this record and the index. The focused tests verify adjacency, left-aligned text and the existing dropdown and Credit Card order. The top bar and Account Group source match the earlier editor.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

### 2026-11-24 — Align captions above editable values

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-reference-photo--proceed) records the owner’s reference photo at PR #97 head `47c665317013d18efff2a043d65a29c818745f72`. Captions use the shared caption size and the same start inset as the editable value. The icon aligns beside the value. Name and Description retain their inline placeholders. Existing field meanings and date formats are preserved.
- Changed `src/features/accounts/account-form-controls.tsx`, `tests/accounts/accounts-preview.test.ts`, `docs/product/ACCOUNT-GROUPS-SPEC.md`, this record and the index. The focused assertions cover caption placement, icon alignment and inline currency options.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

[Task guide](../README.md) · [Agent contract](../../../AGENTS.md) · [Discussions](../../discussions/README.md)

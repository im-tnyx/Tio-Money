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

[Task guide](../README.md) · [Agent contract](../../../AGENTS.md) · [Discussions](../../discussions/README.md)

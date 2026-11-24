# TM-ACCOUNTS-20261123-001 — Accounts UI foundation

| Field | Verified value |
| --- | --- |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle | IN_REVIEW |
| RFC | [#96](https://github.com/im-tnyx/Tio-Money/issues/96) |
| Decision | [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096382991) for UI only. Finance BLOCKED_PENDING_DECISION. |
| Current agent | Cursor Cloud (Composer) — docs provenance alignment only |
| Previous agent | ChatGPT GPT-6.2; earlier Codex Cloud, GPT-6 family. Exact prior variants UNKNOWN_NOT_VERIFIED. |
| Branch | `feat/accounts-ui-foundation-20261123` |
| Original base and starting HEAD | `f865969d200d70fbc8e84dd6a48d8020a155e42c` |
| Latest audited base | `885c861d30d7ebc10cade3cf3f781ffb79732d4b` (main after PR #106) |
| Latest audited HEAD | First EMI Date fix `7c805e55d90a73c7b08c1383ecac5857630b0d3d`, then this main reconciliation |
| Review | DEFERRED. No independent review of the draft has been performed. |
| Merge authorization | NOT_GRANTED |
| PR | [Draft #97](https://github.com/im-tnyx/Tio-Money/pull/97) |

## Scope and ownership

Owner directions dated 2026-11-23 were transcribed by the agent in the RFC. The owner requested Accounts creation through the tab header and a separate Manage Accounts destination. The agent recorded the bounded technical decision after checking live refs and the source. No open PR claimed the Accounts route. PRs #80, #88 and #90 had merged. Issue #94 owns reconciliation of prior task history and #91 tracks the Android Back defect separately.

The Accounts feature owns group selection, transient typed Cash, Bank, Credit Card, Wallet, Loan and Investment form drafts, named Bank payment modes and the unavailable Manage Accounts view. Routes compose controllers and presentation. Screens receive immutable state and callbacks per [TM-DEC-011](../../../docs/governance/DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule). Reuse the visual group definitions, shared theme/components and currency preferences. No finance schema, journals, account data, default seeding, real Save, account lifecycle writes or fake totals.

Acceptance before coding: check routing from the Accounts header and Settings, disabled unsupported groups, guarded draft navigation, Main/Sub currency choices, no persistence, unchanged tabs/FAB, and the screen/controller boundary. Run static checks, Expo bundles and governance. Device QA covers Back, keyboard, safe area, reduced motion, theme and accessibility.

## Current UI snapshot (source verified 2026-11-24)

Source verified at Accounts preview First EMI Date fix [`7c805e5`](https://github.com/im-tnyx/Tio-Money/commit/7c805e55d90a73c7b08c1383ecac5857630b0d3d) on base [`885c861`](https://github.com/im-tnyx/Tio-Money/commit/885c861d30d7ebc10cade3cf3f781ffb79732d4b) after this reconciliation. Behavior includes the independent Wallet form ([`9ad5d80`](https://github.com/im-tnyx/Tio-Money/commit/9ad5d80c2a04c96d0509c1369da1fcc3fe17bf06)), Credit Card payment-picker shell with `paymentSource: null`, Loan First EMI Date only (no Next Due), keyboard-aware form viewport, and Group row label. This section supersedes earlier layout descriptions below; dated checkpoints remain historical evidence, not competing current specifications. See [Account Groups product specification](../../../docs/product/ACCOUNT-GROUPS-SPEC.md) for the separate future finance contract.

**Navigation and state.** Accounts header + navigates to Add Account. The initial Choose Account Group bottom sheet opens after the native entrance transition (immediately for web or Reduced Motion); the top Group row can reopen it. Six built-in groups have forms; Insurance is informational and custom groups do not create accounts here. One transient typed draft per group is retained until the screen closes. Dismissing a picker preserves the draft; closing the editor discards the session. The top bar uses round Close and disabled Save actions. Accounts and Manage Accounts do not show real financial data.

**Current field order** (after the common Account Group row; left to right below means top to bottom in the form):

| Group | Visible fields in order |
| --- | --- |
| Cash | Account Name, Opening Amount, Description |
| Bank Account | Account Name, Opening Amount, Description, Linked Payment Modes |
| Credit Card | Card Name, Opening Outstanding, Total Credit Limit, From / Payment, Billing Cycle Start Date, Payment Due Date, Description, Auto Pay |
| Wallet | Account Name, Opening Amount/Currency, Description |
| Loan | Account Name, Loan Direction, Original Principal, Opening Outstanding Principal, EMI Amount (Optional), From / Payment, First EMI Date, Description, Auto Pay |
| Investment | Account Name, Investment Type, Historical Invested Cost, Estimated Valuation, Valuation Date, valuation guidance, Description |

**Shared field presentation.** Main form inputs use the shared borderless field, 46 dp minimum height, leading icon or currency symbol, and aligned muted captions with **0 dp caption-to-input gap**. Account Name, Card Name and Description appear as inline placeholders. The Credit Card and Loan Payment rows share a visible **From** caption above a title-sized **Payment** placeholder, is non-editable, and has no visible Unavailable or eligibility copy. No trailing From label. Credit Card and Loan alone show Auto Pay after Description, Off and disabled. Investment has neither Payment From nor Auto Pay. Monthly card days begin at 01 and 15 with “of every month”. Loan uses a single First EMI Date (defaults to local Today); Next Due is not collected because it can be derived later from First EMI and today. The First EMI control opens the reusable above-only anchored Day / short Month / Year wheel popup with native synchronized cylindrical projection, dedicated selection pill, 8 dp horizontal / 6 dp vertical padding and a Reduced Motion fallback. Day/month scroll continuously across calendar boundaries within 1900–2100. Each scroll updates the date draft immediately; outside tap or Back retains the last valid selection. No Save or Done button. Month/year changes clamp invalid days. Investment Valuation Date retains the existing editable day/month/year row.

**Selectors.** Loan Direction and Investment Type open an anchored, rounded popup with a selected checkmark, not a bottom sheet. Outside tap or Back dismisses without selecting. Account Group and the Bank mode editor retain their bottom-sheet flows. Main currency is the initial draft currency; if Sub Currencies are configured, one amount row per eligible form shows horizontally scrollable symbol choices in configured order with a tinted selected state and checked radio accessibility. Currency selection is hidden without Subs. Currency changes clear monetary fields, including EMI, without clearing other draft data.

**Bank payment modes.** Empty state has a 48 dp link icon and guidance. Add opens the shared sheet with an outlined name field, type choices and Apply to draft. Entries have named rows, Edit and Remove; caps are 3 Debit Cards, 3 UPI, 1 Cheque and 1 Internet Banking. Cancel discards unapplied mode edits. No credentials or financial writes.

**Boundary.** All money and date edits are preview strings/parts, not validated financial records. No account Save, linking, payment execution, ledger, schema, balances, Default Cash or management writes. These remain gated by [RFC #98](https://github.com/im-tnyx/Tio-Money/issues/98). Native device QA and independent review remain pending; merge authorization NOT_GRANTED.

## Checkpoints

The entries below record implementation history at their stated revisions; superseded layouts and old CI results must not be read as current behavior or current-head evidence.

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

### 2026-11-24 — Credit Card reference date rows

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-credit-card-date-rows--proceed) records the owner’s reference-photo follow-up at PR #97 head `7dd83b1d2070ab80504d84346f0ef4715726f4a7`. The preview shows Billing Cycle Start Date and Payment Due Date as editable monthly days, initially 01 and 15. The caption-to-input gap is 4 dp. Loan and Investment retain full dates.
- Changed `src/features/accounts/{account-form-contract.ts,account-form-controls.tsx,add-account-screen.tsx}`, `src/shared/i18n/strings.ts`, `tests/accounts/accounts-preview.test.ts`, `docs/product/ACCOUNT-GROUPS-SPEC.md`, this record and the index. Preview day checks cover the initial values, ordinary edits and invalid values. No issuer schedule or payment behavior is inferred from the preview values.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.
- Follow-up from the owner’s connected conversation reduces only the vertical caption-to-input gap in Add Account from 4 dp to 2 dp. Codex updated `src/shared/theme/component-tokens.ts`, `src/features/accounts/account-form-controls.tsx` and its regression assertion. Native visual QA is pending.


### 2026-11-24 — Extend the date layout to Loan and Investment

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-loan-and-investment-date-layout--proceed) records the owner’s request at PR #97 head `8c84f6084944b45081920bab74458a42723d4572`. Loan Start Date, Loan Next Due Date and Investment Valuation Date show prominent day inputs followed by month and year on the same row. The caption gap is 2 dp. Credit Card retains its monthly dates.
- Codex verified independent component edits and preservation of full date values across currency changes. The transient draft retains partially entered dates. Updated Accounts form controls and contract, English strings, Accounts tests and the group specification.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

### 2026-11-24 — Replace option sheets with an anchored popup

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-account-option-popup--proceed) records the owner’s reference at PR #97 head `2127e984a11481663c0f734d57db4aa8daa43caa`. Wallet Type, Loan Direction and Investment Type now use a rounded themed popup with a selected checkmark. The card anchors to the row, flips above when space is limited and scrolls when needed. Outside tap and Back dismiss the card and retain the draft.
- Codex verified the existing draft state machine and added safe-viewport placement coverage. The presentation component owns only the anchor measurement. Account Group and Bank payment-mode editor keep their existing sheet flow. The popup uses a tinted surface and no extra native dependencies.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual and interaction QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

### 2026-11-24 — Bank payment mode empty state

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-bank-payment-mode-empty-state--proceed) records the owner’s reference at PR #97 head `c461e0ed000c29ef0665a4622b99a29f48db3fb5`. The Bank draft shows centered link guidance under Linked Payment Modes at zero entries. Applying the first mode displays the list. Removing the last mode restores the guidance.
- Codex verified the empty and populated states with the existing draft changes and source assertions. TypeScript, lint, Prettier, 159 app tests, 29 governance tests and Markdown links passed locally. Scope includes the Bank presentation, English strings, Accounts tests and the Accounts spec.
- Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

### 2026-11-24 — Loan EMI and Add Account polish

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#2026-11-24-loan-emi-input--proceed) records the Loan request at PR #97 head `0835840e638b466f847e10b34260344e8dcf8848`. Loan shows an optional EMI Amount after Opening Outstanding Principal using the draft currency. The amount clears on currency changes alongside the principal fields.
- The previous `0835840` update set the decorative Bank empty-state link icon to 48 dp and removed the Account Group bottom-sheet X. Both PR workflows passed for that revision.
- Codex verified the Loan form structure and currency reset behavior. Source self-review PERFORMED. Independent review DEFERRED and physical-device visual QA pending. See [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks) for CI.

### 2026-11-24 — Credit Card Payment field clarification

- [Owner clarification](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7129925352) and [implementation authorization](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7129946299) scope this checkpoint to the Credit Card Payment row. Agent ChatGPT GPT-6.2; previous verified agent Codex Cloud, GPT-6 family, exact variant UNKNOWN_NOT_VERIFIED. Starting HEAD `a5b89f11d029d06cff92a8c1d98e5a861d8c40c1`, base `6468b62786d56edb1a70b7a5c90146e17566e23b`. Prior agent work is preserved.
- Reuse AccountField with From as the visible caption and Payment as the borderless title-sized placeholder. Keep the existing card icon, field order, and read-only preview. Remove the unavailable value and supporting copy from this row only. Owner also confirms zero caption-to-input gap; the existing shared captionGap token and regression assertion already equal zero and remain unchanged.
- Changed paths: `src/features/accounts/add-account-screen.tsx`, `src/shared/i18n/strings.ts`, `tests/accounts/accounts-preview.test.ts`, `docs/product/ACCOUNT-GROUPS-SPEC.md`, this task record and `.ai/current.md`.
- Connector-only source inspection and exact replacement checks; local TypeScript, lint, format, tests and device QA NOT_RUN here. Independent review DEFERRED. Fresh exact-HEAD CI required; see [PR #97 checks](https://github.com/im-tnyx/Tio-Money/pull/97/checks). RFC #98 finance boundary unchanged; merge authorization NOT_GRANTED. Rollback: revert only this scoped commit.

### 2026-11-24 — Current UI documentation reconciliation

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7129981723) records the owner-directed documentation-only checkpoint under RFC #96. ChatGPT GPT-6.2 inspected the current UI source at `149c48b32ce503a6646341bfba6755254ce44f8c`, base `6468b62786d56edb1a70b7a5c90146e17566e23b`, and reconciled the current scope, field order, tokens, preview boundaries and task metadata. The preceding UI commit is the source reference; old checkpoint text is retained as history.
- Exact source reference workflow snapshot at audit: [AI governance checks](https://github.com/im-tnyx/Tio-Money/actions/runs/45383245822): success; [Phase 0 checks](https://github.com/im-tnyx/Tio-Money/actions/runs/45383245765): success. This is not evidence for the subsequent documentation commit. Local validation NOT_RUN (connector-only); independent review DEFERRED and device QA pending.
- Changed paths: this task record, `.ai/current.md` and `docs/product/ACCOUNT-GROUPS-SPEC.md` only. PR summary reconciled separately; no application code, tests, dependencies or financial policies changed. Fresh exact-HEAD CI required. Rollback is a scoped docs revert. Merge authorization NOT_GRANTED.

### 2026-11-24 — Loan-only payment controls

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7130036055) records the latest owner correction: Loan, not Investment, receives the shared From / Payment field after EMI Amount and Auto Pay after Description. Credit Card stays visually unchanged. Both Loan directions use the same non-editable preview. No real payment, tracking, reminders, selection or finance persistence. Agent ChatGPT GPT-6.2; starting HEAD `eebbd8e8f1aa717060438a3b568e1a6cf7e7a866`, base `6468b62786d56edb1a70b7a5c90146e17566e23b`.
- Changed paths: `src/features/accounts/add-account-screen.tsx`, `tests/accounts/accounts-preview.test.ts`, `docs/product/ACCOUNT-GROUPS-SPEC.md`, this task record and `.ai/current.md`. Connector-only source inspection; local typecheck, lint, format, tests and device QA NOT_RUN. Independent review DEFERRED. Fresh exact-HEAD CI required. No merge authorization; rollback by scoped revert.

### 2026-11-24 — Loan live date wheel popup

- [Initial technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7130177109), [live selection clarification](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7130187826), and [short month clarification](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7130210381) record the owner-approved scope. Starting HEAD `bffa1ad2bea5deebbec1b3f049afcb3232e1edaa`; ChatGPT GPT-6.2. Loan only, local Today on draft creation, Jan–Dec labels, scroll applies immediately, no footer buttons, dismiss retains selection, ISO local date with leap-year clamping and preview years 1900–2100. No payment, schedule, persistence or finance policy change.
- Shared calendar utility, popup placement, controlled popup/date field/wheel components, theme tokens, Loan session/ViewModel and regression tests updated. Existing Card and Investment dates preserved. Connector-only source edits; local typecheck, lint, format, tests and physical-device QA NOT_RUN. Independent review DEFERRED. Fresh exact-HEAD CI required. Scoped revert is rollback. Merge authorization NOT_GRANTED.

### 2026-11-24 — Date wheel strict TypeScript CI repair

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7130313905) · Starting HEAD `a94e75821bb52a5f5baa9f305f28edcb28025cb2`. [AI Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45385420865) passed; [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45385420895/job/138414950947) failed during strict TypeScript before lint, format, tests and Metro. RN ScrollView instance ref typing and unchecked split array indexing were the two root causes.
- Use ComponentRef for native instance methods and fixed-width numeric parsing after strict date format validation. Additional invalid-date and leap-day assertions preserve the calendar contract. No compiler, dependency, workflow or UI behavior changes. Connector-only; local validation NOT_RUN. Fresh exact-HEAD CI and native QA required. Independent review DEFERRED; merge authorization NOT_GRANTED.

### 2026-11-24 — Cylindrical wheel visual correction and lint repair

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7130908622) · ChatGPT GPT-6.2; starting HEAD `a00ebfcecdfa22aab289d68ab3751a25ad6b6980`. [AI governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45385763502) passed; [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45385763517/job/138416117787) passed TypeScript then failed ESLint react-hooks/refs, with subsequent checks skipped. Replace render-time ref reads with a stable initial offset and shared presentation animation node. Preserve strict rules; replace raw zero style literals with existing tokens.
- Owner's reference requires a curved wheel rather than a flat list: continuously project offset into perspective, rotateX, vertical compression, scale and edge fading; use a neutral center band and respect Reduced Motion. Pure geometry regression tests plus existing live date/selection tests; no new dependency, financial state or workflow changes. Short months, local Today, no buttons, and Loan-only scope retained.
- Connector-only source edits; local full checks NOT_RUN. Fresh exact-HEAD CI and Android/iOS physical QA required. Independent review DEFERRED; no merge or publish authorization. Rollback by scoped revert.

### 2026-11-24 — Compact cylindrical wheel refinement

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131024413) · Owner requests smaller height and stronger curve; ChatGPT GPT-6.2; starting HEAD `44acb1bedd58b5e830cf8805e6fce6d68603dd8b`. Shared date picker rows now 32 dp instead of 48 dp; five rows give 160 dp nominal wheel and 176 dp padded content at standard font scale. Existing font-scale and compact viewport behavior remain. Rotation per row increases from 26 to 34 degrees with the existing 84-degree cap. Center readability, live updates, reduced motion and date rules unchanged.
- [AI Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45390126543) passed; [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45390126450/job/138431317244) passed typecheck and lint, then failed Prettier in two files. Reformat the Pick union and projection memo without behavior changes; no checks relaxed. Add regression assertions for compact geometry and rotation.
- Changed paths: shared component tokens, Add Account screen (format only), shared wheel picker (equivalent memo structure), Accounts preview tests, theme README, product spec, current task index and this record. Connector-only; local formatter/full checks NOT_RUN. Fresh exact-HEAD CI and native visual QA required. Independent review DEFERRED. No merge or publish authorization; rollback scoped revert.

### 2026-11-24 — Compact date popup padding

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131153575) · Owner requests 4 dp padding on every side; ChatGPT GPT-6.2; starting HEAD `29f36781bebb37352318e57b3494af399debb8cb`. Use one shared padding token in the content layout, preferred popup height and viewport budget. The nominal wheel remains 160 dp with 32 dp rows; padded content is now 168 dp excluding border. Curvature and date behavior unchanged.
- [Prior AI Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45390807001) passed; [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45390806997/job/138433680899) failed Prettier in app-wheel-picker.tsx. That existing formatting blocker is outside this padding-only edit and remains unresolved. Connector-only; local checks NOT_RUN. Fresh exact-HEAD CI and device QA required. Independent review DEFERRED; no merge/publish authorization. Rollback scoped revert.

### 2026-11-24 — Synchronized cylindrical wheel motion

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131375703) · Owner reports stretch before rotation and requests correction. ChatGPT GPT-6.2; starting HEAD `f32276aede2769e943e4a1fcf449c859d55bd5a5`. [AI Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45391672082) passed; [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45391671829/job/138436721000) failed Prettier in app-wheel-picker.tsx.
- Native Animated.ScrollView maps the native scroll event directly to one offset on Android/iOS; JS listener only emits selection. Fixed-radius camera depth replaces independent scale; angular-edge fade prevents visible clamped rows. Guard active gesture and stale controlled selection echoes from forced alignment. Web fallback and Reduced Motion retained. No geometry, popup anchor, date policy, payment, dependency or persistence change. Nominal 32 dp rows, 160 dp wheel, 4 dp padding and 168 dp content remain.
- Changed shared wheel, projection, selection helper, tokens, Accounts tests and documentation. Numerical continuous-arc, edge and alignment-policy tests added. Connector-only; local formatter, full checks and frame-level device QA NOT_RUN. Fresh exact-HEAD CI required. Independent review DEFERRED; no merge/publish authorization. Scoped revert is rollback.

### 2026-11-24 — Wheel viewport fill and offset observer

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131482628) · Owner confirms motion is correct and requests less empty vertical space in the screenshot. ChatGPT GPT-6.2; starting HEAD `e93f09c55a619c4e7e55fae3e71706b19785c332`. Enlarge the projected fixed-radius cylinder by changing the angular step from 34 to 22 degrees. Preserve the 84-degree edge cap, synchronized native driver, 32 dp rows, 160 dp nominal viewport, 4 dp padding and 168 dp nominal padded content. No popup placement or date policy change.
- [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45393331657/job/138442472785) passed TypeScript then failed react-hooks/refs in the native event factory. The native event now maps offset only; an effect-managed Animated.Value listener observes selection and unsubscribes on cleanup. No lint rules disabled. Tests pin the larger visible extent, symmetric fade and listener lifecycle.
- Connector-only; local formatter/full checks NOT_RUN. Physical-device motion/visual QA and fresh exact-HEAD CI remain required. Independent review DEFERRED; no merge or publish authorization. Rollback scoped revert.

### 2026-11-24 — Wheel selection surface and side padding

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131562897) and [owner clarification](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131569748) · ChatGPT GPT-6.2; starting HEAD `a946675a9522f442180dae4642daf17c40b5db37`. Owner requests 8 dp side padding and selection token correction. Shared date picker geometry splits into 8 dp horizontal and 4 dp vertical padding; opaque wheelSelection palette role uses light #E6E8EF and dark #3B4658. Segmented control colors, 32 dp row, 160 dp nominal wheel, 168 dp nominal content height, 22-degree projection, popup placement, date selection and financial boundaries are unchanged.
- Update theme palette, geometry tokens, date field, palette/preview assertions, theme README, current index, product spec and task record. [Prior governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45393938627) passed; [Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45393938623/job/138444605631) failed Prettier in app-wheel-picker.tsx and accounts-preview.test.ts. Wrap the long preview assertion while updating tests; wheel motion file is unchanged and its formatting blocker remains. Connector-only; local formatter, full tests and native visual QA NOT_RUN. Fresh exact-HEAD CI required; independent review DEFERRED; no merge or publish authorization. Scoped revert is rollback.

### 2026-11-24 — Continuous calendar wheel and vertical padding

- [Owner-approved technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131687327) · ChatGPT GPT-6.2; starting HEAD `a71f3ec481f540aa9e23e0134a0114c1219fc0f0`. The day wheel uses absolute Gregorian day ordinals, month uses absolute month indices, and year uses absolute year indices within 1900–2100. The reducer selects a canonical civil date from each absolute detent; month/year clamp invalid days. Virtualized Animated.FlatList uses fixed spacer rows and mounts only a small window of projected rows; active day scrolling no longer remounts when month length changes. Existing popup id guard, native projection, 32 dp row, 160 dp nominal viewport, 22-degree curvature, pill and no-footer contract preserved. Side padding remains 8 dp; vertical padding is 6 dp; nominal content height 172 dp.
- Haptic feedback requested; BLOCKED on network-capable verified dependency installation. Expo SDK 58 documents expo-haptics ~58.0.8. Local npm registry lookup failed EAI_AGAIN; no fabricated lockfile integrity, package import or vibration substitute. Follow-up: run npx expo install expo-haptics in a network-capable checkout, verify lockfile, dependency compatibility and native runtime, then add one selection tick per user-originated detent with no programmatic sync tick.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45394536388/job/138446671265) failed Prettier in app-wheel-picker.tsx; rewritten wheel requires fresh validation. Added calendar rollover, leap-day, bounds and virtualized list assertions. Connector-only; local full checks and native QA NOT_RUN. Independent review DEFERRED. No merge, publish or finance change. Scoped revert is rollback.

### 2026-11-24 — Above-only Loan date popup

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131747436) · Owner requests the Loan date popup always above its field to avoid below-field scroll interference. ChatGPT GPT-6.2; starting HEAD `336bc763096e38504a6304635260fd6ad815d55a`. Shared popup geometry supports opt-in above-only placement. AppDateField measures before opening, anchors above with the existing gap, and fits complete 5/3/1 rows within safe available height (including padding/border). If one readable row cannot fit, do not open until the field is moved lower; no below/center fallback. Option popup auto placement remains unchanged. No date/finance/animation/color/padding changes.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45395473928) static typecheck, lint, format and tests passed at the observed checkpoint; Metro smoke was in progress. [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45395474000) passed. Added placement and row-fit regression tests; local full checks and physical-device QA NOT_RUN. Haptic dependency remains blocked as recorded above. Fresh exact-HEAD CI required; independent review DEFERRED. No merge or publish authorization; scoped revert is rollback.

### 2026-11-24 — Animated linked calendar detents

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131832645) · Owner requests visible Month and Year scrolling when calendar carry-over changes them. ChatGPT GPT-6.2; starting HEAD `2699b7783f46828f1953e603f8fa93e1dded6d7c`. Nearby external detent changes use native animated scroll without pre-setting projection offset. Programmatic events cannot emit intermediate date changes; user drag takes ownership. Reduced Motion and jumps beyond 12 rows align immediately to avoid large virtualized scrolls. No change to calendar arithmetic, popup placement, dimensions, colors, dependency or financial boundaries.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45395844958/job/138451269066) failed TypeScript TS2339 on placement test union access; narrow each position with an assertion before checking bottom. Add animation-policy and source integration assertions. [Prior Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45395844748) passed. Local full checks, formatter and native QA NOT_RUN. Haptic dependency still blocked. Independent review DEFERRED; fresh exact-HEAD CI required. No merge/publish; scoped revert.

### 2026-11-24 — Stable Day wheel on Month/Year changes

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7131886815) · Owner requests no Day-wheel jerk on Month/Year changes. ChatGPT GPT-6.2; starting HEAD `7f25641583996c624c0acd97901d19509459d01d`. Separate transient physical Day index from canonical civil ordinal; the popup session reducer owns the coordinate. Month/year changes keep the index when day remains equal, or move only by the clamp difference (31 to 28 moves three rows). Day-originated scrolling advances by civil ordinal delta and preserves calendar carry-over. A bounded reserve retains representation of all valid dates, with rebase only when exhausted. Shared wheel restricts selection to the true date bounds. No geometry, colors, native driver, persistence or dependency change.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45396391896/job/138453203367) passed typecheck and lint then failed Prettier in app-popup-card.tsx and accounts-preview.test.ts. Format those affected expressions; no check relaxation. Add physical index, bounds, rollover and reducer tests. Local full checks/formatter and native device QA NOT_RUN. Haptics still blocked. Independent review DEFERRED; fresh exact-HEAD CI required. No merge/publish; scoped revert.

### 2026-11-24 — Stable Month detent on Year change

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7132941584) · Owner confirms Year changes must not move or change Month. ChatGPT GPT-6.2; starting HEAD `4e93f689daafa3cec237d4e5e3a112085aa69457`. Session-owned Month physical coordinate is separated from the civil-month ordinal; Year changes retain the physical coordinate, Day/Month rollover advances by actual calendar-month delta. Bound reserve and current-origin mapping preserve legal dates. Day clamp and native wheel rendering remain unchanged. No geometry, color, persistence or dependency changes.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45396871192/job/138454872756) failed Prettier only in accounts-preview.test.ts after typecheck and lint. [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45396871299) passed. Adjust preview formatting and add Month stability, forward/reverse rollover, endpoint and session tests. Local full checks/formatter and device QA NOT_RUN; fresh exact-HEAD CI required. Haptics still blocked. No merge/publish; independent review DEFERRED; scoped revert.

### 2026-11-24 — Shared popup disclosure chevron

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133053933) · Owner approves right when closed and down when open for all anchored form popups. ChatGPT GPT-6.2; starting HEAD `e1e47fea75b2463f7665f391c057cad4f78cd8e5`. Shared AppPopupChevron uses actual controlled open state, 24 dp text-field icon role, secondary text color, existing stroke and 160 ms motion primitive, native Animated rotation and immediate Reduced Motion fallback. Wallet Type, Loan Direction, Investment Type and both Loan date fields use it; remove fixed expand path. Outside tap, Back and option selection retain existing close behavior. No navigation/Bottom Sheet, calendar, placement, dependency or financial changes.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45404408780/job/138481111891) failed Prettier in accounts-preview.test.ts; [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45404408799) passed. Simplified long source assertion and added shared chevron/token regressions. Connector-only; local formatter/full checks and device QA NOT_RUN. Fresh exact-HEAD CI required; haptics still blocked. Independent review DEFERRED; no merge/publish; scoped revert.

### 2026-11-24 — Keyboard-aware form focus

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133130631) · Owner reports Description is obscured by the keyboard. ChatGPT GPT-6.2; starting HEAD `ee26f6fc1a37169f12e9d1d7443b682b535886f7`. AppKeyboardForm owns the single vertical scroll viewport, retains iOS padding/Android native resize, and reveals the focused input by measured minimum scroll distance. AppTextField forwards focus, blur and multiline growth through an optional presentation context without changing caller callbacks. Layout/keyboard events cover viewport changes; stale measurement generation and cleanup guard asynchronous native callbacks. Reduced Motion avoids animated scroll. No extra keyboard inset, fixed keyboard height, dependencies, sheet, popup or finance change.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45405246170/job/138484060130) passed typecheck/lint but failed Prettier in accounts-preview.test.ts; [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45405246256) passed. Added geometry and source integration regressions. Local formatter/full checks and device QA NOT_RUN; prior formatting blocker may remain, fresh exact-HEAD CI required. Haptics still blocked. Independent review DEFERRED; no merge/publish; scoped revert.

### 2026-11-24 — Date row chevron exclusion

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133219003) · Owner requests removal of the trailing date chevron. ChatGPT GPT-6.2; starting HEAD `7fdea1b0b85edc6ddafbf897c014931d426cd3f2`. Shared AppDateField restores the prior row layout with leading calendar icon and date value only. Wallet Type, Loan Direction and Investment Type keep the animated right/down disclosure chevron. Date popup accessibility, positioning, wheel behavior and keyboard visibility remain unchanged. Updated regression assertion and current docs.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45405806241/job/138486101579) failed TypeScript on native instance ref types in the keyboard form. Correct those types using React ComponentRef; no runtime behavior or check change. [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45405806226) passed. Local formatter/full checks and physical device QA NOT_RUN; fresh exact-HEAD CI required, prior formatting blocker may remain. Haptics still blocked. No merge/publish; independent review DEFERRED; scoped revert.

### 2026-11-24 — Accounts placeholder copy removal

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133268955) · Owner requests removing the visible Saved accounts and balances message. ChatGPT GPT-6.2; starting HEAD `7161afe192f6f5875b7de432612ddcb3b674d35c`. Accounts tab renders an empty themed canvas beneath the existing header and Add action. Remove the unused translation key and redundant empty ScrollView. Manage Accounts copy, navigation, draft forms and disabled financial persistence remain unchanged. Regression asserts no placeholder on Accounts and preserves the Manage Accounts message.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45406373854/job/138488091368) passed typecheck/lint but failed Prettier in accounts-preview.test.ts; [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45406373875) passed. Existing formatting blocker remains subject to fresh CI. Local checks/formatter and device QA NOT_RUN; no merge/publish; scoped revert.

### 2026-11-24 — Payment mode pill label size

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133365793) · Owner requests 14 sp instead of 13 sp for Linked Payment Modes pill text. Starting HEAD `431088689da8d556c96e6ce12b517b1a4df88006`. Add compact option label token aliasing existing dp14; compact AccountChoices uses it and shared line-height ratio. Pill minimum height 24 dp, touch minimum 48 dp, padding, caption size and all noncompact controls remain unchanged. Regression covers token and usage; no finance or dependency changes.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45406666611/job/138489135732) failed Prettier in accounts-preview.test.ts; [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45406666662) passed. Local formatter/full checks and device QA NOT_RUN. Existing formatting blocker remains; fresh exact-HEAD CI required. No merge/publish; scoped revert.

### 2026-11-24 — Future Credit Card payment source picker

- [Owner product direction](https://github.com/im-tnyx/Tio-Money/issues/98#issuecomment-7133478214) · [Documentation PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133479299). Starting HEAD `9161d13902952db1683d5f01eff0c56957cc9003`. Credit Card Payment will list existing eligible active Cash and Bank accounts, only when available. Keep noninteractive Payment placeholder when none exist; selected actual account name replaces it and selection references the stable account ID. Reopen to change selection. No fake accounts or typed account names. Same-currency eligibility proposed pending review; archived accounts, self-reference and unapproved posting are excluded. Loan and Auto Pay policy unchanged. Current UI remains disabled, no account read model, schema, seeding, link persistence or finance writes authorized. RFC #98 remains DECISION_PENDING.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45407352473/job/138491529957) failed Prettier in account-form-controls.tsx and accounts-preview.test.ts; [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45407352321) passed. Documentation only; existing checks and blockers unchanged. No merge/publish; scoped revert.

### 2026-11-24 — Credit Card account picker Bottom Sheet

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133564682) · [Finance RFC direction](https://github.com/im-tnyx/Tio-Money/issues/98#issuecomment-7133565922). Owner selects Bottom Sheet. Starting HEAD `3c15040a514fbce31403dae3672e2af4b74cb86c`. Reusable account picker contract and BottomSheetLayer content group caller-provided eligible Cash/Bank choices, show names and checked stable-ID selection, invoke controller callbacks and reuse the single AppBottomSheet shell. Credit Card Payment uses the selected display name and only exposes a button when choices exist. Current controller supplies null; no fixture accounts, eligibility enforcement, real reads, persisted links, Loan or Auto Pay changes. Future controller must validate and close on selection. Added pure projection and source regression tests. Existing formatting failure remains; local formatter/full CI and native QA NOT_RUN. No merge/publish; scoped revert.

### 2026-11-24 — Group row label

- [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7133641546) · Owner requests visible Group label instead of Account Group in the first Add Account row. Starting HEAD `6d594055bf8c289841d8a9759ff0eb1a0cea974a`. Dedicated localized visible label; existing accessible Account Group name, picker title, Settings labels, selected value, geometry and behavior unchanged. Updated regression and product copy. No finance or dependency changes.
- [Prior Phase 0](https://github.com/im-tnyx/Tio-Money/actions/runs/45408841855/job/138496810987) failed Prettier in account-form-controls.tsx and accounts-preview.test.ts; [Governance](https://github.com/im-tnyx/Tio-Money/actions/runs/45408841844) passed. Existing formatting blocker remains. Local formatter/full checks and device QA NOT_RUN; fresh exact-HEAD CI required. No merge/publish; scoped revert.

### 2026-11-24 — Independent Wallet only

- [Owner refinement](https://github.com/im-tnyx/Tio-Money/issues/98#issuecomment-7135648127) · [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7135649141). Starting HEAD `3b54c9b92ccafca75d76e54fd48036d60aa27534`. Remove Wallet Type, Provider, Linked Bank UI and corresponding draft state/action/translation. Wallet shares independent opening amount and currency selector with Cash/Bank. Only Loan and Investment option popups remain. UPI remains Bank payment mode. Product spec, TM-DEC-007, TM-ADR-019 and ledger design updated for new product scope; legacy compatibility and all finance implementation gates remain. Regression coverage for Wallet draft/currency and blocked Wallet option popup; no finance data, schema or write changes. Fresh CI and device QA required; previous formatting failures unresolved. Scoped revert, no merge/publish.

### 2026-11-24 — Reconcile with main after PR #103

- The owner requested safe reconciliation in chat. [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/97#issuecomment-7136972788). Draft #97 started at `9ad5d80c2a04c96d0509c1369da1fcc3fe17bf06` and integrates main `2698fb3f1988e7a6247974fa3e79a410a6bb5b70` with a normal two-parent merge. The only conflict was the shared task index. Both Accounts and Expo histories were retained.
- The change preserves Accounts behavior, the independent Wallet scope and the RFC #98 finance gate. [PR #97](https://github.com/im-tnyx/Tio-Money/pull/97) records exact-head validation. Independent review remains deferred and device QA is pending.
- Local validation reproduced the existing two-file Prettier failure. Formatting the affected screen and test exposed two stale source assertions. The tests now cover the shared Cash/Bank/Wallet opening amount and follow the form spacing into the existing shared keyboard viewport. The application runtime behavior is unchanged.

### 2026-11-24 — Align task provenance with live HEAD

- Owner requested documentation/task alignment with current code after a read-only branch audit, on this Accounts preview branch only (no separate docs branch). Cursor Cloud (Composer) from verified Accounts HEAD `9eae9214efd767bcef08d6ff83566f7e21337b53` / base `2698fb3f1988e7a6247974fa3e79a410a6bb5b70`.
- Docs-only in `.ai/`: refresh the task header audited base/HEAD, rewrite the Current UI snapshot source line to that live merge (independent Wallet, payment-picker shell still null, Loan wheels, keyboard form, Group label), and update the compact index provenance. No application, test, schema or finance runtime change. Dated checkpoints that mention Wallet Type remain historical.
- Source comparison against `src/features/accounts/{account-form-contract,add-account-screen,use-add-account-view-model}.ts(x)` and `src/shared/theme/component-tokens.ts` confirms the field-order table, 0 dp caption gap, disabled Save, and `paymentSource: null` already matched the previous narrative. Exact-HEAD CI for this docs commit and device QA remain separate; independent review DEFERRED; merge authorization NOT_GRANTED.

### 2026-11-24 — Loan First EMI Date only (Borrowed-first)

- Owner direction in chat: keep the existing Loan form layout; do not introduce the expandable redesign yet. Ask for First EMI Date; drop Next Due Date because today is known and next due can be derived later. Fix Borrowed path first; Given remains on the shared Loan form for now.
- Preview change: Loan draft keeps one calendar wheel field (`startDate` keyed, labeled First EMI Date, default local Today). Remove `nextDueDate` from the draft, ViewModel, screen and regressions. Outstanding/Original/EMI/Payment/Auto Pay unchanged. No finance calculation of next due or outstanding.
- Cursor Cloud (Composer) on `feat/accounts-ui-foundation-20261123`. Fresh exact-HEAD CI and device QA required; independent review DEFERRED; merge authorization NOT_GRANTED.

### 2026-11-24 — Reconcile with main after PR #106

- Owner requested safe reconciliation: Draft #97 was four commits behind main. Cursor Cloud (Composer) merges main [`885c861`](https://github.com/im-tnyx/Tio-Money/commit/885c861d30d7ebc10cade3cf3f781ffb79732d4b) (PR #106 Codespaces preview eligibility gate) into `feat/accounts-ui-foundation-20261123` at prior HEAD `7c805e55d90a73c7b08c1383ecac5857630b0d3d` with a normal two-parent merge. No force-push.
- The only conflict was `.ai/current.md`. Accounts UI history and the RFC #105 preview-privilege index entry are both retained. Accounts application source for First EMI Date and finance gates is unchanged by the merge; preview workflow files match main.
- Exact-HEAD CI required after publish. Independent review DEFERRED; device QA pending; merge authorization NOT_GRANTED.

[Task guide](../README.md) · [Agent contract](../../../AGENTS.md) · [Discussions](../../discussions/README.md)

# TM-ACCOUNTS-20261123-001 — Accounts UI foundation

| Field | Verified value |
| --- | --- |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle | VALIDATING |
| RFC | [#96](https://github.com/im-tnyx/Tio-Money/issues/96) |
| Decision | [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/96#issuecomment-7096382991) for UI only. Finance BLOCKED_PENDING_DECISION. |
| Current agent | Codex Cloud, GPT-6 family. Exact variant UNKNOWN_NOT_VERIFIED. |
| Previous agent | No previous assignee verified for this task. |
| Branch | `feat/accounts-ui-foundation-20261123` |
| Base and starting HEAD | `f865969d200d70fbc8e84dd6a48d8020a155e42c` |
| Review | DEFERRED until draft handoff. |
| Merge authorization | NOT_GRANTED |
| PR | Pending |

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

[Task guide](../README.md) · [Agent contract](../../../AGENTS.md) · [Discussions](../../discussions/README.md)

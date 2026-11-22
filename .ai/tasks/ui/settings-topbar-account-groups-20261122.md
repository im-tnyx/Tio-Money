# UI task — Shared Settings top bar and read-only Account Groups

- **Task:** TM-UI-SETTINGS-20261122-001
- **RFC/technical PROCEED:** https://github.com/im-tnyx/Tio-Money/issues/79 ; owner chat 2026-11-22, agent-transcribed; not GitHub owner merge approval
- **Agent:** ChatGPT GPT-6 (technical implementation/review); independent reviewer **DEFERRED** (optional by existing repo policy)
- **Base:** protected main `bb6638b56d2dea6d1e067806be009f500666e82c` (verified before branch); **branch:** `ui/settings-topbar-account-groups-20261122`
- **Scope:** shared token-based 50dp top bar, More screen Settings title, Account Settings → Account Groups read-only seven templates, Appearance → Theme visible UI wording, preserved Main/Sub Currency and persisted theme. All screen actions originate in controllers. Informational Insurance is not a finance ledger class.
- **Excluded:** no account create/edit/save, no Insurance policy/ledger/SQL schemas, no cloud/network, no new dependency, no privileged preview dispatch, no PR #65/#71/main modification, no merge.
- **Files:** `src/shared/ui/app-top-bar.tsx`, `src/features/settings/{more-screen,more-contract,use-more-view-model,appearance-sheet,account-group-templates,account-groups-screen,account-groups-route}.tsx` (contract/templates use .ts), `src/app/account-groups.tsx`, `src/shared/i18n/strings.ts`, `tests/phase0/{appearance-settings,settings-topbar-groups}.test.ts`, `src/shared/theme/README.md`, this task, `.ai/current.md`.
- **Acceptance:** owner may inspect Draft PR source and, **after manually selecting `tio-preview` and activating the existing protected worker**, review Expo Go UI through dedicated preview Codespace. Token/permission changes or trusted workflow run are not part of this task. Check required CI on exact SHA; Android and iPhone live UI/accessibility remain owner-device QA.
- **Rollback:** keep Draft PR unmerged; no changes to default branch.
- **Validation checkpoint:** exact HEAD CI **PENDING** until GitHub Actions results exist. No unrun local tests claimed.

## 2026-11-22 — Owner UI refinement / scope decision

- **Source:** owner chat correction and technical PROCEED recorded in [RFC #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7083229587), not a PR merge approval.
- **UI:** Eye action to toggle descriptions (compact name-only default), plus action for up to five custom **display-only** labels via accessible sheet; remove "Built-in templates" banner; official `home_storage` wght200 only on **Settings → Account Groups row**, *not* catalogue entries.
- **Storage:** dedicated versioned local UI preferences via existing SQLite kv-store, validated/duplicate-safe, no ledger or account subtype mapping. On corrupt saved data block writes; on write error preserve prior state. Group name entries are NOT enabled as financial account types until a separate finance ADR.
- **Non-goals:** no group removal/rename, payment/ledger/Insurance transactions, no native dependencies or new cloud integration; no main modifications, merge or privileged preview activation.
- **Tests:** pure validation (five maximum, duplicate, malformed, round-trip), negative architecture checks and official SVG provenance. Exact-head CI remains to verify after code commit; Android/iOS on-device approval still pending.

## Shared input/button contract refinement (owner chat 2026-11-22)

The `+` header button opens the existing shared `AppBottomSheet` Add Account Group flow.
Cancel and Save use `ActionButton`, while the group-name input uses the new
shared, theme-owned `AppTextField`. The screen no longer defines TextInput
visual styles. Controller validates and persists at most five display-only
labels; no financial account or ledger changes. Validate on exact PR HEAD.

## Shared ActionButton 42dp visual / 48dp touch (2026-11-22)

- **Owner chat instruction:** "Action button height pure app ke liye 42 rahega"; technical PROCEED in [RFC #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7083306947).
- The existing reusable `ActionButton` receives a token-owned **42dp painted visual** inside an accessible **48dp minimum Pressable**, preserving screen-reader and minimum touch height. The same shared button powers Add Account Group bottom-sheet Save/Cancel and other current app ActionButton usages. Other controls retain their own tokens; responsive large text may expand the visual height rather than clip labels.
- Extra test guards explicitly reject accidental visual/touch target conflation; no finance data, security or root navigation changes. Exact HEAD CI and device UI review required before merge.

## 2026-11-23 — Account Groups owner UI correction

- **Owner source:** Current chat: eye icon state reversed (Show vs Hide) and unnecessary empty area between top bar and built-in group list. Technical PROCEED and specific rationale recorded in [RFC #79 comment](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7084013456); agent-transcribed, not GitHub owner merge permission.
- **Decision:** Showing descriptions displays the **open eye**; hiding descriptions displays the **crossed eye**. Screen-reader button label still communicates the action **to take next** (Hide when currently visible, Show when currently hidden). Keep current persisted preference and controller behavior.
- **Layout:** Remove Account Groups scroll `paddingTop` and redundant list top border under the shared top bar's existing bottom divider. Preserve list bottom padding and platform safe-area handling.
- **Scope:** `account-groups-screen.tsx`, `settings-topbar-groups.test.ts`, this task. No shared top bar/theme/token edits, no dependency, finance, credential, security workflow or main changes.
- **Validation:** Regression assertions for icon/action parity and single-divider flush list. Required latest-exact-HEAD CI, code review and owner device UI validation must be independently observed; pending on implementation commit.
- **Gate:** PR #80 OPEN/DRAFT; separate PR merge authorization **NOT_GRANTED**. Historical Issue #71 npm/Sigstore anomaly retained as diagnostic, not accepted.

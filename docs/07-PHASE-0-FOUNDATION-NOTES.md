<div align="center">

# 🧱 Tio Money · Phase 0 Foundation Notes

### Exact implementation boundaries, setup evidence and decisions still needing sign-off.

![Status](https://img.shields.io/badge/STATUS-IMPLEMENTED%20SOURCE%20%2F%20QA%20PENDING-7357E8?style=flat-square)

[🏠 README](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🏗 Architecture](05-TECH-ARCHITECTURE.md) · [🧪 Plan](06-IMPLEMENTATION-TEST-PLAN.md)

</div>

---

> [!IMPORTANT]
> These notes describe the **feature branch only**, including the integration of merged governance main. The latest [owner-scoped empty-shell decision](DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) supersedes earlier active FAB/editor previews. The persistent [Phase 0 RFC](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7001758473) and task checkpoint provide provenance; owner merge authorization is not granted. GitHub Actions has verified package installation and the source-quality suite ([successful CI run](https://github.com/im-tnyx/Tio-Money/actions/runs/44351018913)); this is **not** proof of Expo Go/device QA, finished finance, published products, approved ADRs or a merged PR. Do not mark M0 complete until device evidence and review are recorded.

## Decisions implemented for the scaffold (subject to owner review)

| Area | Scaffold choice | Why / remaining gate |
| :--- | :--- | :--- |
| Runtime | Expo SDK 58 / RN 0.88.1 / React + React DOM 19.3.0 / TS strict | Locked engines support **Node `^22.13.0 || ^24.3.0 || >=26.0.0`**; `.nvmrc` pins 22.16.0; `react-dom` occurs once and matches React; Expo Go device QA pending |
| Routes | Expo Router `Stack` + `Slot`; **five blank tabs** with a **disabled floating `+` icon above More** | **Home · Trans. · Stats. · Account · More**; [TM-DEC-005](DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab), no extra app screen routes |
| App status | **Native splash → Home's blank canvas + five bottom tabs + disabled FAB**; no app top bar, editor, Settings, Welcome, loading text, forms or cards | Splash remains during SQLite bootstrap on successful startup; only exceptional database failure may show safe retry recovery |
| Theme | Provisional semantic light/dark tokens from [Screen Spec §03](03-SCREEN-SPEC.md#03--tio-money-visual-language--proposed-tokens) | Final palette, contrast and user override awaiting owner/device review |
| Persistence | `expo-sqlite` opens one local file; FK ON verified before/after versioned migration | Only `app_settings` table exists; no ledger/postings/mutable balance cache. Write-coordinator and real migration QA are Phase 2 |
| Migration version | `PRAGMA user_version` (v1) + single bootstrap transaction | Future upgrades must be tested on actual on-disk DB; no silent deletion/reset |
| Financial contracts | Pure typed `JournalDraft` and structural balance preflight only | Not a finance engine; account-class policies, idempotency, refund linkage and correction date still need ADRs |
| Native integration | `disabledSmsAdapter` returns false; default manifest has no SMS permissions | Android policy/custom build is conditional P1+; iOS automatic inbox reading unsupported |
| Language | **English-only initial UI** under [TM-DEC-001](DECISIONS.md#tm-dec-001--english-only-initial-app) | Typed message keys preserved; no Hindi dictionary, MVP language selector or bilingual acceptance promise |
| Environment | No backend, secrets, tracking or account login in Phase 0 | `EXPO_PUBLIC_*` values are public; `.env.example` contains no credentials |

## Quality and verification register

| Check | Status on document creation | Reproduction |
| :--- | :--- | :--- |
| Static source and code-review pass | Proposed implementation; review required | Review the PR diff |
| Dependency install and lockfile | **Passed on GitHub Actions Ubuntu, 2026-11-18** | [CI run](https://github.com/im-tnyx/Tio-Money/actions/runs/44351018913) · `npm ci --no-audit --no-fund` |
| Expo compatibility | **Passed config and dependency checks in CI; device unverified** | `npx expo install --check`; `npx expo config --type public` |
| TypeScript, ESLint, Prettier, unit tests | Previously passed on prior shell HEAD; **fresh reduced-UI CI must pass** | `npm run check`; [prior run evidence](https://github.com/im-tnyx/Tio-Money/actions/runs/44477632200) |
| Android/iOS Metro bundles | **Passed GitHub CI** (both `expo export --platform android` and `ios`) | [CI run](https://github.com/im-tnyx/Tio-Money/actions/runs/44351447192); bundles are not installed-device tests |
| SQLite migration/FK tests | **Passed pure migration-driver unit tests**, not on-device FK/real-SQLite startup | `npm test`; still run real SQLite device initialization and upgrade |
| Expo Go Android / iPhone | **Not verified** | Open QR on both; test five blank tabs, nonresponsive disabled FAB, cold restart |

**Lockfile rule:** The committed lockfile was normalized by a one-time branch CI job, then the temporary write-enabled workflow was removed. The later review fix restricted the root Node engine range to the Expo/React Native lockfile intersection and removed the duplicate `react-dom` key (see [PR #1 review thread](https://github.com/im-tnyx/Tio-Money/pull/1#discussion_r4618083328)). The permanent quality workflow runs reproducible `npm ci`, Expo compatibility, strict code/format tests and config checks. The matching `react-dom@19.3.0` peer is pinned explicitly because an unpinned transitive `react-dom@19.3.1` broke `npm ci`. Avoid rewriting package versions by guessing if `expo install --check` disagrees: run the SDK-aware `npx expo install --fix` in a network-enabled working tree, review its diff, and commit exactly the validated lockfile.

## Manual Expo Go and real-SQLite acceptance — NOT_VERIFIED

**Run on both a physical Android phone and a physical iPhone**, each with a current Expo Go client compatible with SDK 58. Log device model, OS version, Expo Go version, app commit SHA, tester, UTC date, and PASS/FAIL for each case; screen recording/screenshots should omit private data.

1. **Install and cold start:** On a clean app sandbox, scan the `npx expo start --clear` QR code and verify **native splash → directly Home blank canvas + five tabs + disabled FAB**; there must be **no intermediate 'Preparing your local workspace' text, spinner, login, onboarding or app top bar**. On normal startup SQLite initialization must finish before splash hides. Repeat with the app fully killed and reopened. Expo Go may display its own app icon instead of a custom production splash; record this limitation rather than claiming native splash artwork is verified. Only a genuine SQLite bootstrap failure may show minimal retry/error recovery.
2. **Navigation order and destinations:** In portrait, verify all five English labels and their accessible names: **Home · Trans. · Stats. · Account · More**. Tap each in order and back; every screen body must be fully blank, with no top app header, placeholders, balances, cards or reports. The obsolete `/history` deep link has been intentionally removed in the owner-scoped UI reduction.
3. **Disabled floating `+` icon:** Verify one and only one floating `+` sits at right, centered above the More destination, with a gap above the nav divider on narrow/wide screens and in landscape. Its accessibility state must be **disabled**; tap it from Home and More and verify **nothing happens**, no route or modal opens.
4. **Absent feature routes:** Confirm there is no Add Transaction editor, Save action, keyboard form, Settings, Welcome or old History screen. The visible interface is limited to five blank content routes, five bottom tabs and the disabled `+` icon.
5. **More is blank:** Verify More highlights correctly on selection and shows no Settings entry or placeholder content; the disabled icon remains positioned above it without intercepting tab touch.
6. **Theme, accessibility and safe areas:** Test device light/dark switch; verify blank canvas and bottom navigation colors, legible labels, large touch targets, TalkBack/VoiceOver reading tab labels and disabled-FAB status, and no clipping around status/navigation bars. Run a large font setting and record any overflow.
7. **Real SQLite/FK test:** Using a temporary local test harness or debugger in the sandbox (not an end-user finance screen), access the initialized `expo-sqlite` connection and query `PRAGMA foreign_keys` (expect **1**), `PRAGMA user_version` (expect **1**), and `sqlite_master` (expect **app_settings**, no ledger event/postings tables). Close/restart then repeat. Test a safe migration retry on a disposable sandbox and confirm no destructive reset; do **not** alter actual user data.
8. **Permissions, offline and recovery:** Inspect the effective Android manifest and iOS permissions; no SMS inbox access should appear. Test offline launch after the first successful local bundle download and document any Expo Go development-server limitation honestly. Simulate failed initialization only in a disposable test harness and verify the retry screen does not delete SQLite files.
9. **Evidence and gate:** Attach device-specific PASS/FAIL logs to PR #1, link actual failures, and repeat after fixes. Until both platforms complete this, status is **NOT_VERIFIED**, regardless of green TypeScript, Metro bundle exports or governance CI.

These tests are a **manual QA contract**, not evidence that either device has been exercised.

## Phase 1 handoff

1. Maintain the owner-approved **five empty tabs + disabled FAB** ([TM-DEC-005](DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab)); review final iconography, small screens, English contrast and screen-reader behavior.
2. Propose a **new scoped future task** before implementing account onboarding, Settings, a transaction editor or enabling the FAB; until then keep the Phase 0 surface blank. Future MVP copy remains English-only, with financial calculations kept in the canonical domain.
3. Before connecting real Save, resolve [Document 06 finance blockers](06-IMPLEMENTATION-TEST-PLAN.md#9-owner-decisions-and-specification-gaps), then deliver Phase 2 balanced journal, migrations, idempotency and rollback evidence.
4. Keep import and automatic SMS outside the Expo Go MVP. No bank credentials, OTPs or SMS permissions in baseline source.

---

[← Docs Hub](00-INDEX.md) · [Implementation Plan →](06-IMPLEMENTATION-TEST-PLAN.md)

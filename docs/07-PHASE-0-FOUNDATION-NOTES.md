<div align="center">

# 🧱 Tio Money · Phase 0 Foundation Notes

### Exact implementation boundaries, setup evidence and decisions still needing sign-off.

![Status](https://img.shields.io/badge/STATUS-IMPLEMENTED%20SOURCE%20%2F%20QA%20PENDING-7357E8?style=flat-square)

[🏠 README](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🏗 Architecture](05-TECH-ARCHITECTURE.md) · [🧪 Plan](06-IMPLEMENTATION-TEST-PLAN.md)

</div>

---

> [!IMPORTANT]
> These notes describe the **feature branch only**, including the integration of merged governance main. The persistent [Phase 0 RFC](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7001758473) and task checkpoint provide provenance; owner merge authorization is not granted. GitHub Actions has verified package installation and the source-quality suite ([successful CI run](https://github.com/im-tnyx/Tio-Money/actions/runs/44351018913)); this is **not** proof of Expo Go/device QA, finished finance, published products, approved ADRs or a merged PR. Do not mark M0 complete until device evidence and review are recorded.

## Decisions implemented for the scaffold (subject to owner review)

| Area | Scaffold choice | Why / remaining gate |
| :--- | :--- | :--- |
| Runtime | Expo SDK 58 / RN 0.88.1 / React + React DOM 19.3.0 / TS strict | Locked engines support **Node `^22.13.0 || ^24.3.0 || >=26.0.0`**; `.nvmrc` pins 22.16.0; `react-dom` occurs once and matches React; Expo Go device QA pending |
| Routes | Expo Router `Stack` + nested `Slot`; five tabs plus an independent floating Add FAB | **Home · Trans. · Stats. · Account · More**; owner [TM-DEC-004](DECISIONS.md#tm-dec-004--five-destinations-and-floating-add), not a content Add tab |
| App status | All finance screens are marked planned; Save disabled | Prevents placeholder UI being mistaken for real ledger features |
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
| TypeScript, ESLint, Prettier, unit tests | **Passed GitHub CI** (strict typecheck, lint, formatting, **9 tests**) | `npm run check`; [run evidence](https://github.com/im-tnyx/Tio-Money/actions/runs/44351018913) |
| Android/iOS Metro bundles | **Passed GitHub CI** (both `expo export --platform android` and `ios`) | [CI run](https://github.com/im-tnyx/Tio-Money/actions/runs/44351447192); bundles are not installed-device tests |
| SQLite migration/FK tests | **Passed pure migration-driver unit tests**, not on-device FK/real-SQLite startup | `npm test`; still run real SQLite device initialization and upgrade |
| Expo Go Android / iPhone | **Not verified** | Open QR on both; test root routes, editor, settings, cold restart |

**Lockfile rule:** The committed lockfile was normalized by a one-time branch CI job, then the temporary write-enabled workflow was removed. The later review fix restricted the root Node engine range to the Expo/React Native lockfile intersection and removed the duplicate `react-dom` key (see [PR #1 review thread](https://github.com/im-tnyx/Tio-Money/pull/1#discussion_r4618083328)). The permanent quality workflow runs reproducible `npm ci`, Expo compatibility, strict code/format tests and config checks. The matching `react-dom@19.3.0` peer is pinned explicitly because an unpinned transitive `react-dom@19.3.1` broke `npm ci`. Avoid rewriting package versions by guessing if `expo install --check` disagrees: run the SDK-aware `npx expo install --fix` in a network-enabled working tree, review its diff, and commit exactly the validated lockfile.

## Phase 1 handoff

1. Follow the owner-approved five destinations + floating FAB ([TM-DEC-004](DECISIONS.md#tm-dec-004--five-destinations-and-floating-add)); review final iconography, small screens, English contrast and screen-reader behavior.
2. Implement future account onboarding UX, real shared control states and the full transaction editor *presentation*, with **English-only MVP copy and no language chooser**. Keep financial calculations in the future canonical domain.
3. Before connecting real Save, resolve [Document 06 finance blockers](06-IMPLEMENTATION-TEST-PLAN.md#9-owner-decisions-and-specification-gaps), then deliver Phase 2 balanced journal, migrations, idempotency and rollback evidence.
4. Keep import and automatic SMS outside the Expo Go MVP. No bank credentials, OTPs or SMS permissions in baseline source.

---

[← Docs Hub](00-INDEX.md) · [Implementation Plan →](06-IMPLEMENTATION-TEST-PLAN.md)

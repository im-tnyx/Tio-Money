<div align="center">

# 🧱 Tio Money · Phase 0 Foundation Notes

### Exact implementation boundaries, setup evidence and decisions still needing sign-off.

![Status](https://img.shields.io/badge/STATUS-IMPLEMENTED%20SOURCE%20%2F%20QA%20PENDING-7357E8?style=flat-square)

[🏠 README](../README.md) · [📚 Docs Hub](00-INDEX.md) · [🏗 Architecture](05-TECH-ARCHITECTURE.md) · [🧪 Plan](06-IMPLEMENTATION-TEST-PLAN.md)

</div>

---

> [!IMPORTANT]
> These notes describe the **feature branch only**. They do not assert merged code, installed packages, Expo Go/device QA, published products, financial correctness, or approved ADRs. Do not mark M0 complete without evidence.

## Decisions implemented for the scaffold (subject to owner review)

| Area | Scaffold choice | Why / remaining gate |
| :--- | :--- | :--- |
| Runtime | Expo SDK 58 / RN 0.88.1 / React 19.3 / TS strict | [Expo release compatibility](https://docs.expo.dev/versions/latest/); local install and Expo Go runtime checks outstanding |
| Routes | Expo Router `Stack` + nested `Slot` root shell + single bottom action | Four content destinations and center `+`; placement remains [Screen Spec proposal](03-SCREEN-SPEC.md#02--navigation-architecture) |
| App status | All finance screens are marked planned; Save disabled | Prevents placeholder UI being mistaken for real ledger features |
| Theme | Provisional semantic light/dark tokens from [Screen Spec §03](03-SCREEN-SPEC.md#03--tio-money-visual-language--proposed-tokens) | Final palette, contrast and user override awaiting owner/device review |
| Persistence | `expo-sqlite` opens one local file; FK ON verified before/after versioned migration | Only `app_settings` table exists; no ledger/postings/mutable balance cache. Write-coordinator and real migration QA are Phase 2 |
| Migration version | `PRAGMA user_version` (v1) + single bootstrap transaction | Future upgrades must be tested on actual on-disk DB; no silent deletion/reset |
| Financial contracts | Pure typed `JournalDraft` and structural balance preflight only | Not a finance engine; account-class policies, idempotency, refund linkage and correction date still need ADRs |
| Native integration | `disabledSmsAdapter` returns false; default manifest has no SMS permissions | Android policy/custom build is conditional P1+; iOS automatic inbox reading unsupported |
| Environment | No backend, secrets, tracking or account login in Phase 0 | `EXPO_PUBLIC_*` values are public; `.env.example` contains no credentials |

## Quality and verification register

| Check | Status on document creation | Reproduction |
| :--- | :--- | :--- |
| Static source and code-review pass | Proposed implementation; review required | Review the PR diff |
| Dependency install and lockfile | **Committed** generated lockfile; final `npm ci` CI evidence pending | `npm ci` from locked dependencies |
| Expo compatibility | Selected documented SDK 58 pair; not device-proven | `npx expo install --check`; `npx expo config --type public` |
| TypeScript, ESLint, Prettier, unit tests | **Not yet passed** | `npm run check` in a network-enabled environment |
| SQLite migration/FK tests | Pure migration-driver tests written; device tests pending | `npm test`; real device startup and upgrade |
| Expo Go Android / iPhone | **Not verified** | Open QR on both; test root routes, editor, settings, cold restart |

**Lockfile rule:** The candidate lockfile was generated and formatted by a one-time branch-only CI job, then committed. The temporary write-enabled workflow was removed. The permanent quality workflow now requires reproducible `npm ci`. Avoid rewriting package versions by guessing if `expo install --check` disagrees: run the SDK-aware `npx expo install --fix` in a network-enabled working tree, review its diff, and commit exactly the validated lockfile.

## Phase 1 handoff

1. Approve central Add placement and design tokens; test small screens, Hindi/English, contrast and screen readers.
2. Implement first-run language and account UX, real shared control states and the full transaction editor *presentation* without in-screen finance math.
3. Before connecting real Save, resolve [Document 06 finance blockers](06-IMPLEMENTATION-TEST-PLAN.md#9-owner-decisions-and-specification-gaps), then deliver Phase 2 balanced journal, migrations, idempotency and rollback evidence.
4. Keep import and automatic SMS outside the Expo Go MVP. No bank credentials, OTPs or SMS permissions in baseline source.

---

[← Docs Hub](00-INDEX.md) · [Implementation Plan →](06-IMPLEMENTATION-TEST-PLAN.md)

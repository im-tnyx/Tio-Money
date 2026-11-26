# 12 · Mandatory Dumb-Screen and Layer Separation Contract

> **Owner decision TM-DEC-011 (2026-11-21): ALL screens are dumb/presentation-only; NO logic in screens.** Documented from the connected-chat instruction ("all screen dump screen rahega koi bhi logic screen m nahi rahega"). This is an **architecture contract** for existing More Appearance and all *future* Stage 1 code, **not authorization to alter the current four blank finance tabs, implemented More presentation/controller, disabled Add or latest owner-approved navigation**. [Decision register](../governance/DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule) · [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23) · [Finance ADRs](../governance/STAGE-1-FINANCE-ADRS.md).

[Architecture](TECH-ARCHITECTURE.md) · [Features/layer map](../../.ai/core/feature-boundaries.md) · [Tests](../engineering/IMPLEMENTATION-TEST-PLAN.md) · [Screen UX](../design/SCREEN-SPEC.md)

## 1. Strict definition

A **screen** is a pure, deterministic render boundary: **given an immutable typed ViewModel and callback properties, render accessible React Native elements**. Screen files have no business rules, no stateful workflow, no startup side effects, no own route decisions. Changing UI visual state is conveyed by the controller through props; even presentational toggles, text-input drafts, submit-loading and selected tabs are supplied by the controller when they involve lifecycle or state. Controlled inputs may invoke only injected callbacks with raw user intents; validation and finance formatting logic are outside the screen.

| Layer / place | Owns | Explicitly forbidden |
| :--- | :--- | :--- |
| Expo Router `src/app/**` route adapters | Static route declaration/composition, import approved feature container, providers at root layout | Financial calculations, SQLite reads/writes, fetched data, app workflow or hidden state |
| Feature `screens/*.tsx`, shared presentational UI | Props-to-JSX, accessible labels and controlled callbacks, theme tokens or passed resolved style | `useState`, `useEffect`, `useReducer` for workflows; navigation, repository, network, native permissions, finance math, commands, conditional financial policy |
| Feature `controllers/*` / `hooks/*` / screen containers | Navigation, input draft state, async lifecycle, field orchestration, error/loading states, accessibility intents; consume use cases | SQL strings, hidden ledger arithmetic, hardcoded business values, independently computed Net Worth |
| Application `use-cases/*` | Validate commands against domain, idempotency, transactional orchestration and authorised intent | React Native components, direct UI styling, internal feature screen imports |
| Pure `domain/money`, `domain/ledger` | Strict native amounts, typed account classes, balanced journal, pure projections, calculations, policy error codes | Expo, React, SQLite, filesystem, network, mutable app state |
| `data/sqlite` adapters | Parameterised SQL, migrations, transaction boundaries, version/FK checks, canonical read-model persistence | Screen imports, UI components, new business formulas duplicating ledger |
| `platform` / `services/fx` adapters | Optional FX pair network, file/native permissions when separately approved, correct retries | Auto-upload of finance data, direct UI mutation, cloud access outside owner stage gate |

**Allowed visual hooks:** the existing `MoreScreen`/`AppearanceSheet` may read centralized theme/i18n tokens purely for styling/accessible copy. **Not allowed:** screen-owned persistence, stateful workflows, routing or financial decisions; those remain in controller/application/domain adapters.

**A screen must not:** fetch, write storage, call `router.push` / navigation directly, open permission dialogs, invoke an app service/use case, branch on "asset vs liability" to calculate amounts, aggregate records or initialize DB. Pure *visual* conditional rendering such as `loading ? <Spinner /> : <Content />` is permitted **only** when a controller provided the already-decided state. A screen may pass a user intent via `onSubmit(rawForm)`; the callback is injected by its controller, not instantiated via a service import.

**A route module may do minimal static routing composition** (e.g. export a feature container). Root `_layout.tsx` legitimately composes theme, database bootstrap gate and navigation hooks (as **separate providers/controllers**); this is **not** permission to copy their effects into a feature screen.

## 2. Data and event flow

```text
User input -> Dumb screen (callback only)
           -> Feature controller / hook (workflow and typed view state)
           -> Application use case -> Pure domain ledger -> Repository port
           -> SQLite adapter transaction -> one canonical ledger
           -> Read-model / projection -> controller ViewModel -> Dumb screen

FX trigger -> controller -> FxQuote use case -> approved provider adapter
                                     -> local cache/projection -> immutable ViewModel
```

**Expected pattern (illustrative only, not implemented):**

```tsx
// Pure presentational screen: no hooks, services, router, SQL or finance math.
type AccountViewModel = Readonly<{
  title: string;
  balanceLabel: string; // preformatted by a presentation mapper
  submitDisabled: boolean;
}>;
type AccountScreenProps = Readonly<{
  vm: AccountViewModel;
  onAddAccount: () => void;
}>;
export function AccountScreen({ vm, onAddAccount }: AccountScreenProps) {
  return (
    <AccountView
      title={vm.title}
      balanceLabel={vm.balanceLabel}
      disabled={vm.submitDisabled}
      onPress={onAddAccount}
    />
  );
}
```

**Invalid (must fail architecture review):** a screen imports `expo-sqlite`, `@/data/sqlite`, `@/domain/ledger`, `expo-router` and calls `router.push`, computes `balance += amount`, calls FX network, applies fees or creates a ledger posting. Type-only imported display contracts from a feature's public interface are permitted; business data computations remain in the mapper/controller/domain.

## 3. Source UI snapshot from 2026-11-21

**Exact inspected main SHA:** `118830c94a7af78dd2c29fdf6d3f7ab561cf4c1a` on 2026-11-21. Five root route modules remain, but **only four** are BlankScreen:
- `src/app/(tabs)/index.tsx` → `BlankScreen` (Home)
- `src/app/(tabs)/transactions.tsx` → `BlankScreen` (Trans.)
- `src/app/(tabs)/reports.tsx` → `BlankScreen` (Stats.)
- `src/app/(tabs)/accounts.tsx` → `BlankScreen` (Account)
- `src/app/(tabs)/more.tsx` → `MoreRoute`, which composes [`useMoreViewModel`](../../src/features/settings/use-more-view-model.ts) and [dumb `MoreScreen`](../../src/features/settings/more-screen.tsx) plus a presentational Appearance sheet.

The appearance controller owns **visibility, preference selection and persistence**, and the screen emits typed `MoreAction` callbacks. **Theme/translation hooks that only resolve rendering tokens/text**, like existing `useAppTheme()`, are presentation concerns and do not authorize workflow-state hooks, FX, domain calculations, routing decisions, network or database work inside screens. Root `_layout.tsx` composes existing tabs, shared motion hooks and independent disabled FAB.

**Current owner-approved UI:** five destinations and separate More-aligned **disabled** Add; selected icon 300/inactive 200, **0dp** icon-label gap, 24dp symbols, 50dp bar baseline + OS inset, 50dp FAB + 16dp clearance and **160ms Reduced Motion-aware content crossfade**. Older five-blank/all-200/1dp descriptions in TM-DEC-005/010 were historical pre-refinement snapshots.

Read-only repository source verification is **not** proof of installed-device QA or that the future AST/negative-fixture gates `TM-PRES-001–006` already exist.

### Accounts and Currency Settings preservation

The merged [Accounts UI from PR #97](https://github.com/im-tnyx/Tio-Money/pull/97) is the approved Accounts presentation baseline. Review the current source and [post-merge UI record](../../.ai/tasks/accounts/accounts-ui-foundation-20261123.md#current-ui-snapshot-source-verified-2026-11-25) alongside the earlier tab snapshot above. This requirement applies to every account type and future finance gate. Preserve layouts, field placement, labels, icons, spacing, typography, themes, navigation, animations and accessibility interactions. Visual or behavioral changes require separate discussion and explicit owner approval.

Preserve the existing Main Currency, Sub Currency, Currency Detail and Currency Display Settings screens. Reuse their currency preferences, provider, selectors and shared controls. Keep existing Main and per-Sub override behavior for currency-default precision or 0–3 display decimals, Auto/Indian/International/no grouping, and front/end symbol placement. Extend the shared formatting path when exact financial display is approved and preserve existing preview outputs. Booked amounts must cross that boundary as exact minor units with their stored currency-unit precision. The current number-based examples remain preview inputs. Use the stored unit and an approved display fallback when the booked currency leaves the preference list. Preference changes affect display only. Keep one preference store and one shared formatting path without feature-specific copies.

Integrate future finance through controller-supplied ViewModels, application commands, domain rules, typed repository ports and SQLite adapters. The domain owns exact parsing, limits and immutable currency-unit rules. Screens render prepared display values and forward callbacks. Future finance PRs must demonstrate regression coverage for the affected Account forms and Currency Settings routes, preference isolation and removal, unchanged booked amounts, and existing selector, sheet and navigation behavior. Test relevant layout, theme, keyboard, accessibility and animation behavior on Android and iOS. The Bank-specific vectors and remaining policy decisions are tracked in [RFC #98 Gate 2.3](https://github.com/im-tnyx/Tio-Money/issues/98#issuecomment-7155693192).

## 4. CI architecture-gate specification for future code PRs

A separate scoped implementation PR must actually **install and enable enforcement**; this documentation does not claim it exists:

- `TM-PRES-001`: fixture-based static boundary test rejects deep imports from `screens/**` or tab screen files into `data/**`, `domain/ledger/**`, `platform/**`, repositories, service/use-case implementation or `expo-router` navigation functions; allow explicitly listed read-only types and UI/theme tokens.
- `TM-PRES-002`: AST or reviewed ESLint rules reject screen-owned `useEffect`, `useState`, direct async I/O, navigation, SQL, balances, conversion/fee calculations; verify deliberate *negative* fixtures fail CI rather than naive filename-only matching.
- `TM-PRES-003`: public interface separates `ScreenProps / ViewModel` from controller/test doubles; screens can render with fake immutable VMs and spy callbacks **without database/network/Expo Router initialization**.
- `TM-PRES-004`: controller tests cover loading, errors, input validation, drafts, callbacks, cancellation/retry and navigation; domain/repository tests cover balanced entries, exact integers, idempotency, rollback.
- `TM-PRES-005`: snapshot/interaction tests verify frozen five-tab nav/More-aligned disabled FAB remains unchanged; screen view states match tested controller outputs on Android/iOS.
- `TM-PRES-006`: deliberate import of `@/data/sqlite` from a screen and local finance calculation each cause the rule suite to fail; root `_layout` minimal provider composition remains valid.

No monolithic screen/store/service locator. A feature screen cannot bypass this boundary by moving finance logic into a shared UI helper. Cross-feature use only the owning feature's published ports and domain services.

## 5. Adoption and release gate

For each Stage 1 PR, document the **screen, controller, use case, domain, repository and platform owners**, types, allowed dependency direction, and architecture test names. Implement UI only in a separately authorised feature scope. Keep Phase 0 shell unchanged and verify code-level negative fixtures/CI on the exact proposed feature HEAD before review. Any attempted shortcut that puts navigation/business/SQL/I/O in a screen is **BLOCKING**, even if Expo renders correctly.

**Decision status:** Owner rule **CONFIRMED for design**; actual automated enforcement **NOT IMPLEMENTED**; future feature delivery **NOT AUTHORIZED BY THIS DOCUMENT**. Review and merge of this docs PR require the usual separate owner-specific permission.

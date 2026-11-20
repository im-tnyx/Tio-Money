# 12 · Mandatory Dumb-Screen and Layer Separation Contract

> **Owner decision TM-DEC-011 (2026-11-21): ALL screens are dumb/presentation-only; NO logic in screens.** Documented from the connected-chat instruction ("all screen dump screen rahega koi bhi logic screen m nahi rahega"). This is an **architecture contract** for all *future* Stage 1 code and not authorization to alter the current five blank tabs. [Decision register](DECISIONS.md#tm-dec-011--strict-dumb-screen-presentation-only-rule) · [RFC #23](https://github.com/im-tnyx/Tio-Money/issues/23) · [Finance ADRs](11-STAGE-1-FINANCE-ADRS.md).

[Architecture](05-TECH-ARCHITECTURE.md) · [Features/layer map](../.ai/core/feature-boundaries.md) · [Tests](06-IMPLEMENTATION-TEST-PLAN.md) · [Screen UX](03-SCREEN-SPEC.md)

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

## 3. Actual Phase 0 verified on main

At verified `main` SHA `f4332eb338ca75e27a5b35ff57511f522a4bb96a`, the five files:

- `src/app/(tabs)/index.tsx`
- `src/app/(tabs)/transactions.tsx`
- `src/app/(tabs)/reports.tsx`
- `src/app/(tabs)/accounts.tsx`
- `src/app/(tabs)/more.tsx`

each contain **only an import of `BlankScreen` and `export default BlankScreen;`**. They contain no hook, component-local finance logic, SQL, navigation or interaction handler. `src/app/(tabs)/_layout.tsx`, `src/app/_layout.tsx` are **route/provider composition** with navigation/theme/bootstrap hooks delegated to modules outside feature screens. This is a **read-only source inspection**, not an Android/iOS installed-device assertion or a static enforcement test already running.

**Frozen owner UI (TM-DEC-010):** Home · Trans. · Stats. · Account · More; exact existing labels/icons/weights/colors, 50dp bar baseline + OS inset, 1dp icon/label gap, one 50dp disabled FAB centered over More with 16dp clearance. No + activation, new tab, mock balance, top app bar or screen content is authorised by this document.

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

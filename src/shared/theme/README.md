# Tio Money — Core Theme Ownership

The shared React Native / TypeScript theme is the **single owner** of product-visible
physical sizes, typography, color roles and reusable component visual contracts.
It draws on the *ownership pattern*, not the Flutter code, of the Tio-World core theme.

## Ownership hierarchy

1. **`primitives.ts`** owns approved numeric dp sizes and opacity constants.
   Introduce a new value only with explicit design evidence; avoid copying a numeric
   literal into multiple component files.
2. **`tokens.ts`** owns spacing, radii, typography and system light/dark semantic
   palettes. Existing colors and spacing values are unchanged.
3. **`component-tokens.ts`** owns semantic sizing for navigation, FAB, buttons,
   shadows, exceptional recovery and the tab icon vector-rendering size contract.
   All component roles alias the primitive physical values rather than declaring
   new numbers.
4. **`theme-provider.tsx`** resolves the locally persisted **System / Light / Dark** preference
   and `useColorScheme()` once for the entire app, exposing tokens through `useAppTheme()`.
   The root composes an `AppearancePreferenceStore` adapter backed by the already-installed
   `expo-sqlite/kv-store`. No per-screen theme overrides or finance database migration.
5. **`src/shared/ui/`** displays theme-driven elements. **`src/app/(tabs)/more.tsx`**
   composes `MoreRoute` with `MoreScreen`, `useMoreViewModel`, typed `UiState` and `Action`.
   Four other tab routes remain blank. Navigation, safe areas and splash dismissal
   remain in the existing shell; finance SQLite initialization remains in bootstrap/data.

## Icon-size rule — every UI surface

`iconTokens.size` is the canonical **24dp icon size**. Component roles
`iconRoleSizes.navigation`, `.topBar`, `.button`, `.bottomSheet`, `.card`,
and `.textField` **all alias this same owner**. Future top bars, reusable buttons,
sheets, cards and text fields must consume this shared icon contract and not
declare `width: 24`, `height: 24` or a new icon-size constant locally.

The reusable `AppBottomSheet` is introduced by Issue #42 on a separate feature branch.
Other future components must not be created simply to demonstrate a token. A legitimately different icon size
requires an approved **semantic role** and a design decision, not arbitrary
per-screen numbers. The five bottom-tab icons use official Google Material
Symbols Outlined SVG assets and the Expo SDK 58 compatible `react-native-svg`
renderer. They use the 24dp shared size and active/inactive theme colors.
No custom icon geometry, platform-dependent font glyphs or Metro SVG transformer
is required.

## Visual continuity and design-system boundaries

- Current bottom navigation: **50dp baseline total height** (top border 1dp +
  top pad 1dp + 48dp minimum-height tab row), plus actual OS bottom safe area
  when present. The tab icons remain 24dp, labels 11sp, and icon-label gap
  **1dp (reduced from 5dp; superseding the intermediate 3dp)** through
  `navigationTokens.iconLabelGap`, between each Google icon and its label.
  The floating circular disabled FAB has **50dp diameter (from 56dp)**,
  with an official Google Material Symbols Outlined `add` mark at 24dp
  and default weight 400 (FAB-only). These changes retain the 48dp tab touch targets,
  More-centered FAB positioning and **16dp FAB-to-bar separation** (increased
  from 12dp for better clearance).
- Five bottom-tab glyphs use official **Google Material Symbols Outlined** SVGs
  (home, book_2, bar_chart_4_bars, account_balance and more_horiz), licensed
  Apache 2.0. The owner-approved 2026-11-21 selected-state rule is:
  **400 regular when selected**, **200 when unselected**; the former all-tab
  maximum 200 is superseded for selected tabs only. Both are original 24px
  optical-size SVG XML paths selected by `navigationTokens.selectedIconWeight`
  and `.unselectedIconWeight`, tinted by existing active/inactive theme colors.
  The [asset provenance](../assets/google-material-icons/README.md) records
  exact upstream names and licensing. The display size remains shared 24dp;
  FAB's original weight-400 add symbol and disabled behavior do not change.
- Bottom bar adds the OS safe-area bottom inset to the 50dp baseline and
  remains safe-area-aware on Android and iPhone. The floating disabled FAB stays
  centered over More, separated from the visible bar by 16dp, based on the
  shared `minimumBottomPadding` role rather than an unrelated horizontal
  inset. These measured insets are runtime values, **not visual token literals**.
- The historical Phase 0 baseline had five blank routes. This **owner-requested More-only
  feature PR** adds General Settings and an Appearance selector within More while preserving
  four empty tabs, five tab navigation, disabled FAB and no extra route or finance action.
  Native splash transitions directly to the five-tab shell after SQLite
  initialization; an actual bootstrap failure may show minimal recovery.
- Never store ledger, navigation, data loading or feature business logic in
  screens. Presentation components may receive props, render layouts, access
  theme tokens and expose input handlers; controllers/services own behavior.
- Don't create one token module per feature/screen. Only add reusable
  component-specific contracts with verified shared use. Keep literal
  React Native **structural** values such as `flex: 1` and dynamic arithmetic
  distinct from fixed visual sizes. Non-theme source must not define
  hard-coded `fontSize`, `width`, `height`, `gap`, `radius`, shadows or
  padding values.
- Changes to theme tokens must update this README and regression tests
  together, and check both system appearances on Android and iPhone.

## Evidence and verification

- `tests/phase0/design-tokens.test.ts`: token aliases, global icon role
  consistency, enforced absence of numeric visual size literals in the
  Phase 0 UI surfaces, system-appearance ownership and screen/logic split.
  The visual-size guard includes every corner-specific React Native border radius,
  not just `borderRadius`; Google SVG artwork retains its official paths,
  while the displayed vector dimensions remain theme-tokenized.
- `tests/phase0/navigation-shell.test.ts`: five blank routes, disabled FAB,
  responsive More alignment and native splash.
- `npm run check` and Android/iOS Metro export run in the Phase 0 workflow.
  These **do not replace physical Expo Go visual/touch/accessibility QA**.

Historical Phase 0 decision [TM-DEC-005](../../../docs/DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) remains the foundation; owner-requested More-only expansion is recorded in [RFC #17](https://github.com/im-tnyx/Tio-Money/issues/17). Separate owner PR merge authorization rules remain unchanged.

## Shared bottom-sheet contract — Issue #42 (2026-11-21)

`src/shared/ui/app-bottom-sheet.tsx` centralizes modal chrome and dismissal, while the
feature layer supplies only its own body. `bottomSheetTokens` in `component-tokens.ts`
sets **one global** default for top corner radius (24dp via `radius.xl`), handle size,
handle margins, header minimum height/divider, horizontal inset, maximum height and backdrop
opacity. The reusable shell reads the active semantic light/dark colors through `useAppTheme()`.
There is **no sheet outer top border**. The centered header's divider is a distinct element.

Callers pass `visible`, `title`, `dismissAccessibilityLabel`, `onDismiss`, and arbitrary
`children`. Visibility and selection stay in feature ViewModels and are never stored in the
shared shell. The handle is **visual only**, not an unimplemented drag-to-dismiss gesture.
The component retains Android Back, backdrop tap, and iOS VoiceOver escape support. No global
modal manager, navigation side effects or remote data access is included.

Appearance's existing System/Light/Dark radio content is the first real consumer. A second
**test-only** fixture demonstrates distinct content composition without creating a new app route.
Device-level accessibility and dynamic-type smoke tests remain acceptance work; source/CI
checks do not prove actual screen-reader or gesture behavior.

## Bottom navigation active icon weight (Issue #44, 2026-11-21)

`RootTabBar` derives `active` from the existing pathname, then passes it to
`RootTabIcon`. `navigationTokens.selectedIconWeight=400` chooses the exact Google
Material Symbols Outlined **regular 400** SVG; `unselectedIconWeight=200` uses
the original **200** SVG. Both remain 24dp via `iconTokens.size`, with unchanged
brand/secondary color roles, labels, 1dp icon-to-label gap, tab heights, safe-area
insets, navigation events and independent disabled Add FAB. No stroke-width
simulation or new font/Metro transformer is used. Changing the tab's state
only selects approved artwork: no extra screen or business logic.

This design decision supersedes the previous all-tabs maximum-200 rule
**only for selected bottom navigation icons**. Appearance mode icons stay 200.
Review `tests/phase0/navigation-shell.test.ts` and `design-tokens.test.ts`
for both local SVG variants, provenance and semantic token assertions. Android/
iPhone visual verification is distinct from CI.

# Tio Money — Core Theme Ownership (Phase 0)

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
4. **`theme-provider.tsx`** resolves `useColorScheme()` and exposes the typed,
   centrally owned contracts through `useAppTheme()`. System light/dark is automatic.
   **No manual selector**, extra settings screen or local per-route theme overrides.
5. **`src/shared/ui/`** displays theme-driven elements. **`src/app/(tabs)/*.tsx`**
   contains only blank screen exports and the minimal shell layout. Navigation
   actions, responsive safe-area measurements, and splash dismissal belong to
   `src/shared/navigation/` hooks; SQLite initialization remains in bootstrap/data.

## Icon-size rule — every UI surface

`iconTokens.size` is the canonical **24dp icon size**. Component roles
`iconRoleSizes.navigation`, `.topBar`, `.button`, `.bottomSheet`, `.card`,
and `.textField` **all alias this same owner**. Future top bars, reusable buttons,
sheets, cards and text fields must consume this shared icon contract and not
declare `width: 24`, `height: 24` or a new icon-size constant locally.

Those future components **do not currently exist in Phase 0** and must not be
created simply to demonstrate a token. A legitimately different icon size
requires an approved **semantic role** and a design decision, not arbitrary
per-screen numbers. The five bottom-tab icons use official Google Material
Symbols Outlined SVG assets and the Expo SDK 58 compatible `react-native-svg`
renderer. They use the 24dp shared size and active/inactive theme colors.
No custom icon geometry, platform-dependent font glyphs or Metro SVG transformer
is required.

## Visual continuity and design-system boundaries

- Current bottom item: 56dp; icon: 24dp; label: 11; icon-label gap: 5dp;
  FAB circle: 56dp; centered plus mark: 24dp. This refactor does **not**
  alter visible sizes or selected-tab behavior.
- The five bottom-tab glyphs are **Google Material Symbols Outlined, weight
  200 maximum** (home, book_2, bar_chart_4_bars, account_balance and
  more_horiz) with exact official local SVG assets, licensed Apache 2.0.
  Their XML is embedded in `SvgXml` and tinted through the active/inactive
  theme fill; the [asset provenance](../assets/google-material-icons/README.md)
  records upstream filenames and licensing. The shared 24dp display size
  remains unchanged. The disabled FAB mark retains its original native
  View-drawn two-stroke geometry and behavior.
- Bottom bar pads dynamically around Android and iPhone safe areas. The
  floating disabled FAB stays centered over More, separated from the bar by
  12dp. These measured insets are runtime values, **not visual token literals**.
- All five routes remain empty and selectable. No top bar, onboarding,
  transaction editor, Settings, extra screen, finance posting or FAB action.
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

Owner decision [TM-DEC-005](../../../docs/DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) remains the UI authority; all owners' PR merge authorization rules remain unchanged.

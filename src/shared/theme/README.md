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
  **0dp (removed; previously 1dp)** through `navigationTokens.iconLabelGap`,
  between each Google icon and its label.
  The floating circular disabled FAB has **50dp diameter (from 56dp)**,
  with an official Google Material Symbols Outlined `add` mark at 24dp
  and default weight 400 (FAB-only). These changes retain the 48dp tab touch targets,
  More-centered FAB positioning and **16dp FAB-to-bar separation** (increased
  from 12dp for better clearance).
- Five bottom-tab glyphs use official **Google Material Symbols Outlined** SVGs
  (home, book_2, bar_chart_4_bars, account_balance and more_horiz), licensed
  Apache 2.0. The owner-approved 2026-11-21 selected-state rule is:
  **300 when selected**, **200 when unselected**; the former all-tab
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
handle margins, header minimum height/divider, horizontal inset, safe height limits and backdrop
opacity. The reusable shell reads the active semantic light/dark colors through `useAppTheme()`.
There is **no sheet outer top border**. The centered header's divider is a distinct element.

Callers pass `visible`, `title`, `dismissAccessibilityLabel`, `onDismiss`, and arbitrary
`children`. Visibility and selection stay in feature ViewModels and are never stored in the
shared shell. The handle supports vertical drag to expand/collapse and an accessible tap toggle;
drag-down collapses but does not dismiss the sheet.
The component retains Android Back, backdrop tap, and iOS VoiceOver escape support. No global
modal manager, navigation side effects or remote data access is included.

Appearance's existing System/Light/Dark radio content is the first real consumer. A second
**test-only** fixture demonstrates distinct content composition without creating a new app route.
Device-level accessibility and dynamic-type smoke tests remain acceptance work; source/CI
checks do not prove actual screen-reader or gesture behavior.

## Bottom navigation active icon weight (Issue #44, 2026-11-21)

`RootTabBar` derives `active` from the existing pathname, then passes it to
`RootTabIcon`. `navigationTokens.selectedIconWeight=300` chooses the exact Google
Material Symbols Outlined **300-weight** SVG; `unselectedIconWeight=200` uses
the original **200** SVG. Both remain 24dp via `iconTokens.size`, with unchanged
brand/secondary color roles, labels, 0dp icon-to-label gap, tab heights, safe-area
insets, navigation events and independent disabled Add FAB. No stroke-width
simulation or new font/Metro transformer is used. Changing the tab's state
only selects approved artwork from the static, source-verified
`root-tab-icon-svg.json` asset: no extra screen or business logic.

This design decision supersedes the previous all-tabs maximum-200 rule
**only for selected bottom navigation icons**. Appearance mode icons stay 200.
Review `tests/phase0/navigation-shell.test.ts` and `design-tokens.test.ts`
for both local SVG variants, provenance and semantic token assertions. Android/
iPhone visual verification is distinct from CI.

### Owner refinement — selected bottom navigation weight 300 (2026-11-21)

The previously proposed selected 400 was visually too heavy, so the owner's
current decision uses official **300** selected and **200** unselected icons.
These are exact `*_wght300_24px.svg` and `*_wght200_24px.svg` artwork at
shared 24dp display size; theme colors, labels, spacing, navigation and
accessibility roles are unchanged. The independent Add FAB remains 400.

### Bottom tab icon-label spacing refinement (2026-11-21)

The owner requested removal of the remaining 1dp space between each bottom-tab
icon and label. The shared `navigationTokens.iconLabelGap` is now `size.dp0`;
all five tabs consume it through the existing `RootTabBar` gap property. No
change to the selected 300/unselected 200 icon artwork, typography, baseline
height, touch targets, colors, safe areas or the independent disabled Add FAB.

## Five-tab scene crossfade — Issue #46 (2026-11-21)

The owner-approved screen-content navigation animation is a subtle **160ms crossfade**.
`motion.tabCrossfadeDurationMs` in `primitives.ts` owns the single numeric time
value and `navigationTokens.tabCrossfadeDurationMs` aliases it; duration is not
scattered across screens. `src/app/(tabs)/_layout.tsx` uses Expo Router JS
`Tabs` as a **scene host** with `animation: 'fade'` and timing `transitionSpec`.
It hides the built-in navigator bar and retains the independently rendered, existing
`RootTabBar` and disabled `FloatingAddButton` siblings **without movement**.
The same five route filenames/labels and current 300/200 icon SVG weights, 0dp
icon-label gap, 50dp baseline, colors and safe areas remain authoritative.

`src/shared/navigation/reduced-motion-provider.tsx` owns the platform Reduced Motion
query and subscription once at the app root (tab hook remains a compatibility alias). Unknown/unavailable preference
defaults to **no animation**; when Reduced Motion is enabled use `animation: 'none'`.
A timing fade is applied only when the OS permits it. Route navigation stays in the
existing controller and feature screens remain dumb. The tab host uses history-style
Back behavior, which requires on-device Android Back/deep-link testing (a Metro
bundle alone does not validate it). Appearance's own bottom-sheet animation,
splash and finance state are out of scope. See [Issue #46](https://github.com/im-tnyx/Tio-Money/issues/46).

Actual crossfade, quick taps, screen lifetime (including preserved More appearance
state), Reduced Motion toggle, TalkBack/VoiceOver, Android Back and iPhone safe areas
must be verified on devices before final product acceptance. Structural tests and
Android/iOS Metro checks are not substitutes for device evidence.

The JavaScript tab navigator also sets its `sceneStyle.backgroundColor` from
`theme.colors.canvas` to prevent the transition host from showing an unrelated
light/dark background when the user overrides the device appearance.

## Reusable navigation motion — PR #80 / RFC #79 (2026-11-23)

**Requirement:** The More tab scene crossfade and Account Groups detail-page fade
share a theme-owned motion policy, rather than accidental per-screen/native defaults.
Owner feedback for PR #80: iOS fade felt right, but the Android native fade did not.
The detail motion therefore uses Android's native `fade_from_bottom` transition,
while keeping iOS's 160ms `fade` and all five tab fades unchanged.
The screen content remains dumb: only the router layout/controller selects motion.

- `primitives.ts` keeps exactly one approved duration:
  `motion.tabCrossfadeDurationMs = 160`. `component-tokens.ts` exposes semantic
  `navigationTokens.tabCrossfadeDurationMs` and `detailFadeDurationMs` as aliases.
  **Never add a literal `160` to a new route or introduce per-screen durations.**
- `src/shared/navigation/navigation-motion.ts` is the pure reusable policy:
  `getNavigationMotion(reduceMotion, theme.navigation, platform)` returns `tab` and
  `detail` navigator options; `use-navigation-motion.ts` supplies `Platform.OS`
  from React Native alongside theme and OS Reduced Motion preference.
  A new eligible detail route registers `motion.detail` on the **root navigator's**
  `Stack.Screen` before first push; its controller separately preserves any
  existing `gestureEnabled` rules. Tab layouts use `...motion.tab`.
- `ReducedMotionProvider` lives at the app root, above both Tabs and detail Stack
  routes; it owns the **single** `AccessibilityInfo` listener/query and starts with
  animation **disabled** until the OS preference is known. The compatibility alias
  `useReducedTabMotion` must not create a second listener. Always honor live
  `reduceMotionChanged` notifications, including cleanup at unmount.
- **Navigator API distinction:** Expo Router JS Tabs support `animation: 'fade'`
  plus `transitionSpec` with an exact 160ms timing config. Expo Router native Stack
  uses **iOS `animation: 'fade'` and `animationDuration=160ms`** (theme token);
  **Android `animation: 'fade_from_bottom'`** with platform-native timing and
  no `animationDuration` override. That duration API applies **on iOS only**;
  do **not** claim an exact Android 160ms transition, measured frame smoothness or
  visual parity. Do not pass JS Tabs `transitionSpec` to native Stack or fake
  its fade with `Animated.View`.
- The `AppBottomSheet` native modal keeps its existing `animationType="slide"`;
  swipe-to-reveal Delete stays finger-driven. These interactions are **not**
  replacements for navigation fade and should not be globally overwritten.
- Never animate the bottom bar, FAB, safe area, financial data or splash while
  implementing page transitions. Preserve the route controller's Back/swipe
  gesture arbitration, the `theme.colors.canvas` scene background, and OS
  appearance overrides. Other detail screens keep their existing transitions
  unless separately included in an approved UI RFC.

**Required tests/checks:** `tests/phase0/tab-crossfade.test.ts` must test both
fade and Reduced Motion (initial unknown, on/off) on **iOS and Android**,
compare both semantic duration aliases and prove the Account Groups Stack uses
the reusable policy. The policy must be platform-injected and pure.
Run exact-HEAD typecheck, ESLint, Prettier, Phase 0/preview tests and Android/iOS
Metro. **Native acceptance still required:** tab switches, More→Account Groups
open/Back, iOS interactive Back, Android hardware Back, swipe Delete, bottom
sheet Save/keyboard, light/dark and Reduced Motion toggle during a session.
No source-only test or Metro bundling proves visual timing on real devices.

Source: [RFC #79](https://github.com/im-tnyx/Tio-Money/issues/79#issuecomment-7090244141)
and Expo Router SDK 58 native Stack documentation:
https://docs.expo.dev/versions/v58.0.0/sdk/router/.

## Segmented control visual reference — 2026-11-21 (PR #53)

A user-supplied dark segmented `Write | Preview` control is a **visual reference**, not literal labels. The shared `AppSegmentedControl` uses equal-width rounded options, a dark/light semantic track and contrasting selected pill, with a canonical 48dp minimum option touch height and existing 4dp inset/100dp pill-radius primitives. `CurrencyUnitPositionControl` maps this reusable component to `Front | End`; it does not own persisted state. Theme palette keys `segmentedTrack`, `segmentedSelected`, `segmentedText` and `segmentedSelectedText` are maintained centrally in `tokens.ts`. Neither currency bottom-sheet chrome nor global 24dp icon roles are changed by the selector. Real Android/iOS dark/light contrast and accessibility QA remain required; see [RFC #54](https://github.com/im-tnyx/Tio-Money/issues/54).

## Main Currency status-bar/header continuity — PR #53 (2026-11-21)

The dedicated Main Currency screen paints its top safe-area inset with the same
`theme.colors.card` surface as the header. This makes the bar visually extend
behind the system battery/network/status icons without putting Back or
the centered title underneath them. `navigationTokens.topBarHeight` aliases the existing
`size.dp50` primitive for a **50dp header below the dynamic OS top inset**;
header action hit areas retain the shared 48dp minimum and icon sizes remain
24dp. The scrollable body explicitly uses `theme.colors.canvas`, preventing the
header surface from bleeding into the content. This is local to Main Currency;
root tab and global StatusBar behavior are unchanged. Device verification of
Android edge-to-edge and iOS notches remains required.

## Main Currency four-option card — PR #53 (2026-11-21)

The 50dp header contains only the accessible Back icon and centered Main Currency
title; an equal-width decorative right spacer preserves the true center. The old
top-right Change action is the first option inside the existing single settings
card: **Main Currency | Change**, followed by **Unit Position | Front/End**,
**Decimal Point**, and **Format**. Selecting the first row opens the same
shared currency-selection bottom sheet through the controller's existing
`open/currency` action. No separate top-right button, new sheet, preference
schema, ledger behavior, network calls, or global navigation changes.

## Shared bottom-sheet scrolling, clipping and handle drag — PR #53 (2026-11-21)

The shared `AppBottomSheet` now owns the **single native ScrollView**
for Appearance, Currency, Main/Sub selection, Decimal and Format. Feature sheets
no longer contain nested `maxHeight: '70%'` scroll panes; long currency
lists and error rows remain reachable on short screens and with larger text.
A tokenized bottom inset supplements the actual bottom OS safe-area inset.

A 48dp accessible handle lets users drag the sheet upward while touching it
and release to snap expanded. Dragging down collapses it, and tapping
the same handle also toggles. Gestures activate only from the handle area,
leaving swipes inside list options to the native ScrollView. Expanded height
is limited by the **measured modal viewport**, dynamic top safe-area inset
and a theme gap, so the panel should not obscure battery/network indicators.
Presentation-only expansion resets when the sheet closes; feature ViewModels
still own visibility, selection, and dismissal. No additional dependency,
financial data, migration or routing changes.

Android/iPhone device validation is still required for drag smoothness,
short screens, large text, scroll-to-last item, back/backdrop dismiss and
screen-reader handle actions. Source regression tests and Metro CI cannot
certify actual on-device gesture behavior.

## Bottom-sheet refinement: preserve original top chrome (2026-11-21)

The owner explicitly retained the **original thin handle and centered title
geometry**. The visible handle again occupies only its original 4dp height
with 8dp top margin and no added header gap; the existing 48dp header is
unchanged. A separate transparent **absolute-positioned** accessible
handle hit area (48dp tall) supports drag and tap without shifting the
visible handle/title or consuming sheet layout height.

The initial sheet cap returns to its prior **90% viewport** maximum rather
than the experimental 72%; short sheets remain content-sized. Currency
choices use the one shared scroll region. **Only overflowing lists** retain 40dp
of bottom scroll clearance; short sheets add no extra space beyond the
system bottom safe-area padding. The final row must be fully reachable
without being covered or cut at the screen edge. Expansion may grow toward
96% while preserving the top safe inset and theme gap. Verify on Android
and iPhone before treating the visual/gesture behavior as accepted.

## Main Currency Format: no Auto UI option; short-sheet bottom protection — 2026-11-21

Format presents exactly **three options**: Millions Format, Lakhs Format and
No Format. The underlying `grouping: 'auto'` remains an internal display
default: INR resolves to Lakhs, all other Main currencies resolve to Millions.
The Format card value and the selected option show the **resolved style**,
without an Auto label or a fourth row. Choosing a style stores the explicit
user selection until Main Currency changes. Ledger and FX behavior are not
affected.

The original 4dp visible handle, top margins and 48dp title area remain
untouched. The shared `ScrollView` now reserves the actual measured safe-area
bottom inset when limiting the scrolling viewport, keeps flex-grow disabled
for content-sized sheets (Decimal and Format). The OS bottom inset is
supplied exactly once by the SafeAreaView, not added inside the scroll
content as well. The last option should remain reachable and
fully readable above the bottom edge on Android and iOS. Physical-device
safe-area and scroll-to-last-item QA is still required.

## Adaptive bottom sheets: expand only when options overflow — PR #53 (2026-11-21)

The owner specifically requires **short option sheets to stay bottom-aligned,
content-sized**. Decimal, Format and similarly small lists must never become
tall merely because the handle is touched. The shell measures `ScrollView`
content after layout and compares it to the **collapsed** scroll viewport,
including the real bottom safe-area inset, visible handle, 48dp title and
divider. Only overflowing content (e.g. the long Currency/Country list) can
activate the invisible handle's drag/tap affordance or expand toward the safe
height ceiling. Short sheets show the original thin decorative handle with
the original title spacing and stay in place. When the title changes, local
drag/expansion measurements reset. Normal list scrolling remains available
only when actual content exceeds the visible scroll region. This does not
change selection persistence, currency semantics, or global navigation.

On-device acceptance: verify 3-option Format, 4-option Decimal, 3-option
Appearance, long Main/Sub Currency lists, dynamic type and both Android/iOS
bottom safe areas. CI cannot prove gesture physics or visual alignment.

## Short-sheet bottom blank-space correction — PR #53 (2026-11-21)

When a sheet's measured options fit within the collapsed viewport (e.g.
three Format or four Decimal choices), the shared ScrollView adds **0dp
extra end padding**, and its SafeAreaView alone protects the real bottom
system inset. This keeps the content-sized sheet resting at the actual
bottom without an artificial 40dp gap or duplicate OS safe-area padding.
Only overflowing Currency/Country lists receive the existing 40dp scroll
clearance. The original 4dp handle, 8dp top margin and 48dp title/header
geometry are completely unchanged, as is safe-area-aware long-list
scrolling and handle expansion. Physical Android/iOS checks remain needed.

## Main Currency Change action returns to header — PR #53 (2026-11-21)

The latest owner direction supersedes the earlier four-option settings card.
The Main Currency page retains its 50dp top bar, with icon-only Back on
the left and an **existing reusable ActionButton** on the right labeled
**Change**. The reusable button's optional `compact` variant adjusts only
horizontal padding using the existing theme spacing tokens, preserving its
48dp minimum touch height, ghost presentation, accessibility and all other
existing button variants. Left and right top-bar slots use equal token-derived
widths, keeping the title centered. The card below again shows exactly the
three settings: Unit Position, Decimal Point and Format. Change opens the
existing Main Currency selection sheet; persistence, financial values and
sheet layout are unchanged.

## More: Main/Sub Currency shared group — PR #53 (2026-11-21)

The latest owner reference shows two selectable rows within one continuous
surface, separated by a thin inset divider rather than separate full-border
cards. The More screen's Currency section now wraps **Main Currency** and
**Sub Currency** in one `theme.colors.card` group with a single shared
outer top/bottom border and one inset `theme.colors.border` separator.
Both rows retain their existing icon roles, text hierarchy, currency values,
48dp minimum touch targets, accessibility labels and actions. Main Currency
still opens its dedicated screen and Sub Currency its own screen.
Appearance, section spacing, navigation, persistence and other screen behavior
remain unchanged. Android/iOS visual verification is required.

## Sub Currency dedicated route — PR #53 (2026-11-21)

The More Sub Currency row now opens `/currency/sub` instead of a
bottom sheet. The obsolete More Currency sheet and sheet-only controller
state/actions are removed. The new Route, ViewModel and screen follow
the established architecture: 50dp safe-area top bar, accessible Back,
scrollable full-screen radio options, and no navigation or storage in the
presentation layer. `None` is always offered, Main Currency is excluded,
and the current Sub is marked. The existing provider saves selections
without silently navigating away if persistence fails. Main Currency,
Appearance and the More shared card remain unchanged. Android/iOS
screen and accessibility testing remain required.

## Sub Currency Plus and conditional Pencil — PR #53 (2026-11-21)

The Sub Currency route uses the unchanged 50dp title bar with Back at
left, centered title and Plus at right. If a Sub is saved, a Pencil
action appears immediately to the left of Plus. Plus opens an adaptive,
scrollable shared currency-selection bottom sheet. The selected currency
is rendered as a row on the screen. Pencil enables removal editing;
pressing Remove writes None via the existing currency preference store.
The shared 24dp icon and 48dp touch tokens apply throughout.
The current single-Sub data contract is preserved: selecting another
currency replaces the existing code. The sheet closes only when the
local write succeeds, and remains open with an error on failure.
No FX quotes, ledger changes, migration or additional packages.

## Multi Sub Currency, Pencil/X and FX screen layout — PR #53 (2026-11-21)

Sub Currency supports at most 5 distinct saved currencies. The Plus
picker presents names/codes only, with a one-tap add and no FX values.
The main screen lists each selected Sub with the directional rate
`Sub 1.00 = Main X.XXXXXX` and a source/date; a network failure
displays "Reference rate unavailable". Pencil switches to edit mode,
top-left Back switches to X Cancel, and Remove is per currency. X never
removes data or navigates. Legacy v1 selection is migrated in-memory to
the v2 multi-Sub preference without deleting the prior key.

The isolated Frankfurter reference data adapter needs provider/legal,
privacy, offline-cache and stale-age review before merging/release.
Quotes are informational, not ledger conversion or FX transaction data.

## Sub Currency card external copy cleanup — PR #53 (2026-11-21)

Remove the redundant `Main Currency: INR` text above the saved
Sub Currency card, and the separate `Sub Currencies: N/5` and FX
disclosure paragraphs below the card. Keep every saved currency row,
its FX pair quote, source/date or unavailable state, and the persistence
error banner when needed. The Add sheet retains its own count and limit
feedback; the existing five-item backend limit remains enforced.
Header/Plus/Pencil/X behavior, card appearance and add-sheet contents
are unchanged.

## Sub Currency edit mode: left-side remove control — PR #53 (2026-11-21)

Pencil enables Edit and retains the top-left X cancel action. For every
saved currency row, show a 32dp semantic danger-colored circle with a
minus glyph **before the currency label/rate**, on the left. The
underlying accessibility-labeled Pressable maintains a 48dp minimum
touch target and invokes the existing per-currency remove action. Hide
the icon entirely outside Edit; remove the previous trailing text
"Remove" action. Header, FX quote/date display, current five-currency
limit and single-tap add sheet are unchanged. No reordering drag handle
is introduced until reorder behavior is separately specified.

## Sub Currency swipe-left Delete, and compact FX card — 2026-11-21

Outside Pencil mode, each saved currency row supports a horizontal
**left swipe** to reveal a semantic red Delete action on the right.
Tapping Delete invokes the existing per-currency remove operation;
swiping alone never deletes. Swipe right closes the action; vertical
gestures still scroll the saved list. Movement is direction-gated,
clamped to the token-derived reveal width, and snapped open or closed.
Pencil mode keeps the existing left-side red minus control and resets
the swipe reveal. No new packages, accounting changes, or storage
behavior are introduced.

The saved currency row still shows its validated Main/Sub direct
exchange-rate line or unavailable status; the extra visual
FX source/date line has been removed to keep rows compact. The
FX adapter continues validating effective dates internally.
The Plus selection sheet remains currency-only.

## Sub Currency row details as a bottom sheet — PR #53 (2026-11-21)

Tapping the saved currency label/rate in normal mode opens a
**separate, content-sized detail sheet**. The existing Plus sheet remains
a names-only currency picker, and Pencil/Edit minus and horizontal
swipe-delete remain distinct. The detail sheet reuses AppBottomSheet,
CurrencyUnitPositionControl and shared theme tokens. It contains a
two-currency comparison preview, a **read-only direct reference rate**
with a 48dp refresh control, a per-Sub Front/End selector and a
Decimal Point row with four choices (None, 1.0, 1.00, 1.000).
Choosing Decimal swaps the same modal content to a short choice list,
not an overlapping second modal.

The local v2 preference shape gains an **optional per-Sub display
mapping**, read safely from prior v2 records and validated by the same
store. Main Currency display preferences are not modified by a Sub
change; deleting a Sub removes that code's display override.
Reference rate refresh uses the existing verified pair adapter,
rejects stale async responses and keeps the last valid quote on failure.
No manual exchange-rate override, account or ledger conversions,
new backend endpoint or new dependency are introduced. FX data remains
indicative; platform/device sheet, touch and network tests are still
required.

## Sub Currency swipe dismissal and stable geometry — 2026-11-21

Each saved row exposes a short visible `Delete` label (but keeps a
currency-specific accessible Remove label) on left swipe. The screen
owns exactly one currently revealed row; tapping blank space, any
other saved row, Back/X, Pencil or Plus hides the reveal without
changing persisted currencies. Swipe right also closes it. A Delete
tap remains the **only** swipe-path removal trigger. This does not
change the separate Pencil minus control or FX-detail-sheet actions.

Currency row minimum height is now identical in normal and Pencil
modes: the shared 48dp minimum tap target plus existing 32dp spacing.
The Main and Sub Currency top bars use the same **fixed**
`theme.navigation.topBarHeight` (50dp) below the OS safe-area inset,
rather than expandable min-height. Other pages continue their
existing navigation contract. No hardcoded screen dimensions or new
dependencies.

## Sub Currency FX detail alignment — 2026-11-21

The supplied reference uses two aligned caption/value rows with the
same three column boundaries: Sub at left, a centered equals sign
between, and Main at right. A narrower Sub column plus a wider Main
column gives the six-decimal quote room. Amounts scale down on compact
screens without clipping, while extended country labels remain one
line. The setting labels (Exchange Rate, Unit Position, Decimal Point)
share the same 34%-width column; their values begin in the same second
column. This changes layout only: exchange rates and stored
per-currency preferences are unchanged.

## USD reference caption in Sub Currency detail sheet — 2026-11-21

The user's reference shows `USD - USA (US$)` in the first grey caption
and `US$ 1.00` in the left amount. Use those **only in the detail
sheet display**, with the existing muted caption theme and a single-line
auto-fit safeguard so the complete country/symbol text remains legible
on compact devices. Other currency captions and the saved Sub Currency
list retain their existing metadata, and the shared currency catalog,
ISO identity, persistence, FX pair/rates and financial amounts remain
unchanged.

## Sub Currency detail two-tone panel — 2026-11-21

Match the reference using the existing light/dark semantic palette:
the currency conversion preview uses `theme.colors.card` while the
settings section uses `theme.colors.elevated`, separated by the
tokenized divider. The default reusable sheet header, drag handle,
safe area and other sheets remain unchanged; no screenshot color
values are hardcoded. USD's short display-only caption is
`USD - USA (US$)` and its displayed amount uses `US$`.
The shared ISO metadata, stored settings and FX pair/rate are intact.

## Sub Currency swipe-only Delete supersedes edit mode — PR #53 (2026-11-21)

Latest owner direction supersedes the historical Pencil, X Cancel and
left-side minus edit controls described above. The 50dp top bar shows
only the icon-only Back action and Plus add action. Saved Sub Currency
rows keep the same height and remain tappable for details; left swipe
reveals a right-side red Delete action, and only tapping Delete removes
that currency. Swiping right, tapping blank screen space, choosing
another row, Back or Plus hides the exposed action without deleting.
For assistive technology, the row exposes a named accessibility Delete
action without restoring a visible minus or Pencil.

Delete uses dedicated semantic theme colors: white label on a sufficiently
dark red background in both light and dark modes. The dark background
must not reuse the lighter expense/pink value because white-text
contrast would be inadequate. Persistence, FX, ledger and shared sheet
behavior are unchanged. On-device gesture and screen-reader QA is pending.

## Sub Currency inline decimal stepper and unified detail layout — 2026-11-21

Latest owner direction supersedes the nested Decimal Point option sheet only
for Sub Currency details. Existing AppBottomSheet still provides the single
modal shell. The Sub detail row offers minus, sample, and plus: 1, 1.0,
1.00, 1.000; bounds disable the corresponding 48dp accessible controls.
Changes persist per selected Sub without dismissing the sheet. Main Currency
continues to use its existing Decimal Point option bottom sheet.

A read-only Main Currency label appears above the comparison. Sub/Main
captions share the same aligned columns as their values, source/effective
date is disclosed when a rate is available, Exchange Rate is a compact
48dp-minimum row with an independent refresh touch target, and Unit Position
aligns right. Preview and setting rows use the same theme card color with a
semantic divider. Tests cover the isolated decimal bounds and Main unaffected.
FX provider approval and device visual/accessibility QA remain outstanding.

## Sub Currency decimal row right-end alignment — 2026-11-21

The owner's latest layout clarification places the decimal sample value
(left of the controls) in the right-aligned value column, matching the
Exchange Rate value immediately before its refresh button. The two
accessible minus and plus buttons sit together at the far-right end
of the Decimal Point row, in that order. The preview stays outside
the button group instead of being sandwiched between minus and plus.
This affects only the Sub Currency detail bottom sheet. Main Currency,
other shared selectors, persistence, FX source and the ledger are unchanged.

## Sub Currency +/- uses the shared Front/End segmented-pill design (2026-11-21)

The owner requested that the minus and plus actions look the same as the
Front/End button pair in Unit Position, with the decimal sample kept to
their left (as the exchange rate is left of Refresh). The Sub detail sheet
now composes AppSegmentedActionControl, a button-action sibling of the shared
AppSegmentedControl, using the exact same compactWidth, compactOptionHeight,
inset, radius, hit slop, track and semantic pill colors. Unlike selectable
Front/End radio choices, minus/plus remain accessible *buttons* and never
claim a selected value. Each disables correctly at zero/three digits.
No Main Currency control or shared AppBottomSheet behavior is modified.

## Sub Currency Refresh visual feedback — 2026-11-21

The rate refresh icon now becomes a native ActivityIndicator while the
user-triggered request is in flight. The existing 48dp refresh target,
disabled-during-refresh semantics and rate-source boundary remain unchanged.
An accessible status line immediately below Exchange Rate says "Checking
latest published rate..." during the request, then "Reference rate updated."
only if its validated base/quote/date/rate differs, or "Checked — published
rate unchanged." when the provider returns the same data. Failure keeps
the previous valid displayed rate and shows its existing recoverable error
next to the refresh control. The feedback resets when the detail sheet closes
or switches currency. These messages describe the network check outcome,
not a live-market tick or any change to booked amounts. No new dependencies
or background requests were introduced; on-device QA remains pending.

## Sub Currency opt-in app lifecycle and local FX cache — 2026-11-21

The earlier Sub-screen mount-time FX request is superseded. An app-scoped
FxRateProvider is mounted inside DatabaseGate and CurrencyPreferencesProvider.
It runs only for the user's nonempty, saved Sub/Main pairs when the app
starts, Sub selection changes or Main Currency changes. Main/Sub display
format changes and opening screens are render-only; neither causes a new
FX request. Manual Refresh keeps its spinner and validated success/unchanged/
failure status. The shared provider deduplicates in-flight pair requests
and excludes stale responses for disabled pairs.

Last valid rates are cached using the versioned expo-sqlite local KV
adapter, with pair, provider source, publication date and fetch timestamp.
Cached values are displayed with an explicit Cached label if online
verification fails. An absent cache shows unavailable; invalid cache
payloads are rejected. Empty Sub selection makes zero FX requests,
while no background polling or timers are introduced. No financial
transaction/ledger writes or external user data are included. Provider
licensing/privacy approval and on-device tests remain required.

## iOS card-only swipe vs native swipe-back arbitration — 2026-11-21

Card gestures and iOS native Back must have different touch ownership.
The Sub Currency route enables the native Back swipe by default (including
when Delete is revealed). While a user touches inside a currency card,
only that route temporarily disables the native Back gesture; on touch
release, cancellation or responder termination it restores navigation.
Thus right swipe on a card closes the opened Delete action, while right
swipe anywhere outside the currency card keeps the normal iOS Back behavior.
The top-left Back button is always available, the screen's outside-tap
dismissal is preserved, and the native gesture is not disabled for any
other screen. Changes are scoped to gesture arbitration, not the stored
currency or actual Delete handler. Real-device iPhone test remains required,
especially for fast gestures beginning at the extreme left edge.


## Shared Settings top bar and Account Groups catalogue — RFC #79 (2026-11-22)

The **Settings** root content replaces the visible More heading with a centered
50dp `AppTopBar` (the bottom destination remains `More`), with the OS top
safe-area painted using `theme.colors.card`. The same reusable
`src/shared/ui/app-top-bar.tsx` is consumed by the nested **Account Groups**
catalogue, including its accessible Back icon. The header aliases existing
`navigationTokens.topBarHeight`, `iconRoleSizes.topBar`, theme border,
card and text roles, and symmetric side slots; no custom per-screen dimensions.
Existing Main/Sub Currency headers already share the 50dp/card/safe-area
visual contract, but their distinct action-heavy implementations are left
unchanged in this limited slice; future header changes should migrate to the
shared component after their current screen-specific regression tests.

**Settings hierarchy:** Account Settings → Account Groups; Appearance →
Theme; Currency → Main/Sub Currency. The Theme label and bottom-sheet title
change only visible copy: System/Light/Dark state, local preference keys,
storage and the shared modal shell are unchanged. The catalogue displays
seven **informational** built-in labels including **Insurance**, without
financial-class treatment, active account-creation controls, database writes,
or invisible placeholders. Insurance data/claims/premiums require a separate
approved product/ledger design before implementation.

New feature routes compose presentation and controller callbacks, never
router/database calls from screens. Owner-side Android/iPhone safe-area,
dark/light, back navigation, text scaling and Codespaces preview are separate
device acceptance evidence. No preview workflow/permissions were changed.

## Account Groups compact header refinement — RFC #79 / Draft PR #80

Account Groups uses the shared `AppTopBar` with two accessible actions on its
right: **Eye** (show/hide built-in descriptions) followed by **Add**. Both use
shared 24dp top-bar icon roles and 48dp touch targets, with symmetric left/right
header slots preserving the centered 50dp title. Default rows show names only;
Eye toggles optional caption descriptions. The introductory "Built-in templates"
paragraph is removed entirely. A maximum of five locally persisted *display-only*
custom names is implemented in a controller, not in presentational screens or
finance schema; this is not approval of new ledger account classes. User-picked
Google `home_storage` weight-200 artwork appears ONLY on the main Settings
Account Groups entry, not beside list rows. See Google icon asset provenance.

## Shared Account Group bottom-sheet field and actions — RFC #79

The **Add Account Group** flow composes the existing `AppBottomSheet` shell,
existing reusable `ActionButton` for Cancel/Save, and shared
`src/shared/ui/app-text-field.tsx` for its input. The `AppTextField` owns
standard padding, minimum 48dp touch size, typography, border, colors,
placeholder role and invalid border through the existing theme; screens provide
only values and intents. Caller domain validation owns the max 40-character
limit and duplicate handling. No `TextInput`-specific visual constants or
local modal/button code are allowed in this screen.

## Shared ActionButton visual height — 2026-11-22 (owner RFC #79 refinement)

Every app action rendered by the canonical `src/shared/ui/action-button.tsx`
uses a **42dp painted surface** (`buttonTokens.actionHeight = size.dp42`).
The interactive `Pressable` keeps **at least 48dp accessible touch height**
(`buttonTokens.minimumHeight = size.dp48`), center-aligning the 42dp surface
inside it. The visual surface may expand for text scaling; normal buttons
are 42dp tall. Both are single-owner theme primitives, not local numbers.
Existing primary/secondary/ghost, compact, disabled, loading and callbacks
are unchanged. This is NOT a global shrink of top-bar icon touch targets,
text fields, bottom sheet headers, navigation or the disabled FAB.
Real-device touch and text scaling checks remain pending on PR #80.

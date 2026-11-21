# Google Material Symbols Outlined — Tio Money Phase 0

The five bottom-tab icons are genuine **Google Material Symbols Outlined** SVG
files from [Google's Material Design Icons repository](https://github.com/google/material-design-icons),
with **weight 200 for unselected tabs** (`wght200`) and **weight 300
for the selected tab** (`<name>_wght300_24px.svg`), all at 24px optical size. The owner's
2026-11-21 decision supersedes the previous maximum-200 rule for **selected bottom-tab
icons only**. Appearance mode icons remain weight 200. User-supplied Google Fonts links
identify icon names, not additional size or weight approvals. Display size stays 24dp.

| Bottom tab | Official icon ID | Unselected source (200) | Selected source (300) |
| --- | --- | --- | --- |
| Home | `home` | `home_wght200_24px.svg` | `home_wght300_24px.svg` |
| Trans. | `book_2` | `book_2_wght200_24px.svg` | `book_2_wght300_24px.svg` |
| Stats. | `bar_chart_4_bars` | `bar_chart_4_bars_wght200_24px.svg` | `bar_chart_4_bars_wght300_24px.svg` |
| Account | `account_balance` | `account_balance_wght200_24px.svg` | `account_balance_wght300_24px.svg` |
| More | `more_horiz` | `more_horiz_wght200_24px.svg` | `more_horiz_wght300_24px.svg` |

All bottom-tab sources are under `symbols/web/<icon-id>/materialsymbolsoutlined/`
in [Google's repository](https://github.com/google/material-design-icons). The independent
disabled Add FAB remains the official `symbols/web/add/materialsymbolsoutlined/add_24px.svg`
(default weight 400).

Unselected files: `home.svg`, `transactions.svg`, `statistics.svg`, `accounts.svg`,
`more.svg` (all original 200-weight XML, unchanged). Selected equivalents:
`home-selected.svg`, `transactions-selected.svg`, `statistics-selected.svg`,
`accounts-selected.svg`, `more-selected.svg` (exact 300-weight XML).
`add.svg` still supplies the independent disabled FAB. All are byte-for-byte
copies of their upstream SVGs; `root-tab-icon-svg.json` contains the identical
XML for runtime selection. No PNG copies or icon font were added.

**Implementation:** `root-tab-icon-svg.json` holds exact copies of the five
200-weight and five 300-weight tab SVG XML strings, verified against source files.
`src/shared/ui/root-tab-icon.tsx` imports this static asset without a Metro SVG
transformer. `RootTabBar` passes its existing active state to `RootTabIcon`, which uses
`navigationTokens.selectedIconWeight` (300) or `.unselectedIconWeight` (200) to
choose the authentic SVG and uses `SvgXml` from `react-native-svg@15.16.0`.
Only the root fill is injected from the active or inactive light/dark color role. `src/shared/ui/floating-add-button.tsx`
independently renders the exact `add.svg` source using `brandText` color inside
the existing disabled, accessible Pressable. Icon dimensions stay 24dp; the FAB
circle is 50dp, the tab content and base bar are 48dp and 50dp respectively
(excluding OS bottom safe area), and icon-to-label spacing is 1dp.
No SVG Metro transformer or font icon dependency is needed. Tab accessible names
and selected states belong to the parent tabs.

**License:** Official SVGs are distributed under Apache License 2.0; the
complete original license is preserved in [LICENSE.txt](./LICENSE.txt).
No Font Awesome/proprietary artwork is included.

**Scope:** The separate disabled floating `+` now uses the original Google Material
Symbols Outlined default **weight 400** `add_24px.svg` (unchanged and independent
of the bottom tabs' selected 300 / unselected 200 rule); its Pressable remains **disabled**
and does not open routes or execute any finance action. Icon artwork and
navigation sizing changes do not address the Android Expo Go
`Cannot find native module 'ExpoSQLite'` startup crash, which is an
independent native-runtime problem.

## Appearance selection icons (owner reference, 2026-11-21)

These three additional settings icons are official **Material Symbols Outlined 200-weight** SVGs copied byte-for-byte from Google's upstream repository. They render at the existing 24dp `iconRoleSizes.bottomSheet` size, tinted with the current theme; the radio selection remains a separate right-aligned semantic control. Exact XML is bundled in `src/features/settings/appearance-option-svg.json`, verified against these original SVG files and rendered by `appearance-option-icon.tsx` with the existing `SvgXml` renderer. No new fonts or packages.

| Option | Google icon | Source SVG |
| --- | --- | --- |
| System Mode | `routine` | `symbols/web/routine/materialsymbolsoutlined/routine_wght200_24px.svg` |
| Dark Mode | `dark_mode` | `symbols/web/dark_mode/materialsymbolsoutlined/dark_mode_wght200_24px.svg` |
| Light Mode | `light_mode` | `symbols/web/light_mode/materialsymbolsoutlined/light_mode_wght200_24px.svg` |

The existing Apache 2.0 license applies. Owner-provided Google Fonts links identify the selected icon names; `200` is the approved source weight even if those links display default 400.

## Owner-selected weight refinement (2026-11-21)

Selected bottom navigation icons were refined from the originally proposed **400**
to **300**, keeping unselected icons at **200**. The updated five selected SVGs
and the static JSON artwork bundle contain exact Google Material Symbols Outlined
`*_wght300_24px.svg` artwork; originals at 200 are unchanged. The independent
Add FAB keeps its separate default weight **400** and is not affected.

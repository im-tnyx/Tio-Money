# Google Material Symbols Outlined — Tio Money Phase 0

The five bottom-tab icons are genuine **Google Material Symbols Outlined** SVG
files from [Google's Material Design Icons repository](https://github.com/google/material-design-icons),
with source **weight 200** (`wght200`) and the 24px optical-size asset. This
honors the owner's **maximum weight 200**. User-supplied Google Fonts links were
used to identify **icon names**; their screenshot/URL preview controls (e.g.
weight 100, icon.size 22) are *not* independent global styling approvals.
The existing app display size remains the shared 24dp theme token.

| Bottom tab | Official icon ID | Upstream source SVG |
| --- | --- | --- |
| Home | `home` | `symbols/web/home/materialsymbolsoutlined/home_wght200_24px.svg` |
| Trans. | `book_2` | `symbols/web/book_2/materialsymbolsoutlined/book_2_wght200_24px.svg` |
| Stats. | `bar_chart_4_bars` | `symbols/web/bar_chart_4_bars/materialsymbolsoutlined/bar_chart_4_bars_wght200_24px.svg` |
| Account | `account_balance` | `symbols/web/account_balance/materialsymbolsoutlined/account_balance_wght200_24px.svg` |
| More | `more_horiz` | `symbols/web/more_horiz/materialsymbolsoutlined/more_horiz_wght200_24px.svg` |
| Floating disabled Add | `add` (default weight 400) | `symbols/web/add/materialsymbolsoutlined/add_24px.svg` |

Local files: `home.svg`, `transactions.svg`, `statistics.svg`,
`accounts.svg`, `more.svg`, and `add.svg` for the independent disabled
floating FAB. Each is an exact byte-for-byte copy of the matching upstream
file. There are no previously used raster PNG copies.

**Implementation:** `src/shared/ui/root-tab-icon.tsx` contains exactly the
same five tab SVG XML strings as the source files and renders them with `SvgXml`
from `react-native-svg@15.16.0`. Only the root fill is injected from the active
or inactive light/dark color role. `src/shared/ui/floating-add-button.tsx`
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
Symbols Outlined default **weight 400** `add_24px.svg` (a FAB-only exception
from the five bottom tabs' maximum 200); its Pressable remains **disabled**
and does not open routes or execute any finance action. Icon artwork and
navigation sizing changes do not address the Android Expo Go
`Cannot find native module 'ExpoSQLite'` startup crash, which is an
independent native-runtime problem.

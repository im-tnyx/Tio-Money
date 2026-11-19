# Google Material Icons Outlined — Tio Money Phase 0

This directory contains **the original 24px SVG source files**, preserved
byte-for-byte from the [official Google Material Design Icons repository](https://github.com/google/material-design-icons).
The icons are distributed under the [Apache License 2.0](./LICENSE.txt).
No Font Awesome or paid assets are used.

| Tio Money tab | Original icon | Upstream path |
| --- | --- | --- |
| Home | `home` | `src/action/home/materialiconsoutlined/24px.svg` |
| Trans. | `receipt` | `src/action/receipt/materialiconsoutlined/24px.svg` |
| Stats. | `analytics` | `src/action/analytics/materialiconsoutlined/24px.svg` |
| Account | `account_balance_wallet` | `src/action/account_balance_wallet/materialiconsoutlined/24px.svg` |
| More | `more_horiz` | `src/navigation/more_horiz/materialiconsoutlined/24px.svg` |

Local filenames are `home.svg`, `transactions.svg`, `statistics.svg`,
`accounts.svg` and `more.svg`. The PNG copies used in a previous Phase 0
iteration have been deleted.

**React Native integration:** `src/shared/ui/root-tab-icon.tsx` embeds each
unchanged SVG XML source as a literal consumed by `SvgXml` from
`react-native-svg@15.16.0`. The root `fill` is supplied by the active/inactive
palette and icon width/height are controlled by the shared 24dp theme token.
The test suite compares these literal XML sources to the files so future icon
updates cannot drift. This avoids installing `react-native-svg-transformer`,
changing Metro configuration or relying on a font library. The parent tab
owns its accessible name and selected state; the decorative SVG is hidden
from accessibility.

**License:** Google LLC and contributors, Apache License 2.0. The complete
upstream license is redistributed in [LICENSE.txt](./LICENSE.txt).
Original repository: https://github.com/google/material-design-icons.

The floating disabled `+` stays drawn from existing React Native Views and
is not part of this asset pack. SVG substitution is **not** a remedy for the
separate Android Expo Go `ExpoSQLite` native-module runtime error.

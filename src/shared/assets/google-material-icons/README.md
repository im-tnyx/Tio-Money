# Google Material Icons Outlined — Tio Money Phase 0

The five bottom-tab icons are actual artwork from the official
[Google Material Design Icons repository](https://github.com/google/material-design-icons),
distributed under the [Apache License 2.0](./LICENSE.txt). The original files
are **24dp Material Icons Outlined**, with the provided 1x and 2x PNG variants.
They are not Font Awesome and do not require a font package or native module.

| Tio Money tab | Google icon | Upstream category / path |
| --- | --- | --- |
| Home | `home` | `png/action/home/materialiconsoutlined/24dp` |
| Trans. | `receipt` | `png/action/receipt/materialiconsoutlined/24dp` |
| Stats. | `analytics` | `png/action/analytics/materialiconsoutlined/24dp` |
| Account | `account_balance_wallet` | `png/action/account_balance_wallet/materialiconsoutlined/24dp` |
| More | `more_horiz` | `png/navigation/more_horiz/materialiconsoutlined/24dp` |

Each upstream folder contains `1x` and `2x` PNG assets; the
`outline_*_black_24dp.png` source is copied **byte-for-byte** into this
directory as `<tab>.png` and `<tab>@2x.png`. The default black source pixels
are tinted using React Native `Image.tintColor` so both active/inactive states
work in automatic light/dark themes. Tab accessibility labels are owned by the
parent `Pressable`; these decorative images are hidden from accessibility.

**License:** Copyright Google LLC and contributors, Apache License 2.0.
See [LICENSE.txt](./LICENSE.txt) for the complete redistributed license.
Source: https://github.com/google/material-design-icons.

The disabled floating Add '+' is an original UI element drawn with existing
React Native Views and remains deliberately unchanged.

**Scope:** This is an icon-only asset substitution. It does not fix or bypass
the Android Expo Go `ExpoSQLite` missing-native-module crash; that needs a
compatible Expo runtime or a properly built development client.

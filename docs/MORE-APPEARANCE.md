# More → General Settings → Appearance

**Status:** Draft UI implementation candidate, not merged. **RFC:** [#17](https://github.com/im-tnyx/Tio-Money/issues/17).

## Product flow

1. Open the **More** bottom tab. **General Settings** is plain unboxed section text. A single full-available-width card below it shows **Appearance** with a right-side chevron. Tap this row to open a flat-top native bottom sheet with a **left-aligned Appearance title**, an **X dismiss icon** on the right, a **divider directly below the title** and the existing **System / Light / Dark** radio choices. The extra visible description under Appearance is removed; individual option descriptions remain accessible as hints. Tap **X**, the backdrop, or Android Back to dismiss the sheet. No separate Settings route.
2. **System** is the default; existing app palettes follow the Android/iOS device's effective light/dark mode, including later device changes.
3. **Light** and **Dark** immediately re-theme all app tabs and the status-bar foreground, regardless of the device mode.
4. On restart, the selected choice is loaded locally before the UI is rendered. Missing/unrecognized values fall back to **System**. A storage read failure falls back to System with safe error feedback; a failed write keeps the last persisted selection and tells the user to retry.
5. The screen never requires internet, sign-in, backup, database migrations, SMS permissions or a Supabase account.

## Architecture and boundaries

- `src/app/(tabs)/more.tsx`: composition-only Expo Router route.
- `src/features/settings/more-route.tsx`: wires ViewModel to Screen and its modal child.
- `src/features/settings/use-more-view-model.ts` + `more-contract.ts`: typed `MoreUiState` and `MoreAction`; no storage in UI.
- `src/features/settings/more-screen.tsx`: theme-token-only, stateless General Settings heading and full-width Appearance card/chevron.
- `src/features/settings/appearance-sheet.tsx`: stateless accessible React Native Modal bottom sheet with System/Light/Dark circular radios, a header divider, row dividers, backdrop dismissal and an accessible X close icon; flat (square) top corners.
- `src/shared/theme/appearance-preference.ts`: pure parsing/scheme-resolution and injected store port.
- `src/data/preferences/appearance-preference-store.ts`: `expo-sqlite/kv-store` local adapter, separate from financial ledger `tio-money.db`.
- `src/shared/theme/theme-provider.tsx`: one global stored selection plus live OS appearance subscription; persistence attempted before updating state.
- `src/app/_layout.tsx`: dependency injection and matching `StatusBar` foreground.
- Bottom sheet visibility and open/dismiss actions belong to the ViewModel, never to the screen. Selecting an option still uses the existing global preference writer; while the sheet stays open the selected radio updates immediately, and errors remain visible for retry.
- `src/shared/i18n/strings.ts`: English-only labels and error copy.

No new dependency, workflow, native configuration, account, financial data or active FAB behavior.

## Validation and acceptance

- `npm run check`: TypeScript, ESLint, Prettier, Phase 0 and preview tests.
- Android + iPhone Expo Go: try System in both device modes; force Light and Dark; navigate through the other four tabs; restart and confirm preference persists; verify accessible checked-state and readable contrast/status bar.
- Pre-merge preview: owner-created, open UI PR targeting `main`, label exactly `tio-preview` on **only** that PR. Privileged Codespaces workflow requires **separate owner authorization**, not this document or PR creation.
- No QR or published EAS Update is guaranteed by the workflow; test Expo Go **Development Servers** when Codespaces tunnel starts.
- No automatic merge. The owner must explicitly authorize merging the exact PR after review and CI.

**Rollback:** do not merge this draft; remove `tio-preview` and stop the dedicated Codespace after testing. No local financial database change to revert.

## 2026-11-21 — Owner screenshot: option icons and right radio control

The option order is not a user requirement; keep the existing stable `system / light / dark` keys and list order. The owner supplied a three-row reference screenshot. Each selectable row shows the official **Google Material Symbols Outlined 200-weight** `routine` (System Mode), `dark_mode` (Dark Mode) or `light_mode` (Light Mode) SVG at the shared 24dp `bottomSheet` icon token, left-aligned. Place the existing accessible circle/radio selection at the **far right**, with a semantic divider **between** rows. Keep descriptions as accessibility hints, not extra visible subtitle lines, to match the reference. Selected theme color is the shared semantic brand token; do not introduce a hardcoded coral color. Choice selection, persistence, dismissal, and English-only i18n remain unchanged. The sheet remains a dumb component and `useMoreViewModel` owns visibility.

**Icon packaging:** each upstream `.svg` is preserved byte-for-byte in shared assets; the matching static `src/features/settings/appearance-option-svg.json` map is bundled into the app and rendered via `react-native-svg` without a remote request, font, or new dependency. Tests verify equal XML.

## 2026-11-21 — Owner bottom-sheet header refinement

Center the Appearance title between equal-width leading spacer and trailing X-button touch target. Remove the visible help sentence directly below the title (preserve accessible hints on choices and the More entry row). Add a semantic-token divider immediately beneath the header. Remove the bottom sheet's rounded top corners; retain safe-area layout, screen-reader close label, backdrop/Android Back dismissal, stateless screen architecture, persistence, and radio behavior. Scope is presentation, regression tests and documentation only; no privileged Codespaces activation or PR merge authorized.

## 2026-11-21 — Owner device screenshot: compact left-aligned sheet

The owner observed wasted vertical space above the Appearance heading on iPhone and requested the title move left with minimum necessary top spacing. Remove the decorative drag handle and its top margin entirely; keep a single compact header with shared minimum 48dp touch-target height, Appearance aligned to the left within the regular horizontal inset, X aligned right, and an immediate bottom divider. Reduce vertical option-row padding from `lg` to `md` while retaining each row's minimum 48dp accessible radio target. Keep flat sheet corners, accessible X/backdrop/Back dismissal, live theme modes and persistence unchanged. Device QA must verify real small-screen and dynamic-type behavior; no preview activation or PR merge is authorized by this change.

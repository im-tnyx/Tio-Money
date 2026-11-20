# More → General Settings → Appearance

**Status:** Draft UI implementation candidate, not merged. **RFC:** [#17](https://github.com/im-tnyx/Tio-Money/issues/17).

## Product flow

1. Open the **More** bottom tab. **General Settings** is plain unboxed section text. A single full-available-width card below it shows **Appearance** with a right-side chevron. Tap this row to open a native bottom sheet with the existing **System / Light / Dark** radio choices, descriptions, and dividers. Tap **Close**, the backdrop, or Android Back to dismiss the sheet. No separate Settings route.
2. **System** is the default; existing app palettes follow the Android/iOS device's effective light/dark mode, including later device changes.
3. **Light** and **Dark** immediately re-theme all app tabs and the status-bar foreground, regardless of the device mode.
4. On restart, the selected choice is loaded locally before the UI is rendered. Missing/unrecognized values fall back to **System**. A storage read failure falls back to System with safe error feedback; a failed write keeps the last persisted selection and tells the user to retry.
5. The screen never requires internet, sign-in, backup, database migrations, SMS permissions or a Supabase account.

## Architecture and boundaries

- `src/app/(tabs)/more.tsx`: composition-only Expo Router route.
- `src/features/settings/more-route.tsx`: wires ViewModel to Screen and its modal child.
- `src/features/settings/use-more-view-model.ts` + `more-contract.ts`: typed `MoreUiState` and `MoreAction`; no storage in UI.
- `src/features/settings/more-screen.tsx`: theme-token-only, stateless General Settings heading and full-width Appearance card/chevron.
- `src/features/settings/appearance-sheet.tsx`: stateless accessible React Native Modal bottom sheet with System/Light/Dark circular radios, row dividers, backdrop dismissal and Close button.
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

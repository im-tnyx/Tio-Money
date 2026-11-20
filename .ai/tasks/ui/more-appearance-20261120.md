# TM-UI-APPEARANCE-20261120-001 — More appearance selector

| Field | Status |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| Source request | Owner chat, 2026-11-20: new UI PR, More → General Settings → System/Light/Dark |
| RFC | [#17](https://github.com/im-tnyx/Tio-Money/issues/17), technical `PROCEED` decision |
| State | `IN_PROGRESS` for proposed draft implementation, pending exact-head CI and device acceptance |
| Assigned agent | ChatGPT GPT-6, architect/implementation (not Git author or reviewer) |
| Branch | `feat/more-general-settings-appearance` based on `fd154db417b1979d39f855317f252eed37c36e9d` |
| Allowed scope | `src/app/(tabs)/more.tsx`, `src/app/_layout.tsx`, `src/features/settings/*`, appearance theme/data adapter, English strings, tests, docs, `.ai/*` |
| Exclusions | Other tab body behavior, finance ledger/schema, native config, dependencies, CI/workflows, secret values, EAS release |
| Review | `DEFERRED` until draft PR exact SHA; optional for UI, known blockers remain binding |
| Merge authorization | `NOT_GRANTED`; requires separate owner instruction for repository and PR number |
| Codespaces activation | `NOT_GRANTED`; separate owner approval and live verification required |

## Design and acceptance

- No mutable state in MoreScreen: typed state/action via MoreRoute and useMoreViewModel.
- One global preference source, offline persisted in existing Expo SQLite kv-store; no finance migration.
- System follows OS; Light/Dark overrides the palette and status bar; values persist across restart.
- Failed reads show safe System fallback, failed writes don't falsely select a new value.
- Test pure mode resolution, structural screen boundaries, native/UI checks in CI and owner device smoke.
- Remaining: confirm exact-head GitHub CI, optional review disposition, owner Codespaces preview validation and merge-specific approval.
- Neither this task nor RFC permits any workflow dispatch, preview Codespace mutation or PR merge.

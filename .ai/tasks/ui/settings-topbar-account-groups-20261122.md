# UI task — Shared Settings top bar and read-only Account Groups

- **Task:** TM-UI-SETTINGS-20261122-001
- **RFC/technical PROCEED:** https://github.com/im-tnyx/Tio-Money/issues/79 ; owner chat 2026-11-22, agent-transcribed; not GitHub owner merge approval
- **Agent:** ChatGPT GPT-6 (technical implementation/review); independent reviewer **DEFERRED** (optional by existing repo policy)
- **Base:** protected main `bb6638b56d2dea6d1e067806be009f500666e82c` (verified before branch); **branch:** `ui/settings-topbar-account-groups-20261122`
- **Scope:** shared token-based 50dp top bar, More screen Settings title, Account Settings → Account Groups read-only seven templates, Appearance → Theme visible UI wording, preserved Main/Sub Currency and persisted theme. All screen actions originate in controllers. Informational Insurance is not a finance ledger class.
- **Excluded:** no account create/edit/save, no Insurance policy/ledger/SQL schemas, no cloud/network, no new dependency, no privileged preview dispatch, no PR #65/#71/main modification, no merge.
- **Files:** `src/shared/ui/app-top-bar.tsx`, `src/features/settings/{more-screen,more-contract,use-more-view-model,appearance-sheet,account-group-templates,account-groups-screen,account-groups-route}.tsx` (contract/templates use .ts), `src/app/account-groups.tsx`, `src/shared/i18n/strings.ts`, `tests/phase0/{appearance-settings,settings-topbar-groups}.test.ts`, `src/shared/theme/README.md`, this task, `.ai/current.md`.
- **Acceptance:** owner may inspect Draft PR source and, **after manually selecting `tio-preview` and activating the existing protected worker**, review Expo Go UI through dedicated preview Codespace. Token/permission changes or trusted workflow run are not part of this task. Check required CI on exact SHA; Android and iPhone live UI/accessibility remain owner-device QA.
- **Rollback:** keep Draft PR unmerged; no changes to default branch.
- **Validation checkpoint:** exact HEAD CI **PENDING** until GitHub Actions results exist. No unrun local tests claimed.

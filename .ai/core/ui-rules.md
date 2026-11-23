# 🎨 UI rules — quick route

**Canonical:** Owner's latest Phase 0 [TM-DEC-005](../../docs/governance/DECISIONS.md#tm-dec-005--phase-0-empty-navigation-shell-and-disabled-fab) takes precedence over future-state [screen specification](../../docs/design/SCREEN-SPEC.md) and [user flows](../../docs/product/USER-FLOWS.md). [TM-DEC-001](../../docs/governance/DECISIONS.md#tm-dec-001--english-only-initial-app) keeps initial app copy English only.

- **Current Phase 0:** Native splash transitions **directly** to five blank, selectable bottom tabs: **Home · Trans. · Stats. · Account · More**. **No app top bar, feature content, onboarding, Settings, History or editor route**; no intermediate loading text/spinner on successful startup. The single visible `+` icon is **disabled**, right-aligned directly **above More**, with no press handler. Only an actual SQLite startup error may expose minimal safe recovery. Android/iPhone device behavior is not yet independently verified.
- **Future phase only:** A separately authorized implementation may enable **one** unified Income / Expense / Transfer editor via the FAB; never three independent Home shortcut cards. Colors and final iconography remain proposals, but the five-tab navigation and FAB location are already decided in [TM-DEC-004](../../docs/governance/DECISIONS.md#tm-dec-004--five-destinations-and-floating-add).
- Explain money movement clearly: transfer From/To, any fee charged and exact expense impact. Keep validation, success and rollback language truthful.
- All initial UI copy, error messages, screen-reader labels and accessibility hints are **English**; **no language selector** in the MVP. Hindi and other translations are future scope.
- Centralize semantic strings; stable data identifiers must not depend on translated copy. Money/date formatting is distinct from translation.
- Prefer platform **system fonts** until approved otherwise; test dynamic type, VoiceOver/TalkBack, tap targets, IME avoidance and safe areas.
- Original colors/layout; do not clone owner's reference screenshots. Theme candidates are not proven contrast-safe.
- Display only implemented import/security/backup affordances; no fake sync or SMS-connected state.

Screens receive typed state and emit user intents; they do not directly read SQLite or calculate ledger totals.

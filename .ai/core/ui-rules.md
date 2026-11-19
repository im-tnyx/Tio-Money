# 🎨 UI rules — quick route

**Canonical:** [Screen specification](../../docs/03-SCREEN-SPEC.md) · [User flows](../../docs/02-USER-FLOWS.md) · [TM-DEC-001](../../docs/DECISIONS.md#tm-dec-001--english-only-initial-app).

- The root shell contains **one** primary `+`; it opens a unified three-tab transaction editor. The final bottom-bar position is a **proposal**, not a frozen owner decision.
- Explain money movement clearly: transfer From/To, any fee charged and exact expense impact. Keep validation, success and rollback language truthful.
- All initial UI copy, error messages, screen-reader labels and accessibility hints are **English**; **no language selector** in the MVP. Hindi and other translations are future scope.
- Centralize semantic strings; stable data identifiers must not depend on translated copy. Money/date formatting is distinct from translation.
- Prefer platform **system fonts** until approved otherwise; test dynamic type, VoiceOver/TalkBack, tap targets, IME avoidance and safe areas.
- Original colors/layout; do not clone owner's reference screenshots. Theme candidates are not proven contrast-safe.
- Display only implemented import/security/backup affordances; no fake sync or SMS-connected state.

Screens receive typed state and emit user intents; they do not directly read SQLite or calculate ledger totals.

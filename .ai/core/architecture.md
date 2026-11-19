# 🏗 Architecture — quick route

**Canonical:** [Technical architecture](../../docs/05-TECH-ARCHITECTURE.md) · [Data model](../../docs/04-DATABASE-DESIGN.md) · [Feature boundaries](feature-boundaries.md).

- Intended stack: React Native, Expo Router, strict TypeScript, offline-first Expo SQLite.
- UI → feature application commands → pure shared financial domain → repository ports → SQLite adapters; view-model projections read canonical ledger postings.
- `src/app/` composes routes/providers; `src/features/<name>/` owns feature UI/application concerns; `src/domain/ledger/` owns canonical math; `src/data/sqlite/` owns durable persistence; `src/platform/` wraps OS boundaries; `src/shared/` holds non-business primitives.
- Domain does not depend on React, Expo, SMS, native security or database libraries. No SQL in screens and no editable balance cache.
- Proposed transaction write coordinator serializes atomic events, reversals and fees; the actual SQLite isolation mechanism requires device tests.
- Phase 0 scaffold is in an **open parallel draft PR**, not `main` as of initial inspection. Its concrete paths take precedence over hypothetical new ones **after merge/reconciliation**, not before.
- Cloud Auth/Supabase, native SMS, encryption and backup are **not approved by this governance task**.

Read the full spec before drawing new interfaces or finalizing packages.

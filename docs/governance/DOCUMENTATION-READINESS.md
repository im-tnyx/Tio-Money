# 13 · Documentation Readiness & Unresolved Finance Gates

> **Status: documentation-only audit/reconciliation.** Source snapshot inspected on 2026-11-21: `main` commit `57e564af8f526f9de69eaaf61f2fbc0c72731188`. This is not acceptance of executable financial schema, mobile-device tests, provider selection, security controls or release readiness. See [RFC #50](https://github.com/im-tnyx/Tio-Money/issues/50) and [Owner Decisions](DECISIONS.md).

[Documentation Hub](../00-INDEX.md) · [PRD](../product/PRD.md) · [Finance ADR Register](STAGE-1-FINANCE-ADRS.md) · [Implementation & Test Plan](../engineering/IMPLEMENTATION-TEST-PLAN.md) · [Agent Rules](../../AGENTS.md)

## 1 · Actual code versus planned product

| Area | Verified source state | Future design authority |
|---|---|---|
| Phase 0 mobile UI | Five root tabs; Home/Trans./Stats./Account export blank finance screens. More → Appearance is implemented; floating Add remains disabled. | [Screen spec](../design/SCREEN-SPEC.md), [More Appearance](../design/MORE-APPEARANCE.md), [Decision TM-DEC-010](DECISIONS.md#tm-dec-010--bottom-navigation-ui-freeze) |
| Local persistence | SQLite startup and settings-only version 1 migration. No finance tables, transaction-save workflow, real ledger repository or balance projection shipped. | [Database design](../architecture/DATABASE-DESIGN.md), [Finance ADRs](STAGE-1-FINANCE-ADRS.md) |
| Account groups / expenses / cards / loans / investments | Six group forms and ledger invariants are documented; actual account/editor/reports flows are not yet implemented. | [Account groups](../product/ACCOUNT-GROUPS-SPEC.md), [User flows](../product/USER-FLOWS.md) |
| Currency | Future Main + optional Sub Currency and exchange-rate refresh-on-use are specified; current domain contract remains INR-only and the proposed SQL is **not approved** for mixed-currency posting. | [Currency specification](../product/CURRENCY-SPEC.md), [TM-ADR-018/023](STAGE-1-FINANCE-ADRS.md) |
| Backup/restore | No encrypted archive, cloud storage adapter or restore engine shipped. **Stage 2 only**, after local ledger acceptance. | [Backup & Sync](../product/BACKUP-SYNC-SPEC.md) |
| Identity/Supabase | No app signup, Supabase client or remote financial data sync shipped. **Stage 3 only**, after explicit opt-in, informed consent and reviewed identity/RLS model. | [TM-DEC-009](DECISIONS.md#tm-dec-009--conditional-identity-only-for-opt-in-supabase), [Backup & Sync](../product/BACKUP-SYNC-SPEC.md) |

**Source-of-truth invariant:** future ledger math must use one append-only balanced journal with currency-specific exact integer minor units. Reference-only bank-linked wallets create no duplicate asset. No unapproved FX clearing, card autopay execution, loan interest or investment gain policies are implied by UI examples.

## 2 · Decision and implementation gaps (not missing specification files)

| Gate / priority | What exists | What must be decided or evidenced before the **affected implementation/release** | Owner |
|---|---|---|---|
| **G1 · Stage 1 blocker** — executable ledger/schema | Conceptual double-entry postings and candidate INR-only SQL; accepted command idempotency invariant | Six-group typed schema, one canonical asset/liability mapping, safe on-device migration, persistent idempotency, rollback, foreign-key and reconciliation proof; prohibit using proposed old four-type DDL as approved migration | [Database](../architecture/DATABASE-DESIGN.md), [TM-ADR-011/019](STAGE-1-FINANCE-ADRS.md) |
| **G2 · Stage 1 blocker** — account form contract | Six built-in groups, Cash name/opening amount/currency/description; Bank payment capabilities; Card/Investment/Loan typed fields | Final field type/required-default/precision/date/linked-account/edit/archive matrix; reject unsupported group conversions; add deterministic field-validation fixtures. A bank payment capability is metadata, not a separate balance | [Account Groups](../product/ACCOUNT-GROUPS-SPEC.md), [Screen spec](../design/SCREEN-SPEC.md) |
| **G3 · Stage 1 blocker** — card settlement | Card purchase/repayment liability rules and tracking-only autopay are specified | Issuer statement date/amount vs calculated outstanding, minimum/partial/prepaid payment, holds, refunds, due-date rollovers, interest/fees and available-credit uncertainty. Never label tracking as actual debit | [TM-ADR-020](STAGE-1-FINANCE-ADRS.md) |
| **G4 · Stage 1 blocker** — loan schedules | Borrowed vs given, historic opening vs new disbursement, principal vs interest split | Amortization/day-count, rate change, accrued vs paid interest, rounding, missed/early payments; domain fixtures and owner financial-policy decision | [TM-ADR-021](STAGE-1-FINANCE-ADRS.md) |
| **G5 · Stage 1 blocker** — investment recognition | Cost-basis ledger asset and separately dated **unposted** market-value estimate | Disposal lot/basis, dividends, realized gains/losses, refunds, optional mark-to-market Net Worth reconciliation; no estimated valuation may silently alter canonical booked Net Worth | [TM-ADR-022](STAGE-1-FINANCE-ADRS.md) |
| **G6 · Stage 1 blocker for cross-currency operations** | Main/Sub display preference; exact native per-currency amounts and stale-rate labeling | Cross-currency journal clearing, fee/gain/rounding, compatible exchange-rate provider, licensing/privacy and deterministic zero/three-decimal fixtures. Unsupported mixed-currency posting remains rejected | [TM-ADR-018/023](STAGE-1-FINANCE-ADRS.md), [Currency](../product/CURRENCY-SPEC.md) |
| **G7 · Conditional Stage 1 blocker** — adjustments & imports | Core refund/reversal and import-candidate concepts | Effective-time/backdating policy; overdraw/fee limits and overdraft; import provenance; Save & Add Another retention/abandoned draft UX where applicable | [TM-ADR-012–017](STAGE-1-FINANCE-ADRS.md) |
| **G8 · Stage 2 future security gate** — encrypted backup | User-directed provider-file backup concept; no app login | Approved crypto+KDF/key recovery threat model, archive manifest/version, staged restore/collision policy, Android/iPhone provider feasibility, tampering/fault injection and verified independent recovery | [Backup & Sync](../product/BACKUP-SYNC-SPEC.md) |
| **G9 · Stage 3 future identity/security gate** — optional Supabase | Explicit local-only default, optional opt-in signup, tenant-RLS minimum | Auth/session/consent lifecycle, stable tenant ownership, RLS deny-by-default tests with two users, cross-device conflict/idempotency/tombstones, retention/deletion and secrets handling | [Backup & Sync](../product/BACKUP-SYNC-SPEC.md), [TM-DEC-009](DECISIONS.md#tm-dec-009--conditional-identity-only-for-opt-in-supabase) |
| **G10 · Release/evidence gate** — enforcement & devices | Finance test *catalogue* and presentation-only screen *contract* exist | Real implemented tests and physical Android/iPhone evidence at exact SHA; `TM-PRES-001–006` negative architecture fixtures and finance test IDs must not be misreported as passing before execution | [Test plan](../engineering/IMPLEMENTATION-TEST-PLAN.md), [Dumb Screen Contract](../architecture/DUMB-SCREEN-BOUNDARIES.md) |

These are **gates for future financial/cloud implementation**, not blockers to merging a factual, docs-only audit PR, provided it introduces no misleading approval. The register **does not choose** unsettled financial, provider, crypto or identity policy on behalf of the owner.

## 3 · Delivery sequence / permissions

1. **Stage 1:** complete local-first SQLite finances: account groups, manual Income/Expense/Transfer, cards/loans/investments, reports and approved currency behavior. No Tio Money signup; future unsupported FX operations are explicitly blocked.
2. **Stage 2:** independently designed, encrypted user-directed backup/restore via supported Google Drive/iCloud Drive/file-provider flows. Provider login may apply, but is not Tio Money app signup. No promise of automatic backup/sync.
3. **Stage 3:** optional Supabase sync; only an affirmative user choice triggers Tio Money signup/signin and informed finance-data upload consent. Local SQLite remains operable after logout/opt-out; tenant isolation and conflict handling must be tested.

**No financial credentials, PINs, OTPs, privileged Supabase/service-role keys or plaintext backup passphrases** belong in app bundles or logs. Local SQLite is **not claimed encrypted at rest**, and the absence of a backup is a real loss risk. External FX quotes must never transmit account balances, notes or transaction identifiers.

## 4 · Merge readiness checklist for this documentation-only slice

- [ ] Verify PR exact HEAD/base against live `main` and inspect changed Markdown paths only.
- [ ] Validate Markdown link destinations/anchors and avoid stale historical statements masquerading as current.
- [ ] Confirm no runtime, SQL, migrations, dependencies, workflow, permission or repository-setting changes.
- [ ] Verify Git commit messages contain no forbidden `Co-authored-by:` trailers.
- [ ] Check GitHub exact-HEAD CI, required status checks, review approvals/threads, branch protection/rulesets and outstanding blocking findings; mark API/permissions gaps **UNVERIFIED**, not PASS.
- [ ] Record independently performed review and device tests only if genuinely executed; no current finance or cloud functionality asserted.
- [ ] **Separate owner permission naming the exact repository + new PR and explicit merge action is mandatory.** A request to “go to merge gate” is not permission to bypass this gate.

[Back to Docs Hub](../00-INDEX.md) · [RFC #50](https://github.com/im-tnyx/Tio-Money/issues/50)

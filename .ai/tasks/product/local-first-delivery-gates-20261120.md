# TM-DOC-DELIVERY-20261120-003 — Phase C local delivery, backup/sync & navigation freeze

> Documentation-only technical task. Source is owner's 2026-11-20 "Go" after Phase C proposal plus explicit instruction **not to change the existing bottom tabs**. Agent-transcribed [RFC #20](https://github.com/im-tnyx/Tio-Money/issues/20). No implementation or merge authorization.

| Field | Verified value |
| :--- | :--- |
| Repo | `im-tnyx/Tio-Money` |
| Current agent/model | ChatGPT GPT-6 (current session) |
| Previous agent for new task | UNKNOWN_NOT_VERIFIED |
| RFC | [#20](https://github.com/im-tnyx/Tio-Money/issues/20) |
| Technical PROCEED | Agent decision to draft **only** this bounded documentation; owner explicitly directed start/keep tabs unchanged |
| Base/head at creation | Open Draft [PR B #16](https://github.com/im-tnyx/Tio-Money/pull/16) at `c5dfec3722a62b6ee0cd5cc30586f1e3a92f745b`; PR A [#14](https://github.com/im-tnyx/Tio-Money/pull/14) still open Draft |
| Main reference | `fd154db417b1979d39f855317f252eed37c36e9d` on 2026-11-20 |
| Working branch | `docs/local-first-delivery-backup-gates-20261120`, stacked **on PR B**, not main |
| Lifecycle | IN_PROGRESS → VALIDATING → draft review, not yet approved |
| Independent review | DEFERRED / NOT PERFORMED, strongly recommended for finance, encryption/auth/identity |
| Owner merge authorization | **NOT_GRANTED** for PR A/B/C; requires future action-specific, repo + PR-number permission |
| Rollback | Close unmerged Draft PR without touching existing PR branches/main; branch deletion separately authorized |

## Document scope

Allowed: `docs/06-IMPLEMENTATION-TEST-PLAN.md`, new `docs/09-BACKUP-SYNC-SPEC.md`, `docs/DECISIONS.md` (TM-DEC-010 only), `docs/00-INDEX.md` and task/index handoff. No code, assets, bottom-nav visuals/layout, migrations, CI, dependency installs, provider account setup, encryption key provisioning, real Supabase project/Auth/RLS or network operations.

## Protected UI and safety boundary

Owner says bottom navigation is already correct: preserve Home · Trans. · Stats. · Account · More, existing icon assets/weights/sizes and positioning, 50dp bar + OS inset, 1dp gap, 50dp FAB above More + 16dp clearance, system theme, disabled Phase 0 FAB. No new tab and no restyle. Future forms live within the existing tab shell and need separate scope.

Local financial events must remain balanced, versioned, atomic, idempotent. No bank credentials or card PIN/CVV/OTP. Stage 1 external FX requests can only send currency pair metadata; Stage 2 encrypted file backup; Stage 3 opt-in Supabase with conditional login and explicit upload consent. No remote financial data in Stage 1. “Autopay” is tracking, not bank debit.

## Acceptance before review

- Owner stage order and frozen nav constraints in 06, 09, DECISIONS and index.
- Test IDs for 6 groups, loan/card/investment, FX provider, migration/crash, security and conditional auth.
- Stage 2 backup integrity, wrong key, encryption/key lifecycle, restore version/rollback/duplication state.
- Stage 3 tenant/RLS, conflict/deletion, signout/consent and no forced signup.
- No implementation claims; old M0–M7 historic work breakdown not confused with complete local Stage 1 exit.
- GitHub exact diff limited to Markdown, links resolve, no forbidden co-author trailers, new-head actions/status recorded honestly.
- No owner-specific merge authorization given; all three Draft PRs stay unmerged unless separately authorized.

### 2026-11-20 · Initial task checkpoint

- **RFC:** Issue #20, technical PROCEED by ChatGPT GPT-6 after direct owner instruction.
- **Previous verified working agent:** UNKNOWN_NOT_VERIFIED for this new scoped task.
- **Stack base:** PR #16 HEAD `c5dfec3722a62b6ee0cd5cc30586f1e3a92f745b`; main `fd154db417b1979d39f855317f252eed37c36e9d`.
- **Attempt:** author documentation-only Phase C in isolated branch; final PR/status/checks to be added after creation.
- **Tests:** pending GitHub Markdown/diff/CI; no mobile SQL, device, encryption or Supabase testing performed.
- **Review:** DEFERRED / not performed. Known finance/crypto/sync ADR questions remain open.
- **Merge authority:** NOT_GRANTED; user Go is not permission to merge.

# TM-DOC-PRODUCT-20261120-001 — Owner product direction documentation alignment

> **Documentation-only, isolated branch.** This is a task checkpoint, not permission to merge or deploy.

| Field | Verified value |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| Source owner request | Connected-chat instructions through 2026-11-20: "Go start kare" for Tio Money docs, after detailed local/account/currency/backup/identity decisions |
| Durable discussion/RFC | [Issue #13](https://github.com/im-tnyx/Tio-Money/issues/13) |
| Technical proceed decision | **PROCEED — documentation slice only**, recorded by ChatGPT GPT-6 in Issue #13 on 2026-11-20; owner request transcribed separately |
| Current working agent | ChatGPT GPT-6 (self-identified session) |
| Prior agent for this new task | UNKNOWN_NOT_VERIFIED |
| Working branch | `docs/local-first-product-contract-20261120` |
| Starting base `main` | `fd154db417b1979d39f855317f252eed37c36e9d` |
| Starting base Git tree | `929fb77503124f53e68e46ef56a30626829b9769` |
| Lifecycle at draft | IN_PROGRESS, documentation validation and PR review pending |
| Independent review | DEFERRED — no independent reviewer claimed; finance/security review recommended before schema implementation |
| Owner merge authorization | **NOT_GRANTED**. No explicit named PR merge action. |
| Merge executor | None; separate owner authorization and current-HEAD/protection preflight required |
| Current PR | To be opened as draft from this branch; live GitHub is authoritative |

## Scope and boundaries

**Owned paths:** `docs/DECISIONS.md`, `docs/01-PRD.md`, `docs/00-INDEX.md`, new `docs/08-ACCOUNT-GROUPS-SPEC.md` and `docs/10-CURRENCY-SPEC.md`, this task record, compact `.ai/current.md` checkpoint after PR creation.

**Excluded:** `src/`, `tests/`, `app.json`, migrations, `04-DATABASE-DESIGN.md`, `05-TECH-ARCHITECTURE.md`, `06-IMPLEMENTATION-TEST-PLAN.md`, workflows, live secrets/keys, third-party provider account setup, payments, permissions, any real Supabase project, branch deletion, force-push, direct main write and merge.

**Financial/identity risks:** The existing INR-only ledger and only four account subtypes cannot silently support loans, investments or cross-currency journal. Detailed posting, FX and card due/autopay rules are explicitly **BLOCKED pending ADR**, not implemented by this task. Stage 1 sends only currency pairs to a prospective FX provider; user financial data stays local. Stage 2 backup and Stage 3 Supabase/Auth are future scoped work.

**Alternative rejected:** a single broad code/docs PR replacing current financial/Phase 0 design; instead keep a reviewable staged documentation-only PR.

## Planned acceptance/validation

- All links in new specs and owner decisions resolve to existing doc paths or the durable RFC.
- Existing Phase 0 five blank tabs + disabled FAB and initial English-only UI remain unchanged.
- New 006–009 decisions do not claim implementation, store permissions or real payment execution.
- PRD's previous four-account, INR-only and unspecific later-cloud direction are superseded explicitly **without** amending live SQL.
- Check new documents for testable account/FX acceptance IDs, security/privacy, and open ADR gates.
- Confirm GitHub diff is Markdown only, no prohibited commit trailers; record exact HEAD/CI status after PR creation.
- **No merge** without later PR-specific express authorization.

## Immutable session checkpoint — 2026-11-20 · ChatGPT GPT-6

- **Prior verified agent:** UNKNOWN_NOT_VERIFIED (new scoped task).
- **Discussion:** [Issue #13](https://github.com/im-tnyx/Tio-Money/issues/13) contains bounded architecture RFC and agent PROCEED to draft documents.
- **Base:** `main` `fd154db417b1979d39f855317f252eed37c36e9d`.
- **Attempted:** documentation-only stage A on new feature branch; initial baseline has no known open GitHub PRs at inspection.
- **Review:** DEFERRED, not performed; no reviewer approval claimed.
- **Tests/evidence:** pending exact new-HEAD validation; no mobile device test claimed.
- **Merge:** NOT_GRANTED; this documentation work does not authorize PR merge.
- **Next:** Review draft PR diff for consistency, complete gate checks, revise if necessary, then ask for separate PR-specific merge permission.

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
| Lifecycle at draft | **IN_REVIEW** — [Draft PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) open; no merge authorization |
| Independent review | DEFERRED — no independent reviewer claimed; finance/security review recommended before schema implementation |
| Owner merge authorization — VERIFIED POST-MERGE | **GRANTED for PR #14 only** in separate owner connected-chat instruction; GitHub verifies PR #14 MERGED. The original NOT_GRANTED state is preserved in earlier dated checkpoint prose. |
| Merge executor | None; separate owner authorization and current-HEAD/protection preflight required |
| Current PR — VERIFIED POST-MERGE (2026-11-21) | [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) **MERGED / CLOSED**; squash `582893d0915622623f8c6b3fb9da0f1bbb0a4a60`. The 'Lifecycle at draft' row is a historical snapshot, not current status. |

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
- **Tests/evidence:** GitHub compare at first commit: ahead 1 / behind 0; exactly 6 Markdown files. Checked relative Markdown links against branch tree: **0 missing targets**. Commit text has **0 forbidden co-author trailers**. **No on-device/SQL tests run**; final-head CI unverified at this checkpoint.
- **Merge:** NOT_GRANTED; this documentation work does not authorize PR merge.
- **Next:** Review draft PR diff for consistency, complete gate checks, revise if necessary, then ask for separate PR-specific merge permission.

### 2026-11-20 — Draft PR creation and handoff

- [Draft PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) opened against `main`, **not merged**. Head at creation: `7265f8a3a4d232a07426f932c1c7b42fc20673a8`.
- Initial changed paths: `docs/DECISIONS.md`, `docs/01-PRD.md`, `docs/00-INDEX.md`, `docs/08-ACCOUNT-GROUPS-SPEC.md`, `docs/10-CURRENCY-SPEC.md`, this task.
- This follow-up checkpoint adds `.ai/current.md` and updates task; the final HEAD must be rechecked.
- Independent review **DEFERRED** / not performed. Financial and identity architecture details blocked on future ADRs. No unproven CI/QA claims.
- **Owner PR #14 merge authorization: NOT_GRANTED.** Do not merge or enable auto-merge.

### 2026-11-20 — PR #14 merge-gate P2 remediation (scoped docs only)

- **Owner current request:** "Merge gate le jaye" for PR #14. Technical PROCEED: fix the known [P2 opening-contract review finding](https://github.com/im-tnyx/Tio-Money/pull/14#discussion_r4644772021) and re-run exact-HEAD documentation/CI checks; **not** authorization to merge.
- **Source of review:** a GitHub `COMMENTED` review submitted through PR author's `im-tnyx` account, **not independent approval**. Before edit, P2 thread `PRRT_kwDOVy5U3s66EVYx` was unresolved and current PR HEAD `659915ba8c9766082ccc945809b8879df3b5b6ce`.
- **Fix contract:** shared Opening Amount is conditional; funded Cash/Bank/Wallet opens via balanced opening equity, bank-linked wallet references do not create money/journals, Card opens liability, historical Investment cost asset/valuation is separate, historical Borrowed/Given Loans open liability/receivable; new purchases/disbursements are **separate financial events**. Zero positions produce metadata with no zero journal postings. Test IDs `TM-AG-011…016` protect net worth and idempotency.
- **Financial boundary:** historical as-of reconciliation, investment market-value accounting, loan interest, precise FX and SQL schema remain **BLOCKED pending later finance ADRs**; no runnable SQL or financial app implementation changed.
- **Paths permitted:** `docs/08-ACCOUNT-GROUPS-SPEC.md`, `docs/01-PRD.md`, this task file and compact `.ai/current.md` checkpoint only. Do not alter PR B #16 or PR C #22 branches; they must be re-synchronized after PR A advances.
- **Review disposition:** initial reviewer COMMENTED / non-independent. P2 to be objectively verified and answered on the review thread; do not claim formal APPROVED. **Owner merge authorization NOT_GRANTED**.
- **Pre-commit checks:** source patch invariants reviewed; final HEAD link/CI and mergeability to be rechecked after update.

### 2026-11-20 — Conditional merge authorization and Codex review remediation

- **Owner authorization source:** current connected ChatGPT instruction: "I authorize the agent to merge PR #14 of im-tnyx/Tio-Money into main, provided all current required GitHub checks, branch protections, applicable review requirements, and outstanding findings are verified and satisfied." This **is** PR-specific authorization with conditions, **not** permission for force-push, auto-merge, branch deletion or bypass.
- **Current stage before merge:** new [Codex automated review](https://github.com/im-tnyx/Tio-Money/pull/14) of `c6d9473d9fed0d83982e0cf4e93cb3e16626bfef` added **two unresolved P2** PRD findings about omitted bank-linked Wallet references; these must be corrected and threads dispositioned **before merging**.
- **Fix scope:** `docs/01-PRD.md` first-run and Accounts scope explicitly include bank-linked Wallet references as **non-financial metadata** with eligible Bank link, derived currency, no additional opening/ledger/asset; archive a reference cannot archive/delete/change Bank. No executable implementation.
- **GitHub branch introspection at inspection:** `GET /branches/main` reported `protected:false`, `protection.enabled:false`, required status checks empty, and `GET /pulls/14` `mergeable_state:clean`, requested reviewer list empty. Detailed branch-protection endpoint 403 (integration permission) and rulesets endpoint 403 (private repo plan limitation). Do not falsely claim those endpoints were inspected. Recheck at exact HEAD/base and stop if changed or additional constraints appear.
- **Review disposition:** prior agent-authored P2 resolved by documented fix; Codex `COMMENTED` is **automated review** not formal `APPROVED`. Independent human review not performed, optional by project governance absent required branch rules. New P2 findings require author-side evidence and explicit disposition; do not resolve blindly.
- **CI and merge:** all previous-head CI was successful but does not certify this new commit. Verify latest check runs, new review threads, PR scope and mergeability before any merge. Only execute GitHub merge if **every owner condition** is verified. Record actual merged SHA afterward, never infer from API invocation.

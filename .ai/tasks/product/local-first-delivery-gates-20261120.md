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
| Working branch | `docs/local-first-delivery-backup-gates-20261120`, originally stacked on PR B, **reconciled by non-force merge of current `main`**; PR #22 base retarget **to `main`** after exact-diff verification |
| Lifecycle | **RECONCILING / Draft** — [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) OPEN, not merged; next Ready for Review only after new-head CI and human-readable review |
| Independent review | Initial Draft review NOT PERFORMED; **new exact-head automated review to be requested**. Independent human `APPROVED` review **not verified**; strongly recommend crypto/identity assessment before implementation |
| Owner merge authorization | PR #14 and PR #16 **separately authorized and MERGED**; PR #22 **NOT AUTHORIZED** for merge, requires separate owner PR-specific permission |
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

### 2026-11-20 · Draft PR #22 handoff checkpoint

- **PR:** [Draft PR #22](https://github.com/im-tnyx/Tio-Money/pull/22), `docs/local-first-delivery-backup-gates-20261120` → `docs/local-first-finance-architecture-20261120` (Draft PR #16), **NOT** directly to `main`. At PR creation the HEAD was `b7756c3fd129bc3d24d00536d81e90c1703dd87a`.
- **Verified initial PR diff:** exactly six Markdown paths, 1 ahead/0 behind vs PR B, **140 relative links / 0 broken paths**, first commit message has no prohibited `Co-authored-by` trailer.
- **Changed docs:** implementation & test plan, future backup/sync spec, decision register TM-DEC-010, docs index, current index and this task. Bottom-nav source/design assets untouched.
- **CI:** no exact-head GitHub workflow outcome claimed by this checkpoint. It must be verified after the new documentation handoff commit.
- **Independent review:** `DEFERRED` (not performed). Finance, recovery/encryption, and identity ADRs remain future blockers. No mobile/device, database or cloud integration test executed.
- **Authority:** Owner merge authorization `NOT_GRANTED` for PR #14/#16/#22. The owner's `Go` authorizes drafting, **not merging**. Before any merge revalidate owner action-specific permission and GitHub checks, protection and scope.
- **Safe next action:** independently review stacked PR sequence, take action on documented ADR blockers before code, and review final-head CI before considering a separately authorized merge.

### 2026-11-20 — Safe reconciliation after approved PR #16 squash merge

- **Owner instruction:** "22 ko naye `main` ke saath safely reconcile karke CI aur review dobara karna hoga." This authorizes PR #22 docs-only branch integration, base retarget, current-head CI and review, **NOT PR #22 merge** or any `main` update.
- **Source of truth:** [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) is **MERGED** with GitHub-confirmed squash commit `6187b7a7e4c59949547c21655accf50dec8d0dfd`. [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) previously merged. Old PR #22 head `edf0aa8769dc93a8d6477ee60bd57e97d436d0f9` is stacked on PR B's historical pre-squash head `c5dfec3722a62b6ee0cd5cc30586f1e3a92f745b`; GitHub marked the old PR dirty after the squash.
- **Reconciliation method:** make **one two-parent, non-force merge commit**: first parent old PR #22 head, second parent verified new `main`. Use Git tree of new `main` verbatim, overlay **only** six PR #22-owned Markdown paths (docs index, delivery/test plan, TM-DEC-010 decision register, new future backup/sync spec, this task, and current handoff). This **preserves byte-for-byte** all other merged PR #14/#16 corrected finance docs, including canonical posted Net Worth, non-ledger bank-linked Wallet and exact-money ADR blocks. Never force-push, delete branch or modify UI/source/workflows.
- **Task and current-index conflict:** preserve the complete latest `main` handoff text and prepend a dated PR #22 checkpoint; old PR C drafts and old PR A/B open-state statements remain historical provenance, **not current status**. New current status in this task corrects prior records without falsifying authorizations.
- **Owner bottom-nav freeze:** TM-DEC-010 strictly preserves five destinations Home · Trans. · Stats. · Account · More, existing icon shapes/sizes, nav baseline 50dp + inset, 1dp gap, 50dp Add with 16dp spacing above More; current disabled FAB remains disabled. No pixel/layout/code changes authorized.
- **Review & CI plan:** after verifying resulting six-file diff against `main`, retarget existing Draft PR #22 base to `main`, audit internal Markdown anchors and Stage 1/2/3 boundaries, trigger exact-head pull_request synchronize checks, mark Ready for Review, request fresh Codex review, disposition substantive findings and verify latest SHA/checks. This is **documentation verification**, not on-device crypto/financial QA.
- **Post-merge documentation sync:** PR #16 merge handoff was recorded in its GitHub conversation; this task must not claim a local checkout or archive synchronization was executed. PR #22 requires separate post-merge coordination **if and when** it is explicitly authorized and actually merged.
- **Merge authorization:** **NOT_GRANTED for PR #22**. Do not merge, auto-merge or alter branch protections.

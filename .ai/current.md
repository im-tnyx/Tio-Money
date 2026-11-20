# 🧭 Current task index

## 2026-11-21 — PR #18 immutable compare API shape correction

- **Task:** [TM-OPS-PREVIEW-COMPARE-HEAD-20261121-001](tasks/preview/preview-compare-head-shape-20261121.md), [RFC #29](https://github.com/im-tnyx/Tio-Money/issues/29), branch `fix/preview-compare-head-commit-shape`. Source failure: [manual run #44806734241](https://github.com/im-tnyx/Tio-Money/actions/runs/44806734241) and [#44806945990](https://github.com/im-tnyx/Tio-Money/actions/runs/44806945990); PR-read/label gate passed, but snapshot validator assumed nonexistent `compare.head_commit`, despite GitHub Compare API returning `commits[]` and 17 files.
- **Starting `main`:** `cff662ebd00f5333c348a45c2bc7c196961ae4dd`. Narrow correction validates the **last returned commit SHA** plus a positive, fully returned `total_commits`; preserves exact base SHA, captured/current immutable PR head, file count, path safety and privileged worker gates. No change to PR #18, `tio-preview`, tokens, workflow permissions, owner SSH/Codespace, Android UI or finance docs.
- **Checkpoint:** prior to final fix PR SHA and exact-head CI. Independent review `DEFERRED` per optional TM-DEC-002, recommended for security-sensitive validator. No owner merge authorization for this fix PR; **no actual Codespace Preview success or manual privileged workflow run**. Validate live GitHub state before a future merge.

---

## 2026-11-21 — Codespaces preview labeled PR Issues API HTTP 403 (RFC #27)

- **Task:** [TM-OPS-CODESPACES-ISSUES-READ-20261121-001](tasks/preview/codespaces-preview-issues-read-20261121.md), [RFC #27](https://github.com/im-tnyx/Tio-Money/issues/27), branch `fix/codespaces-preview-issues-read`. [Manual run #44805243638](https://github.com/im-tnyx/Tio-Money/actions/runs/44805243638) received `INPUT_PR=18`, then HTTP 403 after PR metadata fetch at labeled `GET /issues`. GitHub documents `Issues: read` for that API; current trusted worker only granted Contents/Pull requests read. This is a narrow root-cause hypothesis backed by endpoint permissions, **not a verified successful Codespace run**.
- **Observed starting `main`:** `0c295316940fc73e0c8e8bce127aaedede5d3d49`. Proposed change grants only `issues: read`, retains PR uniqueness and all existing owner/main/immutable-sha, Codespace identity and source-path security gates. No `issues: write`, no PAT, no `pull_request_target`, no app source or PR #18 change.
- **Checkpoint:** recorded before new final PR SHA and CI results. Exact-head CI, review, and GitHub ruleset gates must be checked live. Independent review `DEFERRED`, optional under TM-DEC-002. **Owner merge authorization NOT_GRANTED.** No manual privileged workflow run authorized by this task; `main` and PR #18 stay untouched by branch work.

---

## 2026-11-21 — Codespaces manual preview input `18.0` regression (PR #26)

- **Task:** [TM-DEV-PREVIEW-INPUT-20261121-001](tasks/preview/codespaces-preview-input-20261121.md) · [RFC #25](https://github.com/im-tnyx/Tio-Money/issues/25) · [PR #26](https://github.com/im-tnyx/Tio-Money/pull/26) · branch `fix/codespaces-preview-dispatch-pr-string`. **Scope: PR dispatch parser only**, intended to fix [failed manual preview run #44798703853](https://github.com/im-tnyx/Tio-Money/actions/runs/44798703853), which received `INPUT_PR: 18.0` from the workflow's `type: number` input and rejected it before HTTP diagnostic.
- **Observed source before change:** `main` `097e014d7e2a2015230971751bd5c72ee91e6580` (PR #21 squash merged), `pr_number` workflow input `type: number`, strict `^[1-9][0-9]* shell guard. Proposed correction changes input metadata to `type: string` and adds regression tests, without relaxing validation or changing credentials/security gates.
- **Observed pre-index-update:** initial fix commit `e8483afdf17baf3c1ea2b574fd6bbf1e4b522338`; PR #26 **OPEN / DRAFT / NOT MERGED** when inspected. This index-only correction advances HEAD; new exact-head CI and review must be verified, not inferred from prior runs. Independent review disposition **DEFERRED** (optional under TM-DEC-002). No owner authorization to merge any new PR or run a privileged Codespace workflow; neither `main` nor PR #18 modified. The original GitHub PR-read 403, SSH and Expo tunnel remain unverified. Check GitHub for live branch/PR status rather than interpreting this as the current state.

---

## 2026-11-21 — PR #21 trusted Codespaces diagnostic, P3 index handoff

- **Task:** [TM-OPS-PR403-20261120-001](tasks/preview/preview-pr-read-403-20261120.md), [RFC #19](https://github.com/im-tnyx/Tio-Money/issues/19), [PR #21](https://github.com/im-tnyx/Tio-Money/pull/21) on `fix/preview-pr-read-403-diagnostics` → `main`. **OPEN / READY FOR REVIEW / NOT MERGED** when inspected; diagnostic-only, not an HTTP 403 repair.
- **Verified predecessor snapshot:** PR head `cd3b9b82133d3c19c9ac8b60590fd26c0a06061d` against `main` `f4332eb338ca75e27a5b35ff57511f522a4bb96a`, 0 behind, four prior changed paths. At that **previous head**, [Phase 0 CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44793001234) and [AI governance CI](https://github.com/im-tnyx/Tio-Money/actions/runs/44793001467) were **SUCCESS**. **This P3 index correction creates a newer head: recheck exact-head CI rather than reusing those results.**
- **Review:** [Review #5997655461](https://github.com/im-tnyx/Tio-Money/pull/21#pullrequestreview-5997655461) is `COMMENTED`, not GitHub `APPROVED`; its [P3 index-registration finding](https://github.com/im-tnyx/Tio-Money/pull/21#discussion_r4646297484) is addressed by this checkpoint, pending new-head verification and thread disposition. Original P2 token-in-argv concern was addressed in the previous head via piped stdin `curl --config -`. Independent review is **optional under TM-DEC-002**, not a blanket gate. No independent approval is claimed.
- **Boundary:** Existing owner/main/label/immutable source gates and Codespace identity protections remain. Root GitHub PR-read HTTP 403 is **UNKNOWN**, and no successful live privileged diagnostic/SSH/device test has occurred. **Owner PR #21 merge permission NOT_GRANTED**; `main` was not modified by this branch update. Treat these SHA/status statements as an observed checkpoint and consult GitHub for the current state.

---

## 2026-11-20 — PR #22 ready-for-review checkpoint (reconciled on main)

- [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) **OPEN / Ready for Review / not merged**, targeting `main` at `6187b7a7e4c59949547c21655accf50dec8d0dfd`, reconciled HEAD `4e741cf716bcb6020d6e1128a28fc995fd00eb37` before this checkpoint. Original history preserved by non-force two-parent commit; GitHub diff exactly six Markdown files, 0 behind.
- At this verified commit, PR C's changed docs passed **143 local file links + 58 section-anchor occurrences**, zero missing. Live HTTP of 99 external links, on-device SQLite, encryption, Drive/iCloud and Supabase integration were **not tested**.
- Existing bottom tabs/floating Add geometry **frozen** (TM-DEC-010); implementation-plan legacy "FAB placement requires signoff" wording corrected, **without any UI code changes**. Current Add remains disabled.
- **This handoff commit advances SHA to trigger pull_request synchronize CI:** recheck exact-head checks and Codex review and any new findings. **No owner merge authorization for PR #22.**

---


## 2026-11-20 — PR #22 documentation reconciliation on merged main

- **Owner instruction:** safely reconcile [PR #22](https://github.com/im-tnyx/Tio-Money/pull/22), rerun CI and review; **no merge permission for #22**. PR #14 and [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) have already merged under their respective explicit owner authorizations.
- **Current `main` SHA:** `6187b7a7e4c59949547c21655accf50dec8d0dfd` (verified PR #16 squash merge). PR #22 historical head before non-force merge: `edf0aa8769dc93a8d6477ee60bd57e97d436d0f9`.
- **Technical decision / scope:** non-force two-parent PR #22 branch merge preserving all merged `main` files except PR C's six Markdown-owned paths: `docs/00-INDEX.md`, `docs/06-IMPLEMENTATION-TEST-PLAN.md`, `docs/DECISIONS.md` (TM-DEC-010 bottom-tab freeze only), new `docs/09-BACKUP-SYNC-SPEC.md`, [Phase C task](tasks/product/local-first-delivery-gates-20261120.md) and this index. Retarget to `main` and run exact-head CI/review after verification.
- **Protected UI:** existing five bottom tabs, 50dp nav baseline + OS inset, icons/weight/spacing and More-aligned disabled FAB unchanged; no source, SQL, cloud or provider changes.
- **Review/merge gate:** financial, investment, encryption/backup and Supabase tenancy ADRs **not implemented**. No independent review or device tests claimed. **Owner PR #22 merge authorization NOT_GRANTED**.

---


## 2026-11-20 — PR #16 final merge-gate P3 cleanup

- **Owner requested merge-gate verification, not merge:** [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) was OPEN / Ready for Review (non-draft), targeting `main` `582893d0915622623f8c6b3fb9da0f1bbb0a4a60` at HEAD `b81f4813a43af9de408eeddf1a850752ce64b7ca`. Owner's GitHub review is `COMMENTED`, **not `APPROVED`**.
- **Two subsequent P3 findings:** Screen 03 still said Phase 0 shell not yet merged, and [task](tasks/product/local-first-technical-design-20261120.md) still said `RECONCILING` / Draft. Corrected with approved historical PR #1 merge and actual PR #16 lifecycle. No code, bottom-tabs or cloud change.
- **This branch edit requires new HEAD validation:** verify all PR CI and Codex status, resolve addressed P3 threads with documented evidence, preserve six Markdown scope and unchanged `main`; **PR #16 merge NOT AUTHORIZED**. PR #22 remains separate Draft requiring reconciliation.

---


## 2026-11-20 — PR #16 Codex P1 investment valuation review

- Codex automated review of `0b80af9a6d959e682ec0ece3dc1ff45c59223957` reported **P1**: non-posting market valuation cannot silently change **canonical journal-derived Net Worth**. [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) remains Ready for Review, **not merged**.
- Bounded docs correction in `docs/04-DATABASE-DESIGN.md` and `docs/05-TECH-ARCHITECTURE.md`: distinguish immutable posted Net Worth from a **separately labelled unposted portfolio valuation estimate**, ADR-gated balanced revaluation, tests `TM-DB-VAL-001` / `TM-ARCH-010`. No new tables/code/cloud/UI/nav.
- The commit created by this checkpoint requires new exact-head CI and P1 thread response/disposition. **Owner merge authorization NOT_GRANTED** for PR #16; dependent PR #22 remains untouched.

---


## 2026-11-20 — PR #16 follow-up review consistency correction

- Before this checkpoint: [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) was **OPEN / Ready for Review / main-based**, SHA `53886aed3e28c9402cfb8f9402e536c8f8f638af`, all three CI checks green. **Codex re-review requested**, but not yet finalized at observation.
- Manual review found legacy **SCREEN 06** had funded-only Wallet and universal opening form wording inconsistent with the merged PR #14 Bank-linked Wallet reference; `docs/03-SCREEN-SPEC.md` corrected these conditions. Historical PR #1 merge-state blurbs in Screen/Architecture were also corrected, with device QA still unverified. **No app code, bottom navigation or PR #22 files touched.**
- This task checkpoint commit advances the branch HEAD; **do not reuse old CI/Codex results**. Re-check exact-new-head actions, review threads and link integrity. PR #16 **merge authorization NOT_GRANTED**.

---


## 2026-11-20 — PR #16 reconciliation after PR #14 squash merge

**Verified follow-up:** [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) was retargeted to `main`, remains **OPEN / Ready for Review / NOT MERGED**. Reconciled merge commit `ec537534ee617b72e481aa14f3f810852bb5fa2a` (two parents: old PR B HEAD + new main). GitHub compare: 0 behind, six Markdown files only; source `main` unchanged. At that exact SHA, **314 internal Markdown file links and 85 section anchors** passed, 0 missing, no added whitespace or prohibited co-author trailers; **173 external URL occurrences were not HTTP-verified**. This checkpoint advances the branch HEAD to trigger `pull_request:synchronize` CI, so all CI/reviewer results must be rechecked on the new commit. PR #22 remains Draft and requires separate reconciliation; no branch edits or merge authorization for #22.


- **Owner requested:** safely reconcile [PR #16](https://github.com/im-tnyx/Tio-Money/pull/16) onto new `main`, rerun CI and review. This is **not** permission to merge PR #16.
- **Verified PR #14:** squash-merged to `main` at `582893d0915622623f8c6b3fb9da0f1bbb0a4a60`. Existing PR #16 branch HEAD before reconciliation: `c5dfec3722a62b6ee0cd5cc30586f1e3a92f745b`.
- **Integration:** non-force two-parent branch merge into PR #16 with `main` as second parent, main tree authoritative except PR B's **six owned Markdown paths**. Reconcile only Bank-linked Wallet non-ledger reference, Investment/Loan historical opening wording in docs 02–05; preserve original `main` index and PR #14 P2 fixes. **No application, SQL, theme, bottom-navigation or cloud changes.**
- **Documentation task:** [TM-DOC-ARCH-20261120-002](tasks/product/local-first-technical-design-20261120.md) tracks code exclusions, exact method, source and future ADR gates. [Draft PR #22](https://github.com/im-tnyx/Tio-Money/pull/22) is a dependent separate branch, **not edited**.
- **Gate:** PR #16 retarget to `main`, exact-head CI and review required; no independent approval assumed. **Owner merge authorization NOT_GRANTED** for PR #16 and PR #22.

---


## 2026-11-20 — PR #14 conditional merge authority / new Codex findings

- **Owner authorized** merge of `im-tnyx/Tio-Money` **PR #14** into `main`, **only if all current checks, protections, applicable reviews and outstanding findings are verified satisfied**. No authority for auto-merge, force-push, deletion or PR #16/#22.
- Latest reviewed `c6d9473d9fed0d83982e0cf4e93cb3e16626bfef` had three green GitHub check runs and `main` branch API showed `protected:false`, but **Codex added two unresolved P2** findings to `docs/01-PRD.md` after earlier preflight. Correct in original PR branch; verify exact new HEAD and review/comment status again.
- **Remediation:** add Bank-linked Wallet reference to first-run (after Bank exists) and Accounts add/edit/archive flows, without additional financial account/balance/postings. [Task](tasks/product/local-first-product-contract-20261120.md) records source and limitations. Current branch remains PR #14; dependent stacked PR #16/#22 require later reconciliation.
- **Pending at this checkpoint:** final CI, PR review findings, protections preflight and actual GitHub merge result. No merge is claimed here.

---


## 2026-11-20 — PR #14 opening-account P2 merge-gate remediation

- **Owner request:** bring [PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) to merge gate (fix/review/CI; **not merge authorization**). Technical PROCEED remains bounded to finance-product documentation in [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13) and the [task](tasks/product/local-first-product-contract-20261120.md).
- **Before remediation:** PR A HEAD `659915ba8c9766082ccc945809b8879df3b5b6ce`; one unresolved non-independent [P2 review thread](https://github.com/im-tnyx/Tio-Money/pull/14#discussion_r4644772021): generic opening amount conflicts with bank-linked Wallet/no-asset and Investment/Loan opening semantics.
- **Proposed resolution:** group-conditional opening rules, explicit non-posting bank reference, single balanced opening equity for funded/card/loan/investment historical positions, zero-value no-op, six additional test IDs. Preserve all unapproved multi-currency/valuation/migration ADR blockers.
- **Branch constraints:** work only on PR #14 documentation branch; staged PR [#16](https://github.com/im-tnyx/Tio-Money/pull/16) and [#22](https://github.com/im-tnyx/Tio-Money/pull/22) depend on PR A and require later safe reconciliation. No merging of any PR, no `main` change, no device/code/SQL changes.
- **Gate record:** independently reviewed/CI and resolved status must be re-verified at exact updated HEAD; protection rules API not reliably readable; owner PR-specific merge authorization **NOT_GRANTED**.

---


## 2026-11-20 — Product contract PR #14 (newest read-only handoff)

| Task | Owner instruction / RFC | Work branch / PR | Status and gate |
| :--- | :--- | :--- | :--- |
| [`TM-DOC-PRODUCT-20261120-001`](tasks/product/local-first-product-contract-20261120.md) | Owner requested documentation start after local-first, account-group, Main/Sub Currency, backup-last and Supabase-opt-in decisions. [RFC #13](https://github.com/im-tnyx/Tio-Money/issues/13) records technical **PROCEED for docs only**, transcribed by ChatGPT GPT-6. | `docs/local-first-product-contract-20261120` → [Draft PR #14](https://github.com/im-tnyx/Tio-Money/pull/14) based on `main` `fd154db417b1979d39f855317f252eed37c36e9d` | **IN_REVIEW / unmerged**. 6 Markdown files initial commit `7265f8a3a4d232a07426f932c1c7b42fc20673a8`: 0 missing local document links; no forbidden co-author trailer. **Independent review DEFERRED** (not performed). CI for final new HEAD must be checked. **Owner PR-specific merge permission NOT_GRANTED**. |

**Live GitHub status verified 2026-11-20:** Governance [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) **MERGED** with commit `5dbdbe047a542463f0de66b9c0c6e09ef7d2605a`; Phase 0 [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) **MERGED** with commit `e647f78ce200fed1323d80ea794396c371fba7bf`. Older entries in this index saying those PRs are open are **historical dated checkpoints**, not current status. Do not rewrite them or claim iPhone/SQLite QA was completed.

---

## 2026-11-20 — PR #7: latest-main reconciliation checkpoint (owner-requested)

**Live preflight:** [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) remains OPEN / Ready for review, not merged. The approved reconciliation target is `main` at `5a72a112378fa14b168a02e9b18b41360ef79ed4`, including merged [PR #5](https://github.com/im-tnyx/Tio-Money/pull/5); prior PR #7 HEAD was `094b8b9225d9e5fa319af7bf6406bb047e067ee6`, 30 commits behind / 19 ahead. Owner requested merge-readiness and main synchronization in this chat; **owner authorization to merge PR #7 into main remains NOT_GRANTED**.

**Branch-only integration:** Construct a non-force, two-parent merge of current `main` into the PR #7 documentation branch. Preserve its 14 governance Markdown paths and all other source, Expo, EAS, SQLite, permissions, workflow, package and app files exactly from `main`. Only overlapping file `.ai/current.md` is integrated by retaining both the PR #7 current governance checkpoint and `main`'s later PR #5 EAS preview checkpoint. Earlier status statements below remain historical and are not assertions of current PR state. PR #7's two owner P3 review threads were resolved on previous HEAD; no GitHub formal `APPROVED` review is inferred. Independent additional review **DEFERRED** per optional-by-default policy.

**Gate:** exact-post-merge-HEAD CI, provenance/commit attribution, path scope and actual GitHub protections require new verification. Do **not** merge or auto-merge PR #7, invoke EAS publication, or alter PR #10 without separate authorization.

---

## 2026-11-20 — Governance PR #7 current review and main synchronization

**Live PR state at this checkpoint:** [PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) is **OPEN / READY FOR REVIEW** (`draft:false`), **NOT MERGED**. Its task `TM-GOV-CLEANUP-20261119-001` remains **IN_REVIEW**; owner merge authorization **NOT_GRANTED**. [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) and [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) are both merged; [PR #4](https://github.com/im-tnyx/Tio-Money/pull/4) subsequently merged Codespaces Stage A into `main` at `fdae8b4d23117a5be202ec04663ba22f3b21d1a5`. Earlier `DRAFT`/pre-merge statements below are *historical* checkpoints, not current statuses.

**Two owner P3 review findings:** [stale Draft handoff](https://github.com/im-tnyx/Tio-Money/pull/7#discussion_r4639327629) and [stale CI checkpoint](https://github.com/im-tnyx/Tio-Money/pull/7#discussion_r4639327644). This update records current `draft:false` and correctly attributes the previous checks to exact *pre-synchronization* HEAD `be0dd012a27c135b7cff2fce82062e5b5cf4a9a8`: [Phase 0 static #44686452585](https://github.com/im-tnyx/Tio-Money/actions/runs/44686452585) **SUCCESS**, [AI governance #44686452594](https://github.com/im-tnyx/Tio-Money/actions/runs/44686452594) **SUCCESS** (29/29 governance tests, Markdown links, 18 commit-message checks). These **are not results for any later HEAD**. Recheck current GitHub CI after each new commit; a reviewer's `COMMENTED` review is not `APPROVED` and the P3 threads must be independently verified/resolved, not silently dismissed.

**Integration boundary:** PR #7 preserves the new Codespaces preview files, Expo/source/config, and workflows from merged `main` unchanged. Only governance Markdown files differ in this PR. Independent new-head review is **DEFERRED** by optional review policy; no approval is claimed. No `main` write, merge of PR #7, force-push, auto-merge, or change to permissions/ledger is authorized.

---

## 2026-11-20 — Merge-gate staging: Android owner UI PASS, no merge authority

**Latest verified source before this docs-only gate checkpoint:** PR #1 `feat/phase-0-expo-foundation` → `main`, HEAD `ed0be0850b34d6f42140107aa5d7adb30eb77e47`, main `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`. [Phase 0 CI #44602177612](https://github.com/im-tnyx/Tio-Money/actions/runs/44602177612) **SUCCESS** and [governance CI #44602177693](https://github.com/im-tnyx/Tio-Money/actions/runs/44602177693) **SUCCESS** on exactly that HEAD. The original Copilot Node-engine finding was checked against `package.json`, `package-lock.json`, locked Expo/RN engines and README, then replied to with [evidence](https://github.com/im-tnyx/Tio-Money/pull/1#discussion_r4634398174) and **administratively RESOLVED** on GitHub (one resolved review thread, zero known outstanding). This is `FIX_VERIFIED` from a source/CI self-audit, **not** independent approval; existing formal review is still `COMMENTED`. Latest-head independent review **DEFERRED** under optional-by-default policy; recommend for SQLite/native bootstrap.

**Android owner report:** Owner explicitly says current UI was checked on a real Android device and looks correct. Mark **`OWNER_REPORTED_ANDROID_UI_SMOKE_PASS`** (2026-11-20), refining the previous unspecified-device smoke report. Prior `ExpoSQLite` error is no longer being seen per owner; do not mark it active. This is not a complete Android QA matrix and does **not** prove DB `PRAGMA` settings, migration persistence, cold restart, accessibility, system light/dark, or iPhone execution. Android model, OS/Expo Go version, exact device-tested SHA and evidence logs/screenshots were not provided.

**Merge-gate decision: STAGED / HOLD — NOT AUTHORIZED TO MERGE.** Live PR reported `mergeable:true`, 237 ahead / 0 behind at inspected pre-doc SHA; full protection/rulesets endpoints returned 403 (not certifiable). The current Phase 0 UI is **five blank tabs and a disabled FAB** per TM-DEC-005; root `AGENTS.md` Section 7's active Add-editor language applies to the future finance feature, not this Phase 0 UI (scoped clarification; no AGENTS edit). Outstanding: full iPhone device QA, any remaining Android theme/accessibility/safe-area and actual SQLite FK/`user_version`/restart proof, verification of GitHub-required branch gates, exact-final-HEAD CI and a **fresh explicit owner instruction authorizing merge of `im-tnyx/Tio-Money` PR #1**. No merge, auto-merge, main write, PR #7 edit, force push, history rewrite or branch deletion; review after material new changes.

---

## 2026-11-20 pre-merge handoff — latest verified implementation source (not a merge)

| Task | PR/branch | Latest verified source | Acceptance / next action |
|---|---|---|---|
| **TM-P0-ALIGN-20261119-001** | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) · `feat/phase-0-expo-foundation` → `main` | Before this docs-only checkpoint, HEAD `c90d1c00462de5e4a5b007a87dade6641a106f40`. [App CI #44600432345](https://github.com/im-tnyx/Tio-Money/actions/runs/44600432345) PASS; [Governance CI #44600432365](https://github.com/im-tnyx/Tio-Money/actions/runs/44600432365) PASS. Five blank tabs + disabled Google FAB; 24dp icon, 50dp nav baseline/FAB, 1dp label gap, 16dp FAB clearance. **OPEN / NOT MERGED.** | **Owner-reported device UI/no-`ExpoSQLite`-error smoke PASS** (platform/version not specified). Full two-platform, a11y, SQLite PRAGMA/migration/restart **NOT_VERIFIED**. One Copilot Node thread outdated/unresolved, fix evidenced. Independent latest-head review **DEFERRED**. Owner **merge permission for current scope NOT_GRANTED**; fresh explicit authorization required, followed by current HEAD/protections checks. [Task evidence](tasks/phase0/phase0-alignment-20261119.md). |
| **TM-GOV-20261118-001** | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) | **MERGED** into `main` at `04e6aa8d657627516b8ce7de91bd8304fdcbcf90` (2026-11-19); prior 6/6 threads resolved | Preserve verified governance history, no inherited PR #1 merge authority. |
| **TM-GOV-CLEANUP-20261119-001** | [Draft PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) | **DRAFT / UNMERGED**, independent governance docs cleanup | PR #7 also edits `.ai/current.md` and `docs/DECISIONS.md`; reconcile conflicts manually if ever integrated; do not edit PR #7 from Phase 0. |

Current working documentation agent ChatGPT GPT-6; prior verified Phase 0 assistant ChatGPT GPT-6 per conversation. Never infer agent identity, owner approval or physical QA from Git author. Source-sha results above are historical as soon as a doc-only commit advances the branch; rerun CI for the new HEAD. **Previous handoffs below are archived historical snapshots**, not latest merge authority.

---

## Historical verified handoff (2026-11-19) — superseded by the 2026-11-20 snapshot above

| Task | PR / branch | Verified status | Last tested source and next safe action |
|---|---|---|---|
| **TM-P0-ALIGN-20261119-001** | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) · `feat/phase-0-expo-foundation` | **READY FOR REVIEW / OPEN / NOT MERGED**. Five blank selectable tabs + disabled floating `+` over More; shared theme/icon-size tokens and automatic OS light/dark; screens presentation-only. **Owner merge authorization NOT_GRANTED.** | Before this docs-only update, source HEAD `aaa09ad88fdcb9efa032f0f9b3c5e83f72785738`; [app CI #44562328304](https://github.com/im-tnyx/Tio-Money/actions/runs/44562328304) passed 24/24 tests and Android/iOS bundles; [governance CI #44562328037](https://github.com/im-tnyx/Tio-Money/actions/runs/44562328037) passed 29/29 tests. Recheck final docs HEAD. Physical QA of latest tokenized Android/iPhone, system light/dark and real-device SQLite **NOT_VERIFIED**; [Phase 0 task](tasks/phase0/phase0-alignment-20261119.md) and [doc-alignment RFC](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7015156188). |
| **TM-GOV-20261118-001** | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) · `chore/ai-context-governance` | **COMPLETED / MERGED**, not archived. Actual `main` merge SHA `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`, merged 2026-11-19 06:16:11 UTC; **6/6** review threads resolved when inspected. | Earlier no-permission/open-thread records below were correct only at their own timestamps. PR #2 had **separate owner authorization**; that authorization is **not transferable** to PR #1. [Governance task history](tasks/governance/ai-context-setup.md) remains unchanged. |
| **TM-GOV-CLEANUP-20261119-001** | [Draft PR #7](https://github.com/im-tnyx/Tio-Money/pull/7) · `docs/governance-post-merge-reconciliation-20261119` | **DRAFT / NOT MERGED**; separate documentation reconciliation. **Owner merge authorization NOT_GRANTED.** | PR #7 also edits `docs/DECISIONS.md` and `.ai/current.md`. Do not edit/merge PR #7 from Phase 0 work; eventual integration must reconcile its governance checkpoint with PR #1's later Ready-for-Review state without overwriting history. |

**Provenance and review:** Current documentation authoring agent ChatGPT GPT-6, verified from current session; prior Phase 0 working agent ChatGPT GPT-6 from recorded task, never inferred from Git author. Independent new-head review `DEFERRED` (optional policy); the original Node engine review thread on PR #1 remains **outdated but unresolved** in GitHub and requires a valid disposition. Live refs and actual configured GitHub checks/review protections always override this timestamped document. **No current PR #1 or PR #7 merge permission.**

## Archived pre-merge index snapshot (historical; not current status)

> **Historical task-index reconciliation snapshot (before PR #1 was marked Ready for Review).** Governance PR #2 was already merged at main `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`; the older PR #1 Draft and PR #2 open/Not Granted rows below are retained only as earlier checkpoint statements, **not present-day PR status**. Latest verified table above and live GitHub refs take precedence.

> **Historical governance snapshot 2026-11-19T05:34:43.459Z UTC (before its checkpoint commit).** Compare live GitHub branches/PRs/checks before any write or merge. This multi-task index is not proof of current owner authorization. All earlier V2/CI checkpoints remain preserved in the task history.

| Task | Task file | Working branch | PR at snapshot | Verified owner / current agent | Status | Last verified checkpoint | Next safe action |
|---|---|---|---|---|---|---|---|
| `TM-P0-ALIGN-20261119-001` | [Phase 0 task/checkpoint](tasks/phase0/phase0-alignment-20261119.md) · [RFC/PROCEED](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7006286494) | `feat/phase-0-expo-foundation` | [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) — **DRAFT / NOT MERGED** | Current ChatGPT GPT-6; prior verified Phase 0 ChatGPT GPT-6 project assistant | **VALIDATING** — five empty tabs only, disabled floating FAB above More, no other app screens; device QA NOT_VERIFIED; **owner merge authorization NOT_GRANTED** | 2026-11-19; main integration `5d464a66f425dd93bfddcfdfe89fdfa5d330d5a5`; current tested HEAD and CI in PR | Verify new-HEAD app/governance checks, Android/iPhone Expo Go and SQLite startup, review thread disposition; keep draft |
| `TM-GOV-20261118-001` | [Governance task](tasks/governance/ai-context-setup.md) · [latest owner policy checkpoint](tasks/governance/ai-context-setup.md#owner-review-and-agent-merge-policy--2026-11-19) | `chore/ai-context-governance` | [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) — open, unmerged | Current ChatGPT (GPT-6); previous verified ChatGPT (GPT-6), 2026-11-18 checkpoint | **IN_REVIEW** — 6 historical/current reviewer threads unresolved; 1 latest inline-link P2 fixed pending independent verification; **owner merge permission NOT GRANTED** | `2026-11-19T05:34:43.459Z` UTC; pre-checkpoint HEAD `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7` | [29 tests + Markdown and no-coauthor CI PASS](https://github.com/im-tnyx/Tio-Money/actions/runs/44465777121); optional independent re-review recommended, address any remaining blockers and seek **separate PR-specific owner authorization** before any merge |

## Parallel work discovered (not this task's ownership)

| Repository work | Live state at inspection | Authorship / agent evidence | Forbidden action |
|---|---|---|---|
| [Phase 0 Expo PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) on `feat/phase-0-expo-foundation` | **Open draft**, not merged; observed head `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` | Working agent/model `UNKNOWN_NOT_VERIFIED`; PR author is not proof of model; some CI claimed in PR body but not independently rerun here | Do not edit its branch, change app code, merge or rewrite history |

**Latest owner policies:** [TM-DEC-002](../docs/DECISIONS.md#tm-dec-002--independent-review-optional-by-default) — independent review **optional by default** (strongly recommended for financial, migration, security, privacy, auth and sensitive-platform changes); record `PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED`, preserve known blockers and actual required GitHub reviews/checks. [TM-DEC-003](../docs/DECISIONS.md#tm-dec-003--owner-authorized-agent-merge) — **agent merge permitted only after distinct owner authorization** explicitly naming repository, PR number, permission to merge and conditions, plus live-head/required-protection/blocker/scope verification. This connected-chat decision was [transcribed in PR #2](https://github.com/im-tnyx/Tio-Money/pull/2#issuecomment-7000574123) by an agent, **not** an authenticated owner-authored merge approval. **PR #2 merge permission NOT GRANTED.** Strict no-`Co-authored-by:` policy, mandatory RFC/proceed and English-only MVP remain.

**Latest validation at pre-checkpoint HEAD `cb9fa85ead7e0c0a509cd90b87d51f2d3950d9f7`:** [Actual GitHub Actions run #44465777121](https://github.com/im-tnyx/Tio-Money/actions/runs/44465777121) **SUCCESS**: Python `py_compile`, **29/29 governance unittest cases**, supported Markdown `check-links` on PR checkout, **20 actual commit messages/zero prohibited co-author trailers**. Earlier [run #44465201294](https://github.com/im-tnyx/Tio-Money/actions/runs/44465201294) also passed 29 tests on helper fix `e238b7d`. New helper fixture covers inline non-Markdown relocation safety and optional review state gates. Independent review not claimed; 6 open threads remain and configured protected-branch requirements were not independently verified. This handoff commit advances HEAD; recheck its new CI run.

**Coordination:** Only the governance task above is assigned to this session. Treat Phase 0 as a separate, concurrently changing PR; its test and device-validation status must be checked from the PR/checks, never inferred from the index.

**Before the next write:** fetch live `main`, both branch HEADs, both PR states and changed paths. If these conflict with this snapshot, update the task evidence rather than silently assuming continuity.

[Agent contract](../AGENTS.md) · [Task protocol](tasks/README.md) · [Decisions](../docs/DECISIONS.md)

## New preview task — additive checkpoint (2026-11-19)

| Task | Agent / ownership | Status | Next action |
|---|---|---|---|
| [`TM-DEV-PREVIEW-20261119-001`](tasks/preview/codespaces-expo-go-20261119.md) | ChatGPT GPT-6; new isolated `chore/codespaces-expo-go-stage-a` stacked over Phase 0; previous preview-task agent `UNKNOWN_NOT_VERIFIED` | [RFC Issue #3: agent Stage A PROCEED, Stage B BLOCKED](https://github.com/im-tnyx/Tio-Money/issues/3); stacked draft, device QA **NOT_VERIFIED**, merge **NOT_GRANTED** | Validate actual CI and physical Expo Go Android/iPhone; no privileged worker or merge without owner authority |

Older governance/Phase 0 rows above are historical snapshots, not overwritten by this separate preview-task addition. Verify live GitHub state.

**Preview validation follow-up, 2026-11-19:** [Task checkpoint](tasks/preview/codespaces-expo-go-20261119.md#2026-11-19-validation-checkpoint--current-working-chatgpt-gpt-6) · [stacked draft PR #4](https://github.com/im-tnyx/Tio-Money/pull/4) · [source CI SUCCESS on `b317ec8d`](https://github.com/im-tnyx/Tio-Money/actions/runs/44480886934) (16 Phase 0 + 8 preview tests and platform exports). Actual Codespace/tunnel, owner-authenticated EAS UUID and both physical phones **NOT_VERIFIED**. Stage B blocked; owner PR merge permission not granted. Historical earlier rows remain unchanged.

**Process fix + new source CI evidence (2026-11-19):** Preview [task checkpoint](tasks/preview/codespaces-expo-go-20261119.md#2026-11-19-owner-identity-and-managed-process-final-source-checkpoint); [source test run #44482368855](https://github.com/im-tnyx/Tio-Money/actions/runs/44482368855) **SUCCESS** at `fe2003707c53ab5ef615ce547971cc27ebfde209` (16 app + 8 preview tests, Node/Expo checks and both bundles). New checkpoint commit requires fresh head CI. No live Expo device/Codespace/EAS UUID verification, no merge authorization or Stage B activation.


## EAS preview-only task — separate stacked draft (2026-11-19)

| Task | Owner / agent | Branch / expected PR | Scope & next gate |
|---|---|---|---|
| [TM-EAS-PREVIEW-20261119-001](tasks/preview/eas-preview-updates-20261119.md) | ChatGPT GPT-6; previous EAS task agent UNKNOWN_NOT_VERIFIED; [scoped technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7004990185) | `feat/eas-preview-updates-foundation` **stacked on Stage A PR #4**, no merges | SDK 58 EAS preview configuration + manual owner-gated publish workflow *source only*. No EAS build/update/token or trusted worker activated. Independently review, test exact head, obtain separate owner approval before publishing or merging. |

## 2026-11-20 — PR #5 second external P2 re-review / security fix checkpoint

- **Task:** [EAS preview provenance and current P2 disposition](tasks/preview/eas-preview-updates-20261119.md#2026-11-20--second-independent-security-re-review-and-three-p2-repairs), PR [#5](https://github.com/im-tnyx/Tio-Money/pull/5), agent ChatGPT GPT-6; previous verified original preview agent GPT-6. Owner-supplied external reviewer assessed old head `8ca5346e`, found 3 P2; intended `REQUEST_CHANGES` but **no GitHub review posted**.
- **Source remediation:** original `eas-cli@latest` fixed; newly source-fixed rerun actor/attempt, pinned checkout/setup-node SHAs, and true **committed** isolated CLI lock (`eas-cli 27.4.1`, TypeScript peer 5.9.3, 528 lock entries/527 npm sha512 integrities). Real non-secret GitHub CI generated and `npm ci`+signature-validated the corrected lock. PR #5 publishing workflow remains manual-only, owner/main gated, JS/assets-only, Expo-token-only-at-publish; no EAS publish, native build or secrets were used.
- **Validation:** [source smoke run #44699552306](https://github.com/im-tnyx/Tio-Money/actions/runs/44699552306) was running at prior HEAD `a4f706602f0476d304cbcffaf93c3dbe67cca93e`; do not assume final outcome. The index update itself creates a fresh HEAD requiring actual current-head checks. Independent **re-review pending**, current GitHub-required merge gates and exact head must be rechecked. **Owner PR #5 merge authorization NOT_GRANTED**. PR #10 remains separately stacked/unmerged; do not alter it or its base under PR #5 work.

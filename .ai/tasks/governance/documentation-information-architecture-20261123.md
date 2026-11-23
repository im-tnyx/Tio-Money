# TM-DOC-IA-20261123-001 — Documentation information architecture and product-first README

> Markdown/docs-only scoped work. **No owner PR merge authorization.** Preserve historical facts, finance/security contracts and traceability.

## Task identity, decision and lifecycle

| Field | Verified value |
|---|---|
| Task ID | TM-DOC-IA-20261123-001 |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle state | `IN_REVIEW` (Gate 3 audit verified; GitHub Ready for Review transition pending) |
| RFC / discussion | [Issue #89](https://github.com/im-tnyx/Tio-Money/issues/89) |
| Proceed decision | `PROCEED` — [technical decision comment](https://github.com/im-tnyx/Tio-Money/issues/89#issuecomment-7091498129) |
| Decision maker | ChatGPT GPT-6 (agent), 2026-11-23 UTC, based on owner chat request; not a GitHub-owner-authored approval |
| Current working agent/model | ChatGPT / GPT-6 |
| Previous verified working agent | UNKNOWN_NOT_VERIFIED |
| Git commit author / PR author | Verify from actual resulting GitHub objects; not inferred from AI agent |
| Review disposition | DEFERRED; no independent review performed or claimed |
| Owner merge authorization | NOT_GRANTED; specific PR, owner authorization and current gates are required |
| Working branch | `docs/information-architecture-20261123` |
| Base main SHA | `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6` |
| Started at (UTC) | 2026-11-23; precise timestamp not independently recorded |
| PR | [Draft #90](https://github.com/im-tnyx/Tio-Money/pull/90); HEAD to be reverified |

## Mandated discussion and technical decision

Owner requested a task managed through `.ai` and docs restructuring into separate product/design/architecture/engineering/security/governance/history folders, with historical PR/CI records under docs/history and a premium product-centered README. The current `docs/` root had **22 Markdown files** and no directories on inspected main; README and `docs/00-INDEX.md` contained stale/verbose historical PR #1 evidence.

**Entry and non-goals:** This changes repository documentation navigation only, not app screens or user data. No new package, permission, native feature, financial ledger, runtime API, schema, workflow, policy enforcement, trusted root or security waiver. GitHub PR/Issue historical records remain authoritative; documentation history is preserved without inventing verification.

**Ownership/interfaces:** `README.md` product entrance; `docs/00-INDEX.md` canonical docs router; categorized docs are canonical files; `.ai/tasks/governance/` provenance; `.ai/current.md` multi-task index. Relative links from moved content and inbound references in `AGENTS.md`, `.ai`, `.github` and other text must be repaired.

**Threats and alternatives:** Broken anchors, references, inaccurate shipped status, missing history, and active PR conflicts. Keeping flat docs fails owner intent. Blind bulk moves risk stale backlinks; stage verified moves, preserve content and defer colliding files. README's old historical paragraphs belong in appropriately labeled records, and GitHub keeps immutable commit/CI evidence. Revertable docs-only branch is rollback. No PII, tokens or private record duplication.

**Concurrent work:** PR #88 changes docs/CODESPACES-LIVE-PREVIEW.md, docs/EAS-PREVIEW-UPDATES.md, docs/PR-CODESPACES-PREVIEW.md, .ai/current.md. PR #80 also changes .ai/current.md. Reread live refs before shared-file writes and document any deferred moves.

## Acceptance gates defined before implementation

- [x] README conveys product, offline-first trust boundary, truthful shipped/planned features and basic developer setup; no raw historical PR merge-gate block.
- [x] Docs are categorized with retained `00-INDEX.md`; current owner decisions, finance ADRs and security records remain canonical and distinct from history.
- [x] Historical snapshots from README and doc index preserved in history or source task/PR with permanent links and accurate superseded labels.
- [x] Every moved doc's relative and incoming Markdown links/anchors validated; internal references in governance, scripts and docs checked; explicit deferred list for active PR overlap.
- [x] Doc scope only, zero unintended code/policy changes; no forbidden co-author trailers in new commits.
- [x] Exact PR HEAD governance/link CI checked; review disposition evidence recorded; no fabricated test claims.
- [x] PR remains unmerged until separate owner instruction names exact repo + PR + merge conditions.

## Immutable session checkpoints

### 2026-11-23 UTC — ChatGPT GPT-6 initial assignment

- **RFC:** Issue #89, technical PROCEED comment #7091498129; ordinary documentation task authorized to start by owner instruction, NOT merge authorization.
- **Observed base:** `main` `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6`; branch `docs/information-architecture-20261123` created from exact SHA.
- **Scope / ownership:** docs root 22 Markdown files; intended categories product/design/architecture/engineering/security/governance/history. AGENTS and linked decision records inspected. PR #88 and PR #80 concurrent paths recorded.
- **Review:** DEFERRED (no independent review performed). **Security/owner merge:** NOT_GRANTED, no risk waiver.
- **Tests/checks:** NOT_RUN at task creation; await actual modified SHA and CI before assertions.
- **Next safe action:** Implement and validate bounded Markdown move map, first README/hub cleanup and backlink repairs on new branch; open draft PR and record residual links/overlaps.

[Task workflow](../README.md) · [RFC guide](../../discussions/README.md) · [Agent contract](../../../AGENTS.md) · [Docs hub](../../../docs/00-INDEX.md)

### 2026-11-23 UTC — Draft PR and moved-path checkpoint (ChatGPT GPT-6)

- **Branch/base:** main `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6`; draft [PR #90](https://github.com/im-tnyx/Tio-Money/pull/90) initially HEAD `3b05155769424279779d045b4bbfdb79e547a106`; before opening it, compare showed ahead 14/behind 0, 58 changed files.
- **Changed work:** README refreshed to ~100-line product-first page; docs hub rewritten; 18 root docs migrated and GitHub recognized most as renames; Phase-0 historical README/hub checkpoint archived in `docs/history/phase-0/README-AND-HUB-CHECKPOINTS.md`. Related references updated in `.ai/`, `AGENTS.md`, `.github/`, `SECURITY.md`, shared theme docs, `.cursor/BUGBOT.md`, and architecture Issue Template. Documentation-only link value changed in `docs/CODESPACES-LIVE-PREVIEW.md` (current PR #88 overlap; reconcile before merge).
- **Deliberate exclusions:** PR #88 modified preview docs `docs/CODESPACES-LIVE-PREVIEW.md`, `docs/EAS-PREVIEW-UPDATES.md`, `docs/PR-CODESPACES-PREVIEW.md` stay at root until PR #88 is reconciled; PR #80 and #88 both also edit .ai/current.md. No app source or runtime behavior changed.
- **Manual path scan:** Reviewed 82 Markdown paths in 6 index batches; no unaddressed migrated-document links observed. Three non-file/example observations: `.ai/archive/README.md` uses example `file.md#anchor`, `.ai/tasks/governance/ai-context-setup.md` contains illustrative assets/tests examples, Phase 0 source route `(tabs)` needed angle-bracket Markdown URL and was corrected. Archive original link was rebased to new foundation notes path. This scan validates relative target paths only; anchor resolution and full governance check NOT_RUN at this checkpoint.
- **New commit history:** Created branch commits through GitHub with messages written without `Co-authored-by:`; exact GitHub commit-range audit pending. No local Git checkout/network, so local `npm run check` and `python3 scripts/ai_context.py check-links` NOT_RUN; use actual PR CI/logs and report exact results.
- **Review and merge:** independent human review DEFERRED, no approval inferred; owner PR #90 merge authorization **NOT_GRANTED**. Draft PR; CI and scope review must be re-evaluated at final exact HEAD.
- **Next:** Update PR/task index final HEAD, inspect Actions run status + governance link failures, fix only scoped broken docs paths, reconcile parallel PRs safely, never merge without separate permission.

### 2026-11-23 UTC — Gate 2 latest-main reconciliation (ChatGPT GPT-6)

- **Owner request / RFC:** User specifically authorized Gate 2: safely reconcile Draft PR #90 with latest main, preserve merged PR #80 and concurrent PR #88, follow AGENTS.md and .ai, verify links/history/CI, no protections bypass, **no merge to main**. Existing [Issue #89](https://github.com/im-tnyx/Tio-Money/issues/89) technical PROCEED and docs-only scope remain in effect; **no PR #90 merge authorization**.
- **Read-only refs before update:** main `1d512cf4b75911cfe8c4a4f409768ca311b33c0d` (PR #80 merge commit); PR #90 prior HEAD `49151b09e211ee1a51ad8bf8ea200467e94eb8d6`; PR #88 Draft `1b68936930ed0c627ca525ed6972885ba1336d5e`. Original base `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6`.
- **Safe reconciliation:** Created and moved **PR #90 branch only** via non-force expected-SHA fast forward, two-parent commit [`bbecbcc1b84375da1d7dd3f1c1d8fff83d491d15`](https://github.com/im-tnyx/Tio-Money/commit/bbecbcc1b84375da1d7dd3f1c1d8fff83d491d15) with parents PR #90 old HEAD and current main; retained every PR #80 changed/app file from main. Only two overlapping paths required explicit content reconciliation: `.ai/current.md` and `src/shared/theme/README.md`. Verified all eight current PR #80 sections and Android native fade-only notes present; PR #90 document links remain categorized.
- **Scope check:** Comparing current main to reconciled PR #90: 17 commits ahead / 0 behind, 58 changed files, all documentation/Markdown or doc-related templates; the only `src/` diff is `src/shared/theme/README.md` link correction. No runtime implementation, workflow, package, lock, permissions, migrations or secrets touched.
- **PR #88 isolation:** Its branch/head not updated or merged. Existing three preview docs intentionally stay at `docs/` root; PR #88 adds prose to them and PR #90 only rebases one historical link in `docs/CODESPACES-LIVE-PREVIEW.md`. PR #88's current `mergeable_state=dirty` against new main is a separate PR88 issue, not permission to rewrite its feature branch. Its `.ai/current.md` additions must be incorporated if PR #88 later merges; rerun path/anchor/CI gates then.
- **Docs/history validation:** Rechecked source SHA of archived README historical PR #1 paragraph is present verbatim, original commit link exists, historical hub/archive index linked, README contains no PR forensic block, docs hub links to history, AGENTS.md points at migrated canonical decisions. Earlier branch's manual 82-file Markdown target scan plus governance CI were passed; targeted recheck on reconciled HEAD also verified theme and current task history.
- **Exact reconciled-HEAD checks at checkpoint:** Governance/Python/links/commit attribution `SUCCESS` at [run 45117262479](https://github.com/im-tnyx/Tio-Money/actions/runs/45117262479); static **IN_PROGRESS** at [run 45117262451](https://github.com/im-tnyx/Tio-Money/actions/runs/45117262451) and must not be called PASS until concluded. Push preview signal PASS is not an app quality gate. No local checkout: local tests/physical Android/iPhone QA NOT_RUN.
- **Review status:** PR #90 has no submitted GitHub reviews and no inline threads at inspection. Independent review **DEFERRED**; full manual anchor check and concurrent-PR final reconciliation outstanding. Keep Draft. Owner action-specific merge authorization **NOT_GRANTED**; never bypass branch protections, do not alter `main`, auto-merge, or PR #88.
- **Next:** This checkpoint write itself advances exact HEAD and triggers fresh CI; reverify new SHA/status and link-validation. Recheck main and PR #88 at review/merge gate. PR #90 remains Draft until all remaining gates are satisfied.


### 2026-11-23 UTC — Gate 3 final documentation review (ChatGPT GPT-6)

- **Inspected exact HEAD:** `1cdf32d6f5bed2443ea14b5901c13319c0c4bfdf` from current main `1d512cf4b75911cfe8c4a4f409768ca311b33c0d`; PR #90 OPEN/DRAFT at review start, GitHub reports `mergeable_state=clean`. Diff remains 58 documentation-only paths, ahead 18/behind 0.
- **Owner scope and review method:** Gate 3 from owner chat, documentation-only review performed by working ChatGPT/GPT-6 (NOT independent human approval). Checked product purpose, setup, planned-vs-shipped status, privacy/finance boundary, category separation, source history retention, link destinations, GitHub review threads and ruleset. No security/finance implementation changes.
- **Verified docs:** 13 core product/design/architecture/governance/engineering files have **74/74** internal Markdown heading fragments resolving via GitHub-compatible heading slug normalization. Additional 13 README/hub/history/security/style/preview/theme Markdown files yielded **17/17** internal anchor targets (5 same-group, 12 to core docs). Scanned 24 AGENTS/.ai governance/task documents; **27/27** doc-targeted anchor links matched existing canonical target heading IDs. These are manual static checks; GitHub markdown renderer and external network links were not exhaustively visited. Current-HEAD Governance CI also passed repository Markdown link verification.
- **Required exact-HEAD CI:** [Governance run 45117471158](https://github.com/im-tnyx/Tio-Money/actions/runs/45117471158) **SUCCESS**; [static run 45117471118](https://github.com/im-tnyx/Tio-Money/actions/runs/45117471118) **SUCCESS** (typed checks, lint, tests, Android/iOS Metro smoke); commit attribution checked by governance CI. No real phone testing; only documentation scope.
- **Active branch protection:** `protect-main` ruleset 27567187 active; `static` and `Governance / Python, links and commit attribution` required; approving review count 0, review-thread resolution required. PR #90 had **zero submitted reviews and zero review threads** on inspection. Copilot review-on-push applies, draft reviews disabled; revisit findings after Ready for Review.
- **PR #88 coordination:** Draft PR #88 HEAD `1b68936930ed0c627ca525ed6972885ba1336d5e` remains untouched and currently reports an independent merge conflict against newer main. Its three preview docs deliberately remain in `docs/` root, and its `.ai/current.md` addition is not copied into PR #90 because it is unmerged. After PR #88 is merged/reconciled, PR #90 must re-check shared index/history and exact HEAD. No blocker to separately reviewing PR #90 now.
- **Review disposition:** working-agent documentation self-review **PERFORMED (not independent GitHub approval)**, independent human review **DEFERRED** (optional unless active GitHub settings change). No unaddressed blocking findings identified in this static docs review; preservation of PR #88 work is a deferred dependency, not a waiver.
- **Lifecycle:** task moves to `IN_REVIEW`; PR #90 is eligible for the separate GitHub Ready for Review action after this commit's exact-HEAD required CI verifies success. This checkpoint changes PR head; older CI is historical and must not be reused for the new SHA.
- **Merge restriction:** Owner PR #90 merge authorization **NOT_GRANTED**. No auto-merge, merge, force-push, branch deletion, protected-main or PR #88 branch modification, deployment, trust change or security acceptance.

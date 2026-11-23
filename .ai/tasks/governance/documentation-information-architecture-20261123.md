# TM-DOC-IA-20261123-001 — Documentation information architecture and product-first README

> Markdown/docs-only scoped work. **No owner PR merge authorization.** Preserve historical facts, finance/security contracts and traceability.

## Task identity, decision and lifecycle

| Field | Verified value |
|---|---|
| Task ID | TM-DOC-IA-20261123-001 |
| Repository | `im-tnyx/Tio-Money` |
| Lifecycle state | `IN_PROGRESS` (technical proceed recorded; implementation started) |
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

- [ ] README conveys product, offline-first trust boundary, truthful shipped/planned features and basic developer setup; no raw historical PR merge-gate block.
- [ ] Docs are categorized with retained `00-INDEX.md`; current owner decisions, finance ADRs and security records remain canonical and distinct from history.
- [ ] Historical snapshots from README and doc index preserved in history or source task/PR with permanent links and accurate superseded labels.
- [ ] Every moved doc's relative and incoming Markdown links/anchors validated; internal references in governance, scripts and docs checked; explicit deferred list for active PR overlap.
- [ ] Doc scope only, zero unintended code/policy changes; no forbidden co-author trailers in new commits.
- [ ] Exact PR HEAD governance/link CI checked; review disposition evidence recorded; no fabricated test claims.
- [ ] PR remains unmerged until separate owner instruction names exact repo + PR + merge conditions.

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

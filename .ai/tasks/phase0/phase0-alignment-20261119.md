# TM-P0-ALIGN-20261119-001 — Phase 0 governance alignment and completion review

> **Active scoped task, not a merge authorization.** Source of truth is live GitHub. The historical governance task and its checkpoints are preserved separately.

| Required field | Verified value |
|---|---|
| Task ID | `TM-P0-ALIGN-20261119-001` |
| Repository / PR | `im-tnyx/Tio-Money` · [PR #1](https://github.com/im-tnyx/Tio-Money/pull/1), **draft, unmerged** |
| Lifecycle | **VALIDATING** — later review, device acceptance and owner authorization still pending |
| RFC | [Discussion and technical PROCEED](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7001758473) |
| Decision | Agent architect **PROCEED**, 2026-11-19, bounded integration + existing review fix + owner-requested navigation; **not** owner merge permission |
| Owner decisions | [English-only TM-DEC-001](../../../docs/DECISIONS.md#tm-dec-001--english-only-initial-app); [five destinations + FAB TM-DEC-004](../../../docs/DECISIONS.md#tm-dec-004--five-destinations-and-floating-add); optional review/mandatory owner merge TM-DEC-002/003 |
| Working branch | `feat/phase-0-expo-foundation`, existing PR #1 |
| Main verified | `04e6aa8d657627516b8ce7de91bd8304fdcbcf90` merged governance PR #2 |
| Initial Phase 0 HEAD | `1c0f3e21d3e7938c1af3d5003ae640cfcd1cfe8f` |
| Integration merge | `5d464a66f425dd93bfddcfdfe89fdfa5d330d5a5` (two parents, first prior Phase 0 HEAD, second current governance main) |
| Current working agent | ChatGPT, **GPT-6** (known from this execution; not derived from commit author) |
| Previous verified working agent | Earlier Phase 0 ChatGPT GPT-6 session evidenced in this project's conversation; separate from GitHub PR author |
| PR author / reviewers | GitHub PR author `im-tnyx` is not an agent identity; initial Copilot review **COMMENTED**, original blocking Node thread |
| Merge authorization | **NOT_GRANTED for PR #1**. No merge/auto-merge/branch deletion/force operations permitted |
| Started / checkpoint | 2026-11-19T06:46:45.938Z UTC; mutable heads require re-verification |

## Scope and technical contract

- Preserve the real Phase 0 source: Expo Router, SQLite FK startup/settings-only migration, domain-only typed ledger preflight, themes/UI, single unified editor with disabled Save, and no native SMS permissions.
- Integrate **all** governance files from current main via an actual non-destructive two-parent merge commit, retaining Phase 0 workflow separately from AI governance workflow. Compare overlap `docs/00-INDEX.md` and preserve both the owner decisions register link and Phase 0 notes/link/status. Do not rewrite historic governance records.
- Restrict Node to Expo/RN engine intersection, synchronize `package.json`, root lockfile engines and README, verify `.nvmrc` 22.16.0, remove duplicated `react-dom`.
- English-only MVP per TM-DEC-001: retain stable English keys/typed message contract; no unused Hindi dictionary or planned MVP language selection. Additional language implementation requires a new decision.
- Owner navigation direction: **Home · Trans. · Stats. · Account · More**, with separate floating `+` FAB to the unified three-type editor. `Trans.` means transaction-history route, `Stats.` means reports placeholder, `More` is a Settings entry. No new finance feature/screen workflow.
- Maintain module boundaries per [feature ownership](../../core/feature-boundaries.md); no ledger tables, data persistence, bank auth, native SMS, mock balances, Phase 1/2 implementation, schema or business calculations.
- This is a bounded app-shell and compatibility correction. No new security permission or remote data flow has been authorized.

## Recovery and risk record

- Worktree/untracked/worktrees: **NOT_VERIFIED** in a local checkout. The available container has no Tio-Money checkout and `git ls-remote` fails with DNS resolution for `github.com`; GitHub connector confirms remote refs/history. Git-object-based two-parent merge commit with **non-force** branch advancement was used instead of speculative local merging.
- No direct `main` updates; no destructive reset, force-push, branch deletion or database delete.
- On failed CI or device QA, keep PR draft and correct as a new Phase 0 commit with explicit evidence; a safe revert is a follow-up commit, never history rewriting.
- Local SQLite is **not** claimed encrypted/backed up or device-tested. CI exports are bundle smoke tests, not installed app/Expo Go passes.
- Dependency and workflow risks: a compromised/transitive package, broad Node engine range or accidentally privileged workflow can undermine reproducibility; PIN compatible dependencies, keep governance CI read-only and separate, do not introduce secrets/permissions.
- Review disposition: **DEFERRED** independent post-fix re-review at initial checkpoint, optional by owner policy, strongly recommended for migration/bootstrap/privacy boundaries; initial Copilot `COMMENTED` review and open Node finding recorded. Do not mark original thread resolved until fix and tests evidenced.

## Acceptance and validation plan

- Latest SHA has current main ancestor, both `.github/workflows/ai-governance-checks.yml` and `phase-0-checks.yml`, no concurrent conflicting writes and PR still draft.
- `npm ci --no-audit --no-fund`, `npx expo install --check`, `npm run check`, `npx expo config --type public`, Android/iOS `expo export`, government Python syntax and unittest suite, `python3 scripts/ai_context.py check-links`, commit trailer scanner over actual base/head, ESLint import boundaries, and route contracts.
- Reproduce/verify original Node finding, reply to the actual [review discussion](https://github.com/im-tnyx/Tio-Money/pull/1#discussion_r4618083328) with observed exact fix SHA.
- Device QA **NOT_VERIFIED** until physical Android and iPhone (Expo Go) cold/warm route, FAB, Settings, safe-area/keyboard, appearance and real SQLite on-device FK/migration evidence.
- Review owner and required protections, defer any merge until explicit PR-specific owner authorization.

## Immutable session checkpoints — append without rewriting history

### 2026-11-19T06:46:45.938Z — ChatGPT / GPT-6

- **Previous agent:** earlier Phase 0 ChatGPT GPT-6 project session; Git author is not proof.
- **Discussion / PROCEED:** [RFC and dated technical decision](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7001758473); owner implementation signoff optional, not requested; TM-DEC-001 and the owner's five-tab/FAB direct request apply.
- **Base / source:** governance main `04e6aa8`, Phase 0 `1c0f3e2`, two-parent merge `5d464a66`. Branch `feat/phase-0-expo-foundation`; PR #1 draft.
- **Work:** integration executed via tree merge preserving governance and app workflows, Node/English/nav corrections under way.
- **Checks:** pending final current-HEAD CI. Earlier Phase 0 CI was green at `1c0f3e2`, but **not** evidence for the new head. A preliminary post-change run found one test type-comparison error; a scoped fix was pushed.
- **Independent review:** `DEFERRED` (new-HEAD re-review not yet requested/performed); original Copilot `COMMENTED` Node finding recorded.
- **Merge authorization:** `NOT_GRANTED` for `im-tnyx/Tio-Money` PR #1. 
- **Next safe action:** run current-HEAD CI, reply to original review thread, update PR description, collect real-device checklist, append evidence here.
 
[Task protocol](../README.md) · [Current index](../../current.md) · [Agent contract](../../../AGENTS.md) · [Review guide](../../../.github/REVIEW_GUIDE.md)

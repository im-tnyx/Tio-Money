# Tio Money — scoped pull request contract

> Follow [root AGENTS.md](../AGENTS.md), the [mandatory discussion process](../.ai/discussions/README.md), the [review guide](REVIEW_GUIDE.md) and canonical product decisions. A checked box, Issue Form or CI run **never** proves owner approval. Only a separate explicit owner instruction can authorize **merging** this PR.

## 1. Identity and discussion gate

| Field | Evidence / URL (not just a checkbox) |
|---|---|
| Task ID | `TM-…` |
| Issue / technical RFC | Issue, Discussion, existing PR thread or linked RFC |
| Recorded technical `PROCEED` decision | Decision-maker, source, UTC date, scope, conditions |
| Optional owner implementation signoff | Link if provided; otherwise `NOT_REQUIRED` for ordinary bounded work |
| Assigned feature / module owner | Owner and interface boundaries |
| Working branch, base SHA and inspected HEAD | Exact Git SHAs |
| Current / previous verified agent | [Task handoff](../.ai/current.md) URL and provenance; unknown marked honestly |

**Scope exclusions and concurrent PRs:**

## 2. Summary and changed files

**Why is this necessary and what behavior changes?**

**Exact changed paths (or link to diff):**

**Architecture/contracts/feature boundaries:**

**Related owner decisions and alternatives:**

## 3. Impact assessment

| Area | Impact (`NONE`, `YES`, `NOT_APPLICABLE`) and evidence |
|---|---|
| Privacy, sensitive data, logging and permissions | |
| Canonical ledger, native ISO-currency-specific safe-integer minor units (INR paise only for INR), exponent, asset/liability, transfers and fees | |
| Database migration / persistence / offline behavior | |
| Android, iOS, Expo Go, SMS/store-policy compatibility | |
| Shared domain interfaces / circular imports | |
| Dependencies, supply chain, CI / branch settings | |
| English-only MVP, accessibility, future locale readiness | |

## 4. Validation at a specific SHA

> Status values: **`PASS`** = executed and passed; **`FAIL`** = executed and failed; **`NOT_RUN`** = not executed; **`BLOCKED`** = needed but prevented; **`NOT_APPLICABLE`** = genuinely irrelevant with reason. Record actual commands, platform and tested SHA. Never claim local-only results are CI or physical-device evidence.

| Check | Status | Actual command / environment / tested commit / evidence URL |
|---|---|---|
| Python governance tests and syntax (if governance) | `NOT_RUN` | |
| Markdown links, template/archive fixtures (if docs) | `NOT_RUN` | |
| Task-state negative tests / decision gates (if governance) | `NOT_RUN` | |
| Commit-message `Co-authored-by:` audit | `NOT_RUN` | |
| TypeScript, lint, Expo / app tests (if app) | `NOT_APPLICABLE` | |
| Android / iPhone manual-device checks (if app) | `NOT_APPLICABLE` | |
| Security/privacy and source-change review | `NOT_RUN` | |
| Required GitHub checks at actual HEAD | `NOT_RUN` | |

**Actual checked Git commit SHA:**

**Failed checks, skipped checks, and reasons:**

## 5. Optional independent review, GitHub protections and known blocking findings

| Field | Evidence |
|---|---|
| Independent review disposition | `PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED`, reason/source |
| Reviewer, only if performed | Human / Copilot / Codex / agent; identity, link and inspected SHA |
| Review type if performed | Actual GitHub `APPROVED` / `COMMENTED` / `CHANGES_REQUESTED` or independent assessment |
| Inspected PR HEAD SHA | Immutable SHA and changed scope |
| Verdict only if performed | `PASS / CHANGES_REQUESTED / INCONCLUSIVE`; otherwise `NOT_APPLICABLE` (never pretend PASS) |
| Blocking high / medium findings | Thread URLs, fix SHA, test evidence |
| Non-blocking issues / questions | Links and follow-up owner |
| Unresolved threads and re-review request | Exact links/status; never silently resolve |

**Important:** Independent review is **optional by default**; strongly recommended for ledger, migrations, security/privacy, authentication and sensitive platform work. Never bypass known blocking findings or actual GitHub-required reviewers/checks. Bot `COMMENTED` is not formal approval; a skipped, failed or unavailable review is not a passing review.

## 6. Risks, rollback and recovery

**Residual risks / policy decisions:**

**Safe rollback (and data recovery if applicable):**

**Manual review of commits:** No `Co-authored-by:` trailers for Claude, Codex, Cursor, ChatGPT or anyone else. Agent attribution belongs in task records; never spoof authenticated Git author metadata.

## 7. Separate OWNER MERGE APPROVAL — mandatory, not inherited

**Owner authorization for merging THIS PR:** `NOT_GRANTED` until authentic, separately verified owner permission identifies **repository, PR number, explicit permission to merge, and conditions**. Record source, verified owner, date, authorized SHA/scope and conditions. An agent may perform the merge **only after** these facts and the [current-HEAD/protection/blocker preflight](POST-MERGE-SYNC.md#authorized-agent-merge-preflight-before-any-merge) are verified. Renew owner authorization for material scope changes. Only a GitHub-allowed non-force merge method; record actual resulting merge SHA. Auto-merge requires **separate explicit owner authorization**.

**Do not merge** based on implementation, optional independent review, green tests, a bot comment, or a checked box. This template does not configure branch protection or authorize PR #2 to merge.

## 8. After verified merge (manual only)

Record the actual GitHub merge state, resulting commit SHA (including squash differences), post-merge checks, clean local sync and task/index/archive reconciliation under [POST-MERGE-SYNC.md](POST-MERGE-SYNC.md). Preserve parallel PR branches and record the next verified agent plus exact safe next action.

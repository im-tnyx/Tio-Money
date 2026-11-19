# Tio Money — independent review (optional) and blocking findings guide

**Read first:** [AGENTS.md](../AGENTS.md), [current task index](../.ai/current.md), the [discussion/RFC guide](../.ai/discussions/README.md), relevant [feature boundaries](../.ai/core/feature-boundaries.md), and the [canonical docs](../docs/00-INDEX.md). This is a *review protocol*, not permission to implement, merge, change rulesets or deploy. Review the actual current GitHub diff, not just a PR description.

## A. Pre-review verification

1. Verify repository, target `main`, head branch and exact **HEAD commit SHA**; inspect full PR changed paths/diff, outstanding threads, reviews, security controls and actually reported checks.
2. Verify the task ID, required RFC, documented technical `PROCEED` decision, scope and excluded work. **Owner implementation signoff is optional** for ordinary bounded work; required authority for security/privacy/platform or financial rule changes must not be guessed. **Owner merge approval is separately mandatory.**
3. Compare each changed feature's actual interfaces, private implementation and dependencies to [the feature contract](../.ai/core/feature-boundaries.md). Flag routes owning SQL, UI calculating balances, deep cross-feature imports, circular dependencies and multiple ledger engines.
4. Inspect real tests and their **tested SHA**, not just a check-box claim. Review applicable Android/iPhone behavior, SQLite migrations, financial reconciliation, accessibility, privacy, SMS/Expo Go limitations and the English-only MVP as appropriate.
5. Inspect the current/previous **verified agent** checkpoint and exact commit messages. Commit author != AI agent. **All Git `Co-authored-by:` trailers are prohibited**; names like Claude, Codex or Cursor are not allowed.
6. Re-read **all current open inline findings**, including the [new P2 about inline non-Markdown relocation](https://github.com/im-tnyx/Tio-Money/pull/2#discussion_r4624621676), on [PR #2](https://github.com/im-tnyx/Tio-Money/pull/2). Do not rely on a historic count or infer that author replies resolve findings.

## B. Review areas and threat questions

| Area | Minimum question |
|---|---|
| Scope | Do actual files and changed behavior match the documented RFC and task ownership? |
| Financial correctness | Is the only canonical ledger used? Balanced integer-paise postings, transfers/fees, asset/liability and reversal invariants preserved? |
| Security / privacy | Secrets, finance data, raw logs, cloud upload, deletion, user consent, input/path validation and supply-chain risks? |
| Android / iOS | Are native SMS and Expo Go/iPhone inbox limitations described correctly? Any new permission or store-policy risk? |
| Automation | Does CI use only intended privileges, no `pull_request_target`, no hidden approvals/merges? Can PR authors modify their own test definitions? |
| Documentation | Do inline/reference links, anchors, copied templates, archives and decisions remain accurate? |
| Agent continuity | Does the checkpoint preserve history, verified identities, decisions, tests and exact next action? |
| Acceptance evidence | Which tests actually ran? Which are NOT_RUN, BLOCKED or NOT_APPLICABLE? Does tested SHA equal current PR HEAD? |

## C. Severity and verdict

| Classification | Meaning | Required disposition |
|---|---|---|
| **Blocking high** | Data exposure/loss, accounting corruption, approval bypass, critical workflow trust violation | Fix/verify before merge; independent re-review strongly recommended, mandatory only when GitHub settings require it |
| **Blocking medium** | Broken doc references, task-state bypass, significant test/contract failure | Fix/verify before merge; optional independent re-review recommended |
| **Non-blocking** | Improvement without a correctness or policy gate impact | Document follow-up if not resolved |
| **Question** | Missing interpretation or unverified premise | Ask with exact evidence instead of inventing a defect |

**Review disposition:** `PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED`. An independent review is **optional by default**; no owner-approved waiver is inherently needed to skip it. **Strongly recommend** it for financial ledger, migrations, security, privacy, authentication and sensitive platform changes. Record why review was skipped/unavailable/deferred, or the reviewer/actual SHA and verdict if performed. `COMMENTED` is not formal `APPROVED`; a quota-limited, unavailable, failed or skipped review is never a passing review. Actual GitHub-required reviewers/checks and known blocking findings are **not optional**.

### Reviewer report contract

```text
Review disposition PERFORMED / SKIPPED / UNAVAILABLE / DEFERRED, reason/source:
Reviewer identity/tool and independent vs author self-review (only if performed):
PR number/base/head and exact reviewed SHA:
Scope and canonical references read:
Verdict and GitHub review type:
Blocking high / blocking medium (path:line, evidence, impact, smallest fix):
Non-blocking items and questions:
Unresolved threads / fix commit / re-review needed:
Tests and checks actually observed vs not run:
Risk / platform / financial invariants / handoff findings:
Owner merge authorization: authentic owner, repository, PR, explicit permission, conditions, scope (or NOT_GRANTED):
Authorized merge executor: owner/agent only after verified preflight; result SHA if actually merged:
```

**Do not** resolve substantive review threads just because an author pushed a fix, infer passing CI from local unit tests, infer app security from an Actions workflow, or bypass the owner merge gate. For post-merge manual actions read [the safe sync guide](POST-MERGE-SYNC.md).

## Owner-authorized agent merge (never inferred)

Independent review may be skipped under this default policy, **but known blocking findings and actual GitHub required review/check settings cannot be waived**. A verified owner instruction must identify repository, specific PR number, explicit merge permission, and conditions. An agent **MAY** merge only after [the authorized merge preflight](POST-MERGE-SYNC.md#authorized-agent-merge-preflight-before-any-merge): refresh PR state/HEAD and base `main`, satisfy all configured protections, verify blockers and unchanged authorized scope, and use a permitted non-force method. Material changes or unclear permission require renewed owner authorization. Enabling auto-merge requires separate explicit permission. **This policy change does not authorize PR #2 to merge.**

# Tio Money — independent PR review guide

**Read first:** [AGENTS.md](../AGENTS.md), [current task index](../.ai/current.md), the [discussion/RFC guide](../.ai/discussions/README.md), relevant [feature boundaries](../.ai/core/feature-boundaries.md), and the [canonical docs](../docs/00-INDEX.md). This is a *review protocol*, not permission to implement, merge, change rulesets or deploy. Review the actual current GitHub diff, not just a PR description.

## A. Pre-review verification

1. Verify repository, target `main`, head branch and exact **HEAD commit SHA**; inspect full PR changed paths/diff, outstanding threads, reviews, security controls and actually reported checks.
2. Verify the task ID, required RFC, documented technical `PROCEED` decision, scope and excluded work. **Owner implementation signoff is optional** for ordinary bounded work; required authority for security/privacy/platform or financial rule changes must not be guessed. **Owner merge approval is separately mandatory.**
3. Compare each changed feature's actual interfaces, private implementation and dependencies to [the feature contract](../.ai/core/feature-boundaries.md). Flag routes owning SQL, UI calculating balances, deep cross-feature imports, circular dependencies and multiple ledger engines.
4. Inspect real tests and their **tested SHA**, not just a check-box claim. Review applicable Android/iPhone behavior, SQLite migrations, financial reconciliation, accessibility, privacy, SMS/Expo Go limitations and the English-only MVP as appropriate.
5. Inspect the current/previous **verified agent** checkpoint and exact commit messages. Commit author != AI agent. **All Git `Co-authored-by:` trailers are prohibited**; names like Claude, Codex or Cursor are not allowed.
6. Re-read the **previous five open inline findings** on [governance PR #2](https://github.com/im-tnyx/Tio-Money/pull/2) when reviewing that PR, and the latest fix SHA. Follow reference-style archive and BLOCKED-recovery negative tests. Re-review after material commits.

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
| **Blocking high** | Data exposure/loss, accounting corruption, approval bypass, critical workflow trust violation | Fix and independently re-review before merge |
| **Blocking medium** | Broken doc references, task-state bypass, significant test/contract failure | Fix and re-review before merge |
| **Non-blocking** | Improvement without a correctness or policy gate impact | Document follow-up if not resolved |
| **Question** | Missing interpretation or unverified premise | Ask with exact evidence instead of inventing a defect |

**Review outcomes:** `PASS`, `CHANGES_REQUESTED`, `INCONCLUSIVE`, `REVIEW_PENDING`. Record actual GitHub review type: `APPROVED`, `COMMENTED`, `CHANGES_REQUESTED`, or separate independent assessment. Copilot/Codex/agent `COMMENTED` is **not** formal `APPROVED`. Failed, quota-limited or inaccessible reviewers are **not successful reviews**; seek a real eligible reviewer or an explicitly recorded owner-approved review deferral. Owner deferral cannot override branch protection.

### Reviewer report contract

```text
Reviewer identity/tool and independent vs author self-review:
PR number/base/head and exact reviewed SHA:
Scope and canonical references read:
Verdict and GitHub review type:
Blocking high / blocking medium (path:line, evidence, impact, smallest fix):
Non-blocking items and questions:
Unresolved threads / fix commit / re-review needed:
Tests and checks actually observed vs not run:
Risk / platform / financial invariants / handoff findings:
Owner merge permission: SEPARATE and NOT_GRANTED unless explicitly verified:
```

**Do not** resolve substantive review threads just because an author pushed a fix, infer passing CI from local unit tests, infer app security from an Actions workflow, or bypass the owner merge gate. For post-merge manual actions read [the safe sync guide](POST-MERGE-SYNC.md).

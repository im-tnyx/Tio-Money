# Repository-local attribution guard — pilot

Status: **DRAFT / NOT LIVE / NOT MERGE-APPROVED**.

Owner direction: use the Tio-Workspace/Tio-World repository-local pattern, no
external receiver, central scheduled audit or enrollment dependency during
normal Money operation. Retain App 5032971. Keep the key in a protected local
environment only. See [RFC #92](https://github.com/im-tnyx/Tio-Money/issues/92#issuecomment-7234279840).
Verified base: f67ce3c38144e4bc1977ffb2cff4ac2b6cbd53dd.
Pinned checker: im-tnyx/im-tnyx@5e0ff0a56b4f5f503419a12c20930bef0df22bc7.
Policy epoch: tio-money-v2-pilot-1.

## Execution and trust boundary

- All branch pushes (and non-main-target PR events): secretless Actions
  detection in Tio-Money. No untrusted code checkout in the audit steps.
  Keep the existing consumer workflow path, job name and step name for
  main predecessor receipts.
- Main-target PRs: pull_request_target, trusted base code only, protected
  main-only environment attribution-guard-trusted, dedicated App shadow
  check on the PR head. The key is exposed only to the publisher step.
  Central checker mints/verifies a repository-scoped checks-only token and
  revokes it; the App private key itself is not repository-scoped.
- Fixtures: unprivileged PR/push regression tests. No schedule. Existing
  required checks and ruleset remain unchanged. Central code is fetched at
  the pinned immutable SHA, not executed by a central Actions workflow.

Main pushes retain exact V2 predecessor receipts. New feature refs compare
to audited main. Existing feature refs inspect the exact before..after range.
Force pushes, missing evidence, stale snapshots and incomplete history fail.
Feature-branch receipts are not chained. Authorized deletion has no new
commits. Historic commits are not certified by a new baseline.

## Activation (requires separate approval)

1. Owner reviews exact draft diff, CI, unresolved review findings and
   migration gap; separately authorizes merge. Verify resulting main SHA.
   No agent commit or GitHub account label is evidence of human authorship.
2. Retire central scheduled runtime separately, preserve encrypted state and
   existing secrets. No bootstrap or enrollment dependency.
3. Retain GUARD_CHECKER_SHA and GUARD_POLICY_EPOCH at the above values.
   Record approved resulting main as GUARD_MAIN_AUDIT_BASELINE_SHA after gap
   review. Enable GUARD_CONSUMER_AUDIT_ENABLED only after approval.
4. Create a main-only, no-tags attribution-guard-trusted environment and
   configure ATTRIBUTION_GUARD_APP_PRIVATE_KEY with the existing PEM.
   No repository-level secret, key rotation or revocation. Enable
   GUARD_LOCAL_APP_ENABLED only after checking the environment restrictions.
5. Verify positive/negative signed owner, bot, spoof, unsigned, co-author
   fixtures, branch creation, exact multi-commit pushes, merge and PR
   events, token isolation, exact check source and head, stale/overlapping
   results and outage recovery. PR #101 is read-only negative evidence.
6. Only after live validation and separate approval enable production check
   naming/requirement and native owner-only ref restrictions. Do not change
   Tio-World or Tio-Workspace in this pilot.

## Limitations and acceptance

This is a non-required App shadow publisher and detection-only push/other
PR audit. Native ref authorization is separate. Branch-authored workflows
can be removed or modified; some pushes (including default GITHUB_TOKEN
pushes) do not trigger workflows. A post-push failure cannot undo a push.
Events can lag or be missing; missing evidence is a failure. Reusing owner
credentials cannot prove the actor is human. Tags are not audited. A
previous shadow success can remain after early actor rejection, stale
event or infrastructure error; automatic refresh on base changes is not
implemented. Never make the shadow check required. Existing strict CI must
remain active; production freshness and outage recovery are outstanding.

Local adapter fixtures ran 26/26 with mocked central dependencies; Python
and YAML syntax validated locally. Exact draft CI and live signature/App
publication testing are separate. Local clone unavailable. Independent
review DEFERRED. No production authorization or changes to existing
protections, keys, secrets or other repositories.

Provenance: agent-assisted implementation by ChatGPT under the recorded
owner request; connector account metadata is not independent author proof.

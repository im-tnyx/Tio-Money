# Repository-local attribution guard — correction

Status: **DRAFT / NOT LIVE / NOT MERGE-APPROVED**.

Owner direction: Tio-Workspace/Tio-World repository-local pattern. Every
supported branch push is independently audited in Tio-Money. The trusted PR
check is the pre-merge control; a main push audit can detect a newly created
merge commit but cannot prevent an already completed merge. No main audit
baseline, previous-run receipt chain, scheduled runtime, external receiver or
enrollment is required. Existing App 5032971 is retained.

[RFC #92](https://github.com/im-tnyx/Tio-Money/issues/92) · [PR #119](https://github.com/im-tnyx/Tio-Money/pull/119).
Clean source baseline (before #118): 11d554ec2a63cf0a8022c506e048fb61fd1aeeda.
Existing protected main: f67ce3c38144e4bc1977ffb2cff4ac2b6cbd53dd.
Reviewed checker: im-tnyx/im-tnyx@5e0ff0a56b4f5f503419a12c20930bef0df22bc7.
Policy epoch: tio-money-v2-pilot-1.

## Trust boundary

- commit-attribution-push-audit.yml: all supported branch pushes and
  non-main-target PR events. Read-only, no App key. Existing refs use the
  exact before..after range. New refs compare to the current main tip as a
  reachability reference, not a certificate of historic commits. Branch
  creation on already reachable history may introduce no commits relative
  to main. Force pushes, missing evidence and unstable snapshots fail.
- commit-attribution-guard.yml: main-target pull_request_target, trusted
  base code only, main-only protected environment attribution-guard-trusted.
  Dedicated App shadow check on the exact PR head. App key supplied only to
  publisher step. Checker mints/verifies a repository-scoped checks-only
  installation token and revokes it; the private key itself is not scoped.
- commit-attribution-fixtures.yml: unprivileged regression tests.
- Central reviewed checker is fetched at an immutable pin; no central
  Actions execution. Existing native main protection and CI stay unchanged.

## Cleanup

The obsolete consumer workflow, pilot task, old static assertions and
proposed ruleset JSON from #118 are absent from this candidate. Project
source is based on the pre-#118 tree except for the local guard changes
and documentation entry points. The old consumer enable variable is
reused to avoid creating another switch. GUARD_MAIN_AUDIT_BASELINE_SHA
is not consumed. No central state changes or history rewrite in this PR.
Old Git objects and PR references may remain even after source cleanup.

## Owner activation, after separate approval and CI

1. Review the exact draft diff and tests; authorize merge separately.
   Keep existing required static and Governance checks and protections.
2. Retire the central schedule separately; preserve encrypted state and
   existing key custody until no dependency remains.
3. Keep GUARD_CHECKER_SHA and GUARD_POLICY_EPOCH at reviewed values.
   No baseline variable needed. Enable GUARD_CONSUMER_AUDIT_ENABLED only
   after the corrected code is on main.
4. Configure attribution-guard-trusted, main-only, no tags, with the
   existing ATTRIBUTION_GUARD_APP_PRIVATE_KEY. No repository-level key
   and no old key revocation. Enable GUARD_LOCAL_APP_ENABLED after review.
5. Verify live signed owner, negative, spoof, unauthorized actor, unsigned,
   multiple commits, branch creation, stale head/base and exact App source.
   PR #101 is read-only negative evidence; do not merge or alter it.
6. Only after live validation and separate approval enable the production
   App check name and add it as required. Do not modify Tio-World or
   Tio-Workspace in this correction.

## Limitations

Never make the shadow check required. The current shadow publisher and
push/non-main PR audit are non-required. Native branch restrictions are
needed to prevent unauthorized writes. Branch-authored workflows can be
removed or changed; some pushes (including default GITHUB_TOKEN pushes)
do not trigger Actions. No universal every-push guarantee. Events can
lag or be missing; fail closed on missing evidence. Stale success after
base/policy change, early failure or infrastructure outage needs production
validation and a recovery design. GitHub account credentials cannot prove
that an actor is a human. Tags are outside this audit. Do not infer past
history compliance. CI and independent review are pending on this revision.

Provenance: agent-assisted correction under the owner request; connector
account metadata is not independent human authorship evidence.

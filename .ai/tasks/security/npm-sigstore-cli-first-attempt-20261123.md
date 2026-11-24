# TM-SEC-SIGSTORE-20261123-001 — Isolated npm CLI first-attempt differential

**Owner:** Agent GPT-6, delegated diagnostic-only scope in issue #71.
**Source:** Owner's "Go" (2026-11-23) following a fail-closed npm10/npm11 diagnostic proposal. Detailed Gate 8 technical PROCEED: https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7084899606
**Repository:** im-tnyx/Tio-Money
**Branch:** security/issue-71-first-cli-npm10-npm11-20261123
**Verified base:** main d200ed24117d525fe7a9af7cf8b2e6d4e75317c6 at creation.
**Status:** VALIDATION PENDING, Draft PR only.
**Independent security reviewer:** DEFERRED (strongly recommended).

## Goal and threat model

Run one unmodified first invocation of npm audit signatures, independently on Node 22.16.0/npm 10.9.2 (Sigstore3) and Node 26.8.2/npm 11.19.1 (Sigstore4) in separate no-secrets GitHub runners. Both start from the same immutable EAS CLI 27.4.1 lock, Git blob fa92a2b84071c5cb974becffd6ac74dabf050989, SHA256 664b9505a3eff95735f8aad055338cb0402015d35852c5286aba5a40ebaa4aff.

The first failed npm10 audit on Draft PR #80 SHA 7ec17371da7ed476cb256c74695ef2dce1171ac4 reported @babel/helper-compilation-targets@7.29.13 invalid attestation. Its original HTTP bytes were not captured. Historically passing samples do not resolve the contradiction or prove the original first failure was benign.

## Approved implementation boundary

- New scripts/security/npm-sigstore-cli-first-attempt.mjs.
- New tests/security/npm-sigstore-cli-first-attempt.test.mjs.
- One isolated matrix job and path filters added to existing .github/workflows/eas-cli-sigstore-diagnostic.yml, leaving prior forensic jobs intact.
- This task file; do not alter .ai/current.md, which is concurrently owned by Draft PR #80.

Use existing pinned SHA actions, pull_request event only, contents read and no ID token, credentials, trusted environment, secrets or artifacts. Never use pull_request_target or workflow_run. Reject any wrong toolchain or changed committed lock, create fresh private cache/home and empty npmrc, omit tokens/proxies/NODE_OPTIONS from npm environment and ignore lifecycle scripts. A failed npm ci or first npm audit signatures invocation is always FAIL_CLOSED. Do not retry the audit or convert a later pass into a green result for the first failure. Log only reviewed status, exact lock/npm/Sigstore versions, and existing sanitized fingerprint digests: no raw error, HTTP response, certificate, DSSE bundle, header, keys or environment.

There is no dependency update, signing trust policy change, EAS credential access, privileged preview dispatch, package installation into the main app, deployment, account/finance data mutation, PR #65/#78/#80 modification, or protected main/ruleset write.

## Acceptance

Offline negative fixtures: exact versions and locked EAS files, tamper fails, nonzero/abnormal exit fails closed, output sanitized, minimal environment and no privileged workflow triggers.

GitHub exact-HEAD requirements: report required static and Governance checks plus both new matrix jobs (whether PASS or FAIL); a red check stays red. Record the actual first-attempt observations in Issue #71 without declaring any historical root cause. Independent human security review remains deferred; no owner risk acceptance or root authorization. Any next remediation needs a separate evidence-backed security RFC.

## Risks and rollback

Independent runs may receive different registry responses; a same-lock npm10/npm11 pass or difference is NOT a replay of the historical failed response. Original first HTTP bytes, out-of-band Sigstore TUF trust bootstrap authority, exact historical Babel npm Trusted Publisher authorization and historical causal diagnosis are still UNVERIFIED.

Rollback is to close the Draft PR without merge. No change to main or production app.

**Merge permission:** NOT GRANTED for this or any other PR.

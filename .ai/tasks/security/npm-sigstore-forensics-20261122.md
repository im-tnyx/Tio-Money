# TM-SEC-SIGSTORE-20261122-001 — Isolated npm/Sigstore forensics

**State:** IN_PROGRESS / VALIDATING (verify live PR and exact HEAD before changing state).

**Owner request and documented technical PROCEED:** Issue #71, 2026-11-22. This is permission to prepare an isolated diagnostic PR, not to merge it, deploy, change main, touch other PRs or alter rulesets.

**Verified base:** main at 966b1f86143f72de7f7db304143b3a64fcd52c85 when work began. This is a historical checkpoint, not a claim of current head.

**Branch:** security/issue-71-npm-sigstore-diagnostic

## Scope and ownership

Only four additions: this task, a pull_request-only unprivileged diagnostic workflow, a read-only Node script, and deterministic regression tests. No changes to EAS CLI manifest/lock, root dependencies, Expo Go Android/iOS, app source, Codespaces/EAS trusted preview, tokens/secrets, identity, permissions in existing workflows, PR #65, ruleset #27567187 or main.

**Threat model:** untrusted PR code, writable GitHub token, privileged pull_request_target/workflow_run trigger, OIDC, user npmrc or NODE_OPTIONS injection, dependency lifecycle scripts, executable code on package install, tampered/unreviewed lockfile, raw npm/Sigstore response leaking data, misleading green CI interpreted as definitive provenance root cause.

## Technical controls

- pull_request with contents: read only, pinned immutable GitHub checkout/setup-node, persist-credentials: false, no secret-bearing environment, no artifact upload and no ID-token permission.
- Three separate hosted runners: two Node 22.16.0 clean repetitions comparable to original failure, plus Node 26.8.2 for modern bundled npm support of optional attestation JSON.
- Work only from the exact committed isolated EAS CLI package/lock, validate historical Git blob identity and SHA-512 SRI on all three tracked Babel packages.
- Fresh OS temp directory and fresh npm cache, official registry, empty npmrc, omit inherited auth/proxy/token environment, ignore lifecycle scripts and disallow uncontrolled dependency upgrades.
- Fail any npm ci or mandatory npm audit signatures failure. If include-attestations is supported, a JSON verification failure also fails the job. If unsupported, mark UNSUPPORTED_BY_BUNDLED_NPM, not success.
- Emit sanitized allowlisted counts, package versions, timestamps, CLI/runtime, digests and result codes only in Actions summaries. Never print/upload raw attestations, DSSE bundles, certificate chain, credentials, full environment or unfiltered npm output.

## Acceptance and limitations

Local script syntax and four unit tests must pass. Verify workflow syntax, PR scope, new diagnostic matrix plus exact-HEAD Phase 0 and Governance results from GitHub; report explicit SUCCESS/FAIL/NOT_RUN. No physical Android/iOS QA applicable because no app changes. Passing npm audit signatures validates via npm, not an independent forensic verification of DSSE/signing identity/transparency log and not proof of old failure root cause.

Issue #71 remains open until independently reviewed cryptographic evidence or separate recorded owner/security residual-risk acceptance. A nonreproducible failure is not a waiver; never bypass signature checking. Keep PR unmerged unless owner gives explicit repo-and-PR-specific permission. Rollback is closing the diagnostic PR; it changes no protected runtime.

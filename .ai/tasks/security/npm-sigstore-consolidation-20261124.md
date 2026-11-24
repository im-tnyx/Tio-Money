# TM-SEC-71-CONSOLIDATION-20261124 — Security diagnostic branch consolidation

- **State:** VALIDATING; not merge-ready. Issue #71 remains OPEN.
- **RFC / technical PROCEED:** [Issue #71 cleanup Gate 2A](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7138164951), 2026-11-24, agent-transcribed owner direction "Gate 2a".
- **Assigned agent:** ChatGPT; model GPT-6.2. Previous scope-specific records remain intact. No independent human review claimed.
- **Canonical Draft:** [PR #101](https://github.com/im-tnyx/Tio-Money/pull/101), security/issue-71-template-http-first-response-20261123.
- **Verified integration parents:** previous #101 HEAD `61af7283cf0d6a496de768778fa08e02ae973ba2`, main `2698fb3f1988e7a6247974fa3e79a410a6bb5b70`, #78 `34a1b4cde8b95a9bbcfb350e46e544fb76db2d7b`, #84 `ac40cb6c37fdcc22fa93f4e6611a8b9de096f91a`. Preserve all four as actual ancestors; no source branch mutation.
- **Scope:** exact 14 source blobs plus this task and current index; eight cryptographic proof targets, nine HTTP observation targets (not nine cryptographic proofs), isolated npm10/npm11 first-attempt jobs. No dependency, lock, required static gate, privilege, publisher/root policy or app change.
- **Source evidence:** [#78 prior run](https://github.com/im-tnyx/Tio-Money/actions/runs/45044365066), [#84 prior run](https://github.com/im-tnyx/Tio-Money/actions/runs/45064822846), [#101 prior run](https://github.com/im-tnyx/Tio-Money/actions/runs/45235428542). Preserve historical failures and all Issue #71 findings. Prior green runs are not combined CI.
- **Validation so far:** GitHub compare and immutable file identities; source scopes disjoint; ten modified paths match their respective base blobs on main and four new paths are absent; source 15 commit messages inspected with no forbidden co-author trailers. Local full tests NOT_RUN. Fresh combined exact-HEAD CI and independent security review DEFERRED until integration verification. Resulting commit SHA is to be recorded in Issue #71 checkpoint, not self-referentially in this commit.
- **Acceptance:** verify resulting ref, exact source blob identity and full tree difference from main, unchanged EAS lock blob `fa92a2b84071c5cb974becffd6ac74dabf050989`, required static and Governance, unprivileged combined diagnostic jobs and fail-closed/redaction negative fixtures, no blocking integration findings. Retain original PRs until Gate 2B and separate owner-authorized closure/deletion. No PR merge authorized, no root/publisher approval, no historical risk acceptance, no trusted deployment, no CI retry-to-green.
- **Rollback:** if validation fails, keep all source refs and Draft; diagnose or revert integration with a new scoped commit, never force-reset. Preserve original failures and SHA/run links.

## Exact source file custody

- PR #78 `scripts/security/npm-sigstore-diagnostic.mjs` — `195fb7ce156dbd12f1470a092ea6a00a179a4990`
- PR #78 `scripts/security/npm-sigstore-pacote.mjs` — `1c11cd181db01d12683a04d3620f23aa105ee15a`
- PR #78 `scripts/security/npm-sigstore-trusted.mjs` — `d51a270b786e232b5ecacb3696f2bf046c481101`
- PR #78 `tests/security/npm-sigstore-diagnostic.test.mjs` — `364b750b0d8b43e03ac54bd25011cb4d0e73bc2d`
- PR #78 `tests/security/npm-sigstore-pacote.test.mjs` — `1456852399546afffe43e2f46a8da9b35f57ac35`
- PR #78 `tests/security/npm-sigstore-trusted.test.mjs` — `3697476d4a56c1876bcd892cdcb99ba827a3ed27`
- PR #84 `.ai/tasks/security/npm-sigstore-cli-first-attempt-20261123.md` — `ff196610033845b2ceb7f5da2c9556eabb3313eb`
- PR #84 `.github/workflows/eas-cli-sigstore-diagnostic.yml` — `4c1bca222c947a9c67775e976e30988a89459bfb`
- PR #84 `scripts/security/npm-sigstore-cli-first-attempt.mjs` — `8893e178638756a428307ae65f5e1c8b643ca074`
- PR #84 `tests/security/npm-sigstore-cli-first-attempt.test.mjs` — `0ce4e12474f07b48d4c4ec7223dd849de4998580`
- PR #101 `.ai/tasks/security/npm-sigstore-template-first-response-20261123.md` — `db5492eae1e4e5459c2edf5cfdda0bcd2dac5a2e`
- PR #101 `scripts/security/npm-sigstore-http-boundary.mjs` — `00cb52030f91129f472efe17c3ee3dfcafc79fb3`
- PR #101 `scripts/security/npm-sigstore-http-tap.cjs` — `8053a5c9343c9cf4343cd393d4bdf60de188c3a4`
- PR #101 `tests/security/npm-sigstore-http-boundary.test.mjs` — `afbad9d8498ad575092e7b1f0bc344e9e1d9ef55`

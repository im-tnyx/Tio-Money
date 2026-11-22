# TM-SEC-SIGSTORE-20261122-001 — Isolated npm/Sigstore forensics

**State:** IN_PROGRESS / VALIDATING (verify live PR and exact HEAD before changing state).

**Owner request and documented technical PROCEED:** Issue #71, 2026-11-22. This is permission to prepare an isolated diagnostic PR, not to merge it, deploy, change main, touch other PRs or alter rulesets.

**Verified base:** main at 966b1f86143f72de7f7db304143b3a64fcd52c85 when work began. This is a historical checkpoint, not a claim of current head.

**Branch:** security/issue-71-npm-sigstore-diagnostic

## Scope and ownership

Current scoped PR diff (after package-specific follow-ups): twelve added files — this task, one pull_request-only unprivileged diagnostic workflow, five no-secrets security scripts (diagnostic/metadata/proof/trusted/registry), and five deterministic security test files. Verify live GitHub file inventory rather than relying on this count. This is diagnostic evidence tooling, not a vulnerability patch or production runtime change. No changes to EAS CLI manifest/lock, root dependencies, Expo Go Android/iOS, app source, Codespaces/EAS trusted preview, tokens/secrets, identity, permissions in existing workflows, PR #65, ruleset #27567187 or main.

**Threat model:** untrusted PR code, writable GitHub token, privileged pull_request_target/workflow_run trigger, OIDC, user npmrc or NODE_OPTIONS injection, dependency lifecycle scripts, executable code on package install, tampered/unreviewed lockfile, raw npm/Sigstore response leaking data, misleading green CI interpreted as definitive provenance root cause.

## Technical controls

- pull_request with contents: read only, pinned immutable GitHub checkout/setup-node, persist-credentials: false, no secret-bearing environment, no artifact upload and no ID-token permission.
- Three separate hosted runners: two Node 22.16.0 clean repetitions comparable to original failure, plus Node 26.8.2 for modern bundled npm support of optional attestation JSON.
- Work only from the exact committed isolated EAS CLI package/lock, validate historical Git blob identity and SHA-512 SRI on all three tracked Babel packages.
- Fresh OS temp directory and fresh npm cache, official registry, empty npmrc, omit inherited auth/proxy/token environment, ignore lifecycle scripts and disallow uncontrolled dependency upgrades.
- Fail any npm ci or mandatory npm audit signatures failure. If include-attestations is supported, a JSON verification failure also fails the job. If unsupported, mark UNSUPPORTED_BY_BUNDLED_NPM, not success.
- On a first npm audit signatures failure, allow exactly one secondary read-only npm JSON observation for sanitized evidence only; the first failure still exits nonzero. JSON invalid[] package identities are emitted only after exact name+version matching against the committed lockfile. Malformed/unknown JSON reports UNVERIFIED. Never upload raw JSON, registry responses, secrets, certificates or attestation bundles.
- On modern npm, independently compare public tarball SHA-512 against lock SRI, signed SLSA subject digest against tarball bytes, and DSSE signature against the embedded Fulcio leaf public key. This does NOT independently verify trusted Fulcio roots, source/OIDC signer identity, registry managed-key signature or Rekor inclusion; those remain explicitly UNVERIFIED.
- Emit sanitized allowlisted counts, package versions, timestamps, CLI/runtime, digests and result codes only in Actions summaries. Never print/upload raw attestations, DSSE bundles, certificate chain, credentials, full environment or unfiltered npm output.

## Acceptance and limitations

Verify current exact-HEAD workflow syntax, all deterministic tests in the three security test files, diagnostic matrix (two npm 10 replicas and one npm 11 replica), Phase 0 and Governance results from GitHub; report SUCCESS/FAIL/NOT_RUN on that head, never infer CI success from earlier commits. No physical Android/iOS QA applicable because no app changes. Passing npm audit signatures validates via npm, not an independent forensic verification of DSSE/signing identity/transparency log and not proof of old failure root cause.

**Retained forensic evidence:** PR #65 originally reported invalid attestations for three Babel packages; later no-secrets npm 10 replicas on PR #73 reproduced invalid-attestation failure on an identical lockfile without retaining exact package identities. Passing later runs do not resolve that contradiction. See issue #71 for attempt IDs and sanitized evidence; no direct compromise conclusion is established.

Issue #71 remains open until independently reviewed cryptographic evidence or separate recorded owner/security residual-risk acceptance. A nonreproducible failure is not a waiver; never bypass signature checking. Keep PR unmerged unless owner gives explicit repo-and-PR-specific permission. Rollback is closing the diagnostic PR; it changes no protected runtime.


## 2026-11-22 — Fourth observed Babel identity, additional target gate

Protected main after PR #70: `7d2bb686bde5cf1b04f2704b085714aef503f63a`.
Read-only exact HEAD `82f1ea9ffb882786383ab1f8d913f4b64ea041da` of this Draft PR
reproduced **npm audit signatures** failure in required Phase 0 `static`
for **`@babel/helper-compilation-targets@7.29.13`**, in
`tests/preview/eas-cli-locked-install.test.mjs` ([run 45013094452](https://github.com/im-tnyx/Tio-Money/actions/runs/45013094452)).
This was distinct from the three original Babel failures and from another
previously observed `@babel/traverse` failure. Three separate no-secrets
diagnostic runners on the same HEAD passed ([run 45013094532](https://github.com/im-tnyx/Tio-Money/actions/runs/45013094532)).
Thus **intermittent verification behavior is observed, cause unknown**.
No proof of compromise or of harmless registry/network behavior.

The isolated EAS 27.4.1 lockfile remains Git blob
`fa92a2b84071c5cb974becffd6ac74dabf050989`.
The new package is included in the **fourth mandatory exact locked target**
for a follow-up diagnostic: registry tarball SRI, in-toto subject digest and
DSSE embedded-leaf signature on npm 11 if available. A genuine failing check
must fail closed on npm 10 and npm 11; successful alternate runs do not waive
the earlier failure. Cert chain trust to an independently pinned Fulcio root,
signer OIDC identity, npm publish-key trust and cryptographic Rekor inclusion
remain **UNVERIFIED** until independently established. Only allowlisted
evidence goes to job summaries; no raw bundles, certificates, credentials or
network response artifacts are uploaded. This follow-up does not modify
`main`, PR #65, lockfiles, privileged workflows or rulesets. No merge.


## 2026-11-22 — TUF/Fulcio/OIDC/Rekor independent-from-npm verifier gate

On Draft PR #73 only, npm11 diagnostic now runs the **reviewed, patched bundled**
Sigstore 4.1.1 / @sigstore/verify 3.1.1 / @sigstore/tuf 4.0.2, with a fresh
private TUF cache rooted in the Sigstore library's embedded public-good TUF
bootstrap. For each of the four exactly locked Babel packages the trust gate
re-fetches the exact public registry tarball and attestation URL (no secrets),
checks the lockfile SHA-512 SRI and signed subject digest, and requires an
in-toto provenance bundle with a Rekor **signed inclusion promise**. Its separate
Sigstore verifier requires a TUF-authenticated Fulcio chain, certificate
transparency proof, Rekor proof, and GitHub Actions OIDC issuer + Babel
repository-scoped workflow SAN policy. In the event of any failure, it records
a fixed allowlisted error category and **fails closed**; npm10's missing JSON
bundle support is reported UNSUPPORTED rather than falsely PASS.

The signer policy is repository-scoped to
`https://github.com/babel/babel/.github/workflows/*.yml@refs/{heads,tags}/*`;
it is NOT an exact publisher workflow/commit allowlist. The TUF initial trust
bootstrap comes from a reviewed npm-bundled Sigstore version, NOT an additional
out-of-band manually pinned Tio-Money trust root. Certificate or bundle content
is NEVER uploaded. No external code download, npm dependency override,
workflow privilege escalation, signature-gate bypass, or modified EAS lockfile.
A green result will prove only the specific sampled attestations, not the
root cause of historical intermittent npm10/Phase-0 failures. Preserve
Issue #71 and PR #65 security HOLD until separately dispositioned.


## 2026-11-22 — New required-CI recurrence and exact nested package identity
- Following merged PR #76, protected main is `44f033b83921c660797d610a3befa744ab832f9f`.
- Draft #73 safely reconciled head `8f19503c32fbee0c2475f8ecad1c6e9b14cdd076` triggered [Phase 0 run 45018065154](https://github.com/im-tnyx/Tio-Money/actions/runs/45018065154): mandatory `npm audit signatures` FAIL in isolated EAS preview test; exact error **`@babel/code-frame@7.29.7` invalid attestation**. Three no-secrets Sigstore jobs and Governance PASS on the same HEAD; no evidence of compromise or root cause.
- **Important nested lock boundary:** EAS lock contains root `@babel/code-frame@7.23.5`, three nested copies of the failed `7.29.7`, and additional nested copies of `7.10.4`. A proof must select all exact-version nested copies and require consistent official-registry tarball and SHA-512 SRI. Choosing the root version would silently prove the wrong artifact.
- This isolated follow-up adds the fifth exact `7.29.7` Babel target to signed tarball SRI, DSSE subject, TUF/Fulcio/OIDC/CT/Rekor checks. Node 26/npm 11 separately validates each registry `dist.signatures` P-256 ECDSA signature against the official npm registry signing public key pinned as SPKI SHA-256 `+xkKRiEjRDUAy822UZYj5xeenzjYStTpNity0raLYsE=`, matching current npm key ID `SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U` from npm's documented key endpoint. Explicitly distinguish an official-registry key pin from a Tio-Money out-of-band approved Sigstore TUF root (still UNVERIFIED). Registry packuments are read only and not published in artifacts or job logs.
- **No historical root-cause claim:** even if new CI passes, failure source remains UNVERIFIED; same-response replay across npm 10 and npm 11 has NOT been performed. Do not retry-until-green or modify EAS/root dependency lockfiles, app, credentials, main, #65 or rulesets. Keep #73 Draft, #65 HOLD and issue #71 open.

## 2026-11-22 — Owner-authorized next gate: registry ECDSA proof and nested version fix

The next evidence run on current protected-main-synchronized Draft PR #73 is expected to exercise `@babel/code-frame@7.29.7` nested exact-version copies, five pinned subject/SRI/DSSE/TUF provenance targets, and five independent registry P-256 ECDSA publish signature proofs. The official public npm registry signing key ID `SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U` is compared with a statically pinned SHA-256 SPKI digest `+xkKRiEjRDUAy822UZYj5xeenzjYStTpNity0raLYsE=` (verified from the public npm docs key endpoint). No privileged token, external action or dependency changes. The existing mandatory `npm audit signatures` failure is a hard block, not replaced by alternative successful proofs. Out-of-band independently approved Sigstore TUF root and a true npm10/npm11 same-response replay remain UNVERIFIED. Do not declare the recurring error harmless, waive it, or merge either PR.

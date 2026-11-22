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


## 2026-11-22 — Same-captured-response Sigstore verifier differential and TUF root candidate

**Proceed scope:** Owner requested the next Issue #71 forensic gate after the
exact HEAD ed616df8 passed 6/6 checks. This work is limited to a no-secrets
diagnostic script, synthetic negative fixtures and one unprivileged read-only
job under existing Draft PR #73. No main, #65, app, EAS CLI lock, privileged
actions, secrets or ruleset changes.

**Same-response methodology:** On ONE isolated hosted runner select pinned
Node22.16.0/npm10.9.2 and Node26.8.2/npm11.19.1 toolchains with the
immutable reviewed setup-node SHA; preserve their separate built-in
Sigstore 3.0.0 and 4.1.1 libraries. Execute both libraries under the same
Node runtime, isolating one dimension of verifier behavior. For each of five
exact locked Babel packages, verify fresh tarball SHA-512 against committed
SRI and signed DSSE subject, fetch exactly ONE public SLSA attestation
response in memory, require nonambiguous Fulcio-backed provenance and a
signed Rekor promise, and verify the SAME parsed bundle bytes with both
libraries using the same issuer, Babel-workflow URI, CT/Rekor threshold
policy and distinct fresh TUF caches. Fail closed if either rejects; emit
only reviewed package IDs, bundle SHA-256, pinned library versions and
allowlisted verdicts. No raw bundle/certificates/private material uploaded.

**Limits:** This is a SAMPLED SAME-BUNDLE SIGSTORE LIBRARY comparison, not an
offline npm CLI v10-v11 audit-signatures replay. CLI-specific registry
metadata processing and original failing HTTP responses are not reproduced.
The historical failing response was not captured. Therefore historic root
cause and exact same-response CLI comparison remain UNVERIFIED even if both
current verifiers pass. No retry-until-green, check weakening or risk waiver.

**Out-of-band TUF root candidate:** Independently inspected the upstream
public sigstore/root-signing repository at immutable commit
25b222a48cda4aa88e1af85605bdd193f5619a60, metadata/root.json:
root version 16, expires 2027-04-22T19:27:31Z, root role 3-of-5
threshold and five present signatures. This inspection does NOT
cryptographically validate root signatures back to an independently
trusted older bootstrap; nor is it owner approved. npm10/npm11 embedded
Sigstore TUF bootstrap verification is separate. A Tio-Money-approved
independent root pin and an exact authorized Babel publisher workflow
ref remain UNVERIFIED / PENDING OWNER SECURITY POLICY; do not silently
replace or weaken the trust root.

**Acceptance:** New same-bundle job, previous 3 Sigstore runners, required
static/Governance and optional signal must report exact HEAD conclusions.
If any check fails, record the actual failure. Keep #71 OPEN, #73 Draft,
#65 HOLD and main protected. No merge permission implicit.


## 2026-11-22 — First-failure evidence capture gate (owner-directed PROCEED)

**Decision source:** Owner's chat "Go" in response to the scoped
"First-Failure Evidence Capture" next-gate recommendation. This is an
agent-transcribed technical PROCEED; NOT permission to merge, accept
attestation risk, weaken CI or change protected branch settings.

**Scope:** Draft PR #73 only. Extend both the isolated npm10/npm11 diagnostic
and the preexisting Phase 0 isolated EAS CLI security TEST. Add deterministic
negative tests and a first-failure fingerprint module. No app/Expo product
logic, EAS or root dependency lockfiles, privileged workflows, tokens,
rulesets or other PRs are modified.

**Evidence boundary:** Immediately after the FIRST npm audit signatures
invocation returns a failure, record exact allowlisted name@version from the
committed nested EAS CLI lockfile; npm/Sigstore versions where available;
SHA-256 of lockfile and original npm CLI stdout/stderr (never raw strings);
bounded error categories, failed exit status, invalid count and fail-closed
disposition. Explicitly declare the original npm HTTP registry response
NOT_CAPTURED_BY_NPM_CLI.

**Post-failure sampling:** With no retries, credentials, redirects or upload,
perform one bounded read-only public sample of the npm signing-key endpoint
and at most three exact, lockfile-identified Babel package attestation and
packument endpoints. SHA-256 digest and byte-count only; stream hashing
without storing raw HTTP bodies or headers. Timestamp boundary is labeled
AFTER_FIRST_NPM_CLI_FAILURE. Any network/validation failure is UNVERIFIED,
never a substitute for the original response and never a green-check waiver.

**Tests and security:** Synthetic fixtures assert correct nested versions,
no secret/raw-string logging, injected unknown package rejection, no
arbitrary HTTP target selection, bounded digests, error redaction,
transport-failure UNVERIFIED, and never-promote-first-failure behavior.
No ID-token write permission or privileged workflow. The diagnostic's
second npm JSON observation cannot cancel the first failure. A current
green run proves only implementation tests, NOT a captured historical failure.

**Remaining:** Historical intermittent npm10/Phase0 invalid attestations,
independent Tio-Money-approved out-of-band Sigstore TUF root and exact
Babel publisher workflow-ref policy remain UNVERIFIED. Issue #71 OPEN;
PR #73 Draft/unmerged; PR #65 Security HOLD; no merge or risk acceptance.


## 2026-11-22 — Gate 2 Controlled Same-HTTP-Response npm10/npm11 pacote differential

**Decision:** Owner's next "Go next" after reviewing the First-Failure Capture evidence
authorizes ONLY this scoped diagnostic development, not branch merge, release,
security-risk waiver or trusted-root policy change. [Issue #71 RFC/proceed](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079157593).

**Threat and evidence boundary:** Draft PR #73 prior exact HEAD e4e08e02
contained a real fail-closed npm10 observation for
@babel/helper-module-transforms@7.29.13. Its later public registry snapshots
are NOT the original failing HTTP response; actual historic cause is unknown.
The existing Sigstore3/4 comparison used the same DSSE in-memory bundle but
not npm's package metadata/registry fetch/attestation integration.

**Implementation:** A new no-secrets, SHA-pinned, contents:read GitHub
same-pacote job independently selects preinstalled pinned Node22/npm10.9.2
and Node26/npm11.19.1 without npm install/CLI override. On the SAME Node
runtime, capture a bounded one-time official npm public FULL packument and
attestation response per five exact EAS-lock Babel targets, plus the public
keyset. Before either client uses them, check exact lockfile blob, version,
tarball SHA-512 integrity, trusted public registry P256 ECDSA SPKI key pin,
signatures and provenance identity. Only in-memory bytes are served to BOTH
built-in pacote registry/attestation verification paths through a
GET-only 127.0.0.1 local loopback endpoint; strict URL allowlist, no
redirect, no auth, no raw bodies or certificates in CI output. Use
separate ephemeral TUF/cache directories, no retries; both library paths
must request the same full packument and attestation bytes once each and
independently accept them. Rejection or unexpected network request
FAILS CLOSED and is reported only as a bounded status. Synthetic fixtures
test spoofed paths/identities, negative and positive frozen-replay verdicts,
no raw secret output.

**Limitations:** This is a SAMPLED SAME-PUBLIC-HTTP-RESPONSE **pacote** verifier
comparison, not interception of the original npm CLI failed request,
not an entire npm audit signatures CLI replay, not proof of harmlessness,
not a trusted independent out-of-band Sigstore TUF root or exact
owner-approved Babel publisher workflow ref. The separately tested npm
signature/attestation gate remains required, not modified. If new CI is
red, preserve the failure as evidence rather than rerun-until-green.

**Excluded:** main, PR #65, EAS/root dependency lockfiles, EAS tokens,
security ruleset, production Expo/finance code, trusted preview workflows,
environment permissions and auto-merge. PR #73 stays Draft; Issue #71 open;
PR #65 security HOLD, manual reviewer optional.


## 2026-11-22 — Gate 3: Sigstore public root signing-chain crypto check

**Scope:** Owner's "Go next" after successful frozen npm10/npm11 pacote
comparison; agent-transcribed decision in [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7079714316).
This authorizes implementation of an evidence-only diagnostic, NOT
changing Tio-Money's trusted TUF root, weakening CI or merging a PR.

**Method:** From a *pinned immutable public GitHub upstream commit*
25b222a48cda4aa88e1af85605bdd193f5619a60, fetch Sigstore
root-signing's metadata/root_history/{1..16}.root.json and
metadata/root.json using strict HTTPS host/path, no secrets/redirects,
bounded memory. Reconstruct TUF canonical JSON and verify
ECDSA P-256 SHA-256 signatures with distinct key IDs; version N+1 must
meet previous AND new root-role signature thresholds. Root v1 must
be self-signed to its threshold, v16 must equal current published root
and have non-expired root metadata. Historical expired versions
are cryptographic lineage evidence, not a current rollback window.

**Non-goal/trust boundary:** The source-provided historical root v1 is
*not* separately vouched for by an independently trusted, owner-approved
out-of-band source. Even if 15 rotations verify, the ONLY allowed
conclusion is ROOT_CHAIN_SIGNATURES_VERIFIED_FROM_UNAPPROVED_BOOTSTRAP.
An approved Tio-Money root fingerprint and rotation policy, exact
authorized Babel workflow ref, and historical original-failed npm
HTTP response/root-cause remain UNVERIFIED. No trust config changes.

**Tests:** Signed synthetic ECDSA root chain; canonical JSON; tamper,
insufficient old/new thresholds, duplicate signer, rollover gap,
expired candidate, invalid root role, immutable source restriction and
untrusted bootstrap distinction. CI new read-only pull_request root-chain
job with SHA-pinned actions and no install/new packages, OIDC, token
access, artifact upload or privileged triggers. Recheck all exact-head
required statuses and preserve any FAIL, never retry-until-green.
PR #73 Draft, PR #65 Security HOLD, Issue #71 OPEN.


## 2026-11-22 — Live legacy v4/v5 bridge evidence and revised modern-root gate

**Initial exact-head failure:** The first v1-to-v16 canonical+ECDSA root
history diagnostic on Draft PR #73 HEAD ae7449e0 failed closed at v1
due old Sigstore root keys serialized as SEC1 uncompressed 04||X||Y
hex, not PEM SPKI. Fix commit 4d90da3f added strict legacy-P256
encoding and a synthetic negative fixture. On this actual HEAD,
8/8 synthetic tests PASS, while the real chain reached v5 and
failed TUF_SIGNATURE_THRESHOLD_NOT_MET. In exact, immutable upstream
root history, root v4 to root v5 changes all five root role key IDs;
new metadata lists both old and new signer identities, but our
standalone general-purpose verifier cannot cryptographically establish
the predecessor threshold.

**Authoritative upstream explanation:** Sigstore documentation
https://docs.sigstore.dev/cosign/system_config/installation/ explicitly
says the historical root chain has a backward-incompatible format
change requiring manual verification, and recommends bootstrapping
the modern chain from root version **10**. Sigstore root-signing Issue
#329 (key encoding incompatibility) documents hex-vs-PEM migration.
We must NOT auto-translate key IDs, discard a failing signature or
silently mark the v1->v16 chain trusted; **v4->v5 remains UNVERIFIED**
unless an independent manual cryptographic continuity audit plus
owner trust policy is recorded.

**Revised scoped diagnostic:** Use the recommended v10 bootstrap
instead, fetched from the SAME immutable upstream Git commit, to
verify cryptographically all 6 transitions v10->v16 (both predecessor
and successor signature thresholds). Require published root v16 to
match signed history v16 and be unexpired. Report exactly
MODERN_ROOT_V10_TO_V16_VERIFIED_FROM_UNAPPROVED_BOOTSTRAP on success;
historical v1-v10 and v4-v5 bridge remain UNVERIFIED. This does not
pin an independently approved out-of-band v10 SHA-256 nor change npm's
TUF trusted bootstrap. Capture actual exact-head CI rather than
inheriting old red or green results. Owner policy and historical npm
attestation cause still HOLD.


## 2026-11-22 — Root signature failure explained by TUF OLPC vs JCS encoding

**Exact current evidence:** Draft PR #73 modern v10-to-v16 diagnostic
HEAD dd9833f1 again failed closed at its bootstrap root v10 with
TUF_SIGNATURE_THRESHOLD_NOT_MET despite correct PEM key scheme,
signature identities and 3-of-5 threshold. The earlier v1-v4 check
passed with no PEM newlines; root v5+ introduces multi-line PEM strings.

**Verified canonical format discrepancy:** The TUF/OLPC canonical JSON
signed bytes escape ONLY literal backslash and double quote; they DO
NOT escape newline characters in PEM public-key strings. Our initial
checker used JSON.stringify, which wrote \\n instead of a real linefeed
byte, so the signed bytes changed. See TUF-compatible
canonical_json documentation (sigstore_tuf) and the official historical
Sigstore key-format migration issue. This is a **diagnostic
implementation bug**, NOT evidence of invalid upstream signatures,
key compromise or a supply-chain incident.

**Corrected gate:** Strict no-new-dependency OLPC canonical encoding,
including literal PEM newlines and SEC1 historical public-key hex.
Now cryptographically retry public v1->v16 transitions under separate
old/new root-role thresholds, no threshold downgrade or skipped root
rotation. The original root v1 is still obtained from the pinned
*upstream Git commit*, NOT independently validated against the public
2021 signing ceremony or approved as Tio-Money's bootstrap. Thus even
a correct proof can assert only *internal cryptographic continuity
from an unapproved bootstrap*. It cannot change TUF trusted settings,
resolve historical npm10 HTTP/attestation root cause or authorize
merging PR #65/#73. If the new chain fails, classify FAIL_CLOSED.


## 2026-11-22 — Sixth exact target and first-response boundary follow-up

Owner chat `Go follow agent.md` documented under Issue #71 comment 7079959825 permits scoped Draft #73 diagnostic work. Required Phase 0 first-failure on `338a5e32` reported `@babel/types@7.29.15` in addition to `@babel/helper-compilation-targets@7.29.13`. The existing immutable EAS lock has exact root `@babel/types@7.29.15`. Add it as a sixth mandatory target for independent locked SRI, provenance, Sigstore and npm registry ECDSA verification and the frozen-public-response comparison; synthetic missing/wrong-version and redaction tests fail closed. This does not capture the historical failed npm HTTP response or establish cause. Actual first-response-boundary interception remains UNVERIFIED until its exact data path can be demonstrated without changing mandatory Phase 0 verification or logging raw responses. Do not rerun CI to manufacture a pass. Keep #71 OPEN, #73 Draft, #65 HOLD, owner-approved TUF bootstrap UNVERIFIED; no merge or risk acceptance.


## 2026-11-22 — One instrumented npm10 first-response-boundary diagnostic

**Decision:** Owner chat `Go` after read-only audit, continuing the bounded Issue #71 RFC at issue comment 7079959825. One new `pull_request`-only no-secrets job on Draft #73, not the mandatory Phase 0 `static` test. During one isolated EAS-lock `npm audit signatures` invocation, a reviewed CJS preload wraps the bundled make-fetch-happen boundary. It hashes the bounded bytes consumed by the instrumented JSON reader for first live official-registry packument and attestation responses for exactly `@babel/helper-compilation-targets@7.29.13` and `@babel/types@7.29.15`. Raw bodies stay ephemeral in process memory; logs contain only allowlisted package IDs, SHA-256, size, order/count and sanitized first npm error summary. Use empty npmrc/cache, no credentials, no artifact upload, no retry or signature bypass. Any first verification failure remains a failed job. Missing/oversized evidence reports UNVERIFIED/FAIL_CLOSED. Synthetic identity, size, missing response and redaction tests validate the boundary. This **instrumented** npm10 path may alter timing and is not a replay of the old static failure; the original first-failure HTTP bytes remain NOT_CAPTURED. A green run proves only current sampled response acceptance. Root cause and independent owner-approved TUF trust anchor remain UNVERIFIED. If the instrumentation introduces a bug or privilege issue, revert only this scoped Draft PR commit.


## 2026-11-22 — Initial tap preloader failure and separate true npm10 recurrence

First isolated HTTP-boundary job on `6bb1c9cc` failed **before capture**: npm executable symlink was used as a module resolution base, so bundled `make-fetch-happen` was not found; empty CLI stdout and nonempty stderr hash, no captured target response. This is an implementation defect, not a provenance verdict. Fix uses `realpathSync(process.argv[1])` to locate actual `npm-cli.js` before `createRequire`, with a symlink fixture. Local Node24 `npm --version` under the repaired preloader PASS; local Node22/npm10 and networked target audit NOT_RUN outside GitHub. The separate uninstrumented npm10 clean-a on the same pre-fix HEAD genuinely failed mandatory `npm audit signatures` for `@babel/code-frame@7.29.7`, first stdout SHA-256 `4f4a3faf66e0809fedc81a063db8025fda4a189e3130e0a3f6dc7eeb362ef439`, lock SHA-256 `664b9505a3eff95735f8aad055338cb0402015d35852c5286aba5a40ebaa4aff`; no first HTTP body captured. Node22 clean-b, npm11, other forensic checks and required static/Governance PASS. Preserve genuine failure; no rerun until green. New fix HEAD CI must be observed separately.


## 2026-11-22 — JSON reader boundary after clone interception failed

On HEAD `298b626f`, isolated tap job reached TARGET_RESPONSE_SEEN but failed before hashing; npm10 clean A/B and required static/Governance PASS. The failed clone is a diagnostic instrumentation problem, not a confirmed npm provenance finding. The reviewed replacement wraps the target response's `json()` reader: consumes the same bounded response bytes once via `buffer()`, hashes those bytes, parses JSON in-memory, returns the object to npm. No extra registry GET or raw body output. Unlike the unmodified CLI, this instrumented parser may change timing and error classes; never equate a green result with original failing static HTTP bytes. Synthetic local fixture verified a targeted JSON response hash with no body in the report. Exact-HEAD CI remains the acceptance gate.


## 2026-11-22 — HTTP-boundary reader cap semantics: scoped fix

**Owner direction:** "Go" after the read-only Gate 1 recommendation; recorded as
agent-transcribed technical PROCEED at [Issue #71](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7080458729). NOT authorization to merge,
accept supply-chain risk, change TUF root pin, or modify production privileges.

**Pre-fix exact HEAD:** Draft PR #73 a0ac978e8dfb76faf7d969adf1283c04d049cced,
isolated HTTP-boundary job 137234370007 FAIL_CLOSED, tap stage
TARGET_RESPONSE_SEEN then incomplete (no hash), npm CLI stdout empty,
stderr fingerprinted, invalid attestation identities UNVERIFIED. Required
static/Governance PASS. Do not infer actual npm package compromise.

**Root cause of diagnostic failure:** Installed npm 10.9.2 bundled
minipass-fetch Body interprets positive response.size as the expected
**exact** length and pipes into MinipassSized. The previous preload set
response.size to 8MiB expecting a maximum; smaller bodies therefore fail.
Existing test used a Buffer mock which bypasses that streaming behavior.

**Fix:** Do not mutate response.size. For the two exact locked
@babel names only, consume response.body via bounded async iteration
(or bounded Buffer path), abort/destroy on >8MiB, hash bytes actually
used by instrumented JSON.parse, and never persist/render payload. On
unsupported chunks/body, too-large stream, network error or invalid
JSON, return a fixed allowlisted local failure category only and keep
the first npm audit signature failure as CI FAIL_CLOSED. Test with a
real streamed response and a property setter that rejects setting size;
negative tests for over-limit stream and malformed JSON, plus no raw
secret/token output. Distinguish decoded/parsing bytes from original
unmodified registry HTTP wire bytes; instrumentation may change timing.

**Scope:** Diagnostic preload, synthetic tests, diagnostic status
allowlist, task/index only; EAS/root lock, npm signature requirements,
production app, protected main, PR #65, privileged preview workflow
and security rulesets unchanged. No force push, CI retry-until-green,
secret access or merge. Acceptance is fresh exact-head CI and independent
code-review disposition; historical cause / owner approved TUF root
remain UNVERIFIED. Roll back only this scoped Draft PR commit if
instrumentation remains unsafe.

## 2026-11-22 — Gate 4: historical exact-lock HTTP first-failure correlation

**Owner authorization:** Chat `Go` following read-only comparative audit; bounded technical PROCEED recorded at
[Issue #71 comment 7080890333](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7080890333).
This is NOT merge authorization or risk acceptance.

**Gap and fix scope:** Previously the isolated instrumented npm10 one-time
`npm audit signatures` capture only covered two Babel package identities.
A future first failure on another historically observed exact locked identity
could lose the relevant safe HTTP fingerprints. Expand the literal allowlist
to seven recorded exact EAS-lock identities, including nested code-frame and
traverse; exclude `7.29.14` versions from older lock graphs. The unchanged
verified locked EAS manifest/blob remains the authority. Capture only
official-registry matched packument/attestation responses, SHA-256/byte count
for bounded decoded JSON bodies, and sanitized 4XX/5XX/OTHER or fixed
fetch/body failure categories; **never raw HTTP, headers, certs or secrets**.
On a naturally occurring first audit failure, permit partial sanitized response
evidence and correlate only exact package identities reported from the lock;
the **first failed audit still exits nonzero / FAIL_CLOSED**. Current successful
sampled responses do not recreate an older uninstrumented failing response.
Instrumenting response.json can alter timing; no causal verdict is inferred.

**Boundaries:** Existing isolated `pull_request` security workflow, no
permissions or token/OIDC changes; no new package, lockfile, EAS, app, policy,
main, PR #65 or release work. Deterministic negative fixtures validate spoofed
IDs, old graph exclusion, non-200 class, partial failure, ordering, overflow,
digest and credential redaction. Retain Issue #71 OPEN, #73 Draft, #65
Security HOLD; independent owner-approved TUF bootstrap and exact publisher
workflow/ref pending. Record real exact-HEAD CI separately; failures not waived.

## 2026-11-22 — Gate 5: exact locked `@babel/helpers@7.29.15` first-response coverage

**Decision and review:** Owner chat `Go next` following the fresh genuine clean-a
first failure in [run 45035459798, job 137248093959](https://github.com/im-tnyx/Tio-Money/actions/runs/45035459798/job/137248093959).
The bounded forensic RFC/technical PROCEED is documented at
[Issue #71 comment 7081014363](https://github.com/im-tnyx/Tio-Money/issues/71#issuecomment-7081014363).
Active agent ChatGPT/GPT-6; this is **not** a merge approval or security risk waiver.

**First-failure evidence retained unchanged:** Existing PR #73 parent HEAD
`28d607b502d0fc5a4777e285a0357a3c8f8f9106` completed 9/10
exact-head checks SUCCESS, with a real independent npm10 clean-a
FAIL_CLOSED identifying `@babel/helpers@7.29.15` as one invalid attestation.
Same-lock first stdout SHA-256
`9ed138b55b93b7103d3b7f5b97cd06fafa36952b318ea404a84fd34335a464e2`.
That failing CLI's original HTTP bytes were **NOT_CAPTURED**.
The second JSON observation and a distinct instrumented runner passing
**do not** waive the first failure or establish its cause.
The immutable EAS lock SHA-256 is
`664b9505a3eff95735f8aad055338cb0402015d35852c5286aba5a40ebaa4aff`.
Exact `node_modules/@babel/helpers` v7.29.15 comes from official
npm registry with locked SHA-512 SRI; older v7.29.14 graphs are excluded.

**Scope:** Add this specific eighth identity to the existing in-process
no-secrets HTTP preloader and allowlisted report sanitizer. The instrumented
npm10 first `npm audit signatures` still uses its existing single invocation
with fixed response cap, exact npm version and fail-closed semantics. The original
two pass-boundary REQUIRED identities remain unchanged. Deterministic
synthetic fixtures must cover exact official packument and attestation URLs,
wrong-version/host/query exclusion, partial incident reporting, hashes,
zero raw body/credentials and no change to required coverage.
This is a capability for **future** first instrumented failures, not a
replay or same-response comparison of the prior uninstrumented clean-a failure.
No retry of historical red job.

**Boundary/hold:** No new PR, dependency, lockfile, CI workflow or permissions
mutation, privileged EAS workflow, app, deployment, signing policy, TUF root,
PR #65 or protected main change. Issue #71 remains OPEN, PR #73 stays
DRAFT/MERGE HOLD, PR #65 SECURITY HOLD; independently owner-approved out-of-band
Sigstore bootstrap/rotation policy, approved Babel publisher workflow ref and
historical npm10 causal explanation remain UNVERIFIED. Independent human
review optional but strongly recommended, record its actual disposition.

# TM-SEC-EAS-20261122-001 — Isolated EAS CLI security triage and QR-free Expo Go non-regression

## Identity and authority

| Field | Value |
| --- | --- |
| Repository | `im-tnyx/Tio-Money` |
| Task ID | `TM-SEC-EAS-20261122-001` |
| Lifecycle | `VALIDATING`: advisory inventory tooling only; actual package repair **BLOCKED until verified registry resolution** |
| RFC and technical decision | [Issue #59](https://github.com/im-tnyx/Tio-Money/issues/59), `PROCEED WITH ISOLATED RESEARCH` (agent-transcribed, 2026-11-22) |
| Owner instruction | Chat 2026-11-22: "Go" to address EAS advisories while **preserving Android and iOS no-QR Expo Go testing** |
| Current agent/model | ChatGPT / GPT-6 (current chat, self-reported model) |
| Prior verified agent | `UNKNOWN_NOT_VERIFIED` for this scoped task |
| Current branch | `security/eas-cli-advisory-gate-59-20261122` |
| Verified base `main` | `d765c97d71ba600b1838f34d180159855ac67dc1` |
| PR | Created separately after branch checkpoints; verify live PR and HEAD before any action |
| Independent review | `DEFERRED` pending concrete npm-resolved security fix; strongly recommended |
| Owner merge authorization | **NOT_GRANTED for the new PR**; PR #53 authorization does not transfer |
| Timestamps | Calendar date 2026-11-22, actual UTC time not verified |
| Git author/reviewer | Must be independently verified against live GitHub |

## Security and architecture

**Problem:** Owner screenshots reported 17 High Dependabot alerts, all marked transitive in the isolated `.github/preview-eas-cli/package-lock.json`. The EAS CLI is pinned to `27.4.1` and used only by a distinct owner-gated manual EAS preview workflow. Its `npm ci --ignore-scripts`, registry SHA-512 lockfile verification and `npm audit signatures` must survive all repairs. Lockfile pinned direct parents may not accept blanket transitive upgrades.

**Separate current user experience:** Root `package.json` uses `expo start --tunnel --go` for `npm run mobile`. `scripts/start-codespace-expo.mjs`, `.vscode/tasks.json`, Expo app identity and the trusted Codespaces preview worker implement QR-free Android/iOS Expo Go access. **Neither source nor root dependency tree is changed by this task**. CI contract tests cannot replace owner verification on both physical devices.

**Technical choice:** Read-only per-copy floor inventory and a deterministic regression test now; *no invented package-lock contents or integrity values*. A later candidate lockfile must come from a verified official npm registry resolver, not a hand-edit, and must pass all supply-chain checks. Reconsider upgrades to `eas-cli` / `eas.json` or workflow changes only in a separate owner-approved scope.

**Bounded file ownership:** `.github/preview-eas-cli/audit-security.mjs`, `tests/preview/eas-cli-security-inventory.test.mjs`, this task file and a brief additive `.ai/current.md` checkpoint. No changes to either root or isolated package manifests/lockfiles, existing workflows, native config, EAS tokens, Codespaces, app source, payments/finance/ledger/Auth, or protected branch.

## Researched advisory floors (triage only)

These are *minimum patched versions for the listed advisories*, **not** a promise of all 42 alerts cleared or all possible security issues eliminated. Inspect exact GHSA before accepting a candidate.

| Package family | Observed locked versions | Researched minimum by relevant release line | Source |
| --- | --- | --- | --- |
| `node-forge` | `1.4.0` | `1.4.1` | [TLS record DoS GHSA-8hrf-8g6f-7xwp](https://github.com/advisories/GHSA-8hrf-8g6f-7xwp) |
| `minimatch` | `3.1.5`, `5.1.2`, `9.0.9`, `10.2.6` | 3.x `3.1.4`; 5.x `5.1.8`; 9.x `9.0.7`; 10.x `10.2.3` | [nested extglobs GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74), [matchOne GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj) |
| `nanoid` | `3.3.8` | 3.x `3.3.18` | [zero size GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [negative size GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) |
| `joi` | `17.11.0`, `17.13.9` | 17.x `17.13.9` | [email DoS GHSA-4528-x5fx-h6hg](https://github.com/hapijs/joi/security/advisories/GHSA-4528-x5fx-h6hg); `isoDate` already fixed by 17.13.7 |
| `tar` | `7.5.19` | 7.x `7.5.21` | [recursion DoS GHSA-r292-9mhp-454m](https://github.com/isaacs/node-tar/security/advisories/GHSA-r292-9mhp-454m) |

Important: `minimatch` has **multiple distinct advisories**; fixing a single copy or GHSA is insufficient. The audit code classifies per-copy versions against these floors and fails closed on unknown release majors. Its non-zero `--strict` mode is for the **future remediation candidate**, not for blocking all existing product CI now.

## Exact commands and acceptance

Current environment with Node `22.16.0`, npm `10.9.2`: attempted `curl -IL https://registry.npmjs.org/node-forge` and `git ls-remote https://github.com/im-tnyx/Tio-Money.git HEAD`; both failed with DNS resolution errors. **No local installation, package signatures, npm audit, or physical-device tests performed** in this environment. GitHub CI must be checked on the eventual exact PR HEAD.

Read-only offline inventory:
```bash
node .github/preview-eas-cli/audit-security.mjs --json
node .github/preview-eas-cli/audit-security.mjs --strict
node --test tests/preview/eas-cli-security-inventory.test.mjs
```
`--strict` **is expected to fail** until vulnerable package copies are actually upgraded; it is not part of the existing `npm run check` gate.

**Only after official registry access and review, in a separate isolated remediation candidate:**
```bash
# On a CLEAN feature branch and only within the isolated EAS CLI directory.
# Never run npm audit fix --force, never invent resolved/integrity fields.
npm ci --prefix .github/preview-eas-cli --ignore-scripts --no-audit --no-fund --registry=https://registry.npmjs.org
( cd .github/preview-eas-cli && npm audit signatures --registry=https://registry.npmjs.org )
( cd .github/preview-eas-cli && npm audit --json )
node .github/preview-eas-cli/audit-security.mjs --strict
npm run check
```
Before merge: validate root plus isolated `npm ci`, `expo install --check`, preview and governance CI, exact HEAD, all GHSA affected ranges/false-positive dispositions, no changed trusted scripts or credentials. Preserve the existing source-only Codespaces preview allowlist; the tooling PR is deliberately **ineligible for privileged source-only preview**. Owner must reopen the already working app on **both Android and iOS Expo Go without QR**, including reconnect and refresh; report `OWNER_OBSERVED`, not agent-performed. Reject any new installation, Expo project relinking, login, native rebuild or server behavior change. Keep PR #53 and #58 separate.

## Risk, review, rollback and next checkpoint

**Security risk:** Vulnerable EAS tooling remains present on `main` while this preparatory PR is open; tests do **not** remediate it. The trusted EAS workflow must not be dispatched just to test this PR. Do not dismiss alerts and do not interpret zero new app dependencies as EAS tooling being secure.

**Rollback:** Close this PR / revert separately after approved merge; no deployed runtime or database to roll back. Do not bypass protections, force push, or enable auto-merge.

**Reviewer disposition:** `DEFERRED` (no independent reviewer has inspected this new HEAD yet). Existing security vulnerabilities remain blocking for claiming remediation and require review.

**Next safe action:** Verify exact PR HEAD and CI for this read-only tooling PR; in a network-enabled isolated **non-secret** resolver, generate and authenticate a full, unmodified npm lockfile update that satisfies EAS 27.4.1 constraints; if impossible without CLI identity change, return to RFC #59 for new decision. Revalidate Android/iOS no-QR experience before any merge.

## Follow-up — temp-only remediation candidate (2026-11-22)

Owner's latest **Next go** authorized the next bounded preparation step. Current Draft PR #60 adds an isolated non-default helper [`.github/preview-eas-cli/prepare-candidate.mjs`](../../../.github/preview-eas-cli/prepare-candidate.mjs) and [deterministic tests](../../../tests/preview/eas-cli-remediation-candidate.test.mjs).

**Default action is read-only:**
```bash
node .github/preview-eas-cli/prepare-candidate.mjs --plan
```

**Explicit `--candidate` in a network-enabled, unprivileged, clean environment only:**
```bash
node .github/preview-eas-cli/prepare-candidate.mjs --candidate
```

The command *only* creates a fresh OS temporary directory, copies the isolated manifest (never root `package.json`), proposes **version-qualified** overrides for five older resolved package versions, runs `npm install --package-lock-only --ignore-scripts`, `npm ci --ignore-scripts`, `npm audit signatures`, checks registry SHA-512 identifiers, exact `eas-cli@27.4.1` binary version and remaining `npm audit` High/Critical totals. It refuses unreviewed Babel pin drift and fails closed on mismatches. A successful output is **only an unmerged proposal**; it must be reviewed before copying either generated file onto an authorized change branch. The script never overwrites tracked source files, changes GitHub rules, starts Expo or deploys. It deletes failed temp candidates. No credentials are used.

**Known limitations:** This agent's runtime still cannot resolve the npm registry; the candidate has **NOT** been executed, generated, installed, attested, or device-tested. Specific advisories may require more than these five overrides; `--candidate` must reject remaining High/Critical findings. A successful candidate is **not** evidence of no risk and cannot replace independent supply-chain review, root exact-HEAD CI and **owner-observed Android plus iOS no-QR Expo Go reopen**. A repaired package-lock is not yet in the PR. No existing trusted EAS/Codespaces workflows changed. The new code adds no invocation to root npm scripts/CI beyond its deterministic tests.

**Current review/merge:** Security independent review remains `DEFERRED`; new exact-HEAD CI needs verification; the PR stays Draft. Owner PR-specific merge authorization `NOT_GRANTED`.

## 2026-11-22 verified npm candidate staged (not merged)

**Source:** Owner's “Go next” (agent-transcribed) after accepted Issue #59 technical proceed decision. **Scope extension approved for bounded security repair implementation, NOT for merging.** [Issue #59 implementation checkpoint](https://github.com/im-tnyx/Tio-Money/issues/59) records the pre-write security analysis. Current branch remains `security/eas-cli-advisory-gate-59-20261122`; initial validated dependency commit HEAD `ef9c91fa23379a865f94003c991ec613ee140dc8`. Recheck mutable refs and CI on final HEAD.

**Official-registry evidence:** The new *unprivileged, read-only token, no-secrets* [EAS candidate workflow run #44952056378, attempt 2](https://github.com/im-tnyx/Tio-Money/actions/runs/44952056378) passed temporary `npm install --package-lock-only --ignore-scripts`, `npm ci --ignore-scripts`, `npm audit signatures`, `eas --version` exactly `27.4.1`, and `npm audit --json`: **0 Critical, 0 High, 17 Moderate, 1 Low**. It also ran deterministic unit tests protecting Expo Go identity. The first attempt had an *invalid attestation* response for `@babel/helpers@7.29.15`; one same-SHA retry passed without bypass. A recurrence is a blocking CI finding, not to be suppressed.

**Candidate provenance and exact staged files:** `.github/preview-eas-cli/package.json` was reconstructed from runner job output (554 UTF-8 bytes, runner SHA256 `35a6b46d6a19e30dcd905f99bb3e1f4492af5c7da34e1f4aeabc8354b2cb1021`). `.github/preview-eas-cli/package-lock.json` from the same validated official npm run (227142 bytes, runner SHA256 `af3bb66d2ee4252fca7f5785e4818aacc60b02c008a8a4aaca3d8c49da25045f`). Both emitted base64 chunks were reassembled; byte lengths, exact manifest pins, official registry URLs, `sha512-` integrities and bounded version-diff were checked *before* staging via GitHub Contents API; no hand-edit of registry integrity or direct manifest dependency version was made.

**Diff against original isolated lockfile:** 11 existing package versions updated: `@babel/generator`, `@babel/helper-string-parser`, `@babel/helpers`, `@babel/parser`, `@babel/traverse`, `@babel/types` each `7.29.14 → 7.29.15`; `joi 17.11.0 → 17.13.9`; `minimatch 5.1.2 → 5.1.8`; `nanoid 3.3.8 → 3.3.18`; `node-forge 1.4.0 → 1.4.1`; `tar 7.5.19 → 7.5.21`. Two redundant nested `joi` copies removed; **no package paths added**. Two original exact signed Babel override pins remain. `eas-cli=27.4.1` and `typescript=5.9.3` unchanged. Extra Joi fixes scoped to `eas-cli@27.4.1` and `@expo/eas-json@27.4.1` exact parents, not a global Joi major change. `minimatch` patch only targets 5.x instance, no blanket major downgrade.

**Owned change scope for Draft PR #60 NOW (supersedes earlier prep-only list):** `.github/preview-eas-cli/package.json`, `package-lock.json`, `audit-security.mjs`, `prepare-candidate.mjs`; `tests/preview/eas-cli-security-inventory.test.mjs`, `eas-cli-remediation-candidate.test.mjs`; new `.github/workflows/eas-cli-security-candidate.yml` (only `pull_request`, same-repo PR #60, `contents:read`, no secrets, no persisted token, no privileged dispatch); this task record; additive `.ai/current.md`. No changes to existing `.github/workflows/tio-money-eas-pr-preview.yml`, Codespaces preview workflow or scripts, `eas.json`, root app `package.json`/`package-lock.json`, `app.json`, Expo SDK/native IDs, finance/identity source or settings.

**Remaining gates:** CI fresh *committed HEAD* not automatically proven by pre-commit successful candidate. Run new static/governance/candidate checks, inspect same-SHA signature/install/audit results and any review findings. Independent security review remains `DEFERRED` until evidence; **17 Moderate + 1 Low npm findings remain open in candidate** and must be separately triaged. GitHub Dependabot alerts on `main` will not clear before an approved merge/rescan. Owner's Android and iOS physical device **no-QR Expo Go reopen/reconnect/refresh** must be observed on a trusted base—do not dispatch privileged Codespaces preview for this `.github`-changing PR. **MERGE_AUTHORIZATION=NOT_GRANTED for PR #60**. PR #53 and #58 are separate and unmerged. Rollback by reverting isolated changes in PR #60, not by force push or loosening EAS verification.

## Merge-gate preparation checkpoint — 2026-11-22

**Owner instruction:** “Merge gate tak go” — move PR #60 through review/merge-readiness checks **without merging**. Initial audited PR HEAD `2f0e01b0c92f996d090f06e002c110f8806b188a`, protected main `d765c97d71ba600b1838f34d180159855ac67dc1`. All four recorded checks at that SHA PASS: static/Metro Android+iOS, Governance, signal, and temporary unprivileged candidate job. No unresolved review threads or formal approvals at that audit.

**Security review decision / cleanup:** The PR #60-only temporary workflow `.github/workflows/eas-cli-security-candidate.yml` had an exact PR number/head-branch guard. Its function was to collect *non-secret candidate npm resolution/signature evidence*. If merged, the workflow would become a stale, permanently skipped path for future PRs. It was **deleted from this feature branch before Ready for Review**, so no dead PR-specific workflow, extra runner attack surface, or large base64 lockfile logging is introduced to `main`. Prior job evidence remains available at [Actions run #44952518985](https://github.com/im-tnyx/Tio-Money/actions/runs/44952518985); that job is a historical check on the pre-cleanup SHA, **not a check on final HEAD**. Retained candidate-only script is a manual, opt-in, temporary, unprivileged helper, not a privileged workflow.

**Final intended PR scope:** root app, QR-free Codespaces/Expo Go, `app.json`, `eas.json`, trusted EAS workflow, privileged tokens, native config and all finance source still untouched. The two `preview-eas-cli` npm manifest/lockfile files contain official npm-generated patched High-advisory dependency graph. Tests `npm run check` and `npm run preview:test`, isolated `npm ci --ignore-scripts`, `npm audit signatures`, compatible EAS 27.4.1 identity and both Android/iOS Metro bundle checks must pass on final SHA. Historical candidate is 0 High / 0 Critical with **17 Moderate + 1 Low still outstanding**. Do not claim repo-wide scanning clear before merge/rescan. A previous `@babel/helpers` registry attestation response was transient in a same-SHA retry; fail closed upon recurrence.

**Review gate:** Independent security review strongly recommended and remains **DEFERRED / NOT PERFORMED** until actual reviewer evidence is obtained. A ruleset automatically requests Copilot code review on non-draft `pull_request`; any emitted comments must be assessed at **exact reviewed SHA**, not treated as approval without a formal APPROVED review. Zero unresolved threads before requesting review is only a snapshot; recheck after review and after commits. Document meaningful blocking security findings without dismissal or ruleset bypass.

**Owner acceptance gate:** Owner-observed **real Android AND iOS** Expo Go QR-free reopen/reconnect/refresh on the unchanged existing preview process remains **NOT VERIFIED** by agent and must not be inferred from Android/iOS Metro CI. Preview workflow excludes this `.github`-touching PR; do not loosen path allowlist or start credentials-bearing privileged preview merely to test it.

**Merge authorization:** **NOT GRANTED** for PR #60. Owner's present “merge gate tak go” requests gate preparation only. PR #53-specific conditional merge permission does not transfer. No force-push, merge, auto-merge, branch deletion, special GitHub setting change, token use or deploy is authorized. Recheck final base/head protection rules, exact check names, review threads/approvals and outstanding risk before any future specifically authorized merge. Maintain `IN_REVIEW / HOLD` while device QA/security review remains pending. No task archival.

## 2026-11-22 final remediation candidate — zero Moderate (latest checkpoint)

**Owner scope and security authority.** Owner instructed “Codex limit side krte h ab iske alawa solve krke merge ready bana hoga.” This waives only *reliance on unavailable Codex quota review*, **not** actual GitHub branch rules, authorizations or security findings. The earlier owner conditional merge authorization named PR #60 **before** a material expansion into major transitive dependency changes; `docs/POST-MERGE-SYNC.md` requires **renewed owner authorization for material changes**. NO MERGE in this phase; request explicit current-scope PR #60 authorization only after final checks and independent evidence.

**Signed and reproducible candidate.** In isolated Draft diagnostic [PR #62](https://github.com/im-tnyx/Tio-Money/pull/62), unprivileged [Actions run #44956163560](https://github.com/im-tnyx/Tio-Money/actions/runs/44956163560) at `c2fc3bd2e134f766fe33ed77927d0dbecd686d12` **SUCCESS**. No secrets, no EAS deployment, no root Metro changes. Official registry resolved `eas-cli@27.4.1`, TypeScript 5.9.3, signed Babel overrides; `npm install --ignore-scripts`, clean `npm ci --ignore-scripts`, `npm audit signatures`, CLI `--version`, `eas build --help` and `eas update --help` and dependency functional API smoke **PASS**. Temporary npm audit: **0 Critical, 0 High, 0 Moderate, 2 Low** (both Low package-level entries originate from the **same** `diff` advisory). The diagnostic runner, NOT the trusted privileged EAS worker, performed this work. Device tests and full EAS build/update remain unperformed.

**Candidate provenance.** Exact official npm-generated manifest 1298 bytes SHA256 `f4c5dbba1ae3ba950cec852a935f64312d05de4e6bab0663cc6a5950bed03884`; lockfile 213454 bytes SHA256 `664b9505a3eff95735f8aad055338cb0402015d35852c5286aba5a40ebaa4aff`. Files were reassembled from sanitized runner logs and validated for exact byte lengths, approved override set, direct package identity, official npm registry URLs and sha512 integrity, bounded change paths. These are NOT hand-edited lockfile hashes.

**Package graph change beyond earlier patch-only PR #60:** npm 525 → 499 entries. Five existing path-version changes: `@oclif/core` nested minimatch `10.2.6→11.0.1`, root glob `13.0.7→14.0.2`, glob nested minimatch `10.2.6→11.0.9`, root path-scurry `2.0.2→3.0.0`, root ts-deepmerge `6.2.0→8.0.0`; 1 new `@isaacs/nonrecursive-glob-match`, 27 old nested redundant paths removed. Existing root minimatch 5.1.8 and rimraf's old 3.x minimatch intentionally remain (not in current Moderate affected range). Expo/bunyan/rudder/xcode UUID nested 7/8 paths deduplicated to uuid11.1.1. All 19 manifest overrides are version- or parent-scoped, including Expo's glob/uuid replacement and EAS ts-deepmerge. **Material transitive API majors require special attention**: offline CLI help and library API smoke passing does **not** prove real EAS build/OTA behavior. No Expo account, project ID, preview or Codespaces workflow files changed.

**Permanent PR validation strengthened:** `tests/preview/eas-cli-locked-install.test.mjs` now checks `npm audit` Critical/High/Moderate exactly zero, Low ≤2 (cannot silently grow), verified `npm ci` / signatures, CLI exact version and build/update help plus library functional imports. `tests/preview/eas-preview-config.test.mjs` no longer incorrectly requires at least 500 installed packages (the resolver deduplicated safely to 499); it validates a substantial full lock and required package pins + registry sha512 integrities. `audit-security.mjs`, `prepare-candidate.mjs` and regression tests updated to current verified pins. **Final exact-HEAD CI must be checked after this task/index documentation update**, not inherited from historical logs.

**Known Low advisory / proposed disposition — NOT falsely closed:** The two npm Low entries correspond to `diff@7.0.0` direct [GHSA-73rr-hh4g-fpgx](https://github.com/advisories/GHSA-73rr-hh4g-fpgx), plus its `eas-cli` parent metavulnerability. Vendor advises patched diff 8.0.3; malicious patch-header line endings (`\\r`, `\\u2028`, `\\u2029`) can cause parsePatch/applyPatch denial-of-service. `eas-cli@27.4.1` directly pins diff7.0.0. A targeted major diff8 override in experiment [#44955688374](https://github.com/im-tnyx/Tio-Money/actions/runs/44955688374) **FAILED CLEAN NPM CI** due missing nested `ts-node` diff4.0.4, so it is **NOT adopted**. Risk reduction: trusted EAS Action is owner-only manual on `main`, validates immutable owner-authored source-only PR and uses no untrusted fork; the root Expo Go mobile app does not install this isolated tree; EAS CI's signature verification remains mandatory. **Exploitability not disproved**: we have not established every possible caller/data path to `parsePatch`/`applyPatch` in the packaged CLI. Propose documenting as residual Low risk requiring owner risk decision and later compatible upstream patch, not dismissing GitHub alerts or declaring fully vulnerability-free.

**Merge gate and rollback:** Independent Codex code review was unavailable due quota; **no formal approval** was fabricated. Active ruleset previously observed 0 required formal approvals, but recheck live rules, review threads, CI and any new findings before merge. Owner Android+iOS Expo Go QR-free test remains owner-reported baseline; actual deployment/physical testing of final PR head not performed. App/Expo SDK/root lockfile, `eas.json`, trusted Codespaces and EAS workflows, credentials, identities and secrets untouched. Current owner request permits making **PR #60 merge-ready** but not the immediate merge of materially expanded scope; **MERGE HOLD pending current-HEAD checks, Low-risk disposition/owner acceptance and renewed specific authorization.** Closing the test PR #62 unmerged prevents a one-off workflow entering `main`.

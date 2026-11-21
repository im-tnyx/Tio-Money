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

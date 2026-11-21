# Repository security baseline — setup and verification

**Status:** Configuration MERGED via [PR #58](https://github.com/im-tnyx/Tio-Money/pull/58) on 2026-11-22 IST. Source RFC and decision:
[Security baseline issue #57](https://github.com/im-tnyx/Tio-Money/issues/57).
**Observed on:** 2026-11-22. The facts below describe the then-current `main` SHA
`d765c97d71ba600b1838f34d180159855ac67dc1`, not a permanent attestation.
Re-check GitHub immediately before any merge or settings change.

## Verified facts versus unknowns

| Control | Observed on baseline | What this proves |
| --- | --- | --- |
| Default branch | `main` protected | The branch is marked protected |
| Active ruleset | `protect-main` #27567187 | PR required, non-fast-forward/deletion blocked, unresolved review threads required, zero required approvals, no bypass actors |
| Required status checks | Ruleset has strict policy but an **empty required-check list** | No named CI job is currently enforced by this ruleset |
| Existing workflows | Phase 0, governance, Codespaces/EAS preview and preview signal | These workflows exist; it does not make them mandatory |
| CodeQL workflow | None in `.github/workflows` | Does **not** establish whether GitHub CodeQL *default setup* is active |
| Dependabot version updates | No `.github/dependabot.yml` or `.yaml` on inspected `main` | A version-update policy was not present on that snapshot |
| Dependabot alerts, dependency graph, security updates | **Not verified** | Their enablement is a repository-setting state, not inferred from a missing YAML |
| Code scanning findings or Dependabot vulnerabilities | **Not verified** | Connector cannot read alert endpoints; do not claim zero findings |
| Legacy branch-protection endpoint | Integration returns HTTP 403 | No claim about hidden additional legacy settings |

The new [Dependabot policy](../.github/dependabot.yml) proposes weekly **version-update PRs** for
the root npm manifest and GitHub Actions, with at most two open PRs in each category.
Nothing auto-merges; sensitive isolated `.github/preview-eas-cli` dependencies are outside
the root npm directory scope. Proposals that change trusted EAS preview actions must
still receive a human security/attestation review. Configuration does **not** enable
Dependabot alerts or security updates by itself.

## Admin-only verification and decisions

These are operator steps, **not approval to change settings**. Request and record explicit
owner authorization before editing branch protection, enabling paid security features
or changing protected/security-sensitive repository settings.

1. Open [Settings → Advanced Security](https://github.com/im-tnyx/Tio-Money/settings/security_analysis).
   Check and record Dependency graph, Dependabot alerts and Dependabot security updates
   individually, including enabled/disabled/not-available and any active findings.
   Review findings without bulk dismissals; do not equate a disabled scanner with no risks.
2. On the same settings page inspect **Code scanning / CodeQL Default Setup** status
   and GitHub Code Security entitlement. This is a **private** repository: the
   appropriate GitHub Code Security license/plan may be required. Get express owner
   cost/feature approval first if GitHub offers an upgrade. Prefer one *default*
   CodeQL setup for this TypeScript repository once supported; do not add competing
   advanced-setup workflow blindly.
3. Open [rulesets](https://github.com/im-tnyx/Tio-Money/settings/rules)
   and [branch rules](https://github.com/im-tnyx/Tio-Money/settings/branches).
   Document any legacy protection and required checks. **Do not edit yet.**
   Candidate required check names, after checking that they reliably report on
   `main` PRs: `static`, `Governance / Python, links and commit attribution`.
   Exact, stable GitHub check contexts and their app sources must be selected in the UI;
   preserve existing PR, thread, and non-fast-forward protections. Do not enforce
   a signal-only or privileged preview as a required build without a separate review.
4. Review [Security findings](https://github.com/im-tnyx/Tio-Money/security)
   and record all blocking alerts with severity, disposition, and affected paths.
   If code scanning is unavailable, explicitly record **not run**, not **passed**.
5. After explicit settings authorization and any licensed feature decision, enable
   only approved controls, verify their first successful results, then independently
   audit actual ruleset behavior with a test PR. Never weaken required checks,
   enable bypasses, publish EAS builds, or change secrets for convenience.

GitHub guidance: [CodeQL default setup](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning/configure-code-scanning),
[private-repository availability](https://docs.github.com/en/code-security/reference/code-scanning/troubleshoot-analysis-errors/private-repository-enablement),
[Dependabot configuration](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-the-dependabot-yml-file).

## PR and merge boundaries

- Scope of this security-baseline PR: `.github/dependabot.yml` and this guide only.
  No source, auth, ledger, FX, packaging, migrations, secrets, native permissions,
  workflow execution or protected-rule modifications.
- Check exact PR HEAD, all CI/job conclusions, full diff, PR findings and formal review
  requirements. Independent security review is recommended and must not be faked.
- A new PR requires **separate PR-specific owner merge authorization** under
  [AGENTS.md](../AGENTS.md). The owner authorization given for currency PR #53 does
  not authorize merging a new security PR. No auto-merge or branch deletion.
- Currency PR #53 is a separate merge gate. Its device QA acceptance does not prove
  repository-wide vulnerability clearance or enable any security setting.
- To roll back the version-update policy, revert the configuration in a separate
  reviewed and owner-authorized PR; preserve a security/audit record.

## Verified terminal and active follow-ups — 2026-11-22 IST

- [PR #58](https://github.com/im-tnyx/Tio-Money/pull/58) merged via **non-force squash** at 2026-11-21 22:50:06 UTC / 2026-11-22 04:20:06 IST. Verified protected `main` resulting commit SHA: **`7d595bf334a2fd81c4e9e220fda00226c38d6305`**. Reconciled source PR HEAD: `d16b65aabef685a86c6fc616a4e0aae00b785e24`, latest verified base `c513e790f3729b24e4d85f08eac5ea96ba2fee51`. Owner explicitly requested **“Go to merge 58”** and exact-head `static`, `Governance` and `signal` checks all passed; 0 unresolved review threads and no branch-protection bypass. [Issue #57 terminal evidence](https://github.com/im-tnyx/Tio-Money/issues/57#issuecomment-7070466985).
- This versioned policy configures **weekly, bounded non-auto-merge Dependabot version-update proposals** for **root npm and GitHub Actions** only. It is **not** an activation or verification of Dependabot alerts, security updates, dependency graph, CodeQL, paid licensing or required status contexts. Existing EAS CLI isolated lockfile is not targeted for npm version-update proposals. Root Expo Go, Codespaces and trusted EAS workflow unchanged.
- Post-merge `.github/dependabot.yml` policy validation check reported **SUCCESS** on the PR #58 merge SHA, and **both** Dependabot version-update jobs later completed **SUCCESS**. This supersedes the earlier one-pending snapshot; successful jobs only establish update proposal processing, **not** a repository-wide vulnerability clearance, CodeQL scan or real Android/iOS device test.
- Admin-only tasks **remain OPEN** under Issue #57: inspect CodeQL/default setup and private-repo eligibility; verify actual Dependabot alerts, update settings and dependency graph state; inspect legacy branch rules/required contexts with repository owner permission. Never enable/disable premium features, modify branch rules or auto-merge bot PRs without separate owner approval. Any future Dependabot update PR requires normal code/attestation review and checked current HEAD.

## 2026-11-22 — Follow-up bot PR triage and alert visibility gap

- **Bot PR gate:** [#64](https://github.com/im-tnyx/Tio-Money/pull/64) (`actions/checkout@v4` to v7) and [#65](https://github.com/im-tnyx/Tio-Money/pull/65) (`actions/setup-node@v4` to v7) each have failing `static` due to existing immutable Action-SHA assertions in `tests/preview/`. They touch **trusted EAS/Codespaces preview workflows**: do not relax/delete the guard assertions or auto-merge. A separately reviewed coordinated SHA/provenance, workflow-permissions, action-runtime and test update with fresh checks is required; keep historical rejected bot branches intact pending decision.
- **Expo package gate:** [#66](https://github.com/im-tnyx/Tio-Money/pull/66) proposes `react-native-svg@15.16.1`, while current Expo 58 `expo install --check` expects `15.16.0`; [#67](https://github.com/im-tnyx/Tio-Money/pull/67) proposes `react@19.3.1`, while Expo 58 expects `19.3.0`. Both `static` runs FAIL at compatibility verification. Do not override Expo's pinning or blindly merge; keep existing React/React DOM and SVG compatible until a separately tested coordinated Expo/React upgrade. Version-update proposals do not necessarily fix alerts.
- **Dependabot security alerts:** Repository owner reported **one Moderate and one Low** open alert. This connected GitHub API does **not** expose their advisory/package/manifest data (alerts endpoint access rejected); therefore **package, GHSA, reachable code path and patched version remain UNVERIFIED**. The historical isolated EAS CLI `npm audit` result of **2 Low entries** is not interchangeable with GitHub's open-alert count. Inspect each alert in the owner [Dependabot Security UI](https://github.com/im-tnyx/Tio-Money/security/dependabot), record affected manifest path, package/transitive parent, version ranges, GHSA, exploitability and compatible fix in Issue #57, then address Moderate first in a dedicated bounded security PR; do not dismiss any alert without a separately evidenced decision.
- **Source/scope and permission:** PR #53 currency/FX is separately open with 3/3 core CI PASS after non-force reconciliation; no physical Android/iOS QR-free UI/refresh/a11y acceptance observed. PR #68 is documentation only. Nothing here authorizes merge of #53/#64–#68, editing repo security settings, secret access, privileged previews or auto-merge.

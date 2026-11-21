# Repository security baseline — setup and verification

**Status:** Proposed configuration on an unmerged feature PR. Source RFC and decision:
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

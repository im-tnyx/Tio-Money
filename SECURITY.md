# Security Policy — Tio-Money

Tio-Money is an actively developed, private finance application. Security reports matter even when a feature is experimental or not yet shipped. This policy explains the current support boundary and how to request a confidential reporting channel without exposing sensitive information.

> **Current private-development policy (2026-11-22):** The owner has deferred creating a dedicated security reporting mailbox until release preparation. No project-designated external confidential reporting endpoint is verified, and GitHub's **Report a vulnerability** feature must not be assumed enabled for this private repository. Existing trusted private maintainer contacts and metadata-only requests are the interim options below. A verified reporting email is a mandatory **pre-external-release gate**, tracked in [release security issue #77](https://github.com/im-tnyx/Tio-Money/issues/77).

## Supported versions

| Code line | Security support |
| --- | --- |
| Current `main` (pre-release development) | Reports are triaged on a best-effort basis; fixes, where accepted, target the actively maintained code line |
| PR branches, experimental builds and historical preview snapshots | No separate security maintenance promise; report vulnerabilities against their exact commit and relevant current `main` behavior |
| Stable/published releases | No stable release line is designated as supported by this policy |

This table does not claim that code scanning, dependency alerts, third-party audits or vulnerability reporting features are enabled, or that the application is production-ready. Verify current repository state before treating a release or build as supported.

## Mandatory security reporting release gate

**RELEASE HOLD until verified:** Before the **first external beta or public/production distribution** (including TestFlight external testers, Google Play external testing or public app-store distribution), the maintainers must satisfy and document [issue #77](https://github.com/im-tnyx/Tio-Money/issues/77):

- Establish a dedicated, project-controlled, confidential security reporting email address and confirm a safe test message is actually received. Do not publish a placeholder, invented mailbox or personal contact.
- Assign responsible security triage recipients, monitoring and continuity coverage, and an appropriate confidential handling/escalation process.
- Update this file with the verified contact, supported released versions and coordinated-disclosure guidance; verify external discoverability and complete security-owner/release-owner review.
- Record a release checklist decision and **block external release** if the reporting route or required evidence is missing. An equivalent alternative intake requires a new explicit owner decision documented in issue #77.

**Not required during current internal development:** This release gate does not block private coding, CI, internal Expo Go smoke tests or a separately authorized documentation-only PR merge. The gate is a **documented policy, not an automated GitHub Actions enforcement check**; any future automation requires a reviewed, separately authorized change. Email setup is intentionally deferred until release preparation.

## Reporting a potential vulnerability

**Do not post exploit details, credentials, private financial information, reproduction logs, or proof-of-concept code in ordinary GitHub issues, PRs, Discussions, screenshots or public messages.** A private repository is not the same as a restricted security-response channel: many collaborators may see its issues.

1. **If you already have a trusted, private communication channel with the repository owner/maintainer, use that channel** to request a security triage conversation before sharing sensitive technical details. Confirm that the recipient is the intended maintainer.
2. **If you have repository access but no verified private channel,** you may open a **metadata-only security contact request** in this private repository, linking to this policy. Say only that you need a confidential route to report a potential vulnerability. **Do not include the vulnerability itself, affected secrets, or exploit steps** in that request.
3. **If you have no repository access and no established private contact,** there is currently **no verified external reporting route** to publish here. Do not guess a `security@` email address or send details to an unverified account. The owner has deferred creating a dedicated mailbox during internal development; a real confidential reporting route **must** be established before any external release under [issue #77](https://github.com/im-tnyx/Tio-Money/issues/77).

GitHub's private vulnerability reporting for outside researchers is documented for public repositories; this project's private status must not be mistaken for an enabled or accessible reporting feature.

Once a trusted private channel has been established, a useful report includes:

- A short description of the weakness and plausible impact, with affected feature, repository paths, version or exact commit SHA.
- Reproduction conditions and minimal, **non-destructive** steps using synthetic data, with clear expected versus actual behavior.
- Severity rationale, required privileges, platform (Android/iOS, Expo Go, backend or CI) and any known mitigations.
- Sanitized logs or hashes only when necessary; **never** share API keys, GitHub/EAS tokens, recovery secrets, access credentials, real account information or unredacted personal data.

If a flaw may already have exposed user data, credentials or financial records, request urgent private triage through a verified channel; do not expand testing against real users or attempt self-directed data access.

## What to report

Potentially in scope: sensitive financial-data exposure, transaction-integrity or balance corruption, authentication/authorization flaws as identity services are introduced, device-storage and backup encryption risks, permission/privacy problems, malicious dependency behavior, compromised build or artifact provenance, CI trust-boundary violations and secret leakage.

For package-signature and npm/Sigstore attestation anomalies, preserve fail-closed verification and reference the existing [forensic tracking issue #71](https://github.com/im-tnyx/Tio-Money/issues/71) **without posting new confidential payloads there**. A passing retry is not by itself proof of root-cause resolution.

Routine UI bugs, feature ideas and non-sensitive documentation corrections can follow the normal issue/PR process.

## Handling and coordinated disclosure

Maintainers should verify the reporting channel, limit distribution to appropriate responders, acknowledge and assess reports when possible, preserve evidence, identify affected builds/commits, and plan a scoped fix with tests and regression checks. For build/signing concerns, retain mandatory verification gates; do not bypass provenance checks to make CI green.

The reporter and maintainer should agree privately on a reasonable disclosure plan where applicable, after evaluating user safety, mitigation availability and fix readiness. Do not assume a public advisory can be created on this private repository or that a CVE will be issued.

**No guaranteed acknowledgment, fix or disclosure SLA is currently committed.** This document does not authorize vulnerability exploitation, access to other users' data, production changes, repository-policy edits, bypasses, privileged builds or merges.

## Related governance

- [Security baseline and operator verification](docs/security/SECURITY-BASELINE-SETUP.md)
- [Contributor and agent controls](AGENTS.md)
- [Interim reporting policy decision and review](https://github.com/im-tnyx/Tio-Money/issues/75)
- [Mandatory pre-external-release reporting gate](https://github.com/im-tnyx/Tio-Money/issues/77)

Any modification of security settings, code, deployment configuration, secrets or protected branches requires its own authorized change process. A reviewed policy file alone does not establish security compliance.

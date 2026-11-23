# 🔒 Privacy and security rules — quick route

**Canonical:** [PRD](../../docs/product/PRD.md) · [Architecture `09](../../docs/architecture/TECH-ARCHITECTURE.md#09--privacy-security-and-backups) · [Import flow](../../docs/product/USER-FLOWS.md).

- The core product works offline without bank credentials, OTPs or a required cloud account.
- Least data and least privilege: no unrelated raw SMS, OTPs, banking passwords, secrets, full account identifiers or finance payloads in logs/task notes.
- User-reviewed SMS/text/CSV import candidates never book money until validated, deduplicated and confirmed; treat imported content as untrusted.
- **Expo Go cannot use custom Android SMS inbox readers**; Android native/SMS permission integration is a separate policy/owner decision. iOS offers no automatic full inbox access to ordinary third-party apps.
- SQLite local sandbox is **not proof of encryption**; app lock is not DB encryption. Future keys, backup, sync and cloud/Auth services need separate security architecture and owner permission.
- Use parameterized SQL, transaction atomicity, defensive parse limits and integrity checks; avoid leaking personal/financial details in test fixtures and screenshots.
- Governance discussions explicitly assess applicable threats: forged/stale approvals, branch/file-owner collisions, broken context links, sensitive content in RFC/task logs, untrusted Markdown, path traversal/symlink redirection and reviewers assessing an outdated SHA. Require owner-linked decisions, minimum necessary retention, dry-run link maintenance and GitHub source revalidation.
- A `COMMENTED` review, missing scanner, quota-limited Codex run or copied checkbox does not prove independent security review; record exact coverage and outstanding risks.
- Governance tasks may document risks; they do not authorize enabling permissions, deployments or changing repo security settings.

If a requirement conflicts with privacy, stop the sensitive change and record the exact approval needed.

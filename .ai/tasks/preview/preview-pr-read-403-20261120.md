# TM-OPS-PR403-20261120-001 — Trusted PR metadata diagnostic

- **Repository:** `im-tnyx/Tio-Money`
- **Owner request:** ChatGPT conversation 2026-11-20, repair failing Codespaces PR preview.
- **RFC and technical PROCEED:** [Issue #19](https://github.com/im-tnyx/Tio-Money/issues/19); agent-recorded, **not merge permission**.
- **Status:** diagnostic-only implementation on `fix/preview-pr-read-403-diagnostics`, based on `main` `fd154db417b1979d39f855317f252eed37c36e9d`. Independent review **DEFERRED** until PR current-head validation; strongly recommended because a privileged workflow is touched.
- **Root cause:** **UNKNOWN** pending GitHub `X-Accepted-GitHub-Permissions` evidence.
- **Permitted files:** `.github/workflows/tio-money-codespaces-pr-preview.yml`, `tests/preview/pr-codespaces-workflow.test.mjs`, `docs/CODESPACES-PR-403-DIAGNOSIS.md`, this task and compact index.
- **Exclusions:** No token scopes / secret values / repository visibility or GitHub Settings changes; no bypass of PR gate or policy, no Codespaces mutation, no PR #18 edits, no merge or dispatch.
- **Acceptance:** checkout trusted workflow from main after a separately authorized merge; read-only diagnostic captures sanitized permission headers on HTTP failure; unchanged source/security guards; GitHub CI exact-head PASS; owner-specific merge permission separately required.
- **Testing:** `node --test tests/preview/pr-codespaces-workflow.test.mjs`, `npm run check`, governance CI; actual results must be reported from exact SHA.
- **Owner merge authorization:** NOT GRANTED.
- **Next:** exact-head CI and independent review, then owner may separately authorize PR merge before new privileged dispatch.

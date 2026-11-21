# TM-OPS-CODESPACES-ISSUES-READ-20261121-001 — Trusted worker issues: read scope

- **RFC:** [#27](https://github.com/im-tnyx/Tio-Money/issues/27), technical `PROCEED` after owner reported no live workflow operation.
- **Owner intent:** diagnose why PR #18 Preview workflow still does not run. A specific owner permission to merge this future fix PR is **NOT granted**.
- **Evidence:** manual run [#44805243638](https://github.com/im-tnyx/Tio-Money/actions/runs/44805243638), `INPUT_PR: 18`, first PR metadata via curl traversed; later `gh api /repos/{owner}/{repo}/issues?state=open&labels=tio-preview&per_page=100` returned 403. GitHub REST `List repository issues` requires `Issues: read` for fine-grained token.
- **Branch:** `fix/codespaces-preview-issues-read`, from `main` `0c295316940fc73e0c8e8bce127aaedede5d3d49`.
- **Scope:** `.github/workflows/tio-money-codespaces-pr-preview.yml` adds only top-level `issues: read`; regression test of exact read-only permissions and required single-preview-label gate; this task and `.ai/current.md` index.
- **Risk and controls:** privileged workflow changed, narrow GitHub repository metadata read scope only; no PAT or broader write permissions, no new event type, no altered immutable HEAD/label validation, Codespaces identity, secret boundaries, native/finance/app source or manual dispatch.
- **CI acceptance:** exact-head Phase 0 (including preview static tests), AI Governance, preview signal; diff scope and review finding verification. Runtime acceptance remains separate after authorized merge into `main`.
- **Review:** independent review `DEFERRED`, optional under TM-DEC-002, recommended for privileged workflow. All actual blocking findings and GitHub requirements bind.
- **Owner merge authorization:** `NOT_GRANTED`. No merge, secret mutation, Codespace start or workflow dispatch.

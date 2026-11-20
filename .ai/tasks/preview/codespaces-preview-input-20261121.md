# TM-DEV-PREVIEW-INPUT-20261121-001 — Codespaces manual dispatch PR integer string

- **Repository:** `im-tnyx/Tio-Money`
- **Owner request:** 2026-11-21, "Go ye run karna chahiye" after diagnosis of `INPUT_PR: 18.0`. This authorizes bounded code correction and CI, **not** future PR-specific merge permission or privileged manual dispatch.
- **RFC / technical PROCEED:** [Issue #25](https://github.com/im-tnyx/Tio-Money/issues/25), based on observed [failed run #44798703853](https://github.com/im-tnyx/Tio-Money/actions/runs/44798703853).
- **Assigned implementation branch:** `fix/codespaces-preview-dispatch-pr-string`; base `main` `097e014d7e2a2015230971751bd5c72ee91e6580`. Scope only the manual Codespaces preview input parser, its regression tests, and governance handoff.
- **Patch:** `.github/workflows/tio-money-codespaces-pr-preview.yml` input `pr_number.type: number → string`; preserve `^[1-9][0-9]*$` guard, actor/attempt restrictions, repo/PR immutability, `tio-preview`, Codespace identity and token boundaries. Add positive and negative input regression.
- **Exclusions:** No EAS workflow change; no permissions, tokens, GitHub Settings, PR #18 source, live Codespace, Expo tunnel or `main` write.
- **Security concern:** Numeric input allows `18.0` formatting; reject floats, zero, negative, leading zero, scientific notation and malicious input rather than permitting alternate numeric encodings.
- **Review disposition:** Independent review `DEFERRED` under optional TM-DEC-002; current-head source audit and CI required. Do not claim GitHub APPROVED review without one.
- **Validation plan:** exact-head GitHub Phase 0, AI Governance CI and pull-request diff check, check unresolved review threads and verify `main` alignment.
- **Merge authorization:** `NOT_GRANTED` for new PR. Owner needs to explicitly name new PR and permission to merge; after merge a new manual workflow dispatch is separately required for PR #18.
- **Recovery:** leave PR unmerged if checks fail or revert narrow type declaration through governed PR.

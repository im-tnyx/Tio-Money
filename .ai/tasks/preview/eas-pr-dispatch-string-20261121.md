# TM-EAS-DISPATCH-STRING-20261121-001 — EAS manual PR number string fix

- **Repository:** `im-tnyx/Tio-Money` (private).
- **Source:** owner chat request "Sahi kre" for `TIO MONEY EXPO PR REVIEW`; [RFC #31](https://github.com/im-tnyx/Tio-Money/issues/31), technical `PROCEED` for source-only fix.
- **Failing evidence:** [manual run #44810555603](https://github.com/im-tnyx/Tio-Money/actions/runs/44810555603) at `main` `0ac1f6a23e2224b3c2e8d0e10a63699abc53a10e`, `PR_NUMBER=18.0`, `::error::PR number is not numeric`; same symptom in runs #44808732886 and #44806832448.
- **Branch/ownership:** `fix/eas-pr-dispatch-string`, start from `main` `0ac1f6a23e2224b3c2e8d0e10a63699abc53a10e`; implementing agent GPT-6; files: `.github/workflows/tio-money-eas-pr-preview.yml`, `tests/preview/eas-preview-config.test.mjs`, this task, `.ai/current.md`.
- **Exact change:** PR input `type: number` -> `type: string`, strict `^[1-9][0-9]*$` input validation, explicit failure message. Regression asserts string metadata, refusal of floats/zero/negative/leading-zero/malformed values, existing owner/attempt/main/non-draft/source-only/isolated token boundaries.
- **Product and security:** The EAS workflow can publish an OTA or queue paid signed builds, so code fix must not trigger it. Keep owner-only `workflow_dispatch`, `tio-money-eas-preview-trusted`, exact PR snapshot, `src/*|assets/*` restriction, and no Expo credentials before validated publish step. No change to project identifiers or signed build configs.
- **PR #18 eligibility:** `OPEN / DRAFT`, 17 changed files including `.ai/`, `docs/`, `tests/`; explicitly ineligible for both EAS operations. Existing Codespaces Preview successful in [run #44809867734](https://github.com/im-tnyx/Tio-Money/actions/runs/44809867734).
- **Validation:** exact-head `Phase 0 checks`, `AI governance checks`, preview-signal, diff/scope/review findings before Ready for Review. No runtime EAS dispatch claimed, no local checkout claimed from connector-only work.
- **Review:** independent security review `DEFERRED` (optional under TM-DEC-002, recommended for credential-bearing workflow). Address all actual blocking findings if any.
- **Owner merge authorization:** `NOT_GRANTED`; separate owner instruction required for specific PR and action. Separate permission required for any EAS publish/build. Rollback by not merging fix or governed revert.

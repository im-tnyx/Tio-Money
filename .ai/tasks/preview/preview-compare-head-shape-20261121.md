# TM-OPS-PREVIEW-COMPARE-HEAD-20261121-001 — Compare API snapshot validator

- **Source RFC / proceed:** [Issue #29](https://github.com/im-tnyx/Tio-Money/issues/29); owner reports repeated Codespaces Preview failure after PR #28.
- **Failing runs:** [#44806734241](https://github.com/im-tnyx/Tio-Money/actions/runs/44806734241), [#44806945990](https://github.com/im-tnyx/Tio-Money/actions/runs/44806945990), fail at `Restrict exact captured PR revision to source-only UI changes`. PR #18 remains Draft and unmerged; current compare has 17 files and ordered commit list, no `head_commit` field.
- **Working branch:** `fix/preview-compare-head-commit-shape`, from `main` `cff662ebd00f5333c348a45c2bc7c196961ae4dd`.
- **Change:** Replace non-existent `compare.head_commit.sha` check with `compare.commits.at(-1).sha`, require positive safe-integer `total_commits` equals returned commit count; retain base_SHA check, exact frozen PR state, file count, rename path validation, only source paths before Codespace activation.
- **Regression:** API-shaped fixture with no `head_commit` passes; reject missing, empty, truncated or false final commit arrays, base mismatches and prior TOCTOU/rename cases.
- **Exclusions:** no token/permission changes, no native/finance/UI scope, no direct main write, no PR #18 edits or label changes, no manual workflow dispatch/SSH/Expo activation.
- **Security:** fail closed if compare response is truncated or malformed, so no weakening of immutable head guard. Independent review `DEFERRED` (optional under TM-DEC-002, recommended for this security-sensitive validator). Exact HEAD CI and review findings remain mandatory.
- **Owner merge authorization:** `NOT_GRANTED`. New PR must receive separate explicit owner action-specific merge authorization after gates, followed by a fresh manual preview run for PR #18.

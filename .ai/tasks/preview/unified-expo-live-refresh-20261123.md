# TM-OPS-UNIFIED-EXPO-LIVE-REFRESH-20261123-001 — Unified manual Expo preview and persistent Metro

| Field | Verified value |
|---|---|
| Repository / RFC | `im-tnyx/Tio-Money`; [Issue #87](https://github.com/im-tnyx/Tio-Money/issues/87) |
| Decision | [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/87#issuecomment-7090616033), 2026-11-23 UTC, acting architect ChatGPT/GPT-6; owner request transcribed from conversation, not GitHub-authenticated merge approval |
| State / agent | `VALIDATING`; ChatGPT/GPT-6; prior verified agent `UNKNOWN_NOT_VERIFIED` |
| Branch / base | `feat/unified-expo-preview-live-refresh` from verified main `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6` |
| PR / merge | Pending feature PR; owner merge authorization `NOT_GRANTED`; privileged dispatch `NOT_GRANTED` |
| Review | `DEFERRED`; independent security review strongly recommended before merge; no passing human review claimed |
| Started / checkpoint | 2026-11-23T03:16:52Z / 2026-11-23T03:25:24Z |

## Scoped implementation and boundaries

The existing `TIO MONEY EXPO PR REVIEW` form adds default `codespaces_live` with the original EAS operations and platform choices. A reusable Codespaces worker handles manual calls and the existing automatic push signal; there is no independent Codespaces manual dispatch. The two jobs retain separate environment secrets. The worker continues exact owner/main/attempt, immutable PR snapshot, unique label, source allowlist, dedicated Codespace identity, authenticated Git bundle and exact 409 idempotency checks. No PR script runs on the privileged Actions runner. The managed starter reuses healthy Metro and its tunnel on a new UI revision, recovers an unhealthy process only after ownership verification and rejects invalid ownership. A trusted local Metro source-map probe compares served tracked app source with Git HEAD. A same-SHA healthy dispatch avoids remote sync and dependency install.

Changed paths: `.github/workflows/tio-money-eas-pr-preview.yml`, `.github/workflows/tio-money-codespaces-pr-preview.yml`, `.github/scripts/sync-pr-codespaces-preview.sh`, `.github/scripts/check-pr-codespaces-preview.sh`, `.github/scripts/verify-codespace-served-source.mjs`, `scripts/start-codespace-expo.mjs`, `tests/preview/{eas-preview-config,pr-codespaces-workflow,codespace-expo,unified-live-refresh}.test.mjs`, `docs/{EAS-PREVIEW-UPDATES,PR-CODESPACES-PREVIEW,CODESPACES-LIVE-PREVIEW}.md`, this task and additive `.ai/current.md` checkpoint. No lockfile, app, EAS signing, secret/settings or native change.

Alternative `git pull --ff-only` cannot attest the detached preview SHA. Retain verified immutable Git bundle. Rollback: do not merge the draft PR, or an explicitly authorized ordinary revert. If a PID record, ownership, source map, changed PR or worktree is ambiguous, fail closed and investigate privately. Old PRs that have not incorporated the new managed starter may require a safe source-only update from reviewed main before `--preflight` can run; never bypass the ownership gate.

## Validation checkpoint (local connector-materialized subset)

- `node --test tests/preview/codespace-expo.test.mjs tests/preview/unified-live-refresh.test.mjs`: 14/14 PASS on current local edits, mocked/static only.
- `node --test tests/preview/pr-codespaces-workflow.test.mjs tests/preview/codespace-expo.test.mjs`: 24/25; one filesystem fixture failed because sandbox `/tmp` is unavailable, not a workflow execution result. Recheck in full GitHub CI.
- Python PyYAML BaseLoader parsed all three relevant workflow files; `bash -n` on both shell scripts and `node --check` on starter/source probe PASS. GitHub Actions schema semantics still require CI.
- `npm run check`: attempted locally, failed before typecheck because `tsc` is absent in the partial materialization. `npm run preview:test`: attempted locally, failed with missing root/EAS lockfiles and `/tmp` fixture in this partial materialization. **NOT_VERIFIED on a complete checkout** until exact-HEAD CI.
- Real Codespace, Metro process, tunnel URL, Expo Go Android/iPhone display and HMR: **NOT_RUN**; expressly prohibited here. Source-map route and behavior need an authorized live run after merge before claiming physical success.

No `Co-authored-by:` trailers permitted. GitHub commit-range and exact-HEAD CI/review to be appended after PR creation. Owner-specific merge authorization is still required and is not present. Issue #71/PR #65 supply-chain holds are separate and unchanged.

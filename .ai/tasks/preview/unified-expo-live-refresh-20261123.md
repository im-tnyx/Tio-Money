# TM-OPS-UNIFIED-EXPO-LIVE-REFRESH-20261123-001 — Unified manual Expo preview and persistent Metro

| Field | Verified value |
|---|---|
| Repository / RFC | `im-tnyx/Tio-Money`; [Issue #87](https://github.com/im-tnyx/Tio-Money/issues/87) |
| Decision | [Technical PROCEED](https://github.com/im-tnyx/Tio-Money/issues/87#issuecomment-7090616033), 2026-11-23 UTC, acting architect ChatGPT/GPT-6; owner request transcribed from conversation, not GitHub-authenticated merge approval |
| State / agent | `VALIDATING`; ChatGPT/GPT-6; prior verified agent `UNKNOWN_NOT_VERIFIED` |
| Branch / base | `feat/unified-expo-preview-live-refresh` from verified main `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6` |
| PR / merge | [Draft PR #88](https://github.com/im-tnyx/Tio-Money/pull/88); owner merge authorization `NOT_GRANTED`; privileged dispatch `NOT_GRANTED` |
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

### 2026-11-23T03:29:00Z — First PR HEAD and corrective probe design

- First branch HEAD `48df52e6c03eb697fe10be9665d434d7a957d3ae`, Draft PR #88, base `d200ed24117d525fe7a9af7cf8b2e6d4e75317c6`, 15 changed files, one commit with no forbidden co-author trailer. GitHub run 45106182759 Governance and 45106182841 Phase 0 both reported FAILURE with zero job steps available through connector; job logs returned BlobNotFound 404. Do **not** claim tests executed or diagnose the cause from this evidence. Push signal also showed failure; no Codespace action is inferred.
- Correction under RFC scope: derive the Metro source-map request from the selected platform's locally returned Expo Go manifest launch bundle URL, preserve exact transform/query settings, rewrite to loopback only after a strict bundle path/platform check, and compare source content to Git HEAD. This avoids assuming a hardcoded Expo Router transform route. Focused mocked tests PASS; live manifest/source-map response and Expo Go still NOT_RUN.
- Remaining: commit correction, recheck exact HEAD/CI and record review disposition. A red CI with inaccessible failure details blocks Ready for Review/merge; independent human security review DEFERRED.

### 2026-11-23T03:33:37Z — Exact-HEAD CI blocker and fail-closed probe refinement

- PR #88 second HEAD `d619d4f2c5411ce30b443d2f3b83875969ddd712`: Governance run 45106535742 and Phase 0 run 45106535777 both reported FAILURE with zero exposed steps; connector logs/annotations unavailable, so cause `UNVERIFIED`. The older PR #84 exact HEAD had green checks, which does not explain this failure. No workflow rerun or privileged dispatch performed.
- Source probe now bounds both local manifest and map responses, rejects source-map paths no longer tracked in selected Git HEAD, and ignores dependency package `src` paths. Synthetic source-map and workflow tests: 14/14 PASS locally. This is not evidence that a real Expo Go client refreshed.
- Security review disposition: self-inspected credential separation, immutable bundle/source allowlist, owner/main/first-attempt guards, exact 409, clean checkout and PID ownership; **independent human security review DEFERRED**. Blocking findings: exact-HEAD required checks red without accessible diagnostics; real SDK 58 manifest/map compatibility, remote PID preservation, signed tunnel continuity and physical-device HMR NOT_VERIFIED. Keep PR Draft and do not merge or activate it.

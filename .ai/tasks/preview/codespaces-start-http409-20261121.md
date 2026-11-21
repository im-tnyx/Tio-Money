# TM-OPS-CODESPACES-START409-20261121-001 — Idempotent dedicated preview Codespace start

| Item | Value |
|---|---|
| Repository | `im-tnyx/Tio-Money` |
| RFC / technical proceed | [Issue #38](https://github.com/im-tnyx/Tio-Money/issues/38); 2026-11-21, agent-recorded technical `PROCEED` following owner failure report |
| Task state | `VALIDATING`; not merged |
| Branch | `fix/codespaces-start-http409-race` |
| Base commit | `main` `baeb77aef5ed16feec25cb4fc4b3f3209d357ee0` |
| Implementing agent | ChatGPT GPT-6; not inferred from Git metadata |
| Prior agent | `UNKNOWN_NOT_VERIFIED` |
| Review disposition | `DEFERRED` (independent security review recommended) |
| Merge authorization | `NOT_GRANTED` |
| Live privileged dispatch | `NOT_GRANTED` |
| PR | Not opened at initial checkpoint; verify live GitHub |

## Problem, root cause and boundaries

[Owner manual run #100](https://github.com/im-tnyx/Tio-Money/actions/runs/44870219796) passed immutable PR #18 source and dedicated Codespace identity, but workflow failed at Codespace start with `gh: The codespace is already running (HTTP 409)`. This is a Codespaces state transition race. Exact API message is observed, not inferred. No SSH or Metro step was executed.

[Run #99](https://github.com/im-tnyx/Tio-Money/actions/runs/44869882591) had a **separate** unowned Metro process failure after successful file import. This HTTP 409 fix does NOT resolve that runtime process-ownership condition. Do not weaken the Metro guard or kill unowned processes.

## Decision and implementation

- Keep the same trusted-main, owner, `tio-preview` label, immutable snapshot, source-only PR, dedicated Codespace ID verification and requested environment gate.
- When the pre-start GET does not show `Available`, POST once. Accept only the **exact** known CLI error `gh: The codespace is already running (HTTP 409)` as an idempotent race, then continue to existing bounded polling with identity re-verification. Keep every other error fatal and never assume the Codespace is actually Available until verified by GET.
- Do not forward Codespaces or GitHub credentials to remote commands. Do not change PR #18, app source, Expo, finances, dependencies, infra/secrets, workflow permissions, native settings or other Codespaces.
- Test mocked POST success, exact 409, other 409, 403 and already Available without using live secrets or Codespace.
- Rollback: leave draft PR unmerged or revert via a separately approved non-force PR.

## Acceptance / handoff

- Check `npm run check` (including `node --test tests/preview/*.test.mjs`) in GitHub Phase 0, governance CI, exact PR HEAD and no changes outside the four declared paths (trusted workflow, test, task, current index).
- Independent security review strongly recommended; actual required GitHub protection and blocking findings always apply. **Owner merge permission for a numbered PR is separate and not yet granted**.
- A successful static CI is not a real Codespace start or an Expo tunnel test. Any separate Metro ownership issue needs read-only process/PID evidence before process-control modifications.

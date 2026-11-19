# TM-DEV-PREVIEW-20261119-001 — QR-free Expo Go Codespaces preview

**Status:** Stage A **VALIDATING / stacked draft PR**, Stage B **BLOCKED / DEFERRED**. Owner merges **NOT_AUTHORIZED**.

| Field | Evidence |
|---|---|
| Repository | `im-tnyx/Tio-Money`, **private** |
| RFC and proceed | [Issue #3](https://github.com/im-tnyx/Tio-Money/issues/3) — **agent technical PROCEED Stage A only**; not owner approval to merge |
| Current working agent / model | ChatGPT (connected GitHub), GPT-6, from actual conversation |
| Previous verified preview-task agent | `UNKNOWN_NOT_VERIFIED` — new task; separate Phase 0 task reports ChatGPT GPT-6 |
| Phase 0 branch owner | Separate active Phase 0 agent; no change to its source or branch |
| Working branch | `chore/codespaces-expo-go-stage-a` from Phase 0 SHA `790f1cfe4b961b95cc3b7ec5aace8359cbda421c` |
| Baseline main | `04e6aa8d657627516b8ce7de91bd8304fdcbcf90`, governance PR #2 merged |
| PR | Stacked draft against `feat/phase-0-expo-foundation` (link after creation) |
| Review disposition | **DEFERRED**, independent review recommended for platform/security; no approval fabricated |
| Real Codespace, Expo login, iPhone/Android | **NOT_VERIFIED** |
| Merge permission | **NOT_GRANTED** for both PR #1 and this preview PR |

## Scope and constraints

Own only `.devcontainer/devcontainer.json`, `scripts/start-codespace-expo.mjs`, `tests/preview/codespace-expo.test.mjs`, additive `package.json` scripts, `.gitignore` generated route typing ignore, `docs/CODESPACES-LIVE-PREVIEW.md`, this dedicated task and additive `.ai/current.md` entry. No changes to Phase 0-owned `src/`, UI, SQLite, lockfile, credentials, SMS/native permissions, trusted workflows or branch history. App is SDK 58 / Node 22.16.0. Worktree cleanliness and other local agent sessions cannot be verified through GitHub connector.

## 2026-11-19 initial checkpoint — ChatGPT GPT-6

- **Previous verified agent:** `UNKNOWN_NOT_VERIFIED` for this new preview task. Git author/owner identity is distinct.
- **Owner requirements:** QR-free Projects/Recent Projects reopen *when available*, managed Metro and tunnel, private credential handling, bounded tests. Stage B gated.
- **Pre-write discussion/decision:** [RFC issue #3](https://github.com/im-tnyx/Tio-Money/issues/3), explicitly **PROCEED Stage A** and **BLOCK Stage B**; no restricted security setting authorization assumed.
- **Other agents:** Phase 0 draft PR #1 verified at `790f1cfe4b961b95cc3b7ec5aace8359cbda421c`; [coordination notice](https://github.com/im-tnyx/Tio-Money/pull/1#issuecomment-7002572364) sent before source additions. One existing unresolved Node engine review thread is not owned by preview; no false review resolution.
- **Reference read:** Tio Workspace main: devcontainer, live-preview guide, managed Expo starter, Codespace sync script, push-signal workflow, privileged worker.
- **Changed files / actual implementation HEAD:** to be captured in a subsequent checkpoint/PR description. Initial code commit `a17831c6362ce76c783c1a6ede5e1bd318869651` adds devcontainer, starter and helper tests.
- **Test evidence:** source-level tests defined, **not yet executed in an authenticated Codespace**. Run `npm ci --no-audit --no-fund`, `npx expo install --check`, `npm run check`, `npm run preview:test`, platform exports, governance checks/links and device QA; record real run IDs and tested SHA, not imagined results.
- **Security:** repo private; connector main protection query `403` and rulesets account-plan `403`; treat as **NOT_VERIFIED**. No Codespaces token/environment, privileged workflow, Codespace provisioning, external service or Expo credentials created.
- **Review:** **DEFERRED** until final stacked head; strongly recommend independent security/OS review before integration; known and configured required gates remain binding.
- **Owner merge permission:** **NOT_GRANTED**, neither preview PR nor Phase 0 PR #1.
- **Rollback:** stop managed Metro, stop one Codespace, close preview PR; never overwrite Phase 0, hard reset or force-push.
- **Exact next safe action:** open stacked **draft** PR and observe head CI results; owner tests actual SDK-compatible Expo Go on Android/iPhone and records acceptance separately. Stage B remains disabled pending owner/security gates.

[Task lifecycle](../README.md) · [Agent contract](../../../AGENTS.md) · [Owner decisions](../../../docs/DECISIONS.md) · [Preview operating guide](../../../docs/CODESPACES-LIVE-PREVIEW.md)

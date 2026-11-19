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

## 2026-11-19 add-on — existing Expo Go project owner identity

- **Owner-reported existing Expo account/project:** `tnyx-23` / `@tnyx-23/tio-money`, phone display **Tio-Money**; unrelated `@tnyx-23/tnyx` (**Tio-TNYX**) explicitly protected. Existing project visibility is **OWNER_REPORTED**, not independently authenticated in an Expo API session.
- **Persistent discussion/technical decision:** [Issue #3 addendum](https://github.com/im-tnyx/Tio-Money/issues/3#issuecomment-7002783624) extends the same Stage A technical **PROCEED**, with no new project, PR, credential, Codespace or privileged worker. Owner merge permission remains **NOT_GRANTED**.
- **Current branch baseline before this add-on:** `chore/codespaces-expo-go-stage-a` at `1a5c666abf38fbd9014df4137f2458518263f8f5`, Phase 0 PR #1 still draft at `790f1cfe4b961b95cc3b7ec5aace8359cbda421c`; no Phase 0 branch modification. GitHub connector only, no local Codespace state visible.
- **Source modifications:** add `expo.owner = tnyx-23` to preview-branch `app.json` without changing name, slug or native IDs; starter accepts only `npx expo whoami` for exactly the configured owner; add wrong-account and static project-identity regression tests; expand preview guide. Explicitly preserve Tio-TNYX app IDs/EAS UUID/workspace Codespaces/workflows.
- **EAS UUID evidence:** Existing UUID **NOT_VERIFIED** because no authenticated Expo project connection is available. Deliberately **do not add** `extra.eas.projectId`, EAS Update or run interactive `eas init`; no duplicate project creation. Authentication/project identity is a manual owner check via authenticated Expo UI when needed.
- **Acceptance:** Android/iPhone separately open the **existing** Tio-Money Projects entry while Codespace signed into `tnyx-23`; assess Fast Refresh and stop/restart recovery. All device/tunnel/physical Codepace outcomes **NOT_VERIFIED** until owner evidence. No claim of existing EAS UUID association.
- **Testing:** preview identity tests and public Expo config to be checked on the final PR HEAD, not assumed. Review, required CI and PR-specific merge permission remain separate gates.
- **Exact next action:** verify preview branch CI, owner checks authenticated Expo CLI account and Expo Go project without touching Tio-TNYX, and conduct both-device QA; leave privileged Stage B disabled.

## 2026-11-19 validation checkpoint — current working ChatGPT GPT-6

- **Previous verified agent at this same task checkpoint:** ChatGPT (GPT-6), the earlier implementation and add-on session above. This is continuation in one task, not a transfer inferred from GitHub commit author.
- **Verified CI tested SHA:** `b317ec8d69b6fd8c3cebae33b638c3a13fdaac5e`; [GitHub Actions Phase 0 run #44480886934](https://github.com/im-tnyx/Tio-Money/actions/runs/44480886934), job `static` **SUCCESS**.
- **Actually executed on GitHub-hosted Ubuntu (source SHA above):** `npm ci --no-audit --no-fund` **PASS**, `npx expo install --check` **PASS**, `npm run check` **PASS** (TypeScript, ESLint, Prettier, **16/16** Phase 0 tests and **8/8** preview tests including exact Expo owner), `npx expo config --type public` **PASS**, `CI=1 npx expo export --platform android` **PASS**, `CI=1 npx expo export --platform ios` **PASS**, default restricted SMS-permission scan **PASS**. No installed-device run or authenticated Expo session.
- **Independent code-static checks via connected GitHub tooling:** devcontainer JSON parsed successfully; confirmed `app.json` exposes `owner=tnyx-23`, `name=Tio Money`, `slug=tio-money`, with `extra.eas.projectId` absent and no update URL. GitHub tree check of guide/task/index local Markdown links: **14** relative link targets checked, **zero missing** (not the full governance CLI/anchor renderer). GitHub compare `790f1cfe4b961b95cc3b7ec5aace8359cbda421c..b317ec8d69b6fd8c3cebae33b638c3a13fdaac5e` has **3 commits**, **zero** prohibited `Co-authored-by:` trailers.
- **Not run / remaining:** `python3 scripts/ai_context.py check-links` on a full local checkout **NOT_RUN**; full governance Python unit suite **NOT_RUN** on preview head; actual Codespace image pull/postStart authentication, active Metro/status/signed tunnel, duplicate/stop/restart integration and Android/iPhone Projects reopen/refresh **NOT_VERIFIED**. Clean worktree and fast-forward sync simulation **NOT_APPLICABLE** to Stage A; Stage B intentionally unimplemented.
- **Review disposition:** **DEFERRED**, no independent passing review claimed; actual configured required GitHub checks/reviews and PR #1 existing finding remain separate gates. Repo private; protection/ruleset assessment restricted (403); no privileged automation.
- **GitHub PR:** [Stacked draft PR #4](https://github.com/im-tnyx/Tio-Money/pull/4), base `feat/phase-0-expo-foundation`. PR #1 remains draft and untouched. Neither has owner merge authorization.
- **Next safe action:** observe the CI rerun for this documentation checkpoint on the new SHA; owner verifies authenticated Expo project UUID if EAS linkage is ever needed, and runs `npx expo login`/`whoami`, tunnel and both device tests from the *same* Codespace. No EAS initialization or privileged Stage B.

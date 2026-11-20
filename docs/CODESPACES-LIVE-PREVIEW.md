# Tio Money — GitHub Codespaces / QR-free Expo Go development preview

> **Stage A only (stacked draft PR). Owner confirmed one Tio Money Expo Go Development Servers entry opens from the real Codespace; Expo Go grey Projects tile / both-device QA / Fast Refresh remain unverified. Stage B privileged automatic sync: NOT IMPLEMENTED.** This is a developer Metro session, not an installed release, permanent tunnel or always-on backend.

[Technical RFC and agent PROCEED](https://github.com/im-tnyx/Tio-Money/issues/3) · [Phase 0 PR #1](https://github.com/im-tnyx/Tio-Money/pull/1) · [Phase 0 physical-device QA](07-PHASE-0-FOUNDATION-NOTES.md#manual-expo-go-and-real-sqlite-acceptance--not_verified)

## Architecture and scope

Tio Money's Phase 0 source uses Expo **SDK 58**, React Native **0.88.1**, Node `22.16.0` in `.nvmrc` and the committed npm lockfile. The developer container selects the compatible Node 22 Bookworm image family; it installs with `npm ci --no-audit --no-fund` and attempts the managed Expo starter after Codespace creation or resume. Keep SDK and React Native locked: no upgrade for preview.

The starter runs `npm run mobile` (`expo start --tunnel --go`), owns only the detached npm/Metro process it launches, verifies Linux `/proc` identity and project cwd, serializes operations with a per-user lock, checks the real `http://127.0.0.1:8081/status` response and validates the Expo Go tunnel URL from `/_expo/open?platform=ios&runtime=expo`. It refuses to take over or kill any unowned process. Operation timeouts are bounded; errors name a **private** local log, which may contain signed tunnel details. Never paste those logs into chat or CI. Metro port **8081** does not require a public Codespaces port forward for Expo's tunnel.

For SDK 58 the Expo tunnel is an **Expo-account-signed tunnel**; a legacy ngrok helper is neither needed nor installed. See [SDK 58's tunnel notes](https://expo.dev/changelog/sdk-58) and [Expo Go same-account instructions](https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/).

## Existing Expo project identity — strict no-duplicate linking

**Owner-confirmed Expo Go target (not independently authenticated from Expo's account API):** account **`tnyx-23`**, project **`@tnyx-23/tio-money`**, phone Projects display **Tio-Money**. The local source configuration is `expo.name = "Tio Money"`, `expo.slug = "tio-money"` and `expo.owner = "tnyx-23"`. The phone display may use the existing Expo account project's listing name, while `expo.name` intentionally stays "Tio Money" per the application requirement.

**Protected unrelated identity: `@tnyx-23/tnyx` (display Tio-TNYX).** Its EAS UUID, app identifiers, Tio Workspace source, Codespaces and workflows are out of scope and must never be copied, renamed, recreated, relinked or otherwise modified.

**Existing EAS identity, owner-verified via their Expo Dashboard:** `@tnyx-23/tio-money` has Project ID **`722e6857-1159-4414-a024-6a4351e7d3e1`** (owner provided slug, owner and UUID on 2026-11-19). This identifier is configured directly as **`expo.extra.eas.projectId` in the preview branch's `app.json`**, preserving `extra.releaseStage`. The agent has **not** independently authenticated an Expo API session or read the project's Updates/Branches history. The separately protected **Tio-TNYX** ID must never be copied here. Expo SDK 58's account-signed development tunnel does not require EAS Update. **No `expo.updates.url`, runtime version, new EAS project, build or published update is introduced by this link.** Do not run `eas init`, `eas project:init`, `eas update:configure`, `eas update` or `eas build` for this preview. Local linking **does not guarantee** the grey Expo Go Projects tile becomes usable: the owner must separately check `@tnyx-23/tio-money` Updates/Branches for an existing compatible publication.

In the Codespace, after private `npx expo login --no-browser` run **`npx expo whoami`**, which must return exactly **`tnyx-23`**; the managed starter checks this before it starts Metro and **fails closed** if the login is absent or belongs to another account. Then run `npx expo config --type public` and check owner/slug/name. This confirms local configuration and CLI login, **not** independent Expo API validation or the existence of a published EAS Update. Verify the displayed `extra.eas.projectId` matches the owner-provided **Tio-Money** UUID exactly. On the phone, remain signed into `tnyx-23` and tap **Tio-Money**, never Tio-TNYX. If the target cannot connect, use the current private tunnel link fallback and report it as NOT_VERIFIED; do not relink the other project.

**Linkage verification register:**

| Evidence | Status |
|---|---|
| GitHub `app.json` name and slug + explicit owner `tnyx-23` | **CONFIGURED IN STAGE A**; CI public Expo config must confirm |
| Owner reports existing Expo Go project `@tnyx-23/tio-money` | **OWNER_REPORTED**, no authenticated Expo dashboard read by agent |
| Existing Tio-Money EAS project UUID from Expo | **OWNER-VERIFIED DASHBOARD / CONFIGURED LOCALLY** as `722e6857-1159-4414-a024-6a4351e7d3e1`; independent Expo API verification not available |
| Codespace `npx expo whoami` returns `tnyx-23` | **OWNER-OBSERVED PASS** from real Codespace terminal; not rechecked after the config edit |
| Actual Tio Money development server opens in Expo Go | **OWNER-OBSERVED PASS** on one phone from Development Servers; grey Projects card still unverified for direct launch |
| Tio-TNYX project remains untouched | **NO CHANGES REQUESTED OR MADE** to workspace project/repository/configuration |


## One-time owner setup (after agreeing the preview integration branch)

1. Check the chosen branch contains *both* the Expo app and these preview scripts. `main` currently has governance docs only; the active app is draft PR #1 on `feat/phase-0-expo-foundation`. The additive preview implementation is on `chore/codespaces-expo-go-stage-a` as a **stacked draft PR**. Coordinate with Phase 0 before choosing a branch. **Do not merge PR #1 just to create a Codespace.**
2. Open GitHub's **Code → Codespaces** for Tio Money; manually create **one** Codespace on the agreed app-containing preview branch. Do not create duplicates. Choose a modest machine and short idle timeout; do not assume a stopped Codespace costs nothing in retained storage.
3. If installation did not finish, run `npm ci --no-audit --no-fund` in the Codespace. Confirm `node -v` shows a compatible Node 22 release and `npx expo install --check` passes.
4. Run `npx expo login --no-browser` **inside the Codespace terminal**. Expo SDK 58 defaults to browser-based login without this flag; `--no-browser` asks for credentials in the terminal. Enter your Expo credentials only into the private interactive prompt (and complete account verification if requested); never use `--password` on the command line or paste credentials into terminal history, logs, source or chat. Run `npx expo whoami` and require **tnyx-23** before proceeding; do not use the unrelated Tio-TNYX project's account config. The first automatic `postStartCommand` can fail before login; this is expected and **must not** be treated as a healthy tunnel. Do not share Expo passwords, access tokens, Codespaces secrets or tunnel URLs in chat, Git or Actions logs.
5. Install an **SDK 58-compatible Expo Go** on your Android phone and iPhone; sign into Expo Go using the **same Expo account** as the Codespace CLI (required on a physical iPhone). An unavailable/older incompatible iOS Expo Go build is a blocker; do not claim success from account sign-in alone.
6. In the Codespace run `node scripts/start-codespace-expo.mjs`, then `node scripts/start-codespace-expo.mjs --status`. A successful starter message proves **local Metro and Expo CLI tunnel-link health only**, not physical reachability.
7. Inside Expo Go, look for the existing **Tio-Money** (not **Tio-TNYX**) in **Projects / Recent Projects** and open it directly. Try that entry on later launches without a new QR scan. This is a best-effort account flow, **not** a guarantee that the entry persists, the link remains stable, or reconnects never occur.

**Fallback if Projects does not show Tio Money:** recover the **current** Expo Go link privately from the Codespace's Expo CLI session/log and open it on your own phone. Do not publish or transmit the signed link in a GitHub comment. If interactive CLI output is easier, first stop the managed server using `--stop`, then run `npm run mobile` in the Codespace terminal, open the Expo deep link and later stop that interactive process before returning to the managed starter. Never launch a second Metro against an occupied port.

## Session controls

| Command | Purpose |
|---|---|
| `node scripts/start-codespace-expo.mjs` | Start managed Metro/tunnel if absent; healthy project-owned server is reused without a duplicate |
| `node scripts/start-codespace-expo.mjs --status` | Fail unless project-owned Metro and an Expo Go tunnel both pass probes |
| `node scripts/start-codespace-expo.mjs --restart` | Stop only the verified managed process group and restart after checking Expo login |
| `node scripts/start-codespace-expo.mjs --stop` | Stop only a verified managed process; refuses to stop another process |
| `npm run mobile` | Manual, interactive CLI alternative **only after managed Metro stops** |

The Codespace must remain running while Metro serves the phone. JS/assets can Fast Refresh when connected; new native modules, native permission changes and custom SMS readers **cannot be loaded into Expo Go**. Codespace resume attempts an automatic Metro startup, but expired Expo authentication, failed install, port conflict or network outage require manual recovery. Tunnel URLs may change after stops/restarts.

## Recovery, cost and privacy

- Missing login: run `npx expo login --no-browser` privately in the Codespace terminal, then retry the starter. Sign into the same account on the phone.
- Failed install: rerun `npm ci --no-audit --no-fund` with the committed lockfile, inspect error and Node version. Do **not** regenerate package-lock blindly, alter SDKs or delete user work.
- Tunnel startup fails or times out: inspect `~/.cache/tio-money-expo-preview/metro.log` **privately** in the Codespace, fix authentication/network, run `--restart` and `--status`. The starter never prints signed tunnel URLs.
- Occupied port or foreign Metro: the starter refuses to kill it. Inspect the process manually; no `pkill` of unrelated development sessions.
- Stale PID / PID reused: identity/start-time/cwd and command must match, or the starter refuses termination. Stale records may be ignored but a busy port remains a hard blocker.
- Codespace stopped: restart the **same** Codespace in GitHub UI, check Metro, then reopen the Expo Go project/link. Rebuilding/replacing may require login again. Do not automatically provision more Codespaces.
- Phone errors: record OS, device, Expo Go version, application SHA and sanitized error only; do not publish bank, ledger, OTP or user data.

Codespaces computes are billed by active machine time with plan-specific monthly included usage; retained storage can still consume allowance. Set a short idle timeout and manually stop the Codespace when finished. See [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) and [lifecycle](https://docs.github.com/en/codespaces/about-codespaces/understanding-the-codespace-lifecycle). The Expo tunnel endpoint is accessible to someone with its link; this is not a secure private financial backend.

## Stage B: proposed push-driven preview (BLOCKED, not activated)

Future dedicated preview branch: `dev/expo-preview` (**not created**). Desired design:

`approved preview push → unprivileged read-only signal → trusted default-branch workflow_run worker → exact repository / owner actor / branch / accepted SHA checks → restricted environment token → locate exactly one owner-created matching Codespace → reject dirty worktree/wrong origin/wrong branch/divergence → fast-forward only to accepted SHA → run npm ci when manifests change → safely refresh managed Metro → reopen Expo Go if necessary`.

The push signal must receive **no secrets**. Privileged runner must never execute PR-authored shell or checkout arbitrary untrusted source. Owner must configure a **fine-grained Codespaces token** and environment-restricted secret solely through GitHub secure UI, and must assess private-repo visibility/cost, main-branch workflow trust, protection/rulesets, environment restriction and actual available permissions. The connector could not read branch-protection settings (`403`); rulesets produced an account-plan `403`. **Do not treat this as an approved privileged gate.** No Stage B GitHub Actions YAML, token, environment or automatic wake/sync is added.

If security gates cannot be established, retain manual Codespaces startup indefinitely. No PR merge, deploy, branch deletion or GitHub settings changes follow from this proposal.

## Source validation evidence (2026-11-19)

[Phase 0 / preview GitHub Actions run #44480886934](https://github.com/im-tnyx/Tio-Money/actions/runs/44480886934) finished **SUCCESS** on source SHA `b317ec8d69b6fd8c3cebae33b638c3a13fdaac5e`. The locked-install and Expo compatibility commands passed; `npm run check` passed strict TypeScript, ESLint, Prettier, all **16/16** Phase 0 tests and **8/8** preview tests, including the `tnyx-23` app config and account check; Android and iOS Expo Router exports and SMS permission scan passed. `npx expo config --type public` succeeded but its CI output was redirected; project owner/slug/name were separately inspected in the committed `app.json`. Devcontainer JSON was successfully parsed in an independent static check, but an actual Codespace image pull, Node version inside the container, account login, tunnel and phone tests remain **NOT_VERIFIED**. A basic GitHub-tree check found **zero missing local link targets across 14 local references in the guide, task and index**, not a full governance CLI link test.

## Acceptance evidence

| Acceptance | Recorded status |
|---|---|
| Node starter helper tests, static checks, Android/iOS Metro export | **PASS on GitHub Actions run #44480886934**, exact tested source SHA `b317ec8d69b6fd8c3cebae33b638c3a13fdaac5e`: `npm ci`, Expo dependency check, TypeScript/ESLint/Prettier, 16 Phase 0 + 8 preview Node tests, Expo public config command, Android and iOS exports, no-SMS scan. This is NOT physical QA. |
| Real signed Codespace Expo tunnel / Metro stop-resume | **NOT_VERIFIED** |
| **Android:** same-account Expo Go Projects reopen without QR if offered, navigation, refresh, stop/restart | **NOT_VERIFIED** — physical device not available to the agent |
| **iPhone:** SDK 58-compatible Expo Go, same-account login, Projects reopen, navigation/refresh, restart recovery | **NOT_VERIFIED** — physical device not available to the agent |
| Automatic Codespaces wake/sync after approved push | **NOT_IMPLEMENTED / BLOCKED** |

**Rollback:** use `--stop`, stop the owner-designated Codespace in GitHub UI and close/revert the preview-only stacked PR if rejected. Never reset/force-push or merge the app PR to work around preview problems.

### 2026-11-19 process-ownership fix / fresh CI

In the same stacked draft PR #4, commit `fe2003707c53ab5ef615ce547971cc27ebfde209` expanded ownership recognition to Node-managed `npm-cli.js run mobile` invocation forms, with new deterministic positive/negative smoke cases. [GitHub Actions run #44482368855](https://github.com/im-tnyx/Tio-Money/actions/runs/44482368855) completed **SUCCESS** **on that exact tested code SHA**: locked `npm ci`, Expo dependency check, `npm run check` (**16/16** existing app tests, **8/8** preview tests plus TypeScript/ESLint/Prettier), public Expo config, Android and iOS Metro exports, no restricted SMS-permission baseline. Basic local inspection of npm command-line variants informed the additional regression tests. **This is not evidence of an Expo-authenticated Codespace session or physical-device usability.** The subsequent checkpoint-only commit advances Git HEAD and requires current-head CI revalidation.

### Browser-free CLI login (2026-11-19 owner follow-up)

**Recommended one-time Codespace terminal flow for SDK 58:**

```sh
npx expo login --no-browser
npx expo whoami
node scripts/start-codespace-expo.mjs
```

The `whoami` output must be exactly `tnyx-23`. Expo SDK 58 uses browser login by default, so **`--no-browser` explicitly chooses interactive terminal login**. The password and any verification code belong only in the CLI's private prompt, never in a GitHub workflow, command arguments, code, chat or log. This does not create a new Expo/EAS project or modify **Tio-TNYX**. If the CLI rejects authentication, report only the sanitized error (never password/code). This flow is **documented but NOT_VERIFIED in a live authenticated Codespace**.

### Live Codespace confirmed Expo SDK 58 `CI=""` failure (2026-11-19)

Owner authenticated successfully as `tnyx-23` using browser-free CLI login, but Metro exited immediately and Expo Go continued showing Offline. The privately inspected Metro log identified the exact source bug: `Invalid value for environment variable $CI: ""`. The managed starter previously set `CI: ''`, which Expo's `@expo/env` rejects; it now provides `CI: 'false'`, an accepted non-CI interactive value. A preview unit regression test asserts the child environment remains valid even if Codespace inherits `CI=''` or `CI='true'`.

**Immediate manual workaround on a clean port, while the old starter is still checked out:** `CI=false npm run mobile`. This starts an interactive server; keep its terminal open. Before returning to the managed starter, stop the interactive server with Ctrl+C and verify port 8081 is free. Then on the same preview branch, fast-forward the Codespace worktree to the fix (`git status --short` and `git pull --ff-only origin chore/codespaces-expo-go-stage-a` only if clean), and run `node scripts/start-codespace-expo.mjs` followed by `--status`.

**Evidence:** owner-supplied live Codespace CLI output proves authentication and the original CI parse failure; Expo signed tunnel success and Android/iOS reconnect still require separate evidence and are **NOT_VERIFIED** until a successful post-fix live run. Do not post the signed Expo link or private log.

### Owner-confirmed existing EAS project link (2026-11-19)

The owner provided Expo Dashboard **Slug `tio-money`, Owner `tnyx-23`, Project ID `722e6857-1159-4414-a024-6a4351e7d3e1`** for their *already-existing* Tio-Money Expo project. This preview branch now binds the existing identity in `app.json` at `expo.extra.eas.projectId` and preserves `extra.releaseStage`, `expo.name`, `expo.slug`, `expo.owner` and the managed Expo Go tunnel. The exact-match unit regression rejects accidental identity drift. **No EAS CLI `init`, EAS Update configuration/publication, new Expo project, app build, deploy or privileged worker was performed.** Distinct Tio-TNYX stays untouched.

After this draft PR commit, the owner may use their **existing** Codespace only: first `git status --short`; if clean and the branch is `chore/codespaces-expo-go-stage-a`, run `git pull --ff-only origin chore/codespaces-expo-go-stage-a`, then `npx expo config --type public` and check `extra.eas.projectId` against the UUID above. If Expo is already serving the app, do not run a second server. Restart the owner-managed process with `node scripts/start-codespace-expo.mjs --restart` only when appropriate; if an interactive `npm run mobile` process is running, stop it **in its own terminal** with Ctrl+C before using the managed starter. No worktree reset/force push. Phone confirms the Development Servers entry separately from Projects.

**Remaining separate requirement for Projects parity:** Owner checks **Expo Dashboard → `@tnyx-23/tio-money` → Updates / Branches** to see whether a compatible update actually exists. An unlinked or grey Projects tile can have causes beyond a missing local UUID. Do **not** imply project linking alone publishes an update, fixes app visibility or activates offline access. An EAS Update publication needs its own scoped decision and review; Stage B remains blocked. The actual owner-reported phone launch (from Development Servers) is PASS, while the grey Projects card and iPhone/Android cross-device reliability remain **NOT_VERIFIED**.
